package tn.esprit.formation.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.formation.Entity.Question;
import tn.esprit.formation.Repository.QuestionRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class QuestionServiceImpl implements IQuestionService {

    private final QuestionRepository repository;

    @Override
    public List<Question> getByQuizId(Long quizId) {
        return repository.findByQuizIdOrderByOrderIndex(quizId);
    }

    @Override
    public Question getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Override
    public Question add(Question q) {
        return repository.save(q);
    }

    @Override
    public Question update(Long id, Question q) {
        Question existing = repository.findById(id).orElseThrow();
        existing.setQuestionText(q.getQuestionText());
        existing.setType(q.getType());
        existing.setOptions(q.getOptions());
        existing.setCorrectAnswers(q.getCorrectAnswers());
        existing.setOrderIndex(q.getOrderIndex());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public long countByQuizId(Long quizId) {
        return repository.countByQuizId(quizId);
    }
}
