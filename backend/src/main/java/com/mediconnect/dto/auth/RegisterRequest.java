package com.mediconnect.dto.auth;

import com.mediconnect.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 150)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^\\s*$|^[+]?[0-9]{10,15}$", message = "Invalid phone number")
    private String phone;

    private User.Role role = User.Role.PATIENT;

    // Doctor-specific fields
    private String specialty;
    private Integer experienceYears;
    private java.math.BigDecimal consultationFee;
    private String licenseNumber;
    private String bio;
    private String city;
}
