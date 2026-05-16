package com.mediconnect.repository;

import com.mediconnect.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID>, JpaSpecificationExecutor<Doctor> {
    Optional<Doctor> findByUserId(UUID userId);
    boolean existsByLicenseNumber(String licenseNumber);

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE d.isAvailable = true " +
           "AND (:specialty IS NULL OR LOWER(d.specialty) LIKE LOWER(CONCAT('%', :specialty, '%'))) " +
           "AND (:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:minFee IS NULL OR d.consultationFee >= :minFee) " +
           "AND (:maxFee IS NULL OR d.consultationFee <= :maxFee) " +
           "AND (:minRating IS NULL OR d.rating >= :minRating)")
    Page<Doctor> searchDoctors(
        @Param("specialty") String specialty,
        @Param("city") String city,
        @Param("minFee") java.math.BigDecimal minFee,
        @Param("maxFee") java.math.BigDecimal maxFee,
        @Param("minRating") Double minRating,
        Pageable pageable
    );

    @Query("SELECT COUNT(d) FROM Doctor d")
    long countAllDoctors();
}
