package tn.esprit.formation.Controller;

import tn.esprit.formation.DTO.NotificationDTO;
import tn.esprit.formation.DTO.NotificationStatsDTO;
import tn.esprit.formation.DTO.NotificationCreateRequest;
import tn.esprit.formation.Entity.Notification;
import tn.esprit.formation.Entity.NotificationPreference;
import tn.esprit.formation.Service.INotificationService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour gérer les notifications intelligentes
 */
@RestController
@RequestMapping("/formation/notifications")
@AllArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final INotificationService notificationService;

    // ============ Gestion des notifications ============

    /**
     * Crée une nouvelle notification
     * POST /formation/notifications/create
     */
    @PostMapping("/create")
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationCreateRequest request) {
        try {
            NotificationDTO notification = notificationService.createDetailedNotification(
                request.getUserId(),
                Notification.NotificationType.valueOf(request.getType()),
                Notification.NotificationCategory.valueOf(request.getCategory()),
                request.getTitle(),
                request.getMessage(),
                Notification.Priority.valueOf(request.getPriority() != null ? request.getPriority() : "MEDIUM"),
                request.getFormationId(),
                request.getModuleId(),
                request.getQuizId(),
                request.getActionLink(),
                request.getTemplateId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère les notifications d'un utilisateur (paginées)
     * GET /formation/notifications/user/{userId}?page=0&size=10
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<NotificationDTO>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Récupère les notifications non lues
     * GET /formation/notifications/unread/{userId}
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationDTO> unread = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(unread);
    }

    /**
     * Compte les notifications non lues
     * GET /formation/notifications/unread-count/{userId}
     */
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> countUnreadNotifications(@PathVariable Long userId) {
        Long count = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(count);
    }

    /**
     * Marque une notification comme lue
     * PATCH /formation/notifications/{notificationId}/read
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long notificationId) {
        NotificationDTO notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(notification);
    }

    /**
     * Marque toutes les notifications comme lues
     * PATCH /formation/notifications/{userId}/read-all
     */
    @PatchMapping("/{userId}/read-all")
    public ResponseEntity<String> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("Toutes les notifications ont été marquées comme lues");
    }

    /**
     * Récupère les notifications prioritaires
     * GET /formation/notifications/priority/{userId}
     */
    @GetMapping("/priority/{userId}")
    public ResponseEntity<List<NotificationDTO>> getHighPriorityNotifications(@PathVariable Long userId) {
        List<NotificationDTO> highs = notificationService.getHighPriorityNotifications(userId);
        return ResponseEntity.ok(highs);
    }

    /**
     * Récupère les notifications actives (paginées)
     * GET /formation/notifications/active/{userId}
     */
    @GetMapping("/active/{userId}")
    public ResponseEntity<Page<NotificationDTO>> getActiveNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> active = notificationService.getActiveNotifications(userId, pageable);
        return ResponseEntity.ok(active);
    }

    /**
     * Récupère les notifications par type
     * GET /formation/notifications/type/{userId}/{type}
     */
    @GetMapping("/type/{userId}/{type}")
    public ResponseEntity<Page<NotificationDTO>> getByType(
            @PathVariable Long userId,
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifs = notificationService.getNotificationsByType(
            userId, Notification.NotificationType.valueOf(type), pageable);
        return ResponseEntity.ok(notifs);
    }

    /**
     * Récupère les notifications par catégorie
     * GET /formation/notifications/category/{userId}/{category}
     */
    @GetMapping("/category/{userId}/{category}")
    public ResponseEntity<Page<NotificationDTO>> getByCategory(
            @PathVariable Long userId,
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifs = notificationService.getNotificationsByCategory(
            userId, Notification.NotificationCategory.valueOf(category), pageable);
        return ResponseEntity.ok(notifs);
    }

    /**
     * Supprime/Archive une notification
     * DELETE /formation/notifications/{notificationId}
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok("Notification supprimée");
    }

    // ============ Notifications intelligentes/automatiques ============

    /**
     * Génère un reminder d'inactivité
     * POST /formation/notifications/reminder-inactivity
     */
    @PostMapping("/reminder-inactivity")
    public ResponseEntity<String> generateInactivityReminder(
            @RequestParam Long userId,
            @RequestParam Long formationId,
            @RequestParam(defaultValue = "300") long inactionMinutes) {
        notificationService.generateInactivityReminder(userId, formationId, inactionMinutes);
        return ResponseEntity.ok("Reminder d'inactivité généré");
    }

    /**
     * Génère un message d'encouragement
     * POST /formation/notifications/encouragement
     */
    @PostMapping("/encouragement")
    public ResponseEntity<String> generateEncouragement(
            @RequestParam Long userId,
            @RequestParam int completionPercentage,
            @RequestParam String formationTitle) {
        notificationService.generateEncouragementMessage(userId, completionPercentage, formationTitle);
        return ResponseEntity.ok("Message d'encouragement généré");
    }

    /**
     * Notifie qu'un prérequis est satisfait
     * POST /formation/notifications/prerequisite-ready
     */
    @PostMapping("/prerequisite-ready")
    public ResponseEntity<String> notifyPrerequisiteSatisfied(
            @RequestParam Long userId,
            @RequestParam String prerequisiteTitle,
            @RequestParam Long nextFormationId) {
        notificationService.notifyPrerequisiteSatisfied(userId, prerequisiteTitle, nextFormationId);
        return ResponseEntity.ok("Notification de prérequis envoyée");
    }

    /**
     * Notifie un jalon atteint
     * POST /formation/notifications/milestone
     */
    @PostMapping("/milestone")
    public ResponseEntity<String> notifyMilestoneReached(
            @RequestParam Long userId,
            @RequestParam String milestoneTitle,
            @RequestParam(required = false) Integer badge) {
        notificationService.notifyMilestoneReached(userId, milestoneTitle, badge);
        return ResponseEntity.ok("Notification de jalon envoyée");
    }

    /**
     * Notifie qu'une limite est approchante
     * POST /formation/notifications/approaching-limit
     */
    @PostMapping("/approaching-limit")
    public ResponseEntity<String> notifyApproachingLimit(
            @RequestParam Long userId,
            @RequestParam String limitType,
            @RequestParam Integer percentage) {
        notificationService.notifyApproachingLimit(userId, limitType, percentage);
        return ResponseEntity.ok("Notification de limite envoyée");
    }

    /**
     * Notifie qu'un nouveau contenu est disponible
     * POST /formation/notifications/new-content
     */
    @PostMapping("/new-content")
    public ResponseEntity<String> notifyNewContent(
            @RequestParam Long userId,
            @RequestParam String contentTitle,
            @RequestParam String contentType) {
        notificationService.notifyNewContentAvailable(userId, contentTitle, contentType);
        return ResponseEntity.ok("Notification de nouveau contenu envoyée");
    }

    /**
     * Notifie qu'un quiz est disponible
     * POST /formation/notifications/quiz-available
     */
    @PostMapping("/quiz-available")
    public ResponseEntity<String> notifyQuizAvailable(
            @RequestParam Long userId,
            @RequestParam String quizTitle,
            @RequestParam Long quizId,
            @RequestParam Long formationId) {
        notificationService.notifyQuizAvailable(userId, quizTitle, quizId, formationId);
        return ResponseEntity.ok("Notification de quiz envoyée");
    }

    /**
     * Notifie qu'un certificat est prêt
     * POST /formation/notifications/certificate-ready
     */
    @PostMapping("/certificate-ready")
    public ResponseEntity<String> notifyCertificateReady(
            @RequestParam Long userId,
            @RequestParam Long certificateId,
            @RequestParam String certificateName) {
        notificationService.notifyCertificateReady(userId, certificateId, certificateName);
        return ResponseEntity.ok("Notification de certificat envoyée");
    }

    /**
     * Génère une notification basée sur le comportement
     * POST /formation/notifications/behavior-based/{userId}
     */
    @PostMapping("/behavior-based/{userId}")
    public ResponseEntity<String> generateBehaviorBased(@PathVariable Long userId) {
        notificationService.generateBehaviorBasedNotification(userId);
        return ResponseEntity.ok("Notification basée sur le comportement générée");
    }

    // ============ Statistiques et Analytics ============

    /**
     * Récupère les statistiques de notifications
     * GET /formation/notifications/stats/{userId}
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<NotificationStatsDTO> getStats(@PathVariable Long userId) {
        NotificationStatsDTO stats = notificationService.getNotificationStats(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère le taux d'engagement
     * GET /formation/notifications/engagement-rate/{userId}
     */
    @GetMapping("/engagement-rate/{userId}")
    public ResponseEntity<Double> getEngagementRate(@PathVariable Long userId) {
        Double rate = notificationService.getEngagementRate(userId);
        return ResponseEntity.ok(rate != null ? rate : 0.0);
    }

    // ============ Gestion des préférences ============

    /**
     * Crée les préférences par défaut
     * POST /formation/notifications/preferences/create/{userId}
     */
    @PostMapping("/preferences/create/{userId}")
    public ResponseEntity<NotificationPreference> createPreferences(@PathVariable Long userId) {
        NotificationPreference prefs = notificationService.createDefaultPreferences(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(prefs);
    }

    /**
     * Récupère les préférences d'un utilisateur
     * GET /formation/notifications/preferences/{userId}
     */
    @GetMapping("/preferences/{userId}")
    public ResponseEntity<NotificationPreference> getPreferences(@PathVariable Long userId) {
        NotificationPreference prefs = notificationService.getUserPreferences(userId);
        return ResponseEntity.ok(prefs);
    }

    /**
     * Met à jour les préférences
     * PUT /formation/notifications/preferences/{userId}
     */
    @PutMapping("/preferences/{userId}")
    public ResponseEntity<NotificationPreference> updatePreferences(
            @PathVariable Long userId,
            @RequestBody NotificationPreference preferences) {
        NotificationPreference updated = notificationService.updatePreferences(userId, preferences);
        return ResponseEntity.ok(updated);
    }

    /**
     * Active/Désactive les notifications
     * PATCH /formation/notifications/preferences/{userId}/toggle
     */
    @PatchMapping("/preferences/{userId}/toggle")
    public ResponseEntity<String> toggleNotifications(
            @PathVariable Long userId,
            @RequestParam Boolean enabled) {
        notificationService.toggleNotificationsEnabled(userId, enabled);
        String status = enabled ? "activées" : "désactivées";
        return ResponseEntity.ok("Notifications " + status);
    }

    /**
     * Change la fréquence des reminders
     * PATCH /formation/notifications/preferences/{userId}/reminder-frequency
     */
    @PatchMapping("/preferences/{userId}/reminder-frequency")
    public ResponseEntity<String> setReminderFrequency(
            @PathVariable Long userId,
            @RequestParam Integer frequencyHours) {
        notificationService.setReminderFrequency(userId, frequencyHours);
        return ResponseEntity.ok("Fréquence des reminders mise à jour : chaque " + frequencyHours + "h");
    }

    /**
     * Change les heures silencieuses
     * PATCH /formation/notifications/preferences/{userId}/quiet-hours
     */
    @PatchMapping("/preferences/{userId}/quiet-hours")
    public ResponseEntity<String> setQuietHours(
            @PathVariable Long userId,
            @RequestParam Integer startHour,
            @RequestParam Integer endHour) {
        notificationService.setQuietHours(userId, startHour, endHour);
        return ResponseEntity.ok("Heures silencieuses mises à jour : " + startHour + "h à " + endHour + "h");
    }

    // ============ Nettoyage ============

    /**
     * Nettoie les notifications expirées
     * DELETE /formation/notifications/cleanup
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Long> cleanupExpired() {
        Long deleted = notificationService.cleanupExpiredNotifications();
        return ResponseEntity.ok(deleted);
    }

    /**
     * Vérifie s'il faut envoyer un reminder
     * GET /formation/notifications/should-remind/{userId}/{formationId}
     */
    @GetMapping("/should-remind/{userId}/{formationId}")
    public ResponseEntity<Boolean> shouldRemind(
            @PathVariable Long userId,
            @PathVariable Long formationId) {
        Boolean should = notificationService.shouldSendReminder(userId, formationId);
        return ResponseEntity.ok(should);
    }
}
