package tn.esprit.autonomy.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.autonomy.entity.AutonomyAssessment;
import tn.esprit.autonomy.repository.AutonomyAssessmentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AutonomyAssessmentServiceImpl implements IAutonomyAssessmentService {

    private final AutonomyAssessmentRepository repository;

    @Override
    @Transactional
    public AutonomyAssessment add(AutonomyAssessment assessment) {
        return repository.save(assessment);
    }

    @Override
    @Transactional
    public AutonomyAssessment update(Long id, AutonomyAssessment assessment) {
        AutonomyAssessment existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AutonomyAssessment not found with id: " + id));
        existing.setPatientId(assessment.getPatientId());
        existing.setDate(assessment.getDate());
        existing.setEvaluator(assessment.getEvaluator());
        existing.setScores(assessment.getScores());
        existing.setTotalScore(assessment.getTotalScore());
        existing.setTrend(assessment.getTrend());
        existing.setTrendPoints(assessment.getTrendPoints());
        existing.setAssistanceLevel(assessment.getAssistanceLevel());
        existing.setObservations(assessment.getObservations());
        existing.setRecommendedDevicesJson(assessment.getRecommendedDevicesJson());
        existing.setCaregiverRecommendationsJson(assessment.getCaregiverRecommendationsJson());
        return repository.save(existing);
    }

    @Override
    public AutonomyAssessment findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AutonomyAssessment not found with id: " + id));
    }

    @Override
    public List<AutonomyAssessment> findAll() {
        return repository.findAll();
    }

    @Override
    public List<AutonomyAssessment> findAllByPatientId(String patientId) {
        return repository.findAllByPatientIdOrderByIdDesc(patientId);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("AutonomyAssessment not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
