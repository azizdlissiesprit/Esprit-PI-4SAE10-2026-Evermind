package tn.esprit.formation.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type; // QCU, QCM, TRUE_FALSE

    /**
     * JSON array of option strings, e.g. ["Option A","Option B","Option C","Option D"]
     * For TRUE_FALSE, this is ["Vrai","Faux"]
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String options;

    /**
     * JSON array of correct answer indices, e.g. [1] for QCU, [0,2] for QCM, [0] for TRUE
     */
    @Column(nullable = false)
    private String correctAnswers;

    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private Quiz quiz;
}
