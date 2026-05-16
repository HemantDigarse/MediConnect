package com.mediconnect.repository;

import com.mediconnect.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

    @Query("SELECT s FROM AvailabilitySlot s WHERE s.doctor.id = :doctorId AND s.slotDate = :date AND s.isBooked = false ORDER BY s.startTime")
    List<AvailabilitySlot> findAvailableSlotsByDoctorAndDate(
        @Param("doctorId") UUID doctorId,
        @Param("date") LocalDate date
    );

    List<AvailabilitySlot> findByDoctorIdAndSlotDate(UUID doctorId, LocalDate slotDate);

    boolean existsByDoctorIdAndSlotDateAndStartTime(UUID doctorId, LocalDate slotDate, java.time.LocalTime startTime);
}
