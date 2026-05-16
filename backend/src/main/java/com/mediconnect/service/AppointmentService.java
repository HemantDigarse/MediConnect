package com.mediconnect.service;

import com.mediconnect.dto.appointment.*;
import com.mediconnect.entity.*;
import com.mediconnect.exception.*;
import com.mediconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final RazorpayService razorpayService;
    private final NotificationService notificationService;

    @Transactional
    public AppointmentResponse bookAppointment(UUID patientId, BookAppointmentRequest request) {
        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        AvailabilitySlot slot = slotRepository.findById(request.getSlotId())
            .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.getIsBooked()) {
            throw new BadRequestException("This slot is already booked");
        }
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new BadRequestException("Slot does not belong to this doctor");
        }

        // Create Razorpay order
        String razorpayOrderId = razorpayService.createOrder(doctor.getConsultationFee(), "INR");

        Appointment appointment = Appointment.builder()
            .patient(patient)
            .doctor(doctor)
            .slot(slot)
            .status(Appointment.Status.PENDING)
            .paymentStatus(Appointment.PaymentStatus.PENDING)
            .razorpayOrderId(razorpayOrderId)
            .chiefComplaint(request.getChiefComplaint())
            .build();

        slot.setIsBooked(true);
        slotRepository.save(slot);
        appointment = appointmentRepository.save(appointment);

        notificationService.createInAppNotification(
            patient,
            "Appointment Booked",
            "Your appointment with Dr. " + doctor.getUser().getFullName() + " has been booked. Complete payment to confirm."
        );

        return mapToResponse(appointment);
    }

    public Page<AppointmentResponse> getPatientAppointments(UUID patientId, Pageable pageable) {
        return appointmentRepository.findByPatientIdOrderByBookedAtDesc(patientId, pageable)
            .map(this::mapToResponse);
    }

    public Page<AppointmentResponse> getDoctorAppointments(UUID doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorIdOrderByBookedAtDesc(doctorId, pageable)
            .map(this::mapToResponse);
    }

    @Transactional
    public AppointmentResponse confirmAppointment(UUID appointmentId, UUID doctorUserId) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);
        if (!appointment.getDoctor().getUser().getId().equals(doctorUserId)) {
            throw new UnauthorizedException("Not authorized to confirm this appointment");
        }
        appointment.setStatus(Appointment.Status.CONFIRMED);
        appointment = appointmentRepository.save(appointment);

        notificationService.createInAppNotification(
            appointment.getPatient(),
            "Appointment Confirmed",
            "Dr. " + appointment.getDoctor().getUser().getFullName() + " confirmed your appointment."
        );
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(UUID appointmentId, UUID userId) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);

        boolean isPatient = appointment.getPatient().getId().equals(userId);
        boolean isDoctorUser = appointment.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctorUser) {
            throw new UnauthorizedException("Not authorized to cancel this appointment");
        }

        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);

        // Initiate refund if already paid
        if (appointment.getPaymentStatus() == Appointment.PaymentStatus.PAID
                && appointment.getPaymentTxnId() != null) {
            razorpayService.initiateRefund(appointment.getPaymentTxnId(),
                appointment.getDoctor().getConsultationFee());
            appointment.setPaymentStatus(Appointment.PaymentStatus.REFUNDED);
        }

        // Free the slot
        AvailabilitySlot slot = appointment.getSlot();
        slot.setIsBooked(false);
        slotRepository.save(slot);

        return mapToResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse verifyPayment(UUID appointmentId, PaymentVerifyRequest request) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);

        boolean valid = razorpayService.verifyPaymentSignature(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
        );

        if (!valid) {
            throw new PaymentException("Payment signature verification failed");
        }

        appointment.setPaymentStatus(Appointment.PaymentStatus.PAID);
        appointment.setPaymentTxnId(request.getRazorpayPaymentId());
        appointment.setStatus(Appointment.Status.CONFIRMED);
        return mapToResponse(appointmentRepository.save(appointment));
    }

    private Appointment getAppointmentOrThrow(UUID id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private AppointmentResponse mapToResponse(Appointment a) {
        AvailabilitySlot slot = a.getSlot();
        return AppointmentResponse.builder()
            .id(a.getId())
            .patientId(a.getPatient().getId())
            .patientName(a.getPatient().getFullName())
            .doctorId(a.getDoctor().getId())
            .doctorName(a.getDoctor().getUser().getFullName())
            .specialty(a.getDoctor().getSpecialty())
            .slotDate(slot.getSlotDate())
            .slotStartTime(slot.getStartTime())
            .slotEndTime(slot.getEndTime())
            .status(a.getStatus())
            .paymentStatus(a.getPaymentStatus())
            .paymentTxnId(a.getPaymentTxnId())
            .razorpayOrderId(a.getRazorpayOrderId())
            .chiefComplaint(a.getChiefComplaint())
            .consultationFee(a.getDoctor().getConsultationFee())
            .bookedAt(a.getBookedAt())
            .build();
    }
}
