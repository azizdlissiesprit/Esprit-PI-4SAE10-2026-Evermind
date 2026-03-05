package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.formation.Entity.Question;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdOrderByOrderIndex(Long quizId);
    long countByQuizId(Long quizId);
}
