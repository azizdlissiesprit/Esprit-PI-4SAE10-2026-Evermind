package tn.esprit.intervention.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import tn.esprit.intervention.Entity.*;
import tn.esprit.intervention.Repository.InterventionLogRepository;
import tn.esprit.intervention.Repository.InterventionRepository;
import tn.esprit.intervention.Repository.SeedLogRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service("seedService")
@Slf4j
@RequiredArgsConstructor
public class SeedService {

    private final InterventionRepository interventionRepository;
    private final InterventionLogRepository interventionLogRepository;
    private final SeedLogRepository seedLogRepository;

    private static final String ENTITY_INTERVENTION = "Intervention";
    private static final String ENTITY_LOG = "InterventionLog";
    private final Random random = new Random(42);

    private static final String[] INTERVENTION_NOTES = {
        "Responded to fall alert. Patient found sitting on floor beside bed. No visible injuries. Assisted back to bed. Vitals stable: BP 130/80, HR 78.",
        "Cardiac alert response. Patient resting in armchair, slightly anxious. HR stabilized to 82 BPM after 10 minutes.",
        "Geofence breach response. Patient found near facility garden exit. Calm but disoriented. Gently redirected.",
        "Medication reminder intervention. Patient had forgotten morning dose. Administered Donepezil 10mg. Patient cooperative.",
        "Inactivity alert check. Patient was napping in chair. Vital signs normal. Adjusted sensor sensitivity.",
        "SOS response. Patient experienced nightmare, pressed panic button. Oriented but anxious. Provided reassurance.",
        "Fall prevention intervention. Patient attempting to stand without walker. Guided safe standing technique.",
        "Behavioral intervention. Patient showing signs of sundowning agitation. Applied calming music protocol.",
        "Medication discrepancy noted. Smart box shows opened but pill count unchanged. Supervised re-administration.",
        "Routine wellness check following extended quiet period. Patient alert and oriented x2. Hydration offered."
    };

    private static final String[][] LOG_SEQUENCES = {
        {"DISPATCHED", "EN_ROUTE", "ARRIVED", "ASSESSMENT_COMPLETE", "RESOLVED"},
        {"DISPATCHED", "ARRIVED", "ASSISTANCE_PROVIDED", "RESOLVED"},
        {"DISPATCHED", "EN_ROUTE", "ARRIVED", "ESCALATED", "SPECIALIST_NOTIFIED", "RESOLVED"},
        {"DISPATCHED", "ARRIVED", "FALSE_ALARM_CONFIRMED", "RESOLVED"},
        {"DISPATCHED", "REMOTE_ASSESSMENT", "RESOLVED"}
    };

    private static final String[] LOG_NOTES_DISPATCHED = {
        "Alert received and acknowledged. Proceeding to patient location.",
        "Caregiver notified via pager system. Responding from Station B.",
        "On-call nurse alerted. ETA 3 minutes to patient room."
    };
    private static final String[] LOG_NOTES_ARRIVED = {
        "Arrived at patient bedside. Beginning visual and verbal assessment.",
        "On scene. Patient conscious and responsive. Initiating evaluation.",
        "Present with patient. Checking vital signs and environment."
    };
    private static final String[] LOG_NOTES_RESOLVED = {
        "Intervention complete. Patient stable. Monitoring resumed via sensor suite.",
        "Situation resolved. No further action required. Documentation updated.",
        "Case closed. Follow-up scheduled for next shift. Care plan updated."
    };

