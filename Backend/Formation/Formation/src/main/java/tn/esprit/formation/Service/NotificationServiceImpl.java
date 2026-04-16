package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.NotificationDTO;
import tn.esprit.formation.DTO.NotificationStatsDTO;
import tn.esprit.formation.Entity.Notification;
import tn.esprit.formation.Entity.NotificationPreference;
import tn.esprit.formation.Repository.NotificationRepository;
import tn.esprit.formation.Repository.NotificationPreferenceRepository;
import tn.esprit.formation.Repository.UserTimeTrackRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour gérer les notifications intelligentes
 */
@Service
@AllArgsConstructor
@Transactional
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserTimeTrackRepository userTimeTrackRepository;

    // ============ Gestion des notifications ============

    @Override
    public NotificationDTO createNotification(Long userId,
                                             Notification.NotificationType type,
                                             Notification.NotificationCategory category,
                                             String title,
                                             String message,
                                             Notification.Priority priority) {
        
        return createDetailedNotification(userId, type, category, title, message, priority, null, null, null, null, null);
    }

    @Override
    public NotificationDTO createDetailedNotification(
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
        String templateId) {

        // Vérifier les préférences
        NotificationPreference prefs = getUserPreferences(userId);
        
        if (!prefs.getNotificationsEnabled()) {
            throw new RuntimeException("Les notifications sont désactivées pour cet utilisateur");
        }

        if (hasReachedDailyQuota(userId)) {
            throw new RuntimeException("Quota quotidien atteint pour cet utilisateur");
        }

        if (isInQuietHours(userId) && priority != Notification.Priority.CRITICAL) {
            throw new RuntimeException("Les heures silencieuses sont actives, seules les notifications CRITICAL sont envoyées");
        }

        Notification notification = Notification.builder()
            .userId(userId)
            .notificationType(type)
            .category(category)
            .title(title)
            .message(message)
            .priority(priority)
            .formationId(formationId)
            .moduleId(moduleId)
            .quizId(quizId)
            .actionLink(actionLink)
            .templateId(templateId)
            .active(true)
            .isRead(false)
            .viewCount(0)
            .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Override
    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseAndActiveTrue(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification non trouvée: " + notificationId));
        
        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }
        
        return mapToDTO(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseAndActiveTrue(userId);
        LocalDateTime now = LocalDateTime.now();
        
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(now);
        });
        
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification non trouvée: " + notificationId));
        
        notification.setActive(false);
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDTO> getHighPriorityNotifications(Long userId) {
        return notificationRepository.findHighPriorityNotifications(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<NotificationDTO> getActiveNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findActiveNotifications(userId, pageable)
            .map(this::mapToDTO);
    }

    @Override
    public Page<NotificationDTO> getNotificationsByType(Long userId,
                                                         Notification.NotificationType type,
                                                         Pageable pageable) {
        return notificationRepository.findByUserIdAndNotificationTypeOrderByCreatedAtDesc(
            userId, type.toString(), pageable)
            .map(this::mapToDTO);
    }

    @Override
    public Page<NotificationDTO> getNotificationsByCategory(Long userId,
                                                            Notification.NotificationCategory category,
                                                            Pageable pageable) {
        return notificationRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(
            userId, category.toString(), pageable)
            .map(this::mapToDTO);
    }

    // ============ Notifications intelligentes/automatiques ============

    @Override
    public void generateInactivityReminder(Long userId, Long formationId, long inactionDurationMinutes) {
        String title = "Vous nous manquez !";
        String message = String.format("Vous n'avez pas suivi de formation depuis %d minutes. Reconnecter vous dès maintenant !",
            inactionDurationMinutes);
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.REMINDER,
            Notification.NotificationCategory.ENGAGEMENT,
            title,
            message,
            Notification.Priority.MEDIUM,
            formationId,
            null,
            null,
            "/formation/" + formationId,
            "inactivity_reminder"
        );
    }

    @Override
    public void generateEncouragementMessage(Long userId, int completionPercentage, String formationTitle) {
        String title = "Excellent progrès ! 🎉";
        String message;
        
        if (completionPercentage < 30) {
            message = "Vous venez de compléter " + completionPercentage + "% de " + formationTitle + ". Continuez, vous êtes sur la bonne voie !";
        } else if (completionPercentage < 70) {
            message = "Bravo ! Vous avez complété " + completionPercentage + "% de " + formationTitle + ". Vous êtes à mi-chemin !";
        } else {
            message = "Presque là ! " + completionPercentage + "% complété. Terminez " + formationTitle + " et vous aurez votre certificat !";
        }
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.ENCOURAGEMENT,
            Notification.NotificationCategory.ENGAGEMENT,
            title,
            message,
            Notification.Priority.LOW,
            null,
            null,
            null,
            null,
            "encouragement"
        );
    }

    @Override
    public void notifyPrerequisiteSatisfied(Long userId, String prerequisiteTitle, Long nextFormationId) {
        String title = "🔓 Nouvelle formation débloquée !";
        String message = "Félicitations ! Vous avez complété " + prerequisiteTitle + ". Une nouvelle formation vous attend !";
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.PREREQUISITE_READY,
            Notification.NotificationCategory.FORMATION,
            title,
            message,
            Notification.Priority.HIGH,
            nextFormationId,
            null,
            null,
            "/formation/" + nextFormationId,
            "prerequisite_satisfied"
        );
    }

    @Override
    public void notifyMilestoneReached(Long userId, String milestoneTitle, Integer milestoneBadge) {
        String title = "🏆 Jalon atteint !";
        String message = "Vous avez débloqué: " + milestoneTitle;
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.ACHIEVEMENT,
            Notification.NotificationCategory.ACHIEVEMENT,
            title,
            message,
            Notification.Priority.HIGH,
            null,
            null,
            null,
            null,
            "milestone_reached"
        );
    }

    @Override
    public void notifyApproachingLimit(Long userId, String limitType, Integer percentageRemaining) {
        String title = "⚠️ Limite approchante";
        String message = "Vous avez " + percentageRemaining + "% de " + limitType + " restant.";
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.SESSION_TIME_WARNING,
            Notification.NotificationCategory.REMINDER,
            title,
            message,
            Notification.Priority.MEDIUM,
            null,
            null,
            null,
            null,
            "limit_warning"
        );
    }

    @Override
    public void notifyNewContentAvailable(Long userId, String contentTitle, String contentType) {
        String title = "📚 Nouveau contenu disponible";
        String message = "Un nouveau " + contentType + " a été ajouté: " + contentTitle;
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.NEW_CONTENT,
            Notification.NotificationCategory.FORMATION,
            title,
            message,
            Notification.Priority.MEDIUM,
            null,
            null,
            null,
            null,
            "new_content"
        );
    }

    @Override
    public void notifyQuizAvailable(Long userId, String quizTitle, Long quizId, Long formationId) {
        String title = "✏️ Un quiz vous attend";
        String message = "Le quiz '" + quizTitle + "' est maintenant disponible. Testez vos connaissances !";
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.QUIZ_AVAILABLE,
            Notification.NotificationCategory.FORMATION,
            title,
            message,
            Notification.Priority.MEDIUM,
            formationId,
            null,
            quizId,
            "/quiz/" + quizId,
            "quiz_available"
        );
    }

    @Override
    public void notifyCertificateReady(Long userId, Long certificateId, String certificateName) {
        String title = "🎓 Certificat prêt !";
        String message = "Votre certificat pour " + certificateName + " est prêt à télécharger.";
        
        createDetailedNotification(
            userId,
            Notification.NotificationType.CERTIFICATE_READY,
            Notification.NotificationCategory.ACHIEVEMENT,
            title,
            message,
            Notification.Priority.HIGH,
            null,
            null,
            null,
            "/certificates/" + certificateId,
            "certificate_ready"
        );
    }

    @Override
    public void generateBehaviorBasedNotification(Long userId) {
        // Analyse complète du comportement de l'utilisateur pour générer une notification pertinente
        NotificationPreference prefs = getUserPreferences(userId);
        
        if (!prefs.getEncouragementEnabled()) {
            return;
        }
        
        // Exemple: générer une notification basée sur l'engagement
        Long unreadCount = countUnreadNotifications(userId);
        Double engagementRate = getEngagementRate(userId);
        
        if (engagementRate != null && engagementRate < 0.3) {
            createDetailedNotification(
                userId,
                Notification.NotificationType.PERSONALIZED_TIP,
                Notification.NotificationCategory.ENGAGEMENT,
                "💡 Conseil personnalisé",
                "Vous semblez moins engagé. Les utilisateurs actifs complètent 2 formations de plus. Commencez une nouvelle formation !",
                Notification.Priority.LOW,
                null,
                null,
                null,
                null,
                "personalized_tip"
            );
        }
    }

    // ============ Statistiques et Analytics ============

    @Override
    public NotificationStatsDTO getNotificationStats(Long userId) {
        Long total = (long) notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, 
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getTotalElements();
        
        Long unread = countUnreadNotifications(userId);
        
        List<Notification> highPriority = notificationRepository.findHighPriorityNotifications(userId);
        
        Double engagementRate = getEngagementRate(userId);
        if (engagementRate == null) engagementRate = 0.0;
        
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        Long thisWeek = notificationRepository.countNotificationsSince(userId, oneWeekAgo);
        
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        Long thisMonth = notificationRepository.countNotificationsSince(userId, oneMonthAgo);
        
        return NotificationStatsDTO.builder()
            .totalNotifications(total)
            .unreadCount(unread)
            .highlightPriority((long) highPriority.size())
            .engagementRate(engagementRate * 100)
            .thisWeekCount(thisWeek.intValue())
            .thisMonthCount(thisMonth.intValue())
            .build();
    }

    @Override
    public Double getEngagementRate(Long userId) {
        return notificationRepository.getEngagementRate(userId);
    }

    @Override
    public Long countUnreadNotifications(Long userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }

    @Override
    public List<Object[]> getNotificationTypeStats(Long userId) {
        // À implémenter avec une query native si nécessaire
        return new ArrayList<>();
    }

    // ============ Gestion des préférences ============

    @Override
    public NotificationPreference createDefaultPreferences(Long userId) {
        Optional<NotificationPreference> existing = preferenceRepository.findByUserId(userId);
        
        if (existing.isPresent()) {
            return existing.get();
        }
        
        NotificationPreference prefs = NotificationPreference.builder()
            .userId(userId)
            .notificationsEnabled(true)
            .remindersEnabled(true)
            .encouragementEnabled(true)
            .achievementsEnabled(true)
            .inactivityWarningsEnabled(true)
            .reminderFrequencyHours(24)
            .quietHourStart(22)
            .quietHourEnd(7)
            .maxNotificationsPerDay(10)
            .preferredLanguage("fr")
            .emailNotificationsEnabled(false)
            .build();
        
        return preferenceRepository.save(prefs);
    }

    @Override
    public NotificationPreference getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));
    }

    @Override
    public NotificationPreference updatePreferences(Long userId, NotificationPreference preferences) {
        NotificationPreference existing = getUserPreferences(userId);
        
        if (preferences.getNotificationsEnabled() != null) {
            existing.setNotificationsEnabled(preferences.getNotificationsEnabled());
        }
        if (preferences.getRemindersEnabled() != null) {
            existing.setRemindersEnabled(preferences.getRemindersEnabled());
        }
        if (preferences.getEncouragementEnabled() != null) {
            existing.setEncouragementEnabled(preferences.getEncouragementEnabled());
        }
        if (preferences.getMaxNotificationsPerDay() != null) {
            existing.setMaxNotificationsPerDay(preferences.getMaxNotificationsPerDay());
        }
        
        return preferenceRepository.save(existing);
    }

    @Override
    public void toggleNotificationsEnabled(Long userId, Boolean enabled) {
        NotificationPreference prefs = getUserPreferences(userId);
        prefs.setNotificationsEnabled(enabled);
        preferenceRepository.save(prefs);
    }

    @Override
    public void setReminderFrequency(Long userId, Integer frequencyHours) {
        NotificationPreference prefs = getUserPreferences(userId);
        prefs.setReminderFrequencyHours(frequencyHours);
        preferenceRepository.save(prefs);
    }

    @Override
    public void setQuietHours(Long userId, Integer startHour, Integer endHour) {
        NotificationPreference prefs = getUserPreferences(userId);
        prefs.setQuietHourStart(startHour);
        prefs.setQuietHourEnd(endHour);
        preferenceRepository.save(prefs);
    }

    // ============ Nettoyage et maintenance ============

    @Override
    public Long cleanupExpiredNotifications() {
        List<Notification> expired = notificationRepository.findExpiredNotifications();
        expired.forEach(n -> n.setActive(false));
        notificationRepository.saveAll(expired);
        return (long) expired.size();
    }

    @Override
    public Boolean shouldSendReminder(Long userId, Long formationId) {
        NotificationPreference prefs = getUserPreferences(userId);
        
        if (!prefs.getRemindersEnabled()) {
            return false;
        }
        
        if (isInQuietHours(userId)) {
            return false;
        }
        
        if (hasReachedDailyQuota(userId)) {
            return false;
        }
        
        return true;
    }

    @Override
    public Boolean isInQuietHours(Long userId) {
        NotificationPreference prefs = getUserPreferences(userId);
        LocalTime now = LocalTime.now();
        LocalTime start = LocalTime.of(prefs.getQuietHourStart(), 0);
        LocalTime end = LocalTime.of(prefs.getQuietHourEnd(), 0);
        
        if (start.isAfter(end)) {
            // Les heures silencieuses traversent minuit
            return now.isAfter(start) || now.isBefore(end);
        } else {
            return now.isAfter(start) && now.isBefore(end);
        }
    }

    @Override
    public Boolean hasReachedDailyQuota(Long userId) {
        NotificationPreference prefs = getUserPreferences(userId);
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        
        Long todayCount = notificationRepository.countNotificationsSince(userId, today);
        return todayCount >= prefs.getMaxNotificationsPerDay();
    }

    // ============ Utilitaires privés ============

    private NotificationDTO mapToDTO(Notification entity) {
        return NotificationDTO.builder()
            .id(entity.getId())
            .userId(entity.getUserId())
            .notificationType(entity.getNotificationType().toString())
            .category(entity.getCategory().toString())
            .title(entity.getTitle())
            .message(entity.getMessage())
            .priority(entity.getPriority().toString())
            .isRead(entity.getIsRead())
            .readAt(entity.getReadAt())
            .formationId(entity.getFormationId())
            .moduleId(entity.getModuleId())
            .quizId(entity.getQuizId())
            .behaviorScore(entity.getBehaviorScore())
            .actionLink(entity.getActionLink())
            .active(entity.getActive())
            .createdAt(entity.getCreatedAt())
            .expiresAt(entity.getExpiresAt())
            .templateId(entity.getTemplateId())
            .viewCount(entity.getViewCount())
            .details(entity.getDetails())
            .build();
    }
}
