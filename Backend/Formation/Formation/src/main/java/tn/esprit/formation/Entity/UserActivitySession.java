package tn.esprit.formation.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_sessions", indexes = {
    @Index(name = "idx_session_user_course", columnList = "user_id, course_id"),
    @Index(name = "idx_session_user", columnList = "user_id"),
    @Index(name = "idx_session_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivitySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private LocalDateTime sessionStartTime;

    private LocalDateTime sessionEndTime;

    @Column(nullable = false)
    private Long activeTimeInSeconds; // Temps actif réel dans cette session

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime lastPingTime;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        if (!isActive) {
            this.sessionEndTime = LocalDateTime.now();
        }
    }
}
