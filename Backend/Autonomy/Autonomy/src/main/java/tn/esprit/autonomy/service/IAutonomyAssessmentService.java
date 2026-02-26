package tn.esprit.autonomy.service;

import tn.esprit.autonomy.entity.AutonomyAssessment;

import java.util.List;

public interface IAutonomyAssessmentService {

    AutonomyAssessment add(AutonomyAssessment assessment);
    AutonomyAssessment update(Long id, AutonomyAssessment assessment);
    AutonomyAssessment findById(Long id);
    List<AutonomyAssessment> findAll();
    List<AutonomyAssessment> findAllByPatientId(String patientId);
    void deleteById(Long id);
}
