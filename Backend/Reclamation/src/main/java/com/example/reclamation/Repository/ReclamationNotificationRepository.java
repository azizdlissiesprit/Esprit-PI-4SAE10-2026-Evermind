package com.example.reclamation.Repository;

import com.example.reclamation.Entity.NotificationAudience;
import com.example.reclamation.Entity.ReclamationNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReclamationNotificationRepository extends JpaRepository<ReclamationNotification, Long> {
    List<ReclamationNotification> findByAudienceAndRecipientUserIdOrderByCreatedAtDesc(NotificationAudience audience, Long recipientUserId);

    List<ReclamationNotification> findByAudienceOrderByCreatedAtDesc(NotificationAudience audience);

    long countByAudienceAndRecipientUserIdAndReadFalse(NotificationAudience audience, Long recipientUserId);

    long countByAudienceAndReadFalse(NotificationAudience audience);

    void deleteByReclamationReclamationId(Long reclamationId);
}
