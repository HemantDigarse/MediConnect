package com.mediconnect.repository;

import com.mediconnect.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId, Pageable pageable);

    boolean existsByPatientIdAndDoctorId(UUID patientId, UUID doctorId);
    boolean existsByPatientIdAndAppointmentId(UUID patientId, UUID appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double calculateAverageRating(@Param("doctorId") UUID doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    long countByDoctorId(@Param("doctorId") UUID doctorId);
}
