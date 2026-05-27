package com.mediconnect.service;

import com.mediconnect.entity.*;
import com.mediconnect.exception.*;
import com.mediconnect.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentService Unit Tests")
class AppointmentServiceTest {

    @Mock private AppointmentRepository    appointmentRepository;
    @Mock private DoctorRepository         doctorRepository;
    @Mock private UserRepository           userRepository;
    @Mock private AvailabilitySlotRepository slotRepository;
    @Mock private RazorpayService          razorpayService;
    @Mock private NotificationService      notificationService;
    @Mock private EmailService             emailService;

    @InjectMocks private AppointmentService appointmentService;

    private User patient;
    private Doctor doctor;
    private AvailabilitySlot slot;
    private UUID patientId, doctorId, slotId;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        doctorId  = UUID.randomUUID();
        slotId    = UUID.randomUUID();

        patient = new User();
        patient.setId(patientId);
        patient.setFullName("Jane Doe");
        patient.setEmail("jane@test.com");
        patient.setRole(User.Role.PATIENT);

        User doctorUser = new User();
        doctorUser.setId(UUID.randomUUID());
        doctorUser.setFullName("Dr. Smith");

        doctor = new Doctor();
        doctor.setId(doctorId);
        doctor.setUser(doctorUser);
        doctor.setConsultationFee(BigDecimal.valueOf(500));
        doctor.setSpecialty("Cardiologist");

        slot = new AvailabilitySlot();
        slot.setId(slotId);
        slot.setDoctor(doctor);
        slot.setIsBooked(false);
        slot.setSlotDate(java.time.LocalDate.now().plusDays(1));
        slot.setStartTime(java.time.LocalTime.of(10, 0));
        slot.setEndTime(java.time.LocalTime.of(10, 30));
    }

    @Test
    @DisplayName("Booking fails when slot is already taken")
    void bookAppointment_shouldThrow_whenSlotAlreadyBooked() {
        slot.setIsBooked(true);
        when(userRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));

        var req = new com.mediconnect.dto.appointment.BookAppointmentRequest();
        req.setDoctorId(doctorId);
        req.setSlotId(slotId);

        assertThrows(BadRequestException.class, () -> appointmentService.bookAppointment(patientId, req));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Booking creates Razorpay order when slot is available")
    void bookAppointment_shouldCreateOrder_whenSlotAvailable() {
        when(userRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(slotRepository.findById(slotId)).thenReturn(Optional.of(slot));
        when(razorpayService.createOrder(any(), anyString())).thenReturn("order_test_123");
        when(appointmentRepository.save(any())).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        var req = new com.mediconnect.dto.appointment.BookAppointmentRequest();
        req.setDoctorId(doctorId);
        req.setSlotId(slotId);

        var result = appointmentService.bookAppointment(patientId, req);

        assertNotNull(result);
        assertEquals("order_test_123", result.getRazorpayOrderId());
        verify(razorpayService).createOrder(any(), eq("INR"));
        verify(slotRepository).save(argThat(AvailabilitySlot::getIsBooked));
    }

    @Test
    @DisplayName("Payment verification succeeds with valid signature")
    void verifyPayment_shouldConfirmAppointment_whenSignatureValid() {
        Appointment appointment = new Appointment();
        appointment.setId(UUID.randomUUID());
        appointment.setRazorpayOrderId("order_123");
        appointment.setStatus(Appointment.Status.PENDING);
        appointment.setPaymentStatus(Appointment.PaymentStatus.PENDING);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);

        when(appointmentRepository.findById(any())).thenReturn(Optional.of(appointment));
        when(razorpayService.verifyPaymentSignature("order_123", "pay_456", "sig_789")).thenReturn(true);
        when(appointmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = new com.mediconnect.dto.appointment.PaymentVerifyRequest();
        req.setRazorpayOrderId("order_123");
        req.setRazorpayPaymentId("pay_456");
        req.setRazorpaySignature("sig_789");

        var result = appointmentService.verifyPayment(appointment.getId(), req);

        assertNotNull(result);
        assertEquals(Appointment.PaymentStatus.PAID, result.getPaymentStatus());
    }
}
