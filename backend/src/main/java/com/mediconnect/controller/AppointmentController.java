package com.mediconnect.controller;

import com.mediconnect.dto.appointment.*;
import com.mediconnect.dto.common.ApiResponse;
import com.mediconnect.service.AppointmentService;
import com.mediconnect.service.UserResolverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking and management")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserResolverService userResolver;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book an appointment (creates Razorpay order)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @Valid @RequestBody BookAppointmentRequest request,
            Authentication authentication) {
        UUID patientId = userResolver.resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
            appointmentService.bookAppointment(patientId, request), "Appointment booked"));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @Operation(summary = "Get patient's appointments")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getPatientAppointments(
            @PathVariable UUID patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            appointmentService.getPatientAppointments(patientId, PageRequest.of(page, size))));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @Operation(summary = "Get doctor's appointments")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getDoctorAppointments(
            @PathVariable UUID doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            appointmentService.getDoctorAppointments(doctorId, PageRequest.of(page, size))));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Doctor confirms an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(
            @PathVariable UUID id, Authentication authentication) {
        UUID doctorUserId = userResolver.resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
            appointmentService.confirmAppointment(id, doctorUserId), "Appointment confirmed"));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel appointment (with refund if paid)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable UUID id, Authentication authentication) {
        UUID userId = userResolver.resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
            appointmentService.cancelAppointment(id, userId), "Appointment cancelled"));
    }

    @PostMapping("/{id}/payment/verify")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Verify Razorpay payment signature")
    public ResponseEntity<ApiResponse<AppointmentResponse>> verifyPayment(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            appointmentService.verifyPayment(id, request), "Payment verified"));
    }
}
