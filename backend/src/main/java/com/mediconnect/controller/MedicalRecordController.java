package com.mediconnect.controller;

import com.mediconnect.dto.common.ApiResponse;
import com.mediconnect.entity.*;
import com.mediconnect.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@Tag(name = "Medical Records", description = "Patient health records and lab reports")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    @Operation(summary = "Get patient health profile")
    public ResponseEntity<ApiResponse<MedicalRecord>> getRecord(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getOrCreateRecord(patientId)));
    }

    @PutMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @Operation(summary = "Update patient health profile")
    public ResponseEntity<ApiResponse<MedicalRecord>> updateRecord(
            @PathVariable UUID patientId,
            @RequestBody MedicalRecord updates) {
        return ResponseEntity.ok(ApiResponse.success(
            medicalRecordService.updateRecord(patientId, updates), "Health profile updated"));
    }

    @PostMapping(value = "/lab-report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    @Operation(summary = "Upload lab report to S3")
    public ResponseEntity<ApiResponse<LabReport>> uploadLabReport(
            @RequestParam UUID patientId,
            @RequestParam String reportName,
            @RequestParam(required = false, defaultValue = "General") String reportType,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(
            medicalRecordService.uploadLabReport(patientId, reportName, reportType, file),
            "Lab report uploaded"));
    }

    @GetMapping("/lab-reports/{recordId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    @Operation(summary = "Get all lab reports for a medical record")
    public ResponseEntity<ApiResponse<List<LabReport>>> getLabReports(@PathVariable UUID recordId) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getLabReports(recordId)));
    }
}
