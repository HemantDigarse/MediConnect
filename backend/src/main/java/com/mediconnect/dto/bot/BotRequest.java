package com.mediconnect.dto.bot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BotRequest {
    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must be under 1000 characters")
    private String message;
}
