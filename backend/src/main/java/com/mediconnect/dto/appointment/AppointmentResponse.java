package com.mediconnect.dto.appointment;

import com.mediconnect.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private UUID                      id;
    private UUID                      patientId;
    private String                    patientName;
    private UUID                      doctorId;
    private String                    doctorName;
    private String                    specialty;
    private LocalDate                 slotDate;
    private LocalTime                 slotStartTime;
    private LocalTime                 slotEndTime;
    private Appointment.Status        status;
    private Appointment.PaymentStatus paymentStatus;
    private String                    razorpayOrderId;
    private String                    paymentTxnId;
    private String                    chiefComplaint;
    private BigDecimal                consultationFee;
    private LocalDateTime             bookedAt;
}
