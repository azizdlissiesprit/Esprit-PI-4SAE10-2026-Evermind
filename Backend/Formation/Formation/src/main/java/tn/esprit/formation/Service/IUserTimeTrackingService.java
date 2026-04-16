package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.ActivityPingRequest;
import tn.esprit.formation.DTO.SessionStatsDTO;
import tn.esprit.formation.DTO.UserTimeStatsDTO;

import java.util.List;

public interface IUserTimeTrackingService {

    /**
     * Enregistre une activité utilisateur
     */
    void recordActivity(ActivityPingRequest request);

    /**
     * Récupère les statistiques de temps pour un utilisateur et un cours
     */
    UserTimeStatsDTO getUserTimeStats(Long userId, Long courseId);

    /**
     * Récupère les statistiques de toutes les formations d'un utilisateur
     */
    List<UserTimeStatsDTO> getAllUserStats(Long userId);

    /**
     * Récupère les statistiques du top des utilisateurs pour un cours
     */
    List<UserTimeStatsDTO> getTopUsersByCourse(Long courseId, int limit);

    /**
     * Récupère toutes les sessions d'un utilisateur pour un cours
     */
    List<SessionStatsDTO> getUserSessions(Long userId, Long courseId);

    /**
     * Ferme une session active et cumule le temps
     */
    void closeSession(Long userId, Long courseId);

    /**
     * Formate le temps en secondes au format "Xh Xm Xs"
     */
    String formatTime(Long seconds);

    /**
     * Calcule le temps estimé restant (bonus)
     */
    Long getEstimatedRemainingTime(Long userId, Long courseId, Long totalCourseMinutes);

    /**
     * Réinitialise les statistiques (admin)
     */
    void resetUserStats(Long userId, Long courseId);
}
