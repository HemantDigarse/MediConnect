package com.mediconnect.service;

import com.mediconnect.dto.doctor.*;
import com.mediconnect.entity.AvailabilitySlot;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AvailabilitySlotRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.ReviewRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final ReviewRepository reviewRepository;

    public Page<DoctorResponse> searchDoctors(String specialty, String city,
                                               BigDecimal minFee, BigDecimal maxFee,
                                               Double minRating, Pageable pageable) {
        return doctorRepository.searchDoctors(specialty, city, minFee, maxFee, minRating, pageable)
            .map(this::mapToResponse);
    }

    public DoctorResponse getDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapToResponse(doctor);
    }

    public DoctorResponse getDoctorByUserId(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return mapToResponse(doctor);
    }

    public List<SlotResponse> getAvailableSlots(UUID doctorId, LocalDate date) {
        return slotRepository.findAvailableSlotsByDoctorAndDate(doctorId, date)
            .stream().map(this::mapSlotToResponse).collect(Collectors.toList());
    }

    @Transactional
    public SlotResponse createSlot(UUID doctorId, CreateSlotRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (request.getSlotDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Slot date cannot be in the past");
        }
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }
        if (slotRepository.existsByDoctorIdAndSlotDateAndStartTime(doctorId, request.getSlotDate(), request.getStartTime())) {
            throw new BadRequestException("A slot already exists at this time");
        }

        AvailabilitySlot slot = AvailabilitySlot.builder()
            .doctor(doctor)
            .slotDate(request.getSlotDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .isBooked(false)
            .build();

        return mapSlotToResponse(slotRepository.save(slot));
    }

    @Transactional
    public DoctorResponse updateProfile(UUID userId, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        User user = doctor.getUser();
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        if (request.getSpecialty() != null) doctor.setSpecialty(request.getSpecialty());
        if (request.getBio() != null) doctor.setBio(request.getBio());
        if (request.getCity() != null) doctor.setCity(request.getCity());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getExperienceYears() != null) doctor.setExperienceYears(request.getExperienceYears());
        if (request.getIsAvailable() != null) doctor.setIsAvailable(request.getIsAvailable());

        return mapToResponse(doctorRepository.save(doctor));
    }

    public DoctorResponse mapToResponse(Doctor doctor) {
        User user = doctor.getUser();
        return DoctorResponse.builder()
            .id(doctor.getId())
            .userId(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .specialty(doctor.getSpecialty())
            .experienceYears(doctor.getExperienceYears())
            .consultationFee(doctor.getConsultationFee())
            .rating(doctor.getRating())
            .reviewCount(doctor.getReviewCount())
            .licenseNumber(doctor.getLicenseNumber())
            .bio(doctor.getBio())
            .city(doctor.getCity())
            .profileImageUrl(doctor.getProfileImageUrl())
            .isAvailable(doctor.getIsAvailable())
            .build();
    }

    private SlotResponse mapSlotToResponse(AvailabilitySlot slot) {
        return SlotResponse.builder()
            .id(slot.getId())
            .slotDate(slot.getSlotDate())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .isBooked(slot.getIsBooked())
            .build();
    }
}
