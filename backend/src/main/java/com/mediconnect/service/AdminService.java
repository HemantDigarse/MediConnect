package com.mediconnect.service;

import com.mediconnect.dto.admin.AdminStatsResponse;
import com.mediconnect.entity.User;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User toggleUserStatus(UUID userId, boolean isActive) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(isActive);
        return userRepository.save(user);
    }

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalPatients = totalUsers - totalDoctors;
        long totalAppointments = appointmentRepository.count();
        BigDecimal revenue = appointmentRepository.calculateTotalRevenue();

        long pending = appointmentRepository.findAll().stream()
            .filter(a -> a.getStatus() == com.mediconnect.entity.Appointment.Status.PENDING).count();
        long completed = appointmentRepository.findAll().stream()
            .filter(a -> a.getStatus() == com.mediconnect.entity.Appointment.Status.COMPLETED).count();

        return AdminStatsResponse.builder()
            .totalUsers(totalUsers)
            .totalDoctors(totalDoctors)
            .totalPatients(totalPatients)
            .totalAppointments(totalAppointments)
            .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
            .pendingAppointments(pending)
            .completedAppointments(completed)
            .build();
    }
}
