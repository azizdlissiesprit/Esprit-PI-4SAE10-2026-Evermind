package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.formation.Entity.UserActivitySession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivitySessionRepository extends JpaRepository<UserActivitySession, Long> {

    Optional<UserActivitySession> findByUserIdAndCourseIdAndIsActiveTrue(Long userId, Long courseId);

    List<UserActivitySession> findByUserIdAndCourseIdOrderBySessionStartTimeDesc(Long userId, Long courseId);

    List<UserActivitySession> findByUserIdOrderBySessionStartTimeDesc(Long userId);

    List<UserActivitySession> findByCourseIdOrderBySessionStartTimeDesc(Long courseId);

    @Query("SELECT s FROM UserActivitySession s WHERE s.userId = :userId AND s.courseId = :courseId AND s.sessionStartTime >= :startTime ORDER BY s.sessionStartTime DESC")
    List<UserActivitySession> findSessionsInRange(
        @Param("userId") Long userId,
        @Param("courseId") Long courseId,
        @Param("startTime") LocalDateTime startTime
    );

    @Query("SELECT s FROM UserActivitySession s WHERE s.userId = :userId AND s.isActive = true")
    List<UserActivitySession> findActiveSessions(@Param("userId") Long userId);

    @Query("SELECT SUM(s.activeTimeInSeconds) FROM UserActivitySession s WHERE s.userId = :userId AND s.courseId = :courseId")
    Long getTotalSessionTime(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(DISTINCT s.userId) FROM UserActivitySession s WHERE s.lastPingTime >= :dateLimite")
    Long countActiveUsersSince(@Param("dateLimite") LocalDateTime dateLimite);
}
