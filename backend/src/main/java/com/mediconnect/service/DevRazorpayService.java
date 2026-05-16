package com.mediconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Dev-mode mock for RazorpayService.
 * Generates fake order IDs and auto-verifies payments.
 */
@Slf4j
@Service
@Profile("dev")
public class DevRazorpayService extends RazorpayService {

    @Override
    public String createOrder(BigDecimal amount, String currency) {
        String fakeOrderId = "dev_order_" + UUID.randomUUID().toString().substring(0, 8);
        log.info("💳 [DEV] Mock Razorpay order created: {} for {} {}", fakeOrderId, currency, amount);
        return fakeOrderId;
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        log.info("💳 [DEV] Mock payment verification — auto-approved for order: {}", orderId);
        return true;
    }

    @Override
    public void initiateRefund(String paymentId, BigDecimal amount) {
        log.info("💳 [DEV] Mock refund initiated for payment: {}, amount: {}", paymentId, amount);
    }
}
