package tn.esprit.cognitiveassessment.service;

import tn.esprit.cognitiveassessment.entity.CognitiveAssessment;

import java.util.List;

public interface ICognitiveAssessmentService {

    CognitiveAssessment add(CognitiveAssessment assessment);
    CognitiveAssessment update(Long id, CognitiveAssessment assessment);
    CognitiveAssessment findById(Long id);
    List<CognitiveAssessment> findAll();
    List<CognitiveAssessment> findAllByPatientId(String patientId);
    void deleteById(Long id);
}
