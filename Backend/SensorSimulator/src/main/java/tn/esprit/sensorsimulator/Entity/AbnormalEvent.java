package tn.esprit.sensorsimulator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "abnormal_events", indexes = {
    @Index(name = "idx_event_patient", columnList = "patientId"),
    @Index(name = "idx_event_detected", columnList = "detectedAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbnormalEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Which patient experienced the event */
    @Column(nullable = false)
    private Long patientId;

    /** Which sensor detected it */
    @Column(nullable = false)
    private Long sensorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AbnormalEventType eventType;

    @Column(nullable = false)
    private LocalDateTime detectedAt;

    /** The SensorReading ID that triggered this event */
    private Long rawReadingId;

    /** Human-readable description of what happened */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Whether the Alert service has been notified */
    @Column(nullable = false)
    private Boolean alertSent;

    /** The alert ID returned from the Alert service after successful notification */
    private Long alertId;

    @PrePersist
    protected void onCreate() {
        if (this.detectedAt == null) {
            this.detectedAt = LocalDateTime.now();
        }
        if (this.alertSent == null) {
            this.alertSent = false;
        }
    }
}
