package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.formation.Entity.Quiz;
import tn.esprit.formation.Repository.QuizRepository;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class QuizServiceImpl implements IQuizService {

    private final QuizRepository repository;

    @Override
    public Quiz add(Quiz q) {
        return repository.save(q);
    }

    @Override
    public Quiz update(Long id, Quiz q) {
        Quiz existing = repository.findById(id).orElseThrow();
        existing.setTitre(q.getTitre());
        existing.setSeuilReussite(q.getSeuilReussite());
        if (q.getModule() != null) {
            existing.setModule(q.getModule());
        }
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Quiz getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Override
    public List<Quiz> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Quiz> getByModuleId(Long moduleId) {
        return repository.findByModuleId(moduleId);
    }
}
