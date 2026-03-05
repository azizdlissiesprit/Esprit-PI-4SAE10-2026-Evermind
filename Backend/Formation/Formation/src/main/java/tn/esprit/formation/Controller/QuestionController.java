package tn.esprit.formation.Controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.DTO.GenerateQuestionsRequest;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Entity.Question;
import tn.esprit.formation.Entity.QuestionType;
import tn.esprit.formation.Entity.Quiz;
import tn.esprit.formation.Service.AiQuizGenerationService;
import tn.esprit.formation.Service.IQuestionService;
import tn.esprit.formation.Service.IQuizService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/formation")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class QuestionController {

    private final IQuestionService questionService;
    private final IQuizService quizService;
    private final AiQuizGenerationService aiService;

    /**
     * Get all questions for a quiz (includes correct answers — for quiz builder / teacher).
     */
    @GetMapping("/quiz/{quizId}/questions")
    public List<Question> getByQuizId(@PathVariable Long quizId) {
        return questionService.getByQuizId(quizId);
    }

    /**
     * Get questions for a quiz WITHOUT correct answers (for student / learner).
     */
    @GetMapping("/quiz/{quizId}/questions/student")
    public List<Map<String, Object>> getStudentQuestions(@PathVariable Long quizId) {
        List<Question> questions = questionService.getByQuizId(quizId);
        return questions.stream().map(q -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("questionText", q.getQuestionText());
            map.put("type", q.getType());
            map.put("options", q.getOptions());
            map.put("orderIndex", q.getOrderIndex());
            // correctAnswers is intentionally omitted
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Add a question to a quiz.
     */
    @PostMapping("/quiz/{quizId}/questions")
    public Question create(@PathVariable Long quizId, @RequestBody Map<String, Object> body) {
        Quiz quiz = quizService.getById(quizId);
        Question q = new Question();
        q.setQuiz(quiz);
        q.setQuestionText((String) body.get("questionText"));
        q.setType(QuestionType.valueOf((String) body.get("type")));
        q.setOptions((String) body.get("options"));
        q.setCorrectAnswers((String) body.get("correctAnswers"));
        q.setOrderIndex(body.get("orderIndex") != null ? ((Number) body.get("orderIndex")).intValue() : 0);
        return questionService.add(q);
    }

    /**
     * Generate questions using AI (Kimi K2.5 via Azure OpenAI).
     */
    @Transactional
    @PostMapping("/quiz/{quizId}/questions/generate")
    public ResponseEntity<List<Question>> generateWithAi(
            @PathVariable Long quizId,
            @RequestBody GenerateQuestionsRequest request
    ) {
        Quiz quiz = quizService.getById(quizId);
        Module module = quiz.getModule();

        String moduleTitle = module != null ? module.getTitre() : "General";
        String moduleContent = module != null ? module.getContenu() : "";

        int existingCount = (int) questionService.countByQuizId(quizId);

        List<Question> generated = aiService.generateQuestions(
                quiz,
                moduleTitle,
                moduleContent,
                request.getTopic(),
                request.getNumberOfQuestions(),
                request.getQuestionTypes(),
                existingCount
        );

        // Persist each generated question
        List<Question> saved = new ArrayList<>();
        for (Question q : generated) {
            saved.add(questionService.add(q));
        }

        return ResponseEntity.ok(saved);
    }

    /**
     * Update a question.
     */
    @PutMapping("/questions/{id}")
    public Question update(@PathVariable Long id, @RequestBody Question q) {
        return questionService.update(id, q);
    }

    /**
     * Delete a question.
     */
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        questionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

