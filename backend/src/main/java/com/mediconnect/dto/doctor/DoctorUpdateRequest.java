package com.mediconnect.dto.doctor;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DoctorUpdateRequest {
    private String fullName;
    private String phone;
    private String specialty;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String bio;
    private String city;
    private Boolean isAvailable;
}
