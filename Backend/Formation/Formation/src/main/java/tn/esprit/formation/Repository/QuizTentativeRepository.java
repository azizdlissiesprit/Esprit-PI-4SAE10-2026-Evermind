package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.formation.Entity.QuizTentative;

import java.util.List;

public interface QuizTentativeRepository extends JpaRepository<QuizTentative, Long> {
    List<QuizTentative> findByQuizId(Long quizId);
    List<QuizTentative> findByUserId(Long userId);
    List<QuizTentative> findByQuizIdAndUserId(Long quizId, Long userId);
}