    public Map<String, Object> executeSeed() {
        if (seedLogRepository.countByEntityType(ENTITY_INTERVENTION) > 0) {
            log.info("Intervention data already seeded");
            return Map.of("status", "ALREADY_SEEDED",
                "message", "Intervention data has already been seeded. Clear first to re-seed.",
                "interventionCount", seedLogRepository.countByEntityType(ENTITY_INTERVENTION),
                "logCount", seedLogRepository.countByEntityType(ENTITY_LOG));
        }

        log.info("MEDICAL-GRADE INTERVENTION SEEDING STARTED");
        int totalInterventions = 0, totalLogs = 0, skipped = 0;
        List<String> warnings = new ArrayList<>();
        Long[] caregiverIds = {1L, 2L, 3L, 4L, 5L};

        for (long patientId = 1; patientId <= 20; patientId++) {
            int count = 2 + random.nextInt(4);
            int patientInterventions = 0;
            for (int i = 0; i < count; i++) {
                try {
                    int daysAgo = random.nextInt(180);
                    LocalDateTime startedAt = LocalDateTime.now().minusDays(daysAgo)
                        .withHour(random.nextInt(24)).withMinute(random.nextInt(60));
                    long alertId = patientId * 10 + i;
                    long userId = caregiverIds[random.nextInt(caregiverIds.length)];
                    InterventionOutcome outcome = pickWeightedOutcome();
                    InterventionStatus status = InterventionStatus.COMPLETED;
                    boolean isEscalated = random.nextDouble() < 0.15;
                    long durationSeconds = (5 + random.nextInt(86)) * 60L;
                    LocalDateTime completedAt = startedAt.plus(durationSeconds, ChronoUnit.SECONDS);
                    if (daysAgo < 3 && random.nextDouble() < 0.3) {
                        status = InterventionStatus.IN_PERSON_ASSISTANCE;
                        completedAt = null; durationSeconds = 0;
                    }
                    Intervention intervention = Intervention.builder()
                        .alertId(alertId).userId(userId).patientId(patientId)
                        .notes(INTERVENTION_NOTES[random.nextInt(INTERVENTION_NOTES.length)])
                        .outcome(outcome).status(status).startedAt(startedAt).completedAt(completedAt)
                        .durationInSeconds(durationSeconds > 0 ? durationSeconds : null)
                        .isEscalated(isEscalated)
                        .escalatedToUserId(isEscalated ? caregiverIds[random.nextInt(caregiverIds.length)] : null)
                        .logs(new ArrayList<>()).build();
                    Intervention saved = interventionRepository.save(intervention);
                    seedLogRepository.save(SeedLog.builder().entityType(ENTITY_INTERVENTION).entityId(saved.getId()).build());
                    totalInterventions++; patientInterventions++;
                    totalLogs += createInterventionLogs(saved, startedAt, userId);
                } catch (DataIntegrityViolationException e) {
                    skipped++;
                    String msg = "Intervention " + (i+1) + " for patient " + patientId + " skipped — constraint violation";
                    log.warn(msg + ": {}", extractRootCause(e));
                    warnings.add(msg);
                } catch (Exception e) {
                    skipped++;
                    String msg = "Intervention " + (i+1) + " for patient " + patientId + " skipped — " + e.getMessage();
                    log.error(msg, e);
                    warnings.add(msg);
                }
            }
            log.info("Seeded {} interventions for patient {}", patientInterventions, patientId);
        }

        log.info("COMPLETE: {} interventions, {} logs (skipped: {})", totalInterventions, totalLogs, skipped);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "SUCCESS");
        result.put("interventionCount", totalInterventions);
        result.put("logCount", totalLogs);
        result.put("skipped", skipped);
        result.put("message", String.format("Seeded %d interventions with %d audit logs.%s",
            totalInterventions, totalLogs, skipped > 0 ? " (" + skipped + " skipped)" : ""));
        if (!warnings.isEmpty()) result.put("warnings", warnings);
        return result;
    }

    public Map<String, Object> clearSeed() {
        List<SeedLog> logEntries = seedLogRepository.findByEntityType(ENTITY_LOG);
        int logsDeleted = 0, logErrors = 0;
        for (SeedLog sl : logEntries) {
            try {
                if (interventionLogRepository.existsById(sl.getEntityId())) {
                    interventionLogRepository.deleteById(sl.getEntityId()); logsDeleted++;
                }
            } catch (Exception e) { logErrors++; log.warn("Failed to delete log {}: {}", sl.getEntityId(), e.getMessage()); }
        }
        List<SeedLog> interventionEntries = seedLogRepository.findByEntityType(ENTITY_INTERVENTION);
        int interventionsDeleted = 0, interventionErrors = 0;
        for (SeedLog sl : interventionEntries) {
            try {
                if (interventionRepository.existsById(sl.getEntityId())) {
                    interventionRepository.deleteById(sl.getEntityId()); interventionsDeleted++;
                }
            } catch (Exception e) { interventionErrors++; log.warn("Failed to delete intervention {}: {}", sl.getEntityId(), e.getMessage()); }
        }
        seedLogRepository.deleteByEntityType(ENTITY_LOG);
        seedLogRepository.deleteByEntityType(ENTITY_INTERVENTION);
        int totalErrors = logErrors + interventionErrors;
        log.info("Cleared {} interventions and {} logs (errors: {})", interventionsDeleted, logsDeleted, totalErrors);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "CLEARED");
        result.put("interventionsDeleted", interventionsDeleted);
        result.put("logsDeleted", logsDeleted);
        if (totalErrors > 0) { result.put("errors", totalErrors); result.put("message", "Cleared with " + totalErrors + " errors"); }
        return result;
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        long seeded = seedLogRepository.countByEntityType(ENTITY_INTERVENTION);
        status.put("seeded", seeded > 0);
        status.put("seededInterventionCount", seeded);
        status.put("seededLogCount", seedLogRepository.countByEntityType(ENTITY_LOG));
        status.put("totalInterventionCount", interventionRepository.count());
        status.put("totalLogCount", interventionLogRepository.count());
        Optional<SeedLog> lastSeed = seedLogRepository.findByEntityType(ENTITY_INTERVENTION)
                .stream().max(Comparator.comparing(SeedLog::getSeededAt));
        status.put("lastSeededAt", lastSeed.map(SeedLog::getSeededAt).orElse(null));
        return status;
    }

    private InterventionOutcome pickWeightedOutcome() {
        double r = random.nextDouble();
        if (r < 0.40) return InterventionOutcome.ASSISTANCE_GIVEN;
        if (r < 0.60) return InterventionOutcome.FALSE_ALARM;
        if (r < 0.80) return InterventionOutcome.MEDICATION_GIVEN;
        if (r < 0.92) return InterventionOutcome.CONSULTATION_SCHEDULED;
        return InterventionOutcome.EMERGENCY_SERVICES;
    }

    private int createInterventionLogs(Intervention intervention, LocalDateTime baseTime, long userId) {
        String[] sequence = LOG_SEQUENCES[random.nextInt(LOG_SEQUENCES.length)];
        int count = 0;
        for (int i = 0; i < sequence.length; i++) {
            try {
                LocalDateTime logTime = baseTime.plusMinutes(i * (2 + random.nextInt(10)));
                String notes = switch (sequence[i]) {
                    case "DISPATCHED" -> LOG_NOTES_DISPATCHED[random.nextInt(LOG_NOTES_DISPATCHED.length)];
                    case "ARRIVED", "EN_ROUTE" -> LOG_NOTES_ARRIVED[random.nextInt(LOG_NOTES_ARRIVED.length)];
                    case "RESOLVED" -> LOG_NOTES_RESOLVED[random.nextInt(LOG_NOTES_RESOLVED.length)];
                    default -> "Action: " + sequence[i] + ". Proceeding with protocol.";
                };
                InterventionLog logEntry = InterventionLog.builder()
                    .timestamp(logTime).actionType(sequence[i]).performedBy(userId)
                    .notes(notes).intervention(intervention).build();
                InterventionLog saved = interventionLogRepository.save(logEntry);
                seedLogRepository.save(SeedLog.builder().entityType(ENTITY_LOG).entityId(saved.getId()).build());
                count++;
            } catch (Exception e) {
                log.warn("Log '{}' for intervention {} skipped: {}", sequence[i], intervention.getId(), e.getMessage());
            }
        }
        return count;
    }

    private String extractRootCause(Exception e) {
        Throwable root = e;
        while (root.getCause() != null && root.getCause() != root) root = root.getCause();
        String msg = root.getMessage();
        if (msg != null && msg.length() > 200) msg = msg.substring(0, 200) + "...";
        return root.getClass().getSimpleName() + ": " + msg;
    }
}
