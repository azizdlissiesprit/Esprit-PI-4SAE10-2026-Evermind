package com.example.reclamation.Service;

import com.example.reclamation.DTO.NotificationResponse;
import com.example.reclamation.Entity.NotificationAudience;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationNotification;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Exception.NotificationNotFoundException;
import com.example.reclamation.Repository.ReclamationNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReclamationNotificationServiceImpl implements IReclamationNotificationService {

    private final ReclamationNotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public NotificationResponse notifyUser(Long userId, Reclamation reclamation, NotificationType type, String title, String message) {
        if (userId == null) {
            throw new BadRequestException("User notification requires a recipient userId");
        }

        ReclamationNotification notification = notificationRepository.save(ReclamationNotification.builder()
                .reclamation(reclamation)
                .notificationType(type)
                .audience(NotificationAudience.USER)
                .recipientUserId(userId)
                .title(title)
                .message(message)
                .build());

        NotificationResponse response = mapToResponse(notification);
        messagingTemplate.convertAndSend("/topic/notifications/users/" + userId, response);
        return response;
    }

    @Override
    public NotificationResponse notifyAdmins(Reclamation reclamation, NotificationType type, String title, String message) {
        ReclamationNotification notification = notificationRepository.save(ReclamationNotification.builder()
                .reclamation(reclamation)
                .notificationType(type)
                .audience(NotificationAudience.ADMIN)
                .title(title)
                .message(message)
                .build());

        NotificationResponse response = mapToResponse(notification);
        messagingTemplate.convertAndSend("/topic/notifications/admin", response);
        return response;
    }

    @Override
    public List<NotificationResponse> getUserNotifications(Long userId) {
        if (userId == null) {
            throw new BadRequestException("A userId is required");
        }

        return notificationRepository.findByAudienceAndRecipientUserIdOrderByCreatedAtDesc(NotificationAudience.USER, userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getAdminNotifications() {
        return notificationRepository.findByAudienceOrderByCreatedAtDesc(NotificationAudience.ADMIN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        ReclamationNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));
        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Override
    public long countUnreadUserNotifications(Long userId) {
        if (userId == null) {
            throw new BadRequestException("A userId is required");
        }
        return notificationRepository.countByAudienceAndRecipientUserIdAndReadFalse(NotificationAudience.USER, userId);
    }

    @Override
    public long countUnreadAdminNotifications() {
        return notificationRepository.countByAudienceAndReadFalse(NotificationAudience.ADMIN);
    }

    private NotificationResponse mapToResponse(ReclamationNotification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .reclamationId(notification.getReclamation() != null ? notification.getReclamation().getReclamationId() : null)
                .notificationType(notification.getNotificationType())
                .audience(notification.getAudience())
                .recipientUserId(notification.getRecipientUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
