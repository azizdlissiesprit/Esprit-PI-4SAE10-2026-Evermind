package tn.esprit.formation.DTO;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO pour les notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Long id;

    private Long userId;

    private String notificationType;

    private String category;

    private String title;

    private String message;

    private String priority;

    private Boolean isRead;

    private LocalDateTime readAt;

    private Long formationId;

    private Long moduleId;

    private Long quizId;

    private Integer behaviorScore;

    private String actionLink;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    private String templateId;

    private Integer viewCount;

    private String details;
}
