package tn.esprit.intervention.Service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionOutcome;
import tn.esprit.intervention.Entity.InterventionStatus;
import tn.esprit.intervention.Entity.InterventionLog;
import tn.esprit.intervention.Repository.InterventionLogRepository;
import tn.esprit.intervention.Repository.InterventionRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class InterventionServiceImpl implements IInterventionService {

    private final InterventionRepository interventionRepository;
    private final InterventionLogRepository logRepository;
    private final AlertClient alertClient;

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
        if (intervention.getStatus() == null) {
            intervention.setStatus(InterventionStatus.EN_ROUTE);
        }

        // 1. Save intervention
        log.info("💾 Saving new intervention for alertId: {}", intervention.getAlertId());
        Intervention saved = interventionRepository.save(intervention);

        // 1.5 Auto-generate DISPATCHED log
        InterventionLog firstLog = InterventionLog.builder()
                .intervention(saved)
                .timestamp(LocalDateTime.now())
                .actionType("DISPATCHED")
                .performedBy(saved.getUserId())
                .notes("Intervention Acknowledged and Responder Dispatched.")
                .build();
        logRepository.save(firstLog);

        // 2. Notify Alert Service that someone is taking charge
        log.info("📡 Notifying Alert Service (takeCharge) for alertId: {}", intervention.getAlertId());
        alertClient.takeCharge(intervention.getAlertId());
        log.info("✅ Alert Service notified successfully (takeCharge)");

        return saved;
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
    public Intervention updateInterventionStatus(Long id, InterventionStatus status) {
        Intervention intervention = retrieveIntervention(id);
        intervention.setStatus(status);
        
        Intervention saved = interventionRepository.save(intervention);
        
        // Auto-generate status log
        String actionType = "UPDATED";
        String context = "Status explicitly set to " + status.name();
        
        if (status == InterventionStatus.OFFERING_HELP) {
            actionType = "MESSAGE_SENT";
            context = "Responder sent initial voice/text prompt to patient.";
        } else if (status == InterventionStatus.IN_PERSON_ASSISTANCE) {
            actionType = "ARRIVED";
            context = "Responder arrived on scene.";
        }
        
        InterventionLog statusLog = InterventionLog.builder()
                .intervention(saved)
                .timestamp(LocalDateTime.now())
                .actionType(actionType)
                .performedBy(saved.getUserId()) // Assuming the primary owner did it
                .notes(context)
                .build();
        logRepository.save(statusLog);
        
        return saved;
    }

    @Override
    public Intervention finishIntervention(Long id, InterventionOutcome outcome, String notes) {
        Intervention intervention = retrieveIntervention(id);

        // 1. Update fields
        intervention.setOutcome(outcome);
        intervention.setNotes(notes);
        intervention.setCompletedAt(LocalDateTime.now());
        intervention.setStatus(InterventionStatus.COMPLETED);

        // 2. Calculate Duration (in seconds)
        if (intervention.getStartedAt() != null) {
            long seconds = Duration.between(intervention.getStartedAt(), intervention.getCompletedAt()).getSeconds();
            intervention.setDurationInSeconds(seconds);
        }

        // 3. Notify Alert Service to resolve (FAIL IF COMMUNICATION FAILS)
        log.info("📡 Notifying Alert Service (resolveAlert) for alertId: {}", intervention.getAlertId());
        alertClient.resolveAlert(intervention.getAlertId());
        log.info("✅ Alert Service notified successfully (resolveAlert)");
 
        // 4. Save
        log.info("💾 Saving finished intervention ID: {}", id);
        Intervention saved = interventionRepository.save(intervention);
        
        // 5. Generate Resolved Log
        InterventionLog resolvedLog = InterventionLog.builder()
                .intervention(saved)
                .timestamp(LocalDateTime.now())
                .actionType("RESOLVED")
                .performedBy(saved.getUserId())
                .notes("Outcome: " + outcome.name() + " | Notes: " + notes)
                .build();
        logRepository.save(resolvedLog);
        
        return saved;
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

    @Override
    public Intervention escalateIntervention(Long id, Long toUserId, String notes) {
        Intervention intervention = retrieveIntervention(id);
        
        intervention.setIsEscalated(true);
        intervention.setEscalatedToUserId(toUserId);
        
        Intervention saved = interventionRepository.save(intervention);
        
        InterventionLog escalateLog = InterventionLog.builder()
                .intervention(saved)
                .timestamp(LocalDateTime.now())
                .actionType("ESCALATED")
                .performedBy(saved.getUserId())
                .notes("Code Blue / Escalation to User ID " + toUserId + ". Reason: " + notes)
                .build();
        logRepository.save(escalateLog);
        
        return saved;
    }

    @Override
    public List<Intervention> getEscalatedInterventions(Long userId) {
        return interventionRepository.findByEscalatedToUserId(userId);
    }
}
