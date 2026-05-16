package com.mediconnect.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhone;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    @PostConstruct
    public void init() {
        if (twilioEnabled) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio SMS service initialized");
        } else {
            log.info("Twilio SMS disabled (set twilio.enabled=true to enable)");
        }
    }

    @Async
    public void sendAppointmentReminder(String toPhone, String doctorName, String time, String link) {
        String body = "MediConnect: Appt with Dr. " + doctorName + " at " + time + ". Join: " + link;
        sendSms(toPhone, body);
    }

    @Async
    public void sendOtpSms(String toPhone, String otp) {
        String body = "MediConnect OTP: " + otp + ". Valid for 10 minutes. Do not share.";
        sendSms(toPhone, body);
    }

    private void sendSms(String toPhone, String body) {
        if (!twilioEnabled) {
            log.info("[SMS MOCK] To: {} | Body: {}", toPhone, body);
            return;
        }
        try {
            Message.creator(new PhoneNumber(toPhone), new PhoneNumber(fromPhone), body).create();
            log.info("SMS sent to: {}", toPhone);
        } catch (Exception e) {
            log.error("SMS send failed to {}: {}", toPhone, e.getMessage());
        }
    }
}
