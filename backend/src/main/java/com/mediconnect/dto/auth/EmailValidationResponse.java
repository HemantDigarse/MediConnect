package com.mediconnect.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailValidationResponse {
    private String email;
    private boolean validFormat;
    private boolean domainReachable;
    private boolean available;
    private String message;
}
