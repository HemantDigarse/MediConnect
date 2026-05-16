package com.mediconnect.config;

import com.mediconnect.entity.AvailabilitySlot;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.User;
import com.mediconnect.repository.AvailabilitySlotRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Seeds the H2 database with sample data for local development.
 * Only runs when the "dev" profile is active.
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("🌱 Seeding dev database...");

        // --- Create a patient user ---
        User patient = userRepository.save(User.builder()
            .fullName("Harsh Patel")
            .email("patient@test.com")
            .phone("+919876543210")
            .passwordHash(passwordEncoder.encode("password123"))
            .role(User.Role.PATIENT)
            .isVerified(true)
            .isActive(true)
            .build());

        // --- Create doctor users and doctor profiles ---
        String encodedPassword = passwordEncoder.encode("password123");

        createDoctorWithSlots("SJ Verma", "drverma@test.com", "+919876500001", encodedPassword,
            "Cardiologist", 15, new BigDecimal("800"), 4.8, 124, "MCI-10001",
            "Experienced cardiologist specializing in interventional cardiology and heart failure management.",
            "Jalandhar", true);

        createDoctorWithSlots("Priya Sharma", "drsharma@test.com", "+919876500002", encodedPassword,
            "Dermatologist", 10, new BigDecimal("600"), 4.6, 89, "MCI-10002",
            "Board-certified dermatologist with expertise in cosmetic and clinical dermatology.",
            "Mumbai", true);

        createDoctorWithSlots("Arun Mehta", "drmehta@test.com", "+919876500003", encodedPassword,
            "Orthopedic Surgeon", 20, new BigDecimal("1000"), 4.9, 210, "MCI-10003",
            "Senior orthopedic surgeon specializing in joint replacement and sports medicine.",
            "Delhi", true);

        createDoctorWithSlots("Kavitha Nair", "drnair@test.com", "+919876500004", encodedPassword,
            "Pediatrician", 8, new BigDecimal("500"), 4.7, 156, "MCI-10004",
            "Compassionate pediatrician focused on child wellness, vaccination, and developmental care.",
            "Bangalore", true);

        createDoctorWithSlots("Rajesh Kumar", "drkumar@test.com", "+919876500005", encodedPassword,
            "General Physician", 12, new BigDecimal("400"), 4.5, 340, "MCI-10005",
            "Trusted family physician with extensive experience in primary care and preventive medicine.",
            "Chennai", true);

        // --- Create an admin user ---
        userRepository.save(User.builder()
            .fullName("Admin User")
            .email("admin@test.com")
            .phone("+919876500000")
            .passwordHash(encodedPassword)
            .role(User.Role.ADMIN)
            .isVerified(true)
            .isActive(true)
            .build());

        log.info("✅ Dev database seeded successfully!");
        log.info("📋 Test accounts:");
        log.info("   Patient:  patient@test.com / password123");
        log.info("   Doctor:   drverma@test.com / password123");
        log.info("   Admin:    admin@test.com   / password123");
    }

    private void createDoctorWithSlots(String fullName, String email, String phone,
                                        String encodedPassword, String specialty,
                                        int experience, BigDecimal fee, double rating,
                                        int reviewCount, String license, String bio,
                                        String city, boolean available) {
        User user = userRepository.save(User.builder()
            .fullName(fullName)
            .email(email)
            .phone(phone)
            .passwordHash(encodedPassword)
            .role(User.Role.DOCTOR)
            .isVerified(true)
            .isActive(true)
            .build());

        Doctor doctor = doctorRepository.save(Doctor.builder()
            .user(user)
            .specialty(specialty)
            .experienceYears(experience)
            .consultationFee(fee)
            .rating(rating)
            .reviewCount(reviewCount)
            .licenseNumber(license)
            .bio(bio)
            .city(city)
            .isAvailable(available)
            .build());

        // Create slots for the next 7 days
        LocalDate today = LocalDate.now();
        List<LocalTime[]> slotTimes = List.of(
            new LocalTime[]{ LocalTime.of(9, 0),  LocalTime.of(9, 30)  },
            new LocalTime[]{ LocalTime.of(9, 30), LocalTime.of(10, 0)  },
            new LocalTime[]{ LocalTime.of(10, 0), LocalTime.of(10, 30) },
            new LocalTime[]{ LocalTime.of(10, 30),LocalTime.of(11, 0)  },
            new LocalTime[]{ LocalTime.of(11, 0), LocalTime.of(11, 30) },
            new LocalTime[]{ LocalTime.of(11, 30),LocalTime.of(12, 0)  },
            new LocalTime[]{ LocalTime.of(14, 0), LocalTime.of(14, 30) },
            new LocalTime[]{ LocalTime.of(14, 30),LocalTime.of(15, 0)  },
            new LocalTime[]{ LocalTime.of(15, 0), LocalTime.of(15, 30) },
            new LocalTime[]{ LocalTime.of(15, 30),LocalTime.of(16, 0)  },
            new LocalTime[]{ LocalTime.of(16, 0), LocalTime.of(16, 30) },
            new LocalTime[]{ LocalTime.of(16, 30),LocalTime.of(17, 0)  }
        );

        for (int day = 0; day < 7; day++) {
            LocalDate slotDate = today.plusDays(day);
            for (LocalTime[] times : slotTimes) {
                slotRepository.save(AvailabilitySlot.builder()
                    .doctor(doctor)
                    .slotDate(slotDate)
                    .startTime(times[0])
                    .endTime(times[1])
                    .isBooked(false)
                    .build());
            }
        }

        log.info("   Created doctor: {} ({}) with 84 slots", fullName, specialty);
    }
}
