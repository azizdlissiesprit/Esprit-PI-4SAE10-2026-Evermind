package tn.esprit.profile.training.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "training_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String text;

    @ElementCollection
    @CollectionTable(name = "training_question_choices", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "choice_text", nullable = false, length = 1000)
    @OrderColumn(name = "choice_index")
    @Builder.Default
    private List<String> choices = new ArrayList<>();

    // index in choices[]
    @Column(nullable = false)
    private Integer correctChoiceIndex;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonBackReference
    private TrainingQuiz quiz;
}

