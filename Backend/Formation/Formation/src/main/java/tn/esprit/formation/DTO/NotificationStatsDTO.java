package tn.esprit.formation.DTO;

import lombok.*;

/**
 * DTO pour les statistiques de notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationStatsDTO {

    private Long totalNotifications;

    private Long unreadCount;

    private Long highlightPriority;  // CRITICAL + HIGH

    private String lastNotificationTime;

    private Double engagementRate;  // % de notifications lues

    private String topNotificationType;

    private Integer thisWeekCount;

    private Integer thisMonthCount;
}
