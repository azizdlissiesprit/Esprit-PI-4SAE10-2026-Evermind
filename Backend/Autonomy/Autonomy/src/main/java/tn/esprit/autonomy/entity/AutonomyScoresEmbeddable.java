package tn.esprit.autonomy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AutonomyScoresEmbeddable {

    @Column(name = "score_hygiene", nullable = false)
    private Integer hygiene = 0;

    @Column(name = "score_feeding", nullable = false)
    private Integer feeding = 0;

    @Column(name = "score_dressing", nullable = false)
    private Integer dressing = 0;

    @Column(name = "score_mobility", nullable = false)
    private Integer mobility = 0;

    @Column(name = "score_communication", nullable = false)
    private Integer communication = 0;
}
