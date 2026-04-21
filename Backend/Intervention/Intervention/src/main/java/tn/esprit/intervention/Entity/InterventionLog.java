package tn.esprit.intervention.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "intervention_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String actionType; // e.g., "DISPATCHED", "MESSAGE_SENT", "ARRIVED", "ESCALATED", "RESOLVED"

    @Column(nullable = false)
    private Long performedBy; // Current user ID who took the action

    @Column(columnDefinition = "TEXT")
    private String notes; // Context: e.g. "System generated prompt", or "Doctor notified"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intervention_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion during JSON serialization
    @ToString.Exclude
    private Intervention intervention;
}
