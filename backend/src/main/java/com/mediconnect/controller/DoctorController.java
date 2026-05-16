package com.mediconnect.controller;

import com.mediconnect.dto.common.ApiResponse;
import com.mediconnect.dto.doctor.*;
import com.mediconnect.repository.ReviewRepository;
import com.mediconnect.service.DoctorService;
import com.mediconnect.service.UserResolverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor search, profiles, and slot management")
public class DoctorController {

    private final DoctorService doctorService;
    private final ReviewRepository reviewRepository;
    private final UserResolverService userResolver;

    @GetMapping
    @Operation(summary = "Search doctors with filters")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> searchDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
            doctorService.searchDoctors(specialty, city, minFee, maxFee, minRating, pageable)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get currently logged-in doctor's profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyProfile(Authentication authentication) {
        UUID userId = userResolver.resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByUserId(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor profile by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/{id}/slots")
    @Operation(summary = "Get available slots for a doctor on a date")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAvailableSlots(id, date)));
    }

    @PostMapping("/{id}/slots")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Doctor adds availability slot")
    public ResponseEntity<ApiResponse<SlotResponse>> createSlot(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.createSlot(id, request), "Slot created"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Doctor updates own profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateProfile(
            @RequestBody DoctorUpdateRequest request,
            Authentication authentication) {
        UUID userId = userResolver.resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(doctorService.updateProfile(userId, request), "Profile updated"));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get paginated reviews for a doctor")
    public ResponseEntity<ApiResponse<Page<com.mediconnect.entity.Review>>> getReviews(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
            reviewRepository.findByDoctorIdOrderByCreatedAtDesc(id, pageable)));
    }
}
