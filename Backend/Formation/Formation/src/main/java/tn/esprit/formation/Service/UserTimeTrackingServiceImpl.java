package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.formation.DTO.ActivityPingRequest;
import tn.esprit.formation.DTO.SessionStatsDTO;
import tn.esprit.formation.DTO.UserTimeStatsDTO;
import tn.esprit.formation.Entity.UserActivitySession;
import tn.esprit.formation.Entity.UserTimeTrack;
import tn.esprit.formation.Repository.UserActivitySessionRepository;
import tn.esprit.formation.Repository.UserTimeTrackRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
@Transactional
public class UserTimeTrackingServiceImpl implements IUserTimeTrackingService {

    private static final long INACTIVITY_THRESHOLD_SECONDS = 300; // 5 minutes
    private static final long PING_INTERVAL_SECONDS = 30; // 30 secondes

    private final UserTimeTrackRepository userTimeTrackRepository;
    private final UserActivitySessionRepository sessionRepository;

    @Override
    public void recordActivity(ActivityPingRequest request) {
        Long userId = request.getUserId();
        Long courseId = request.getCourseId();

        try {
            // 1. Récupérer ou créer une session active
            Optional<UserActivitySession> existingSession = 
                sessionRepository.findByUserIdAndCourseIdAndIsActiveTrue(userId, courseId);

            LocalDateTime now = LocalDateTime.now();
            UserActivitySession session;

            if (existingSession.isPresent()) {
                session = existingSession.get();
                
                // Vérifier l'inactivité
                long inactivitySeconds = ChronoUnit.SECONDS.between(session.getLastPingTime(), now);
                
                if (inactivitySeconds > INACTIVITY_THRESHOLD_SECONDS) {
                    // Clore la session précédente due à l'inactivité
                    log.debug("Inactivité détectée: {} secondes pour l'utilisateur {} et le cours {}",
                        inactivitySeconds, userId, courseId);
                    session.setIsActive(false);
                    sessionRepository.save(session);
                    
                    // Créer une nouvelle session
                    session = createNewSession(userId, courseId, now);
                } else {
                    // Ajouter le temps actif
                    long activeSeconds = Math.min(inactivitySeconds, PING_INTERVAL_SECONDS + 10);
                    session.setActiveTimeInSeconds(session.getActiveTimeInSeconds() + activeSeconds);
                    session.setLastPingTime(now);
                }
            } else {
                // Créer une nouvelle session
                session = createNewSession(userId, courseId, now);
            }

            sessionRepository.save(session);

            // 2. Mettre à jour le cumul global UserTimeTrack
            updateUserTimeTrack(userId, courseId);

        } catch (Exception e) {
            log.error("Erreur lors de l'enregistrement de l'activité pour l'utilisateur {} et le cours {}",
                userId, courseId, e);
        }
    }

    private UserActivitySession createNewSession(Long userId, Long courseId, LocalDateTime now) {
        return UserActivitySession.builder()
            .userId(userId)
            .courseId(courseId)
            .sessionStartTime(now)
            .lastPingTime(now)
            .activeTimeInSeconds(0L)
            .isActive(true)
            .build();
    }

