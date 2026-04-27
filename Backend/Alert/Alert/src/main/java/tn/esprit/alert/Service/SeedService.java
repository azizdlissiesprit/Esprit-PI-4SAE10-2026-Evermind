package tn.esprit.alert.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import tn.esprit.alert.Entity.*;
import tn.esprit.alert.Repository.AlertRepository;
import tn.esprit.alert.Repository.SeedLogRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class SeedService {

    private final AlertRepository alertRepository;
    private final SeedLogRepository seedLogRepository;

    private static final String ENTITY_ALERT = "Alert";
    private final Random random = new Random(42);

    private static final String[] AI_ANALYSES = {
        "Pattern analysis indicates elevated fall risk. Patient has shown 3 similar episodes in the past 30 days. Recommend increased supervision during evening hours and mobility aid reassessment.",
        "Cardiac rhythm irregularity detected. Correlation with medication timing suggests possible drug interaction. Recommend cardiology consult and 24-hour Holter monitoring.",
        "Geofence breach pattern: Patient has attempted to leave facility perimeter 2 times this week. Behavior correlates with sundowning episodes. Recommend door alarm activation after 16:00.",
        "Medication non-compliance detected for 3rd consecutive day. Cognitive decline may be affecting self-medication ability. Recommend supervised medication administration protocol.",
        "Extended inactivity period outside normal sleep cycle. Previous similar events preceded urinary tract infection diagnosis. Recommend vitals check and urinalysis.",
        "SOS activation during nighttime hours. Patient history shows nocturnal anxiety episodes. Low probability of acute medical emergency based on vitals context.",
        "Multi-sensor correlation: Heart rate elevation + accelerometer spike + geofence alert within 10-minute window suggests acute agitation episode with elopement attempt.",
        "Isolated heart rate spike (118 BPM, 6-minute duration). No concurrent accelerometer anomaly. Likely anxiety-related. Patient's baseline variability is within normal range.",
        "Motion sensor inactivity for 5.2 hours during daytime. Cross-referenced with medication schedule — patient received PRN sedative at 13:00. Likely pharmacological cause.",
        "GPS drift pattern analysis: Patient wandered 230m in circular pattern over 45 minutes. Consistent with confusion-driven ambulatory behavior. Safe return protocol initiated."
    };

    private static final String[] MESSAGES = {
        "FALL ALERT: Accelerometer detected sudden impact consistent with a fall in Room %s. Immediate response required.",
        "CARDIAC ALERT: Heart rate anomaly detected for patient in Room %s. HR: %d BPM (threshold exceeded for >5 min).",
        "GEOFENCE ALERT: Patient from Room %s has exited the designated safe zone. Last GPS coordinates logged.",
        "MEDICATION ALERT: Scheduled medication window missed for patient in Room %s. Box remained unopened past grace period.",
        "INACTIVITY ALERT: No motion detected in Room %s for %.1f hours during active period. Welfare check recommended.",
        "SOS ALERT: Emergency button activated by patient in Room %s. Immediate assessment required."
    };

    private static final String[] CONTEXTS = {
        "Sensor cluster: Wrist-worn device (SIM-WATCH-%03d). Environment: Indoor, facility wing A. Weather: Clear, 22°C.",
        "Monitoring context: 24/7 remote observation. Shift: Night duty (22:00-06:00). Staffing: 2 nurses on floor.",
        "Clinical context: Patient on fall prevention protocol. Last assessment score: MMSE %d/30. Mobility: Walker-assisted.",
        "Environmental context: Room temperature 23°C. Humidity 45%%. Last meal: %d hours ago. Last vitals check: %d hours ago.",
        "Device context: Battery 78%%. Signal strength: Strong. Last calibration: %d days ago. Firmware: v2.4.1."
    };

    // ─── Public API ─────────────────────────────────────────────

    public Map<String, Object> executeSeed() {
        if (seedLogRepository.countByEntityType(ENTITY_ALERT) > 0) {
            log.info("🌱 Alert data already seeded — returning existing count");
            return Map.of(
                "status", "ALREADY_SEEDED",
                "message", "Alert data has already been seeded. Clear first to re-seed.",
                "alertCount", seedLogRepository.countByEntityType(ENTITY_ALERT)
            );
        }

        log.info("🌱 ══════════════════════════════════════════");
        log.info("🌱  MEDICAL-GRADE ALERT SEEDING STARTED");
        log.info("🌱 ══════════════════════════════════════════");

        int totalAlerts = 0;
        int skipped = 0;
        List<String> warnings = new ArrayList<>();

        for (long patientId = 1; patientId <= 20; patientId++) {
            int alertCount = 3 + random.nextInt(5); // 3-7 alerts per patient
            String room = String.valueOf(101 + (patientId - 1));
            int patientAlerts = 0;

            for (int i = 0; i < alertCount; i++) {
                try {
                    int daysAgo = random.nextInt(180);
                    LocalDateTime dateCreation = LocalDateTime.now().minusDays(daysAgo)
                        .withHour(random.nextInt(24)).withMinute(random.nextInt(60));

                    TypeAlerte type = TypeAlerte.values()[random.nextInt(TypeAlerte.values().length)];
                    Severite severity = pickWeightedSeverity();
                    StatutAlerte status = pickWeightedStatus(daysAgo);

                    String message = buildMessage(type, room, patientId);
                    String context = buildContext(patientId);
                    int riskScore = calculateRiskScore(severity, type);

                    Alert alert = new Alert();
                    alert.setPatientId(patientId);
                    alert.setAbnormalEventId((long) (patientId * 10 + i));
                    alert.setTypeAlerte(type);
                    alert.setSeverite(severity);
                    alert.setDateCreation(dateCreation);
                    alert.setStatut(status);
                    alert.setMessage(message);
                    alert.setAiAnalysis(AI_ANALYSES[random.nextInt(AI_ANALYSES.length)]);
                    alert.setContext(context);
                    alert.setAiRiskScore(riskScore);

                    Alert saved = alertRepository.save(alert);
                    seedLogRepository.save(SeedLog.builder()
                        .entityType(ENTITY_ALERT).entityId(saved.getAlertId()).build());
                    totalAlerts++;
                    patientAlerts++;
                } catch (DataIntegrityViolationException e) {
                    skipped++;
                    String msg = String.format("⚠️ Alert %d for patient %d skipped — constraint violation: %s",
                        i + 1, patientId, extractRootCause(e));
                    log.warn(msg);
                    warnings.add(msg);
                } catch (Exception e) {
                    skipped++;
                    String msg = String.format("⚠️ Alert %d for patient %d skipped — error: %s",
                        i + 1, patientId, e.getMessage());
                    log.error(msg, e);
                    warnings.add(msg);
                }
            }
            log.info("🌱 Seeded {} alerts for patient {} (Room {})", patientAlerts, patientId, room);
        }

        log.info("🌱 ══════════════════════════════════════════");
        log.info("🌱  SEEDING COMPLETE: {} alerts total (skipped: {})", totalAlerts, skipped);
        log.info("🌱 ══════════════════════════════════════════");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "SUCCESS");
        result.put("alertCount", totalAlerts);
        result.put("skipped", skipped);
        result.put("message", String.format("Successfully seeded %d alerts across 20 patients.%s",
            totalAlerts,
            skipped > 0 ? String.format(" (%d skipped due to existing data)", skipped) : ""));
        if (!warnings.isEmpty()) {
            result.put("warnings", warnings);
        }
        return result;
    }

    public Map<String, Object> clearSeed() {
        List<SeedLog> logs = seedLogRepository.findByEntityType(ENTITY_ALERT);
        int deleted = 0;
        int errors = 0;
        for (SeedLog sl : logs) {
            try {
                if (alertRepository.existsById(sl.getEntityId())) {
                    alertRepository.deleteById(sl.getEntityId());
                    deleted++;
                }
            } catch (Exception e) {
                errors++;
                log.warn("⚠️ Failed to delete alert ID {}: {}", sl.getEntityId(), e.getMessage());
            }
        }
        seedLogRepository.deleteByEntityType(ENTITY_ALERT);

        log.info("🧹 Cleared {} seeded alerts (errors: {})", deleted, errors);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "CLEARED");
        result.put("alertsDeleted", deleted);
        if (errors > 0) {
            result.put("errors", errors);
            result.put("message", String.format("Cleared %d alerts with %d errors.", deleted, errors));
        }
        return result;
    }

    public Map<String, Object> getStatus() {
        long seeded = seedLogRepository.countByEntityType(ENTITY_ALERT);
        Map<String, Object> status = new HashMap<>();
        status.put("seeded", seeded > 0);
        status.put("seededAlertCount", seeded);
        status.put("totalAlertCount", alertRepository.count());
        Optional<SeedLog> lastSeed = seedLogRepository.findByEntityType(ENTITY_ALERT)
                .stream().max(Comparator.comparing(SeedLog::getSeededAt));
        status.put("lastSeededAt", lastSeed.map(SeedLog::getSeededAt).orElse(null));
        return status;
    }

    // ─── Private Helpers ─────────────────────────────────────────

    private Severite pickWeightedSeverity() {
        double r = random.nextDouble();
        if (r < 0.35) return Severite.BASSE;
        if (r < 0.65) return Severite.MOYENNE;
        if (r < 0.85) return Severite.HAUTE;
        return Severite.CRITIQUE;
    }

    private StatutAlerte pickWeightedStatus(int daysAgo) {
        if (daysAgo > 30) return StatutAlerte.RESOLUE; // Old alerts are resolved
        double r = random.nextDouble();
        if (r < 0.5) return StatutAlerte.RESOLUE;
        if (r < 0.75) return StatutAlerte.EN_COURS;
        if (r < 0.9) return StatutAlerte.NOUVELLE;
        return StatutAlerte.IGNOREE;
    }

    private String buildMessage(TypeAlerte type, String room, long patientId) {
        return switch (type) {
            case FALL_DETECTION -> String.format(MESSAGES[0], room);
            case HEART_RATE_ANOMALY -> String.format(MESSAGES[1], room, 90 + random.nextInt(50));
            case GEOFENCE_EXIT -> String.format(MESSAGES[2], room);
            case MEDICATION_MISSED -> String.format(MESSAGES[3], room);
            case INACTIVITY -> String.format(MESSAGES[4], room, 3.0 + random.nextDouble() * 4.0);
            case SOS_BUTTON -> String.format(MESSAGES[5], room);
        };
    }

    private String buildContext(long patientId) {
        String template = CONTEXTS[random.nextInt(CONTEXTS.length)];
        return String.format(template, patientId, 15 + random.nextInt(15),
            1 + random.nextInt(5), 1 + random.nextInt(8), random.nextInt(30));
    }

    private int calculateRiskScore(Severite severity, TypeAlerte type) {
        int base = switch (severity) {
            case BASSE -> 15 + random.nextInt(20);
            case MOYENNE -> 35 + random.nextInt(25);
            case HAUTE -> 60 + random.nextInt(20);
            case CRITIQUE -> 80 + random.nextInt(20);
        };
        if (type == TypeAlerte.FALL_DETECTION || type == TypeAlerte.HEART_RATE_ANOMALY) {
            base = Math.min(100, base + 10);
        }
        return base;
    }

    private String extractRootCause(Exception e) {
        Throwable root = e;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String msg = root.getMessage();
        if (msg != null && msg.length() > 200) {
            msg = msg.substring(0, 200) + "...";
        }
        return root.getClass().getSimpleName() + ": " + msg;
    }
}
