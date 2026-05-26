package com.mediconnect.service;

import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.UserRepository;
import com.mediconnect.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository     userRepository;
    @Mock private DoctorRepository   doctorRepository;
    @Mock private PasswordEncoder    passwordEncoder;
    @Mock private JwtUtil            jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private TokenStoreService   tokenStore;
    @Mock private EmailService        emailService;
    @Mock private EmailValidationService emailValidationService;
    @Mock private Environment         environment;

    @InjectMocks private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(java.util.UUID.randomUUID());
        testUser.setFullName("Test Patient");
        testUser.setEmail("patient@test.com");
        testUser.setPasswordHash("hashed-password");
        testUser.setRole(User.Role.PATIENT);
        testUser.setIsActive(true);
        testUser.setIsVerified(true);
    }

    @Test
    @DisplayName("Registration fails when email already exists")
    void register_shouldThrow_whenEmailAlreadyExists() {
        when(emailValidationService.normalize("patient@test.com")).thenReturn("patient@test.com");
        when(emailValidationService.validate("patient@test.com")).thenReturn(
            com.mediconnect.dto.auth.EmailValidationResponse.builder()
                .email("patient@test.com")
                .validFormat(true)
                .domainReachable(true)
                .available(false)
                .message("Email is already registered.")
                .build()
        );

        var request = new com.mediconnect.dto.auth.RegisterRequest();
        request.setEmail("patient@test.com");
        request.setPassword("password123");
        request.setFullName("Test Patient");
        request.setRole(User.Role.PATIENT);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login fails with wrong password")
    void login_shouldThrow_whenPasswordIsWrong() {
        var request = new com.mediconnect.dto.auth.LoginRequest();
        request.setEmail("patient@test.com");
        request.setPassword("wrong-password");

        when(emailValidationService.normalize("patient@test.com")).thenReturn("patient@test.com");
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(com.mediconnect.exception.UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Login succeeds with correct credentials")
    void login_shouldReturnTokens_whenCredentialsCorrect() {
        var request = new com.mediconnect.dto.auth.LoginRequest();
        request.setEmail("patient@test.com");
        request.setPassword("correct-password");

        when(emailValidationService.normalize("patient@test.com")).thenReturn("patient@test.com");
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateAccessToken(anyString(), anyString(), any(java.util.UUID.class))).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyString())).thenReturn("refresh-token");

        var result = authService.login(request);

        assertNotNull(result);
        assertEquals("access-token", result.getAccessToken());
        assertEquals("refresh-token", result.getRefreshToken());
    }

    @Test
    @DisplayName("Login fails for inactive user")
    void login_shouldThrow_whenUserIsInactive() {
        testUser.setIsActive(false);
        var request = new com.mediconnect.dto.auth.LoginRequest();
        request.setEmail("patient@test.com");
        request.setPassword("correct-password");

        when(emailValidationService.normalize("patient@test.com")).thenReturn("patient@test.com");
        when(authenticationManager.authenticate(any()))
            .thenThrow(new DisabledException("User is disabled"));

        assertThrows(com.mediconnect.exception.UnauthorizedException.class, () -> authService.login(request));
    }
}
