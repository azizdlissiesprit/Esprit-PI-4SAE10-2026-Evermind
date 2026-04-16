package tn.esprit.formation.Repository;

import tn.esprit.formation.Entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour gérer les notifications
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Récupère toutes les notifications d'un utilisateur
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Récupère les notifications non lues d'un utilisateur
     */
    List<Notification> findByUserIdAndIsReadFalseAndActiveTrue(Long userId);

    /**
     * Compte les notifications non lues
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false AND n.active = true")
    Long countUnreadNotifications(@Param("userId") Long userId);

    /**
     * Récupère les notifications prioritaires (HIGH, CRITICAL)
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.priority IN ('HIGH', 'CRITICAL') AND n.active = true ORDER BY n.createdAt DESC")
    List<Notification> findHighPriorityNotifications(@Param("userId") Long userId);

    /**
     * Récupère les notifications non expirées
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.expiresAt > CURRENT_TIMESTAMP AND n.active = true ORDER BY n.createdAt DESC")
    Page<Notification> findActiveNotifications(@Param("userId") Long userId, Pageable pageable);

    /**
     * Récupère les notifications par type
     */
    Page<Notification> findByUserIdAndNotificationTypeOrderByCreatedAtDesc(
        Long userId, String notificationType, Pageable pageable);

    /**
     * Récupère les notifications par catégorie
     */
    Page<Notification> findByUserIdAndCategoryOrderByCreatedAtDesc(
        Long userId, String category, Pageable pageable);

    /**
     * Récupère les notifications d'une formation spécifique
     */
    List<Notification> findByFormationIdAndActiveTrue(Long formationId);

    /**
     * Compte les notifications envoyées dans les N derniers jours
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since")
    Long countNotificationsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    /**
     * Récupère les notifications lues dans un intervalle de temps
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.isRead = true AND n.readAt BETWEEN :start AND :end ORDER BY n.readAt DESC")
    List<Notification> findReadNotificationsBetween(@Param("userId") Long userId, 
                                                     @Param("start") LocalDateTime start, 
                                                     @Param("end") LocalDateTime end);

    /**
     * Récupère le taux d'engagement (notifications lues / total)
     */
    @Query("SELECT CAST(COUNT(CASE WHEN n.isRead = true THEN 1 END) AS DOUBLE) / COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.active = true")
    Double getEngagementRate(@Param("userId") Long userId);

    /**
     * Récupère les notifications expirées
     */
    @Query("SELECT n FROM Notification n WHERE n.expiresAt <= CURRENT_TIMESTAMP AND n.active = true")
    List<Notification> findExpiredNotifications();

    /**
     * Récupère les formations avec prérequis satisfaits
     */
    @Query("SELECT n FROM Notification n WHERE n.notificationType = 'PREREQUISITE_READY' AND n.userId = :userId AND n.active = true")
    List<Notification> findPrerequisiteReadyNotifications(@Param("userId") Long userId);
}
