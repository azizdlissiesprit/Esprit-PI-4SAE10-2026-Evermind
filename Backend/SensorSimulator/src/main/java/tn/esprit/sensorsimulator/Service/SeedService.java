package tn.esprit.sensorsimulator.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import tn.esprit.sensorsimulator.Entity.*;
import tn.esprit.sensorsimulator.Repository.*;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class SeedService {

    private final SensorRepository sensorRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final AbnormalEventRepository abnormalEventRepository;
    private final SeedLogRepository seedLogRepository;

    private static final String ENTITY_SENSOR = "Sensor";
    private static final String ENTITY_READING = "SensorReading";
    private static final String ENTITY_EVENT = "AbnormalEvent";

    private final Random random = new Random(42);

    // ─── Public API ─────────────────────────────────────────────

    public Map<String, Object> executeSeed() {
        if (seedLogRepository.countByEntityType(ENTITY_SENSOR) > 0) {
            log.info("🌱 Sensor data already seeded — returning existing count");
            return Map.of(
                "status", "ALREADY_SEEDED",
                "message", "Sensor data has already been seeded. Clear first to re-seed.",
                "sensorCount", seedLogRepository.countByEntityType(ENTITY_SENSOR),
                "readingCount", seedLogRepository.countByEntityType(ENTITY_READING),
                "eventCount", seedLogRepository.countByEntityType(ENTITY_EVENT)
            );
        }

        log.info("🌱 ══════════════════════════════════════════");
        log.info("🌱  MEDICAL-GRADE SENSOR SEEDING STARTED");
        log.info("🌱 ══════════════════════════════════════════");

        int sensorCount = 0;
        int readingCount = 0;
        int eventCount = 0;
        int skipped = 0;
        List<String> warnings = new ArrayList<>();

        for (long patientId = 1; patientId <= 20; patientId++) {
            try {
                List<Sensor> sensors = seedSensorsForPatient(patientId);
                sensorCount += sensors.size();

                int readings = seedReadingsForPatient(patientId, sensors);
                readingCount += readings;

                int events = seedAbnormalEventsForPatient(patientId, sensors);
                eventCount += events;

                log.info("🌱 Patient {}: {} sensors, {} readings, {} events", patientId, sensors.size(), readings, events);
            } catch (DataIntegrityViolationException e) {
                skipped++;
                String msg = "Patient " + patientId + " skipped — constraint violation: " + extractRootCause(e);
                log.warn("⚠️ {}", msg);
                warnings.add(msg);
            } catch (Exception e) {
                skipped++;
                String msg = "Patient " + patientId + " skipped — error: " + e.getMessage();
                log.error("⚠️ {}", msg, e);
                warnings.add(msg);
            }
        }

        log.info("🌱 ══════════════════════════════════════════");
        log.info("🌱  SEEDING COMPLETE: {} sensors, {} readings, {} events (skipped: {} patients)", sensorCount, readingCount, eventCount, skipped);
        log.info("🌱 ══════════════════════════════════════════");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "SUCCESS");
        result.put("sensorCount", sensorCount);
        result.put("readingCount", readingCount);
        result.put("eventCount", eventCount);
        result.put("skipped", skipped);
        result.put("message", String.format("Seeded %d sensors, %d readings, %d events.%s",
            sensorCount, readingCount, eventCount,
            skipped > 0 ? " (" + skipped + " patients skipped)" : ""));
        if (!warnings.isEmpty()) result.put("warnings", warnings);
        return result;
    }

    public Map<String, Object> clearSeed() {
        int[] eventResult = deleteByTypeSafe(ENTITY_EVENT, id -> {
            if (abnormalEventRepository.existsById(id)) { abnormalEventRepository.deleteById(id); return true; }
            return false;
        });
        int[] readingResult = deleteByTypeSafe(ENTITY_READING, id -> {
            if (sensorReadingRepository.existsById(id)) { sensorReadingRepository.deleteById(id); return true; }
            return false;
        });
        int[] sensorResult = deleteByTypeSafe(ENTITY_SENSOR, id -> {
            if (sensorRepository.existsById(id)) { sensorRepository.deleteById(id); return true; }
            return false;
        });

        seedLogRepository.deleteByEntityType(ENTITY_EVENT);
        seedLogRepository.deleteByEntityType(ENTITY_READING);
        seedLogRepository.deleteByEntityType(ENTITY_SENSOR);

        int totalErrors = eventResult[1] + readingResult[1] + sensorResult[1];
        log.info("🧹 Cleared {} sensors, {} readings, {} events (errors: {})",
            sensorResult[0], readingResult[0], eventResult[0], totalErrors);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "CLEARED");
        result.put("sensorsDeleted", sensorResult[0]);
        result.put("readingsDeleted", readingResult[0]);
        result.put("eventsDeleted", eventResult[0]);
        if (totalErrors > 0) {
            result.put("errors", totalErrors);
            result.put("message", "Cleared with " + totalErrors + " errors. Some records may have been already deleted.");
        }
        return result;
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("seeded", seedLogRepository.countByEntityType(ENTITY_SENSOR) > 0);
        status.put("seededSensorCount", seedLogRepository.countByEntityType(ENTITY_SENSOR));
        status.put("seededReadingCount", seedLogRepository.countByEntityType(ENTITY_READING));
        status.put("seededEventCount", seedLogRepository.countByEntityType(ENTITY_EVENT));
        status.put("totalSensorCount", sensorRepository.count());
        status.put("totalReadingCount", sensorReadingRepository.count());
        status.put("totalEventCount", abnormalEventRepository.count());

        Optional<SeedLog> lastSeed = seedLogRepository.findByEntityType(ENTITY_SENSOR)
                .stream().max(Comparator.comparing(SeedLog::getSeededAt));
        status.put("lastSeededAt", lastSeed.map(SeedLog::getSeededAt).orElse(null));
        return status;
    }

    // ─── Private: Sensors ────────────────────────────────────────

    private List<Sensor> seedSensorsForPatient(long patientId) {
        List<Sensor> sensors = new ArrayList<>();
        double baseLat = 36.8065 + (((patientId - 1) / 5) * 0.005);
        double baseLon = 10.1815 + (((patientId - 1) % 5) * 0.005);
        int radius = 80 + (int) ((patientId - 1) % 3) * 20;
        String suffix = String.format("%03d", patientId);

        SensorType[] types = {SensorType.HEART_RATE_MONITOR, SensorType.ACCELEROMETER,
                SensorType.GPS_TRACKER, SensorType.MEDICATION_BOX, SensorType.MOTION_DETECTOR};
        String[] prefixes = {"HR", "ACC", "GPS", "MED", "MOT"};

        for (int i = 0; i < types.length; i++) {
            String code = prefixes[i] + "-" + suffix;
            if (sensorRepository.existsBySensorCode(code)) continue;

            Sensor sensor = sensorRepository.save(Sensor.builder()
                .sensorCode(code)
                .sensorType(types[i])
                .patientId(patientId)
                .status(SensorStatus.ACTIVE)
                .baseLatitude(baseLat)
                .baseLongitude(baseLon)
                .geofenceRadius(radius)
                .installedAt(LocalDateTime.now().minusMonths(7))
                .build());

            sensors.add(sensor);
            seedLogRepository.save(SeedLog.builder().entityType(ENTITY_SENSOR).entityId(sensor.getId()).build());
        }
        return sensors;
    }

    // ─── Private: Sensor Readings (6 months, 4x daily) ──────────

    private int seedReadingsForPatient(long patientId, List<Sensor> sensors) {
        int count = 0;
        LocalDateTime start = LocalDateTime.now().minusMonths(6);
        LocalDateTime end = LocalDateTime.now();

        // Find sensor IDs by type
        Map<SensorType, Long> sensorIdMap = new HashMap<>();
        for (Sensor s : sensors) {
            sensorIdMap.put(s.getSensorType(), s.getId());
        }

        // Generate 4 readings per day for 180 days
        List<SensorReading> batch = new ArrayList<>();
        for (LocalDateTime day = start; day.isBefore(end); day = day.plusDays(1)) {
            int[] hours = {7, 12, 18, 23}; // Morning, noon, evening, night

            for (int hour : hours) {
                LocalDateTime ts = day.withHour(hour).withMinute(random.nextInt(60));

                // Heart Rate reading
                Long hrSensorId = sensorIdMap.get(SensorType.HEART_RATE_MONITOR);
                if (hrSensorId != null) {
                    double baseHR = hour >= 22 || hour <= 6 ? 60.0 : 75.0; // Circadian rhythm
                    double hr = baseHR + (random.nextGaussian() * 8);
                    boolean anomalous = hr < 50 || hr > 110;

                    batch.add(SensorReading.builder()
                        .sensorId(hrSensorId).patientId(patientId).timestamp(ts)
                        .heartRate(Math.round(hr * 10.0) / 10.0)
                        .isAnomalous(anomalous).build());
                }

                // GPS reading
                Long gpsSensorId = sensorIdMap.get(SensorType.GPS_TRACKER);
                if (gpsSensorId != null) {
                    Sensor gpsSensor = sensors.stream()
                        .filter(s -> s.getSensorType() == SensorType.GPS_TRACKER).findFirst().orElse(null);
                    if (gpsSensor != null) {
                        double lat = gpsSensor.getBaseLatitude() + (random.nextGaussian() * 0.0003);
                        double lon = gpsSensor.getBaseLongitude() + (random.nextGaussian() * 0.0003);
                        double distance = Math.sqrt(Math.pow(lat - gpsSensor.getBaseLatitude(), 2) +
                            Math.pow(lon - gpsSensor.getBaseLongitude(), 2)) * 111000;
                        boolean anomalous = distance > gpsSensor.getGeofenceRadius();

                        batch.add(SensorReading.builder()
                            .sensorId(gpsSensorId).patientId(patientId).timestamp(ts)
                            .latitude(lat).longitude(lon)
                            .isAnomalous(anomalous).build());
                    }
                }

                // Accelerometer reading
                Long accSensorId = sensorIdMap.get(SensorType.ACCELEROMETER);
                if (accSensorId != null) {
                    double ax = random.nextGaussian() * 0.3;
                    double ay = random.nextGaussian() * 0.2;
                    double az = 1.0 + random.nextGaussian() * 0.1; // Gravity baseline
                    double totalG = Math.sqrt(ax * ax + ay * ay + az * az);
                    boolean anomalous = totalG > 3.0; // Fall threshold

                    batch.add(SensorReading.builder()
                        .sensorId(accSensorId).patientId(patientId).timestamp(ts)
                        .accelerationX(Math.round(ax * 100.0) / 100.0)
                        .accelerationY(Math.round(ay * 100.0) / 100.0)
                        .accelerationZ(Math.round(az * 100.0) / 100.0)
                        .isAnomalous(anomalous).build());
                }

                // Motion Detector
                Long motSensorId = sensorIdMap.get(SensorType.MOTION_DETECTOR);
                if (motSensorId != null) {
                    boolean motionDetected = hour >= 7 && hour <= 21 ? random.nextDouble() > 0.15 : random.nextDouble() > 0.7;

                    batch.add(SensorReading.builder()
                        .sensorId(motSensorId).patientId(patientId).timestamp(ts)
                        .motionDetected(motionDetected)
                        .isAnomalous(false).build());
                }

                // Medication Box (only morning/evening)
                Long medSensorId = sensorIdMap.get(SensorType.MEDICATION_BOX);
                if (medSensorId != null && (hour == 7 || hour == 18)) {
                    boolean opened = random.nextDouble() > 0.1; // 90% compliance

                    batch.add(SensorReading.builder()
                        .sensorId(medSensorId).patientId(patientId).timestamp(ts)
                        .medicationBoxOpened(opened)
                        .isAnomalous(!opened).build());
                }
            }

            // Batch save every 30 days to manage memory
            if (batch.size() > 2000) {
                List<SensorReading> saved = sensorReadingRepository.saveAll(batch);
                for (SensorReading sr : saved) {
                    seedLogRepository.save(SeedLog.builder().entityType(ENTITY_READING).entityId(sr.getId()).build());
                }
                count += saved.size();
                batch.clear();
            }
        }

        // Save remaining
        if (!batch.isEmpty()) {
            List<SensorReading> saved = sensorReadingRepository.saveAll(batch);
            for (SensorReading sr : saved) {
                seedLogRepository.save(SeedLog.builder().entityType(ENTITY_READING).entityId(sr.getId()).build());
            }
            count += saved.size();
        }

        return count;
    }

    // ─── Private: Abnormal Events ────────────────────────────────

    private int seedAbnormalEventsForPatient(long patientId, List<Sensor> sensors) {
        int count = 0;
        int numEvents = 2 + random.nextInt(4); // 2-5 events per patient

        AbnormalEventType[] eventTypes = AbnormalEventType.values();
        String[] descriptions = {
            "Fall detected: Impact force 4.2G on accelerometer. Patient found on floor of room. Conscious and responsive.",
            "Cardiac anomaly: Heart rate spiked to 125 BPM for 8 minutes. No prior exertion. Patient reported chest tightness.",
            "Geofence breach: Patient exited safe zone perimeter at 15:42. Located 180m from facility entrance.",
            "Missed medication: Smart medication box was not opened during scheduled 08:00 window. 2-hour grace period expired.",
            "Prolonged inactivity: No motion detected in patient room for 4.5 hours during daytime. Staff check dispatched.",
            "SOS triggered: Patient pressed emergency button on wearable device at 03:15. Reported anxiety and confusion."
        };

        Map<SensorType, Long> sensorIdMap = new HashMap<>();
        for (Sensor s : sensors) {
            sensorIdMap.put(s.getSensorType(), s.getId());
        }

        for (int i = 0; i < numEvents; i++) {
            int daysAgo = random.nextInt(180);
            LocalDateTime detectedAt = LocalDateTime.now().minusDays(daysAgo).withHour(random.nextInt(24));

            AbnormalEventType eventType = eventTypes[random.nextInt(eventTypes.length)];
            SensorType associatedSensorType = switch (eventType) {
                case FALL -> SensorType.ACCELEROMETER;
                case CARDIAC_ANOMALY -> SensorType.HEART_RATE_MONITOR;
                case GEOFENCE_BREACH -> SensorType.GPS_TRACKER;
                case MISSED_MEDICATION -> SensorType.MEDICATION_BOX;
                case PROLONGED_INACTIVITY -> SensorType.MOTION_DETECTOR;
                case SOS_TRIGGERED -> SensorType.HEART_RATE_MONITOR;
            };

            Long sensorId = sensorIdMap.getOrDefault(associatedSensorType, sensors.get(0).getId());

            AbnormalEvent event = abnormalEventRepository.save(AbnormalEvent.builder()
                .patientId(patientId)
                .sensorId(sensorId)
                .eventType(eventType)
                .detectedAt(detectedAt)
                .description(descriptions[eventType.ordinal() % descriptions.length])
                .alertSent(true)
                .build());

            seedLogRepository.save(SeedLog.builder().entityType(ENTITY_EVENT).entityId(event.getId()).build());
            count++;
        }
        return count;
    }

    // ─── Utility ─────────────────────────────────────────────────

    /** Returns int[]{deleted, errors} */
    private int[] deleteByTypeSafe(String entityType, java.util.function.Function<Long, Boolean> deleter) {
        List<SeedLog> logs = seedLogRepository.findByEntityType(entityType);
        int deleted = 0;
        int errors = 0;
        for (SeedLog sl : logs) {
            try {
                if (deleter.apply(sl.getEntityId())) deleted++;
            } catch (Exception e) {
                errors++;
                log.warn("⚠️ Failed to delete {} ID {}: {}", entityType, sl.getEntityId(), e.getMessage());
            }
        }
        return new int[]{deleted, errors};
    }

    private String extractRootCause(Exception e) {
        Throwable root = e;
        while (root.getCause() != null && root.getCause() != root) root = root.getCause();
        String msg = root.getMessage();
        if (msg != null && msg.length() > 200) msg = msg.substring(0, 200) + "...";
        return root.getClass().getSimpleName() + ": " + msg;
    }
}
