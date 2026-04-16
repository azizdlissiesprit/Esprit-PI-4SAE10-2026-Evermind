package tn.esprit.formation.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité pour gérer les notifications intelligentes
 * Notifications automatiques et intelligentes basées sur le comportement utilisateur
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_created", columnList = "user_id, created_at"),
    @Index(name = "idx_user_read", columnList = "user_id, is_read"),
    @Index(name = "idx_user_type", columnList = "user_id, notification_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID de l'utilisateur destinataire
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * Type de notification
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    /**
     * Catégorie/Source de la notification
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationCategory category;

    /**
     * Titre de la notification
     */
    @Column(nullable = false)
    private String title;

    /**
     * Corps du message
     */
    @Column(columnDefinition = "TEXT")
    private String message;

    /**
     * Contenu détaillé (JSON)
     */
    @Column(columnDefinition = "TEXT")
    private String details;

    /**
     * Priorité (LOW, MEDIUM, HIGH, CRITICAL)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    /**
     * Indique si la notification a été lue
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    /**
     * Timestamp de lecture
     */
    private LocalDateTime readAt;

    /**
     * Formation associée (optionnel)
     */
    private Long formationId;

    /**
     * Module associé (optionnel)
     */
    private Long moduleId;

    /**
     * Quiz associé (optionnel)
     */
    private Long quizId;

    /**
     * Score du comportement qui a déclenché la notification (0-100)
     */
    private Integer behaviorScore;

    /**
     * Lien d'action (URL pour aller à la formation, etc.)
     */
    private String actionLink;

    /**
     * Indique si la notification est active/valide
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Date de création
     */
    private LocalDateTime createdAt;

    /**
     * Date d'expiration (notification expirée si passée)
     */
    private LocalDateTime expiresAt;

    /**
     * Template utilisé pour générer la notification
     */
    @Column(length = 50)
    private String templateId;

    /**
     * Nombre de fois que l'utilisateur a vu cette notification (pings)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            // Par défaut, les notifications expirent après 30 jours
            expiresAt = createdAt.plusDays(30);
        }
    }

    /**
     * Types de notifications
     */
    public enum NotificationType {
        REMINDER,              // Rappel de formation en attente
        ACHIEVEMENT,           // Succès débloqué
        ENCOURAGEMENT,         // Message d'encouragement personnalisé
        INACTIVITY_WARNING,    // Avertissement inactivité
        PREREQUISITE_READY,    // Prérequis complété, nouvelle formation disponible
        QUIZ_AVAILABLE,        // Quiz disponible pour une formation
        PROGRESS_UPDATE,       // Mise à jour de progrès
        LEADERBOARD,          // Vous êtes classé #X
        CHALLENGE,            // Nouveau défi pour vous
        CERTIFICATE_READY,     // Certificat prêt à télécharger
        SESSION_TIME_WARNING,  // Vous approchez de la limite de temps
        PERSONALIZED_TIP,     // Conseil personnalisé basé sur vos données
        FORMATION_EXPIRING,   // Formation expiration imminente
        NEW_CONTENT,          // Nouveau contenu disponible
        MILESTONE_REACHED     // Jalons atteints
    }

    /**
     * Catégories de notifications
     */
    public enum NotificationCategory {
        FORMATION,             // Formations
        ACHIEVEMENT,           // Réalisations
        SYSTEM,               // Système
        ENGAGEMENT,           // Engagement utilisateur
        HEALTH,               // Santé/Bien-être
        REMINDER,             // Rappels
        REWARD                // Récompenses
    }

    /**
     * Niveaux de priorité
     */
    public enum Priority {
        LOW,                  // Non urgent
        MEDIUM,               // Normal
        HIGH,                 // Important
        CRITICAL              // Critique/Urgent
    }
}
