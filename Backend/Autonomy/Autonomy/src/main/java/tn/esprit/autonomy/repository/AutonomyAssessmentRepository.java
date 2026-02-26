package tn.esprit.autonomy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.autonomy.entity.AutonomyAssessment;

import java.util.List;

public interface AutonomyAssessmentRepository extends JpaRepository<AutonomyAssessment, Long> {

    List<AutonomyAssessment> findAllByPatientIdOrderByIdDesc(String patientId);
}