    private void updateUserTimeTrack(Long userId, Long courseId) {
        Long totalSessionTime = sessionRepository.getTotalSessionTime(userId, courseId);
        if (totalSessionTime == null) {
            totalSessionTime = 0L;
        }

        Optional<UserTimeTrack> existingTrack = 
            userTimeTrackRepository.findByUserIdAndCourseId(userId, courseId);

        UserTimeTrack timeTrack;
        if (existingTrack.isPresent()) {
            timeTrack = existingTrack.get();
            timeTrack.setTotalTimeSpent(totalSessionTime);
            timeTrack.setLastActivityTime(LocalDateTime.now());
            timeTrack.setUpdatedAt(LocalDateTime.now());
            
            // Compter les sessions
            List<UserActivitySession> sessions = 
                sessionRepository.findByUserIdAndCourseIdOrderBySessionStartTimeDesc(userId, courseId);
            timeTrack.setSessionCount(sessions.size());
        } else {
            timeTrack = UserTimeTrack.builder()
                .userId(userId)
                .courseId(courseId)
                .totalTimeSpent(totalSessionTime)
                .lastActivityTime(LocalDateTime.now())
                .sessionCount(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        }

        userTimeTrackRepository.save(timeTrack);
    }

    @Override
    @Transactional(readOnly = true)
    public UserTimeStatsDTO getUserTimeStats(Long userId, Long courseId) {
        Optional<UserTimeTrack> timeTrack = userTimeTrackRepository.findByUserIdAndCourseId(userId, courseId);

        if (timeTrack.isEmpty()) {
            return UserTimeStatsDTO.builder()
                .userId(userId)
                .courseId(courseId)
                .totalTimeSpent(0L)
                .totalTimeSpentMinutes(0L)
                .sessionCount(0)
                .formattedTime("0h 0m 0s")
                .estimatedCompletion(0.0)
                .build();
        }

        UserTimeTrack track = timeTrack.get();
        Long totalSeconds = track.getTotalTimeSpent();

        return UserTimeStatsDTO.builder()
            .userId(userId)
            .courseId(courseId)
            .totalTimeSpent(totalSeconds)
            .totalTimeSpentMinutes(totalSeconds / 60)
            .sessionCount(track.getSessionCount())
            .formattedTime(formatTime(totalSeconds))
            .estimatedCompletion(calculateEstimatedCompletion(totalSeconds))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserTimeStatsDTO> getAllUserStats(Long userId) {
        List<UserTimeTrack> tracks = userTimeTrackRepository.findByUserId(userId);

        return tracks.stream()
            .map(track -> UserTimeStatsDTO.builder()
                .userId(track.getUserId())
                .courseId(track.getCourseId())
                .totalTimeSpent(track.getTotalTimeSpent())
                .totalTimeSpentMinutes(track.getTotalTimeSpent() / 60)
                .sessionCount(track.getSessionCount())
                .formattedTime(formatTime(track.getTotalTimeSpent()))
                .estimatedCompletion(calculateEstimatedCompletion(track.getTotalTimeSpent()))
                .build())
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserTimeStatsDTO> getTopUsersByCourse(Long courseId, int limit) {
        List<UserTimeTrack> tracks = userTimeTrackRepository.findByCourseId(courseId);

        return tracks.stream()
            .sorted((a, b) -> b.getTotalTimeSpent().compareTo(a.getTotalTimeSpent()))
            .limit(limit)
            .map(track -> UserTimeStatsDTO.builder()
                .userId(track.getUserId())
                .courseId(track.getCourseId())
                .totalTimeSpent(track.getTotalTimeSpent())
                .totalTimeSpentMinutes(track.getTotalTimeSpent() / 60)
                .sessionCount(track.getSessionCount())
                .formattedTime(formatTime(track.getTotalTimeSpent()))
                .estimatedCompletion(calculateEstimatedCompletion(track.getTotalTimeSpent()))
                .build())
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionStatsDTO> getUserSessions(Long userId, Long courseId) {
        List<UserActivitySession> sessions = 
            sessionRepository.findByUserIdAndCourseIdOrderBySessionStartTimeDesc(userId, courseId);

        return sessions.stream()
            .map(session -> SessionStatsDTO.builder()
                .sessionId(session.getId())
                .userId(session.getUserId())
                .courseId(session.getCourseId())
                .sessionStartTime(session.getSessionStartTime())
                .sessionEndTime(session.getSessionEndTime())
                .activeTimeInSeconds(session.getActiveTimeInSeconds())
                .formattedTime(formatTime(session.getActiveTimeInSeconds()))
                .isActive(session.getIsActive())
                .build())
            .collect(Collectors.toList());
    }

    @Override
    public void closeSession(Long userId, Long courseId) {
        Optional<UserActivitySession> activeSession = 
            sessionRepository.findByUserIdAndCourseIdAndIsActiveTrue(userId, courseId);

        activeSession.ifPresent(session -> {
            session.setIsActive(false);
            session.setSessionEndTime(LocalDateTime.now());
            sessionRepository.save(session);
            
            // Mettre à jour le cumul
            updateUserTimeTrack(userId, courseId);
            log.info("Session fermée pour l'utilisateur {} et le cours {}", userId, courseId);
        });
    }

    @Override
    public String formatTime(Long seconds) {
        if (seconds == null || seconds <= 0) {
            return "0h 0m 0s";
        }

        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long secs = seconds % 60;

        return String.format("%dh %dm %ds", hours, minutes, secs);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getEstimatedRemainingTime(Long userId, Long courseId, Long totalCourseMinutes) {
        Optional<UserTimeTrack> timeTrack = userTimeTrackRepository.findByUserIdAndCourseId(userId, courseId);

        if (timeTrack.isEmpty()) {
            return totalCourseMinutes * 60;
        }

        Long totalSpentSeconds = timeTrack.get().getTotalTimeSpent();
        Long totalCourseSeconds = totalCourseMinutes * 60;

        long remaining = totalCourseSeconds - totalSpentSeconds;
        return Math.max(remaining, 0L);
    }

    @Override
    public void resetUserStats(Long userId, Long courseId) {
        userTimeTrackRepository.findByUserIdAndCourseId(userId, courseId).ifPresent(track -> {
            userTimeTrackRepository.delete(track);
            log.info("Statistiques réinitialisées pour l'utilisateur {} et le cours {}", userId, courseId);
        });

        List<UserActivitySession> sessions = 
            sessionRepository.findByUserIdAndCourseIdOrderBySessionStartTimeDesc(userId, courseId);
        sessionRepository.deleteAll(sessions);
    }

    private Double calculateEstimatedCompletion(Long totalSeconds) {
        // Estimation: chaque 3600 secondes = 10% de progression
        double percentage = (totalSeconds / 3600.0) * 10.0;
        return Math.min(percentage, 100.0);
    }
}
