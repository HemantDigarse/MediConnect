package com.mediconnect.dto.appointment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BookAppointmentRequest {
    @NotNull private UUID   doctorId;
    @NotNull private UUID   slotId;
    private String          chiefComplaint;
    private String          currency = "INR";
}
