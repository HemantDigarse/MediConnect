package com.mediconnect.service;

import com.mediconnect.dto.notification.NotificationResponse;
import com.mediconnect.entity.*;
import com.mediconnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationResponse createInAppNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(Notification.Type.IN_APP)
            .isRead(false)
            .build();
        return mapToResponse(notificationRepository.save(notification));
    }

    public Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::mapToResponse);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new com.mediconnect.exception.ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
            .forEach(n -> {
                n.setIsRead(true);
                notificationRepository.save(n);
            });
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .userId(n.getUser().getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType().name())
            .isRead(n.getIsRead())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
