package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.formation.Entity.UserTimeTrack;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTimeTrackRepository extends JpaRepository<UserTimeTrack, Long> {

    Optional<UserTimeTrack> findByUserIdAndCourseId(Long userId, Long courseId);

    List<UserTimeTrack> findByUserId(Long userId);

    List<UserTimeTrack> findByCourseId(Long courseId);

    @Query("SELECT u FROM UserTimeTrack u WHERE u.userId = :userId ORDER BY u.updatedAt DESC")
    List<UserTimeTrack> findUserAllCourses(@Param("userId") Long userId);

    @Query("SELECT u FROM UserTimeTrack u WHERE u.courseId = :courseId ORDER BY u.totalTimeSpent DESC")
    List<UserTimeTrack> findTopUsersByCourse(@Param("courseId") Long courseId);

    @Query(value = "SELECT u FROM UserTimeTrack u WHERE u.userId = :userId AND u.courseId = :courseId")
    Optional<UserTimeTrack> getUserTimeTrack(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
