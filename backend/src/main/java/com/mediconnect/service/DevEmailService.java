package com.mediconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Dev-mode stub for EmailService — logs emails instead of sending them.
 */
@Slf4j
@Service
@Profile("dev")
public class DevEmailService extends EmailService {

    public DevEmailService() {
        super(null);
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        log.info("📧 [DEV] OTP for {}: {}", toEmail, otp);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.info("📧 [DEV] Password reset token for {}: {}", toEmail, resetToken);
    }

    @Override
    public void sendAppointmentReminder(String toEmail, String doctorName, String time, String roomLink) {
        log.info("📧 [DEV] Appointment reminder for {} with Dr. {} at {}", toEmail, doctorName, time);
    }

    @Override
    public void sendAppointmentConfirmation(String toEmail, String doctorName, String date, String time) {
        log.info("📧 [DEV] Appointment confirmation for {} with Dr. {} on {} at {}", toEmail, doctorName, date, time);
    }
}
