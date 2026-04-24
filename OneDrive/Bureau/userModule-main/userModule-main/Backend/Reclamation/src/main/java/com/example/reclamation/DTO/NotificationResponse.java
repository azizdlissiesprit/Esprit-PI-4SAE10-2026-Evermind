package com.example.reclamation.DTO;

import com.example.reclamation.Entity.NotificationAudience;
import com.example.reclamation.Entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long notificationId;
    private Long reclamationId;
    private NotificationType notificationType;
    private NotificationAudience audience;
    private Long recipientUserId;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
