package tn.esprit.cognitiveassessment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.cognitiveassessment.entity.CognitiveAssessment;

import java.util.List;

public interface CognitiveAssessmentRepository extends JpaRepository<CognitiveAssessment, Long> {

    List<CognitiveAssessment> findAllByPatientIdOrderByIdDesc(String patientId);
}
