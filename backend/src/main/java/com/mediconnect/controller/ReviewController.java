package com.mediconnect.controller;

import com.mediconnect.dto.common.ApiResponse;
import com.mediconnect.entity.Review;
import com.mediconnect.service.ReviewService;
import com.mediconnect.service.UserResolverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Submit and view doctor reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserResolverService userResolver;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Submit a review for a completed appointment")
    public ResponseEntity<ApiResponse<Review>> submitReview(
            @RequestParam UUID doctorId,
            @RequestParam UUID appointmentId,
            @RequestParam int rating,
            @RequestParam(required = false) String comment,
            Authentication authentication) {
        UUID patientId = userResolver.resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
            reviewService.submitReview(patientId, doctorId, appointmentId, rating, comment),
            "Review submitted successfully"));
    }
}
