package tn.esprit.intervention.Controller;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionOutcome;
import tn.esprit.intervention.Service.IInterventionService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/intervention")
@CrossOrigin(origins = "*") // Allow Angular access
public class InterventionController {

    @Autowired
    IInterventionService interventionService;

    // --- 1. Basic CRUD ---

    @GetMapping("/retrieve-all-interventions")
    public List<Intervention> getAllInterventions() {
        return interventionService.retrieveAllInterventions();
    }

    @GetMapping("/retrieve-intervention/{id}")
    public Intervention getIntervention(@PathVariable("id") Long id) {
        return interventionService.retrieveIntervention(id);
    }

    // Called when a Caregiver clicks "Acknowledge"
    @PostMapping("/start-intervention")
    public Intervention startIntervention(@RequestBody Intervention intervention) {
        // Expected JSON: { "alertId": 1, "userId": 5, "patientId": 10 }
        return interventionService.addIntervention(intervention);
    }

    @DeleteMapping("/remove-intervention/{id}")
    public void removeIntervention(@PathVariable("id") Long id) {
        interventionService.removeIntervention(id);
    }

    // --- 2. Functional Methods (Workflow) ---

    // Called when Caregiver clicks "Mark Resolved" and submits the form
    @PatchMapping("/finish-intervention/{id}")
    public Intervention finishIntervention(
            @PathVariable("id") Long id,
            @RequestParam("outcome") InterventionOutcome outcome,
            @RequestParam("notes") String notes
    ) {
        return interventionService.finishIntervention(id, outcome, notes);
    }

    // --- 3. Search / History ---

    @GetMapping("/by-alert/{alert-id}")
    public Intervention getInterventionByAlert(@PathVariable("alert-id") Long alertId) {
        return interventionService.getInterventionByAlertId(alertId);
    }

    @GetMapping("/history/patient/{patient-id}")
    public List<Intervention> getHistoryByPatient(@PathVariable("patient-id") Long patientId) {
        return interventionService.getInterventionsByPatient(patientId);
    }
}