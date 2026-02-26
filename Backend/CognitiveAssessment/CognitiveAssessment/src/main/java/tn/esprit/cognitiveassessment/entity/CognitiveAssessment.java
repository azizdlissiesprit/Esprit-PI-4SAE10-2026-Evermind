package tn.esprit.cognitiveassessment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cognitive_assessments")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CognitiveAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String patientId;

    @Column(nullable = false, length = 32)
    private String date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AssessmentType type;

    @Column(nullable = false, length = 128)
    private String evaluator;

    @Column(nullable = false)
    private Integer mmseScore;

    @Column(nullable = false)
    private Integer moocaScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TrendType trend;

    private Integer trendPoints;

    @Embedded
    private AssessmentScoreEmbeddable scores;

    @Column(columnDefinition = "TEXT")
    private String observations;
}
