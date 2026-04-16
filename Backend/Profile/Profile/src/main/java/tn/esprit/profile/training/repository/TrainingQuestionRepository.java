package tn.esprit.profile.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.training.entity.TrainingQuestion;

import java.util.List;

public interface TrainingQuestionRepository extends JpaRepository<TrainingQuestion, Long> {
    List<TrainingQuestion> findByQuiz_IdOrderByIdAsc(Long quizId);
}

