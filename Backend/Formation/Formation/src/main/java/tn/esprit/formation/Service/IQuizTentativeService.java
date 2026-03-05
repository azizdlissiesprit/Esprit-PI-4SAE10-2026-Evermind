package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.QuizTentative;

import java.util.List;
import java.util.Map;

public interface IQuizTentativeService {
    QuizTentative submit(Long quizId, Long userId, Map<Long, List<Integer>> answers);
    QuizTentative getById(Long id);
    List<QuizTentative> getByQuizId(Long quizId);
    List<QuizTentative> getByUserId(Long userId);
}
