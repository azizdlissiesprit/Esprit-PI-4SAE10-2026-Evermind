package tn.esprit.cognitiveassessment.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.cognitiveassessment.entity.CognitiveAssessment;
import tn.esprit.cognitiveassessment.repository.CognitiveAssessmentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CognitiveAssessmentServiceImpl implements ICognitiveAssessmentService {

    private final CognitiveAssessmentRepository repository;

    @Override
    @Transactional
    public CognitiveAssessment add(CognitiveAssessment assessment) {
        return repository.save(assessment);
    }

    @Override
    @Transactional
    public CognitiveAssessment update(Long id, CognitiveAssessment assessment) {
        CognitiveAssessment existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CognitiveAssessment not found with id: " + id));
        existing.setPatientId(assessment.getPatientId());
        existing.setDate(assessment.getDate());
        existing.setType(assessment.getType());
        existing.setEvaluator(assessment.getEvaluator());
        existing.setMmseScore(assessment.getMmseScore());
        existing.setMoocaScore(assessment.getMoocaScore());
        existing.setTrend(assessment.getTrend());
        existing.setTrendPoints(assessment.getTrendPoints());
        existing.setScores(assessment.getScores());
        existing.setObservations(assessment.getObservations());
        return repository.save(existing);
    }

    @Override
    public CognitiveAssessment findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CognitiveAssessment not found with id: " + id));
    }

    @Override
    public List<CognitiveAssessment> findAll() {
        return repository.findAll();
    }

    @Override
    public List<CognitiveAssessment> findAllByPatientId(String patientId) {
        return repository.findAllByPatientIdOrderByIdDesc(patientId);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("CognitiveAssessment not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
