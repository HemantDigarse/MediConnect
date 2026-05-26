package com.mediconnect.controller;

import com.mediconnect.dto.bot.BotRequest;
import com.mediconnect.dto.bot.BotResponse;
import com.mediconnect.dto.common.ApiResponse;
import com.mediconnect.service.MediConnectBotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bot")
@RequiredArgsConstructor
@Tag(name = "MediConnect Bot", description = "General health and prescription preparation guidance")
public class MediConnectBotController {

    private final MediConnectBotService botService;

    @PostMapping("/general-prescription")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get general guidance and doctor prescription notes")
    public ResponseEntity<ApiResponse<BotResponse>> generalPrescription(@Valid @RequestBody BotRequest request) {
        return ResponseEntity.ok(ApiResponse.success(botService.respond(request.getMessage()), "Bot response generated"));
    }
}
