package tn.esprit.intervention.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seed_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime seededAt;

    @PrePersist
    protected void onCreate() {
        if (this.seededAt == null) {
            this.seededAt = LocalDateTime.now();
        }
    }
}
