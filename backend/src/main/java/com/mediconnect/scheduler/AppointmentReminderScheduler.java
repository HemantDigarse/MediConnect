package com.mediconnect.scheduler;

import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.AvailabilitySlot;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.service.EmailService;
import com.mediconnect.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    @org.springframework.beans.factory.annotation.Value("${app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusHours(1).plusMinutes(5);

        log.info("Running appointment reminder job for window: {} to {}", now, windowEnd);

        List<Appointment> upcoming = appointmentRepository.findConfirmedAppointmentsInWindow(now, windowEnd);
        log.info("Found {} upcoming appointments to remind", upcoming.size());

        for (Appointment appointment : upcoming) {
            try {
                sendReminder(appointment);
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment {}: {}", appointment.getId(), e.getMessage());
            }
        }
    }

    private void sendReminder(Appointment appointment) {
        AvailabilitySlot slot = appointment.getSlot();
        String doctorName = appointment.getDoctor().getUser().getFullName();
        String patientName = appointment.getPatient().getFullName();
        String patientEmail = appointment.getPatient().getEmail();
        String patientPhone = appointment.getPatient().getPhone();

        String time = slot.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a"));
        String roomLink = appBaseUrl + "/video-consult/" + appointment.getId();

        // Email reminder
        emailService.sendAppointmentReminder(patientEmail, doctorName, time, roomLink);

        // SMS reminder (if phone available)
        if (patientPhone != null && !patientPhone.isBlank()) {
            smsService.sendAppointmentReminder(patientPhone, doctorName, time, roomLink);
        }

        log.info("Reminder sent to patient {} for appointment with Dr. {}", patientName, doctorName);
    }
}
