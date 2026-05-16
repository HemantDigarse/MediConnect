package com.mediconnect.service;

import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserResolverService {

    private final UserRepository userRepository;

    public UUID resolveUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new com.mediconnect.exception.ResourceNotFoundException("User not found"))
            .getId();
    }
}
