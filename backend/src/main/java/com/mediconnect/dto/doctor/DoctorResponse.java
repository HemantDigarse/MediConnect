package com.mediconnect.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String specialty;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private Double rating;
    private Integer reviewCount;
    private String licenseNumber;
    private String bio;
    private String city;
    private String profileImageUrl;
    private Boolean isAvailable;
}
