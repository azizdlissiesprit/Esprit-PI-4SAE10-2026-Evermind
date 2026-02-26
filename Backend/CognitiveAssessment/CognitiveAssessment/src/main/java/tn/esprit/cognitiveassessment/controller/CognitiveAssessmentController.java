package tn.esprit.cognitiveassessment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.cognitiveassessment.entity.AssessmentScoreEmbeddable;
import tn.esprit.cognitiveassessment.entity.CognitiveAssessment;
import tn.esprit.cognitiveassessment.service.ICognitiveAssessmentService;
import tn.esprit.cognitiveassessment.service.EmailNotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/cognitive-assessments")
@RequiredArgsConstructor

public class CognitiveAssessmentController {

    private final ICognitiveAssessmentService service;
    private final EmailNotificationService emailNotificationService;

    @PostMapping
    public ResponseEntity<CognitiveAssessment> create(@RequestBody CognitiveAssessment assessment) {
        assessment.setId(null);
        // Garantir que les scores sont toujours présents pour la persistance en base
        if (assessment.getScores() == null) {
            assessment.setScores(new AssessmentScoreEmbeddable(0, 0, 0, 0));
        } else {
            AssessmentScoreEmbeddable s = assessment.getScores();
            assessment.setScores(new AssessmentScoreEmbeddable(
                    s.getMemory() != null ? s.getMemory() : 0,
                    s.getOrientation() != null ? s.getOrientation() : 0,
                    s.getLanguage() != null ? s.getLanguage() : 0,
                    s.getExecutiveFunctions() != null ? s.getExecutiveFunctions() : 0));
        }
        if (assessment.getObservations() == null) {
            assessment.setObservations("");
        }
        CognitiveAssessment created = service.add(assessment);
        
        // Send email notification for new assessment
        emailNotificationService.sendNewCognitiveAssessmentNotification(created);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CognitiveAssessment> update(@PathVariable Long id, @RequestBody CognitiveAssessment assessment) {
        assessment.setId(id);
        CognitiveAssessment updated = service.update(id, assessment);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CognitiveAssessment> getById(@PathVariable Long id) {
        CognitiveAssessment a = service.findById(id);
        return ResponseEntity.ok(a);
    }

    @GetMapping
    public ResponseEntity<List<CognitiveAssessment>> getAll() {
        List<CognitiveAssessment> list = service.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<CognitiveAssessment>> getByPatientId(@PathVariable String patientId) {
        List<CognitiveAssessment> list = service.findAllByPatientId(patientId);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
