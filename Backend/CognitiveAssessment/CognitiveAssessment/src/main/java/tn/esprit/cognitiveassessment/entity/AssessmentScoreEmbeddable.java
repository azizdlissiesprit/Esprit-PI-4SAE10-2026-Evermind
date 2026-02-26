package tn.esprit.cognitiveassessment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssessmentScoreEmbeddable {

    @Column(name = "score_memory", nullable = false)
    private Integer memory = 0;

    @Column(name = "score_orientation", nullable = false)
    private Integer orientation = 0;

    @Column(name = "score_language", nullable = false)
    private Integer language = 0;

    @Column(name = "score_executive_functions", nullable = false)
    private Integer executiveFunctions = 0;
}
