package tn.esprit.autonomy.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.autonomy.entity.AutonomyAssessment;
import tn.esprit.autonomy.entity.AutonomyScoresEmbeddable;
import tn.esprit.autonomy.service.IAutonomyAssessmentService;
import tn.esprit.autonomy.service.EmailNotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/autonomy-assessments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, maxAge = 3600)
public class AutonomyAssessmentController {

    private final IAutonomyAssessmentService service;
    private final EmailNotificationService emailNotificationService;

    @PostMapping
    public ResponseEntity<AutonomyAssessment> create(@RequestBody AutonomyAssessment assessment) {
        assessment.setId(null);
        if (assessment.getScores() == null) {
            assessment.setScores(new AutonomyScoresEmbeddable(0, 0, 0, 0, 0));
        } else {
            var s = assessment.getScores();
            assessment.setScores(new AutonomyScoresEmbeddable(
                    s.getHygiene() != null ? s.getHygiene() : 0,
                    s.getFeeding() != null ? s.getFeeding() : 0,
                    s.getDressing() != null ? s.getDressing() : 0,
                    s.getMobility() != null ? s.getMobility() : 0,
                    s.getCommunication() != null ? s.getCommunication() : 0));
        }
        if (assessment.getObservations() == null) assessment.setObservations("");
        if (assessment.getRecommendedDevicesJson() == null) assessment.setRecommendedDevicesJson("");
        if (assessment.getCaregiverRecommendationsJson() == null) assessment.setCaregiverRecommendationsJson("");
        AutonomyAssessment created = service.add(assessment);
        
        // Send email notification for new assessment
        emailNotificationService.sendNewAutonomyAssessmentNotification(created);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutonomyAssessment> update(@PathVariable Long id, @RequestBody AutonomyAssessment assessment) {
        assessment.setId(id);
        AutonomyAssessment updated = service.update(id, assessment);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutonomyAssessment> getById(@PathVariable Long id) {
        AutonomyAssessment a = service.findById(id);
        return ResponseEntity.ok(a);
    }

    @GetMapping
    public ResponseEntity<List<AutonomyAssessment>> getAll() {
        List<AutonomyAssessment> list = service.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AutonomyAssessment>> getByPatientId(@PathVariable String patientId) {
        List<AutonomyAssessment> list = service.findAllByPatientId(patientId);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
