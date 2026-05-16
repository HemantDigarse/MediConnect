package com.mediconnect.service;

import com.mediconnect.entity.*;
import com.mediconnect.exception.*;
import com.mediconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.mediconnect.util.S3Util;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final LabReportRepository labReportRepository;
    private final UserRepository userRepository;
    private final S3Util s3Util;

    public MedicalRecord getOrCreateRecord(UUID patientId) {
        return medicalRecordRepository.findByPatientId(patientId)
            .orElseGet(() -> {
                User patient = userRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
                MedicalRecord record = MedicalRecord.builder().patient(patient).build();
                return medicalRecordRepository.save(record);
            });
    }

    @Transactional
    public MedicalRecord updateRecord(UUID patientId, MedicalRecord updates) {
        MedicalRecord record = getOrCreateRecord(patientId);
        if (updates.getBloodGroup() != null) record.setBloodGroup(updates.getBloodGroup());
        if (updates.getAllergies() != null) record.setAllergies(updates.getAllergies());
        if (updates.getChronicConditions() != null) record.setChronicConditions(updates.getChronicConditions());
        if (updates.getCurrentMedications() != null) record.setCurrentMedications(updates.getCurrentMedications());
        if (updates.getHeightCm() != null) record.setHeightCm(updates.getHeightCm());
        if (updates.getWeightKg() != null) record.setWeightKg(updates.getWeightKg());
        return medicalRecordRepository.save(record);
    }

    @Transactional
    public LabReport uploadLabReport(UUID patientId, String reportName, String reportType, MultipartFile file) {
        MedicalRecord record = getOrCreateRecord(patientId);
        String fileUrl;
        try {
            String key = "lab-reports/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            fileUrl = s3Util.uploadFile(key, file.getBytes(), file.getContentType());
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }

        LabReport report = LabReport.builder()
            .medicalRecord(record)
            .reportName(reportName)
            .reportType(reportType)
            .fileUrl(fileUrl)
            .build();
        return labReportRepository.save(report);
    }

    public List<LabReport> getLabReports(UUID recordId) {
        return labReportRepository.findByMedicalRecordIdOrderByUploadedAtDesc(recordId);
    }
}
