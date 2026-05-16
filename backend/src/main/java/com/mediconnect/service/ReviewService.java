package com.mediconnect.service;

import com.mediconnect.entity.*;
import com.mediconnect.exception.*;
import com.mediconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review submitReview(UUID patientId, UUID doctorId, UUID appointmentId, int rating, String comment) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new UnauthorizedException("Not authorized to review this appointment");
        }
        if (appointment.getStatus() != Appointment.Status.COMPLETED) {
            throw new BadRequestException("Can only review completed appointments");
        }
        if (reviewRepository.existsByPatientIdAndAppointmentId(patientId, appointmentId)) {
            throw new BadRequestException("Review already submitted for this appointment");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Review review = Review.builder()
            .patient(patient)
            .doctor(doctor)
            .appointment(appointment)
            .rating(rating)
            .comment(comment)
            .build();

        review = reviewRepository.save(review);

        // Update doctor's average rating
        Double avgRating = reviewRepository.calculateAverageRating(doctorId);
        long reviewCount = reviewRepository.countByDoctorId(doctorId);
        if (avgRating != null) {
            doctor.setRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP).doubleValue());
            doctor.setReviewCount((int) reviewCount);
            doctorRepository.save(doctor);
        }

        return review;
    }
}
