package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.NotificationDTO;
import tn.esprit.formation.DTO.NotificationStatsDTO;
import tn.esprit.formation.Entity.Notification;
import tn.esprit.formation.Entity.NotificationPreference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface pour gérer les notifications intelligentes
 */
public interface INotificationService {

    // ============ Gestion des notifications ============

    /**
     * Crée une notification intelligente
     */
    NotificationDTO createNotification(Long userId, 
                                      Notification.NotificationType type,
                                      Notification.NotificationCategory category,
                                      String title, 
                                      String message,
                                      Notification.Priority priority);

    /**
     * Crée une notification avec contexte complet
     */
    NotificationDTO createDetailedNotification(
        Long userId,
        Notification.NotificationType type,
        Notification.NotificationCategory category,
        String title,
        String message,
        Notification.Priority priority,
        Long formationId,
        Long moduleId,
        Long quizId,
        String actionLink,
        String templateId);

    /**
     * Récupère les notifications d'un utilisateur
     */
    Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable);

    /**
     * Récupère les notifications non lues
     */
    List<NotificationDTO> getUnreadNotifications(Long userId);

    /**
     * Marque une notification comme lue
     */
    NotificationDTO markAsRead(Long notificationId);

    /**
     * Marque toutes les notifications comme lues
     */
    void markAllAsRead(Long userId);

    /**
     * Supprime/Archive une notification
     */
    void deleteNotification(Long notificationId);

    /**
     * Récupère les notifications prioritaires
     */
    List<NotificationDTO> getHighPriorityNotifications(Long userId);

    /**
     * Récupère les notifications actives (non expirées)
     */
    Page<NotificationDTO> getActiveNotifications(Long userId, Pageable pageable);

    /**
     * Récupère les notifications par type
     */
    Page<NotificationDTO> getNotificationsByType(Long userId, 
                                                  Notification.NotificationType type, 
                                                  Pageable pageable);

    /**
     * Récupère les notifications par catégorie
     */
    Page<NotificationDTO> getNotificationsByCategory(Long userId, 
                                                      Notification.NotificationCategory category, 
                                                      Pageable pageable);

    // ============ Notifications intelligentes/automatiques ============

    /**
     * Génère un reminder intelligent basé sur l'inactivité
     */
    void generateInactivityReminder(Long userId, Long formationId, long inactionDurationMinutes);

    /**
     * Génère un message d'encouragement personnalisé
     */
    void generateEncouragementMessage(Long userId, int completionPercentage, String formationTitle);

    /**
     * Notifie qu'un prérequis est satisfait
     */
    void notifyPrerequisiteSatisfied(Long userId, String prerequisiteTitle, Long nextFormationId);

    /**
     * Génère une notification de jalon atteint
     */
    void notifyMilestoneReached(Long userId, String milestoneTitle, Integer milestoneBadge);

    /**
     * Envoie une alerte si l'utilisateur approche d'une limite
     */
    void notifyApproachingLimit(Long userId, String limitType, Integer percentageRemaining);

    /**
     * Notifie que du nouveau contenu est disponible
     */
    void notifyNewContentAvailable(Long userId, String contentTitle, String contentType);

    /**
     * Notifie un passage au quiz
     */
    void notifyQuizAvailable(Long userId, String quizTitle, Long quizId, Long formationId);

    /**
     * Notifie un certificat prêt
     */
    void notifyCertificateReady(Long userId, Long certificateId, String certificateName);

    /**
     * Génère une notification personnalisée basée sur le comportement
     */
    void generateBehaviorBasedNotification(Long userId);

    // ============ Statistiques et Analytics ============

    /**
     * Récupère les statistiques de notifications
     */
    NotificationStatsDTO getNotificationStats(Long userId);

    /**
     * Récupère le taux d'engagement (notifications lues)
     */
    Double getEngagementRate(Long userId);

    /**
     * Compte les notifications non lues
     */
    Long countUnreadNotifications(Long userId);

    /**
     * Récupère les statistiques par type de notification
     */
    List<Object[]> getNotificationTypeStats(Long userId);

    // ============ Gestion des préférences ============

    /**
     * Crée les préférences par défaut pour un utilisateur
     */
    NotificationPreference createDefaultPreferences(Long userId);

    /**
     * Récupère les préférences d'un utilisateur
     */
    NotificationPreference getUserPreferences(Long userId);

    /**
     * Met à jour les préférences
     */
    NotificationPreference updatePreferences(Long userId, NotificationPreference preferences);

    /**
     * Change l'état global des notifications
     */
    void toggleNotificationsEnabled(Long userId, Boolean enabled);

    /**
     * Change la fréquence des reminders
     */
    void setReminderFrequency(Long userId, Integer frequencyHours);

    /**
     * Change les heures silencieuses
     */
    void setQuietHours(Long userId, Integer startHour, Integer endHour);

    // ============ Nettoyage et maintenance ============

    /**
     * Supprime les notifications expirées
     */
    Long cleanupExpiredNotifications();

    /**
     * Vérifie s'il faut envoyer un reminder basé sur la fréquence
     */
    Boolean shouldSendReminder(Long userId, Long formationId);

    /**
     * Vérifie si c'est dans les heures silencieuses
     */
    Boolean isInQuietHours(Long userId);

    /**
     * Vérifie si l'utilisateur a atteint son quota quotidien
     */
    Boolean hasReachedDailyQuota(Long userId);
}
