package tn.esprit.profile.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.training.entity.TrainingQuiz;

import java.util.Optional;

public interface TrainingQuizRepository extends JpaRepository<TrainingQuiz, Long> {
    Optional<TrainingQuiz> findByModule_Id(Long moduleId);
}

