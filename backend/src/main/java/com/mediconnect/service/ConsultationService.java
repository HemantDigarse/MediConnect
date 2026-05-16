package com.mediconnect.service;

import com.mediconnect.dto.consultation.*;
import com.mediconnect.entity.*;
import com.mediconnect.exception.*;
import com.mediconnect.repository.*;
import com.mediconnect.util.PdfGenerator;
import com.mediconnect.util.S3Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PdfGenerator pdfGenerator;
    private final S3Util s3Util;
    private final NotificationService notificationService;

    @Transactional
    public ConsultationResponse startConsultation(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != Appointment.Status.CONFIRMED) {
            throw new BadRequestException("Appointment must be CONFIRMED before starting consultation");
        }

        if (consultationRepository.findByAppointmentId(appointmentId).isPresent()) {
            throw new BadRequestException("Consultation already started for this appointment");
        }

        String videoRoomId = UUID.randomUUID().toString();

        Consultation consultation = Consultation.builder()
            .appointment(appointment)
            .videoRoomId(videoRoomId)
            .chiefComplaint(appointment.getChiefComplaint())
            .startedAt(LocalDateTime.now())
            .build();

        consultation = consultationRepository.save(consultation);
        appointment.setStatus(Appointment.Status.CONFIRMED);
        appointmentRepository.save(appointment);

        return mapToResponse(consultation);
    }

    public ConsultationResponse getConsultation(UUID id) {
        return mapToResponse(getOrThrow(id));
    }

    @Transactional
    public ConsultationResponse saveNotes(UUID id, DoctorNotesRequest request) {
        Consultation consultation = getOrThrow(id);
        if (request.getDiagnosis() != null) consultation.setDiagnosis(request.getDiagnosis());
        if (request.getDoctorNotes() != null) consultation.setDoctorNotes(request.getDoctorNotes());
        if (request.getChiefComplaint() != null) consultation.setChiefComplaint(request.getChiefComplaint());
        return mapToResponse(consultationRepository.save(consultation));
    }

    @Transactional
    public Prescription createPrescription(UUID consultationId, PrescriptionRequest request) {
        Consultation consultation = getOrThrow(consultationId);

        Prescription prescription = Prescription.builder()
            .consultation(consultation)
            .medications(request.getMedications())
            .dosage(request.getDosage())
            .instructions(request.getInstructions())
            .build();

        // Generate PDF and upload to S3
        try {
            byte[] pdfBytes = pdfGenerator.generatePrescriptionPdf(prescription, consultation);
            String key = "prescriptions/" + UUID.randomUUID() + ".pdf";
            String url = s3Util.uploadFile(key, pdfBytes, "application/pdf");
            prescription.setPdfUrl(url);
        } catch (Exception e) {
            log.warn("PDF generation failed, saving without PDF URL: {}", e.getMessage());
        }

        prescription = prescriptionRepository.save(prescription);

        notificationService.createInAppNotification(
            consultation.getAppointment().getPatient(),
            "Prescription Ready",
            "Your prescription has been issued. Download it from Medical Records."
        );

        return prescription;
    }

    @Transactional
    public ConsultationResponse endConsultation(UUID id) {
        Consultation consultation = getOrThrow(id);
        consultation.setEndedAt(LocalDateTime.now());
        consultation.getAppointment().setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(consultation.getAppointment());
        return mapToResponse(consultationRepository.save(consultation));
    }

    private Consultation getOrThrow(UUID id) {
        return consultationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + id));
    }

    private ConsultationResponse mapToResponse(Consultation c) {
        return ConsultationResponse.builder()
            .id(c.getId())
            .appointmentId(c.getAppointment().getId())
            .videoRoomId(c.getVideoRoomId())
            .chiefComplaint(c.getChiefComplaint())
            .diagnosis(c.getDiagnosis())
            .doctorNotes(c.getDoctorNotes())
            .startedAt(c.getStartedAt())
            .endedAt(c.getEndedAt())
            .createdAt(c.getCreatedAt())
            .build();
    }
}
