package tn.esprit.formation.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_tentatives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizTentative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    /**
     * JSON map of answers: {"questionId": [selectedIndices], ...}
     * e.g. {"1":[0], "3":[1,2], "5":[0]}
     */
    @Column(columnDefinition = "TEXT")
    private String answers;

    private Integer score;

    private Integer total;

    private Boolean passed;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
