package tn.esprit.intervention.Service;

import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionOutcome;

import java.util.List;

public interface IInterventionService {
    List<Intervention> retrieveAllInterventions();
    Intervention addIntervention(Intervention i);
    Intervention retrieveIntervention(Long id);
    void removeIntervention(Long id);

    // Business Logic
    Intervention finishIntervention(Long id, InterventionOutcome outcome, String notes);
    Intervention getInterventionByAlertId(Long alertId);
    List<Intervention> getInterventionsByPatient(Long patientId);
}