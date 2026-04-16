package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.formation.DTO.QuizDTO;
import tn.esprit.formation.Entity.Quiz;
import tn.esprit.formation.Repository.QuizRepository;

import java.util.List;

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
    public List<Quiz> getByModuleId(Long moduleId) {
        return repository.findByModuleId(moduleId);
    }

    // Convert Quiz to QuizDTO for safe API responses
    public QuizDTO convertToDTO(Quiz quiz) {
        if (quiz == null) {
            return null;
        }
        return QuizDTO.builder()
                .id(quiz.getId())
                .titre(quiz.getTitre())
                .seuilReussite(quiz.getSeuilReussite() != null ? quiz.getSeuilReussite() : 70)
                .moduleId(quiz.getModule() != null ? quiz.getModule().getId() : null)
                .moduleTitre(quiz.getModule() != null ? quiz.getModule().getTitre() : "N/A")
                .moduleType(quiz.getModule() != null ? quiz.getModule().getType() : null)
                .moduledureeEstimee(quiz.getModule() != null ? quiz.getModule().getDureeEstimee() : null)
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .build();
    }

    public List<QuizDTO> getAllAsDTO() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }
}
