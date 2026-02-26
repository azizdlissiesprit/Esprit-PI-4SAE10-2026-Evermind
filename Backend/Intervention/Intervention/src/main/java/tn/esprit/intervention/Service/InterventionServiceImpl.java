package tn.esprit.intervention.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionOutcome;
import tn.esprit.intervention.Repository.InterventionRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class InterventionServiceImpl implements IInterventionService {

    private final InterventionRepository interventionRepository;

    @Override
    public List<Intervention> retrieveAllInterventions() {
        return interventionRepository.findAll();
    }

    @Override
    public Intervention addIntervention(Intervention intervention) {
        // Automatically set the start time if not provided
        if (intervention.getStartedAt() == null) {
            intervention.setStartedAt(LocalDateTime.now());
        }
        return interventionRepository.save(intervention);
    }

    @Override
    public Intervention retrieveIntervention(Long id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found with ID: " + id));
    }

    @Override
    public void removeIntervention(Long id) {
        interventionRepository.deleteById(id);
    }

    // --- BUSINESS LOGIC ---

    @Override
    public Intervention finishIntervention(Long id, InterventionOutcome outcome, String notes) {
        Intervention intervention = retrieveIntervention(id);

        // 1. Update fields
        intervention.setOutcome(outcome);
        intervention.setNotes(notes);
        intervention.setCompletedAt(LocalDateTime.now());

        // 2. Calculate Duration (in seconds)
        if (intervention.getStartedAt() != null) {
            long seconds = Duration.between(intervention.getStartedAt(), intervention.getCompletedAt()).getSeconds();
            intervention.setDurationInSeconds(seconds);
        }

        // 3. Save
        return interventionRepository.save(intervention);
    }

    @Override
    public Intervention getInterventionByAlertId(Long alertId) {
        // Assuming your Repo has: Optional<Intervention> findByAlertId(Long alertId);
        return interventionRepository.findByAlertId(alertId)
                .orElseThrow(() -> new RuntimeException("No intervention found for Alert ID: " + alertId));
    }

    @Override
    public List<Intervention> getInterventionsByPatient(Long patientId) {
        // Assuming your Repo has: List<Intervention> findByPatientId(Long patientId);
        return interventionRepository.findByPatientId(patientId);
    }
}
