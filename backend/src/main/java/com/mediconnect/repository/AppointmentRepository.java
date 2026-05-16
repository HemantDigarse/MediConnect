package com.mediconnect.repository;

import com.mediconnect.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Page<Appointment> findByPatientIdOrderByBookedAtDesc(UUID patientId, Pageable pageable);

    Page<Appointment> findByDoctorIdOrderByBookedAtDesc(UUID doctorId, Pageable pageable);

    List<Appointment> findByDoctorIdAndStatus(UUID doctorId, Appointment.Status status);

    @Query(value = "SELECT a.* FROM appointments a JOIN availability_slots s ON a.slot_id = s.id " +
           "WHERE a.status = 'CONFIRMED' AND a.payment_status = 'PAID' " +
           "AND (s.slot_date + s.start_time) BETWEEN :fromTs AND :toTs",
           nativeQuery = true)
    List<Appointment> findConfirmedAppointmentsInWindow(
        @Param("fromTs") LocalDateTime from,
        @Param("toTs") LocalDateTime to
    );

    @Query("SELECT COUNT(a) FROM Appointment a")
    long countAllAppointments();

    @Query("SELECT COALESCE(SUM(d.consultationFee), 0) FROM Appointment a JOIN a.doctor d WHERE a.paymentStatus = 'PAID'")
    java.math.BigDecimal calculateTotalRevenue();
}
