package tn.esprit.intervention.Service;

import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionOutcome;
import tn.esprit.intervention.Entity.InterventionStatus;

import java.util.List;

public interface IInterventionService {
    List<Intervention> retrieveAllInterventions();
    Intervention addIntervention(Intervention i);
    Intervention retrieveIntervention(Long id);
    void removeIntervention(Long id);

    // Business Logic
    Intervention updateInterventionStatus(Long id, InterventionStatus status); // Added new method
    Intervention finishIntervention(Long id, InterventionOutcome outcome, String notes);
    Intervention getInterventionByAlertId(Long alertId);
    List<Intervention> getInterventionsByPatient(Long patientId);
    Intervention escalateIntervention(Long id, Long toUserId, String notes);
    List<Intervention> getEscalatedInterventions(Long userId);
}