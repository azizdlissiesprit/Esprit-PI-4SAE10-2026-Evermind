package tn.esprit.patient.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "doctor_name")
    private String doctorName;

    @CreationTimestamp
    @Column(name = "report_date", updatable = false)
    private LocalDateTime reportDate;

    // --- CLINICAL FIELDS ---

    @Column(columnDefinition = "TEXT")
    private String primaryDiagnosis;

    @Column(length = 50)
    private String diseaseStage; // Mild, Moderate, Severe, Terminal

    @Column(columnDefinition = "TEXT")
    private String cognitiveAssessment; // MMSE/MoCA observations

    @Column(columnDefinition = "TEXT")
    private String functionalStatus; // ADL capabilities

    @Column(columnDefinition = "TEXT")
    private String behavioralObservations; // Agitation, wandering, etc.

    @Column(columnDefinition = "TEXT")
    private String medicationReview; // Current med adjustments

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan; // Next steps, therapies

    @Column(columnDefinition = "TEXT")
    private String additionalNotes; // Free-form
}
