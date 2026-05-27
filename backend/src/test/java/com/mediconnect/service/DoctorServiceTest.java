package com.mediconnect.service;

import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.User;
import com.mediconnect.repository.DoctorRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorService Unit Tests")
class DoctorServiceTest {

    @Mock private DoctorRepository doctorRepository;
    @Mock private com.mediconnect.repository.UserRepository userRepository;
    @Mock private com.mediconnect.repository.AvailabilitySlotRepository slotRepository;
    @Mock private com.mediconnect.repository.ReviewRepository reviewRepository;

    @InjectMocks private DoctorService doctorService;

    private Doctor doctor;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFullName("Dr. Jane");
        user.setEmail("dr.jane@test.com");
        user.setRole(User.Role.DOCTOR);

        doctor = new Doctor();
        doctor.setId(UUID.randomUUID());
        doctor.setUser(user);
        doctor.setSpecialty("Dermatologist");
        doctor.setConsultationFee(BigDecimal.valueOf(300));
        doctor.setRating(4.5);
        doctor.setExperienceYears(7);
    }

    @Test
    @DisplayName("Doctor search returns paginated results")
    void searchDoctors_shouldReturnPagedResults() {
        Page<Doctor> mockPage = new PageImpl<>(List.of(doctor));
        when(doctorRepository.searchDoctors(isNull(), isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
            .thenReturn(mockPage);

        var result = doctorService.searchDoctors(null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("Search with specialty filter returns correct results")
    void searchDoctors_shouldFilter_bySpecialty() {
        Page<Doctor> mockPage = new PageImpl<>(List.of(doctor));
        when(doctorRepository.searchDoctors(eq("Dermatologist"), isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
            .thenReturn(mockPage);

        var result = doctorService.searchDoctors("Dermatologist", null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals("Dermatologist", result.getContent().get(0).getSpecialty());
    }

    @Test
    @DisplayName("getDoctorById throws when doctor not found")
    void getDoctorById_shouldThrow_whenNotFound() {
        when(doctorRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(com.mediconnect.exception.ResourceNotFoundException.class,
            () -> doctorService.getDoctorById(UUID.randomUUID()));
    }
}
