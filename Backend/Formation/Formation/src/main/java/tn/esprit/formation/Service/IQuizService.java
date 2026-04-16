package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.Quiz;

import java.util.List;

public interface IQuizService {
    Quiz add(Quiz q);
    Quiz update(Long id, Quiz q);
    void delete(Long id);
    Quiz getById(Long id);
    List<Quiz> getAll();
    List<Quiz> getByModuleId(Long moduleId);
}
