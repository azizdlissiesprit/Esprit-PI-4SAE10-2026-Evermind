package com.example.reclamation.Service;

import com.example.reclamation.DTO.NotificationResponse;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;

import java.util.List;

public interface IReclamationNotificationService {
    NotificationResponse notifyUser(Long userId, Reclamation reclamation, NotificationType type, String title, String message);

    NotificationResponse notifyAdmins(Reclamation reclamation, NotificationType type, String title, String message);

    List<NotificationResponse> getUserNotifications(Long userId);

    List<NotificationResponse> getAdminNotifications();

    NotificationResponse markAsRead(Long notificationId);

    long countUnreadUserNotifications(Long userId);

    long countUnreadAdminNotifications();
}
