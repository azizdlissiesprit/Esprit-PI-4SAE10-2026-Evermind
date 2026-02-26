package tn.esprit.intervention.Entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interventions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- LOGICAL LINKS (IDs Only) ---

    @Column(name = "alert_id", nullable = false)
    private Long alertId;

    // Instead of 'private User caregiver', we store the ID.
    // The Service layer will use FeignClient to call User-Service for the name/role.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Redundant but necessary for fast querying (e.g., "Get all interventions for Patient X")
    // without joining the Alert table or calling the Patient Service every time.
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    // --- INTERVENTION DATA ---

    @Column(columnDefinition = "TEXT")
    private String notes; // e.g. "Called patient, they are fine."

    @Enumerated(EnumType.STRING)
    private InterventionOutcome outcome;

    // --- METRICS ---

    @Column(nullable = false)
    private LocalDateTime startedAt; // When 'Acknowledge' was clicked

    private LocalDateTime completedAt; // When 'Resolve' was clicked

    private Long durationInSeconds; // Calculated: completedAt - startedAt
}