package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.Quiz;

import java.util.List;
import java.util.Optional;

public interface IQuizService {
    Quiz add(Quiz q);
    Quiz update(Long id, Quiz q);
    void delete(Long id);
    Quiz getById(Long id);
    List<Quiz> getAll();
    Optional<Quiz> getByModuleId(Long moduleId);
}
