package com.mediconnect.controller;

import com.mediconnect.dto.chat.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat/{consultationId}")
    public void sendMessage(
            @DestinationVariable String consultationId,
            @Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/consultation/" + consultationId, message);
    }

    @MessageMapping("/chat/{consultationId}/typing")
    public void typing(
            @DestinationVariable String consultationId,
            @Payload ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/consultation/" + consultationId + "/typing", message);
    }
}
