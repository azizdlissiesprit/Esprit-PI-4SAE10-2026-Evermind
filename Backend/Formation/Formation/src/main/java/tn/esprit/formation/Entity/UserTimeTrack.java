package tn.esprit.formation.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_time_track", indexes = {
    @Index(name = "idx_user_course", columnList = "user_id, course_id"),
    @Index(name = "idx_user", columnList = "user_id"),
    @Index(name = "idx_course", columnList = "course_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTimeTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long courseId; // Formation/Module ID

    @Column(nullable = false)
    private Long totalTimeSpent; // en secondes

    @Column(nullable = false)
    private LocalDateTime lastActivityTime;

    @Column(nullable = false)
    @Builder.Default
    private Integer sessionCount = 1;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String activityLog; // JSON storage for activity tracking

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
