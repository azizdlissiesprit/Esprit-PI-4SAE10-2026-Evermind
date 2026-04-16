package tn.esprit.profile.training.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "training_quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingQuiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // e.g. 70 means 70%
    @Column(nullable = false)
    private Integer passingScore;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", unique = true, nullable = false)
    @JsonBackReference
    private TrainingModule module;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @JsonManagedReference
    @Builder.Default
    private List<TrainingQuestion> questions = new ArrayList<>();
}

