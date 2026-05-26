package com.mediconnect.service;

import com.mediconnect.dto.auth.AuthResponse;
import com.mediconnect.dto.auth.EmailValidationResponse;
import com.mediconnect.dto.auth.LoginRequest;
import com.mediconnect.dto.auth.OtpVerifyRequest;
import com.mediconnect.dto.auth.RegisterRequest;
import com.mediconnect.dto.auth.ResetPasswordRequest;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.exception.UnauthorizedException;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.UserRepository;
import com.mediconnect.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final TokenStoreService tokenStore;
    private final EmailService emailService;
    private final EmailValidationService emailValidationService;
    private final org.springframework.core.env.Environment environment;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String OTP_PREFIX = "otp:";
    private static final String RESET_TOKEN_PREFIX = "reset:";
    private static final long REFRESH_TTL_DAYS = 7;
    private static final long OTP_TTL_MINUTES = 10;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = emailValidationService.normalize(request.getEmail());
        EmailValidationResponse emailValidation = emailValidationService.validate(email);
        if (!emailValidation.isValidFormat() || !emailValidation.isDomainReachable()) {
            throw new BadRequestException(emailValidation.getMessage());
        }
        if (!emailValidation.isAvailable()) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
            .fullName(request.getFullName())
            .email(email)
            .phone(normalizeOptional(request.getPhone()))
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole() != null ? request.getRole() : User.Role.PATIENT)
            .isVerified(false)
            .isActive(true)
            .build();

        user = userRepository.save(user);

        if (user.getRole() == User.Role.DOCTOR) {
            String licenseNumber = normalizeOptional(request.getLicenseNumber());
            String specialty = normalizeOptional(request.getSpecialty());
            if (licenseNumber == null || specialty == null) {
                throw new BadRequestException("Doctors must provide specialty and license number");
            }
            if (doctorRepository.existsByLicenseNumber(licenseNumber)) {
                throw new BadRequestException("License number already registered");
            }
            Doctor doctor = Doctor.builder()
                .user(user)
                .specialty(specialty)
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .consultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : java.math.BigDecimal.ZERO)
                .licenseNumber(licenseNumber)
                .bio(normalizeOptional(request.getBio()))
                .city(normalizeOptional(request.getCity()))
                .build();
            doctorRepository.save(doctor);
        }

        sendOtp(user.getEmail());

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        storeRefreshToken(user.getEmail(), refreshToken);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        String email = emailValidationService.normalize(request.getEmail());
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        storeRefreshToken(user.getEmail(), refreshToken);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractEmail(refreshToken);
        String storedToken = tokenStore.get(REFRESH_TOKEN_PREFIX + email);

        if (storedToken == null || !storedToken.equals(refreshToken) || jwtUtil.isTokenExpired(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        storeRefreshToken(user.getEmail(), newRefreshToken);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void verifyOtp(OtpVerifyRequest request) {
        String email = emailValidationService.normalize(request.getEmail());
        String key = OTP_PREFIX + email;
        String storedOtp = tokenStore.get(key);

        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsVerified(true);
        user.setOtpCode(null);
        userRepository.save(user);
        tokenStore.delete(key);
    }

    public void resendOtp(String rawEmail) {
        String email = emailValidationService.normalize(rawEmail);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new BadRequestException("Email is already verified");
        }
        sendOtp(email);
    }

    public EmailValidationResponse validateEmail(String email) {
        return emailValidationService.validate(email);
    }

    public String forgotPassword(String email) {
        String normalizedEmail = emailValidationService.normalize(email);
        userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String resetToken = java.util.UUID.randomUUID().toString();
        tokenStore.set(RESET_TOKEN_PREFIX + resetToken, normalizedEmail, 60, TimeUnit.MINUTES);

        emailService.sendPasswordResetEmail(normalizedEmail, resetToken);

        if (isDevProfile()) {
            return resetToken;
        }
        return null;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = tokenStore.get(RESET_TOKEN_PREFIX + request.getToken());
        if (email == null) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenStore.delete(RESET_TOKEN_PREFIX + request.getToken());
    }

    private void sendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        tokenStore.set(OTP_PREFIX + email, otp, OTP_TTL_MINUTES, TimeUnit.MINUTES);
        emailService.sendOtpEmail(email, otp);
    }

    private void storeRefreshToken(String email, String refreshToken) {
        tokenStore.set(REFRESH_TOKEN_PREFIX + email, refreshToken, REFRESH_TTL_DAYS, TimeUnit.DAYS);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .userId(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole())
            .isVerified(user.getIsVerified())
            .build();
    }

    private boolean isDevProfile() {
        return java.util.Arrays.asList(environment.getActiveProfiles()).contains("dev");
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
