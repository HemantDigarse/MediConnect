package com.mediconnect.controller;

import com.mediconnect.dto.common.ApiResponse;
import com.mediconnect.dto.consultation.*;
import com.mediconnect.entity.Prescription;
import com.mediconnect.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Video consultation management")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/start/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    @Operation(summary = "Start consultation - generates video room ID")
    public ResponseEntity<ApiResponse<ConsultationResponse>> startConsultation(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(
            consultationService.startConsultation(appointmentId), "Consultation started"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get consultation details")
    public ResponseEntity<ApiResponse<ConsultationResponse>> getConsultation(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultation(id)));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Doctor saves diagnosis and notes")
    public ResponseEntity<ApiResponse<ConsultationResponse>> saveNotes(
            @PathVariable UUID id,
            @RequestBody DoctorNotesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.saveNotes(id, request), "Notes saved"));
    }

    @PostMapping("/{id}/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Generate prescription PDF and upload to S3")
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(
            @PathVariable UUID id,
            @Valid @RequestBody PrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            consultationService.createPrescription(id, request), "Prescription created"));
    }

    @PatchMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    @Operation(summary = "End consultation, mark appointment as COMPLETED")
    public ResponseEntity<ApiResponse<ConsultationResponse>> endConsultation(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.endConsultation(id), "Consultation ended"));
    }
}
