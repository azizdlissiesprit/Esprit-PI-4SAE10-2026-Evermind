package tn.esprit.autonomy.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "autonomy_assessments")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutonomyAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String patientId;

    @Column(nullable = false, length = 32)
    private String date;

    @Column(nullable = false, length = 128)
    private String evaluator;

    @Embedded
    private AutonomyScoresEmbeddable scores;

    @Column(nullable = false)
    private Integer totalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TrendType trend;

    private Integer trendPoints;

    @Column(nullable = false, length = 64)
    private String assistanceLevel;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(columnDefinition = "TEXT")
    private String recommendedDevicesJson;

    @Column(columnDefinition = "TEXT")
    private String caregiverRecommendationsJson;
}
