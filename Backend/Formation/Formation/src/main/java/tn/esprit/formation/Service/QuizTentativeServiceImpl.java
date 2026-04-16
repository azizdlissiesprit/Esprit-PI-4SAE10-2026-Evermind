package tn.esprit.formation.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.formation.Entity.*;
import tn.esprit.formation.Entity.Module;
import tn.esprit.formation.Repository.ModuleRepository;
import tn.esprit.formation.Repository.QuestionRepository;
import tn.esprit.formation.Repository.QuizRepository;
import tn.esprit.formation.Repository.QuizTentativeRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class QuizTentativeServiceImpl implements IQuizTentativeService {

    private final QuizTentativeRepository tentativeRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ModuleRepository moduleRepository;
    private final CertificateService certificateService;
    private final ObjectMapper objectMapper;

    @Override
    public QuizTentative submit(Long quizId, Long userId, Map<Long, List<Integer>> answers) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndex(quizId);

        int score = 0;
        int total = questions.size();

        for (Question q : questions) {
            List<Integer> correctIndices = parseJsonIntList(q.getCorrectAnswers());
            List<Integer> studentAnswer = answers.getOrDefault(q.getId(), Collections.emptyList());

            // Sort both lists for comparison
            List<Integer> sortedCorrect = new ArrayList<>(correctIndices);
            List<Integer> sortedStudent = new ArrayList<>(studentAnswer);
            Collections.sort(sortedCorrect);
            Collections.sort(sortedStudent);

            if (sortedCorrect.equals(sortedStudent)) {
                score++;
            }
        }

        int seuil = quiz.getSeuilReussite() != null ? quiz.getSeuilReussite() : 70;
        int pct = total > 0 ? Math.round((float) score / total * 100) : 0;
        boolean passed = pct >= seuil;

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            answersJson = "{}";
        }

        QuizTentative tentative = QuizTentative.builder()
                .userId(userId)
                .quiz(quiz)
                .answers(answersJson)
                .score(score)
                .total(total)
                .passed(passed)
                .submittedAt(LocalDateTime.now())
                .build();

        tentative = tentativeRepository.save(tentative);

        // Auto-issue certificate when quiz is passed
        if (passed) {
            try {
                Module module = quiz.getModule();
                ProgrammeFormation programme = module != null ? module.getProgrammeFormation() : null;
                certificateService.issueCertificate(tentative, quiz, module, programme);
            } catch (Exception e) {
                // Log but don't fail the tentative save
            }
        }

        return tentative;
    }

    @Override
    public QuizTentative getById(Long id) {
        return tentativeRepository.findById(id).orElseThrow();
    }

    @Override
    public List<QuizTentative> getByQuizId(Long quizId) {
        return tentativeRepository.findByQuizId(quizId);
    }

    @Override
    public List<QuizTentative> getByUserId(Long userId) {
        return tentativeRepository.findByUserId(userId);
    }

    private List<Integer> parseJsonIntList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
