package tn.esprit.profile.training.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.profile.training.entity.TrainingModule;
import tn.esprit.profile.training.entity.TrainingQuiz;
import tn.esprit.profile.training.repository.TrainingModuleRepository;
import tn.esprit.profile.training.repository.TrainingQuizRepository;
import tn.esprit.profile.training.web.dto.TrainingQuizDto;
import tn.esprit.profile.training.web.dto.UpsertTrainingQuizRequest;

import java.util.List;

@RestController
@RequestMapping("/training/quizzes")
@RequiredArgsConstructor
public class TrainingQuizController {
    private final TrainingQuizRepository quizRepository;
    private final TrainingModuleRepository moduleRepository;

    @GetMapping
    public List<TrainingQuizDto> list(@RequestParam(required = false) Long moduleId) {
        if (moduleId != null) {
            return quizRepository.findByModule_Id(moduleId).map(this::toDto).stream().toList();
        }
        return quizRepository.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public TrainingQuizDto get(@PathVariable Long id) {
        TrainingQuiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        return toDto(quiz);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingQuizDto create(@RequestBody UpsertTrainingQuizRequest req) {
        TrainingModule module = moduleRepository.findById(req.moduleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Module not found"));
        quizRepository.findByModule_Id(module.getId()).ifPresent(q -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Quiz already exists for this module");
        });
        TrainingQuiz quiz = TrainingQuiz.builder()
                .module(module)
                .title(req.title())
                .passingScore(req.passingScore() == null ? 70 : req.passingScore())
                .build();
        return toDto(quizRepository.save(quiz));
    }

    @PutMapping("/{id}")
    public TrainingQuizDto update(@PathVariable Long id, @RequestBody UpsertTrainingQuizRequest req) {
        TrainingQuiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        if (req.moduleId() != null && !req.moduleId().equals(quiz.getModule().getId())) {
            TrainingModule module = moduleRepository.findById(req.moduleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Module not found"));
            quizRepository.findByModule_Id(module.getId()).ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Quiz already exists for this module");
            });
            quiz.setModule(module);
        }
        quiz.setTitle(req.title());
        if (req.passingScore() != null) {
            quiz.setPassingScore(req.passingScore());
        }
        return toDto(quizRepository.save(quiz));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found");
        }
        quizRepository.deleteById(id);
    }

    private TrainingQuizDto toDto(TrainingQuiz q) {
        return new TrainingQuizDto(
                q.getId(),
                q.getModule() != null ? q.getModule().getId() : null,
                q.getTitle(),
                q.getPassingScore()
        );
    }
}

