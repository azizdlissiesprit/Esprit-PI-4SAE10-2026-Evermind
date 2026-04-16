package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.DTO.ActivityPingRequest;
import tn.esprit.formation.DTO.SessionStatsDTO;
import tn.esprit.formation.DTO.UserTimeStatsDTO;
import tn.esprit.formation.Service.IUserTimeTrackingService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/formation/activity")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserActivityTrackingController {

    private final IUserTimeTrackingService timeTrackingService;

    /**
     * Enregistre l'activité utilisateur (ping du frontend)
     * POST /formation/activity/ping
     */
    @PostMapping("/ping")
    public ResponseEntity<Map<String, String>> recordActivity(@RequestBody ActivityPingRequest request) {
        try {
            timeTrackingService.recordActivity(request);
            return ResponseEntity.ok(Map.of("message", "Activity recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Récupère les statistiques de temps pour un utilisateur et un cours
     * GET /formation/activity/stats/{userId}/{courseId}
     */
    @GetMapping("/stats/{userId}/{courseId}")
    public ResponseEntity<UserTimeStatsDTO> getUserTimeStats(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        try {
            UserTimeStatsDTO stats = timeTrackingService.getUserTimeStats(userId, courseId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère toutes les statistiques d'un utilisateur pour tous ses cours
     * GET /formation/activity/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserTimeStatsDTO>> getAllUserStats(@PathVariable Long userId) {
        try {
            List<UserTimeStatsDTO> stats = timeTrackingService.getAllUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère les statistiques du top des utilisateurs pour un cours
     * GET /formation/activity/leaderboard/{courseId}?limit=10
     */
    @GetMapping("/leaderboard/{courseId}")
    public ResponseEntity<List<UserTimeStatsDTO>> getTopUsersByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<UserTimeStatsDTO> stats = timeTrackingService.getTopUsersByCourse(courseId, limit);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère toutes les sessions d'un utilisateur pour un cours
     * GET /formation/activity/sessions/{userId}/{courseId}
     */
    @GetMapping("/sessions/{userId}/{courseId}")
    public ResponseEntity<List<SessionStatsDTO>> getUserSessions(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        try {
            List<SessionStatsDTO> sessions = timeTrackingService.getUserSessions(userId, courseId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Ferme la session active d'un utilisateur
     * POST /formation/activity/close-session/{userId}/{courseId}
     */
    @PostMapping("/close-session/{userId}/{courseId}")
    public ResponseEntity<Map<String, String>> closeSession(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        try {
            timeTrackingService.closeSession(userId, courseId);
            return ResponseEntity.ok(Map.of("message", "Session closed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Calcule le temps estimé restant
     * GET /formation/activity/estimated-time/{userId}/{courseId}/{totalMinutes}
     */
    @GetMapping("/estimated-time/{userId}/{courseId}/{totalMinutes}")
    public ResponseEntity<Map<String, String>> getEstimatedTime(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @PathVariable Long totalMinutes) {
        try {
            Long remainingSeconds = timeTrackingService.getEstimatedRemainingTime(userId, courseId, totalMinutes);
            String formattedTime = timeTrackingService.formatTime(remainingSeconds);
            return ResponseEntity.ok(Map.of(
                "remainingSeconds", String.valueOf(remainingSeconds),
                "formattedTime", formattedTime
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Réinitialise les statistiques (admin only)
     * DELETE /formation/activity/reset/{userId}/{courseId}
     */
    @DeleteMapping("/reset/{userId}/{courseId}")
    public ResponseEntity<Map<String, String>> resetStats(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        try {
            timeTrackingService.resetUserStats(userId, courseId);
            return ResponseEntity.ok(Map.of("message", "Statistics reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
