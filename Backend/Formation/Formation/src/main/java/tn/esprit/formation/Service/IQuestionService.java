package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.Question;

import java.util.List;

public interface IQuestionService {
    List<Question> getByQuizId(Long quizId);
    Question getById(Long id);
    Question add(Question q);
    Question update(Long id, Question q);
    void delete(Long id);
    long countByQuizId(Long quizId);
}
