package com.mediconnect.dto.doctor;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateSlotRequest {
    @NotNull private LocalDate slotDate;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
}
