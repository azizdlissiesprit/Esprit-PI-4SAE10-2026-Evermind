package tn.esprit.alert.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertId;

    // External references to other microservices
    private Long patientId;
    private Long abnormalEventId;

    @Enumerated(EnumType.STRING)
    private TypeAlerte typeAlerte;

    @Enumerated(EnumType.STRING)
    private Severite severite;

    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    private StatutAlerte statut;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;

    private Integer aiRiskScore;

    // Automatically set the creation date when the alert is first created
    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}