package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.formation.Entity.Quiz;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByModuleId(Long moduleId);
}
