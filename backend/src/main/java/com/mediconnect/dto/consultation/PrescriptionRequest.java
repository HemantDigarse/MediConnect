package com.mediconnect.dto.consultation;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrescriptionRequest {
    @NotBlank private String medications;
    @NotBlank private String dosage;
    private String instructions;
}
