package tn.esprit.formation.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité pour gérer les préférences de notifications par utilisateur
 */
@Entity
@Table(name = "notification_preferences", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID de l'utilisateur
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * Activer/Désactiver les notifications
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = true;

    /**
     * Envoyer des reminders
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean remindersEnabled = true;

    /**
     * Envoyer des messages d'encouragement
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean encouragementEnabled = true;

    /**
     * Envoyer des notifications de réalisations
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean achievementsEnabled = true;

    /**
     * Envoyer des avertissements d'inactivité
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean inactivityWarningsEnabled = true;

    /**
     * Fréquence des reminders (en heures)
     * 0 = pas de reminders
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer reminderFrequencyHours = 24;

    /**
     * Heure de début pour les notifications (0-23)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer quietHourStart = 22;  // 22h (10 PM)

    /**
     * Heure de fin pour les notifications (0-23)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer quietHourEnd = 7;    // 7h (7 AM)

    /**
     * Nombre maximum de notifications par jour
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer maxNotificationsPerDay = 10;

    /**
     * Langue préférée pour les notifications
     */
    @Column(length = 10)
    @Builder.Default
    private String preferredLanguage = "fr";

    /**
     * Email pour les notifications
     */
    private String notificationEmail;

    /**
     * Envoyer aussi à l'email
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean emailNotificationsEnabled = false;

    /**
     * Date de dernière mise à jour
     */
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
