package com.mediconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
@org.springframework.context.annotation.Profile("!dev")
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@mediconnect.in}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "MediConnect - Email Verification OTP";
        String body = buildOtpEmailBody(otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = appBaseUrl + "/reset-password?token=" + resetToken;
        String subject = "MediConnect - Password Reset Request";
        String body = buildPasswordResetEmailBody(resetLink);
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendAppointmentReminder(String toEmail, String doctorName, String time, String roomLink) {
        String subject = "MediConnect - Appointment Reminder";
        String body = buildReminderEmailBody(doctorName, time, roomLink);
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendAppointmentConfirmation(String toEmail, String doctorName, String date, String time) {
        String subject = "MediConnect - Appointment Confirmed";
        String body = "<h2>Appointment Confirmed</h2>"
            + "<p>Your appointment with <strong>Dr. " + doctorName + "</strong> is confirmed.</p>"
            + "<p><strong>Date:</strong> " + date + " at " + time + "</p>"
            + "<p>You will receive a reminder 1 hour before your appointment.</p>"
            + "<br><p>— MediConnect Team</p>";
        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildOtpEmailBody(String otp) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px'>"
            + "<h2 style='color:#0F766E'>MediConnect — Email Verification</h2>"
            + "<p>Your verification OTP is:</p>"
            + "<div style='background:#f0fdf4;border:2px solid #0F766E;border-radius:8px;padding:20px;text-align:center'>"
            + "<h1 style='color:#0F766E;letter-spacing:10px;margin:0'>" + otp + "</h1>"
            + "</div>"
            + "<p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>"
            + "<p style='color:#666;font-size:12px'>If you did not request this, please ignore this email.</p>"
            + "</div>";
    }

    private String buildPasswordResetEmailBody(String resetLink) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px'>"
            + "<h2 style='color:#0F766E'>MediConnect — Password Reset</h2>"
            + "<p>Click the button below to reset your password. This link is valid for <strong>60 minutes</strong>.</p>"
            + "<a href='" + resetLink + "' style='display:inline-block;background:#0F766E;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0'>Reset Password</a>"
            + "<p style='color:#666;font-size:12px'>If you did not request this, please ignore this email.</p>"
            + "</div>";
    }

    private String buildReminderEmailBody(String doctorName, String time, String roomLink) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px'>"
            + "<h2 style='color:#0F766E'>MediConnect — Appointment Reminder</h2>"
            + "<p>Your appointment with <strong>Dr. " + doctorName + "</strong> is in <strong>1 hour</strong> at <strong>" + time + "</strong>.</p>"
            + "<a href='" + roomLink + "' style='display:inline-block;background:#0F766E;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0'>Join Consultation</a>"
            + "<p style='color:#666;font-size:12px'>Please be ready 5 minutes before your appointment.</p>"
            + "</div>";
    }
}
