package tn.esprit.formation.Controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.formation.Entity.Certificate;
import tn.esprit.formation.Entity.QuizTentative;
import tn.esprit.formation.Repository.CertificateRepository;
import tn.esprit.formation.Service.IQuizTentativeService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/formation/quiz-tentative")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class QuizTentativeController {

    private final IQuizTentativeService service;
    private final CertificateRepository certificateRepository;
    private final ObjectMapper objectMapper;

    /**
     * Submit a quiz attempt. Auto-grades and returns the result.
     * If passed, also includes the certificateCode.
     * Body: { "quizId": 1, "userId": 42, "answers": { "1": [0], "3": [1,2] } }
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(@RequestBody Map<String, Object> body) {
        Long quizId = Long.valueOf(body.get("quizId").toString());
        Long userId = Long.valueOf(body.get("userId").toString());

        // Parse answers: Map<Long, List<Integer>>
        @SuppressWarnings("unchecked")
        Map<String, Object> rawAnswers = (Map<String, Object>) body.get("answers");
        Map<Long, List<Integer>> answers = new HashMap<>();
        if (rawAnswers != null) {
            for (Map.Entry<String, Object> entry : rawAnswers.entrySet()) {
                Long questionId = Long.valueOf(entry.getKey());
                @SuppressWarnings("unchecked")
                List<Integer> indices = objectMapper.convertValue(entry.getValue(), new TypeReference<List<Integer>>() {});
                answers.put(questionId, indices);
            }
        }

        QuizTentative tentative = service.submit(quizId, userId, answers);

        Map<String, Object> result = new HashMap<>();
        result.put("id", tentative.getId());
        result.put("score", tentative.getScore());
        result.put("total", tentative.getTotal());
        result.put("passed", tentative.getPassed());
        result.put("submittedAt", tentative.getSubmittedAt().toString());

        // Include certificate code if issued
        if (Boolean.TRUE.equals(tentative.getPassed())) {
            Optional<Certificate> cert = certificateRepository.findByTentativeId(tentative.getId());
            cert.ifPresent(c -> result.put("certificateCode", c.getCertificateCode()));
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public QuizTentative getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/quiz/{quizId}")
    public List<QuizTentative> getByQuiz(@PathVariable Long quizId) {
        return service.getByQuizId(quizId);
    }

    @GetMapping("/user/{userId}")
    public List<QuizTentative> getByUser(@PathVariable Long userId) {
        return service.getByUserId(userId);
    }
}

