package tn.esprit.sensorsimulator.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.sensorsimulator.Entity.*;
import tn.esprit.sensorsimulator.Repository.AbnormalEventRepository;
import tn.esprit.sensorsimulator.Repository.SensorReadingRepository;
import tn.esprit.sensorsimulator.Repository.SensorRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * The heart of the SensorSimulator. Runs on a scheduled interval and generates
 * realistic sensor data for all active sensors. Detects anomalies and
 * communicates with the Alert service.
 */
@Service
@Slf4j
public class SimulationEngine {

    private final SensorRepository sensorRepository;
    private final SensorReadingRepository readingRepository;
    private final AbnormalEventRepository eventRepository;
    private final AlertIntegrationService alertService;

    // ====== Simulation State ======
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final AtomicLong cycleCount = new AtomicLong(0);

    // ====== Configurable Parameters ======
    // Base probability for accidents. Adjusted from 0.02 to 0.002 to reduce overall frequency.
    // Reduced from 0.02 (2.0%) down to 0.0005 (0.05%) to handle 100+ sensors gracefully
    @Value("${simulation.accident-probability:0.0005}")
    private double accidentProbability;

    @Value("${simulation.geofence.center-lat:36.8065}")
    private double geofenceCenterLat;

    @Value("${simulation.geofence.center-lon:10.1815}")
    private double geofenceCenterLon;

    @Value("${simulation.geofence.radius-meters:100}")
    private double geofenceRadiusMeters;

    @Value("${simulation.auto-start:true}")
    private boolean autoStart;

    // ====== Internal State for Coherent Simulation ======
    private final Random random = new Random();
    private final Map<Long, Double> lastHeartRates = new HashMap<>();
    private final Map<Long, double[]> lastPositions = new HashMap<>();
    private final Map<Long, Integer> inactivityCounters = new HashMap<>();
    private final Map<Long, Boolean> lastMotionStates = new HashMap<>();
    private final Set<String> medicationsTakenToday = new HashSet<>();
    private LocalDateTime lastMedicationReset = LocalDateTime.now();

    // Context Buffer: patientId -> List of recent readings (max 10)
    private final Map<Long, EvictingQueue<SensorReading>> contextBuffer = new ConcurrentHashMap<>();

    // ====== Alert Cooldown (prevents spamming same alert type) ======
    // Key: "patientId:eventType" -> Value: last time an alert was sent
    private static final Duration ALERT_COOLDOWN = Duration.ofMinutes(10);
    private final Map<String, LocalDateTime> alertCooldownMap = new ConcurrentHashMap<>();

    @Autowired
    public SimulationEngine(SensorRepository sensorRepository,
                            SensorReadingRepository readingRepository,
                            AbnormalEventRepository eventRepository,
                            AlertIntegrationService alertService) {
        this.sensorRepository = sensorRepository;
        this.readingRepository = readingRepository;
        this.eventRepository = eventRepository;
        this.alertService = alertService;
    }

    // ====== Lifecycle ======

    @jakarta.annotation.PostConstruct
    public void init() {
        if (autoStart) {
            log.info("🚀 SimulationEngine auto-starting (simulation.auto-start=true)");
            running.set(true);
        } else {
            log.info("⏸️ SimulationEngine initialized but NOT auto-started. Call /simulation/start to begin.");
        }
    }

    public void start() {
        running.set(true);
        log.info("🚀 SimulationEngine STARTED. Cycle count: {}", cycleCount.get());
    }

    public void stop() {
        running.set(false);
        log.info("⏸️ SimulationEngine STOPPED at cycle {}", cycleCount.get());
    }

    public boolean isRunning() {
        return running.get();
    }

    public long getCycleCount() {
        return cycleCount.get();
    }

    public double getAccidentProbability() {
        return accidentProbability;
    }

    public void setAccidentProbability(double probability) {
        log.info("🔧 Accident probability changed: {} -> {}", this.accidentProbability, probability);
        this.accidentProbability = probability;
    }

    // ====== Main Simulation Loop ======

    @Scheduled(fixedDelayString = "${simulation.interval-ms:10000}")
    public void simulationCycle() {
        if (!running.get()) {
            return;
        }

        long cycle = cycleCount.incrementAndGet();
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🔄 SIMULATION CYCLE #{} started at {}", cycle, LocalDateTime.now());

        // Reset medication tracking at midnight
        resetMedicationTrackingIfNewDay();

        List<Sensor> activeSensors = sensorRepository.findByStatus(SensorStatus.ACTIVE);
        log.info("📊 Processing {} active sensors", activeSensors.size());

        if (activeSensors.isEmpty()) {
            log.warn("⚠️ No active sensors found. Skipping cycle.");
            return;
        }

        for (Sensor sensor : activeSensors) {
            try {
                processSensor(sensor, cycle);
            } catch (Exception e) {
                log.error("🚨 Error processing sensor id={}, code={}: {}",
                        sensor.getId(), sensor.getSensorCode(), e.getMessage(), e);
            }
        }

        log.info("✅ SIMULATION CYCLE #{} completed. Total readings in DB: {}",
                cycle, readingRepository.count());
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    // ====== Per-Sensor Processing ======

    private void processSensor(Sensor sensor, long cycle) {
        log.debug("🔍 Processing sensor: id={}, type={}, patientId={}",
                sensor.getId(), sensor.getSensorType(), sensor.getPatientId());

        SensorReading reading = switch (sensor.getSensorType()) {
            case HEART_RATE_MONITOR -> generateHeartRateReading(sensor, cycle);
            case ACCELEROMETER -> generateAccelerometerReading(sensor, cycle);
            case GPS_TRACKER -> generateGpsReading(sensor, cycle);
            case MEDICATION_BOX -> generateMedicationReading(sensor, cycle);
            case MOTION_DETECTOR -> generateMotionReading(sensor, cycle);
        };

            if (reading != null) {
                SensorReading saved = readingRepository.save(reading);
                log.debug("💾 Saved reading id={} for sensor id={}", saved.getId(), sensor.getId());

                // Add to context buffer
                addToContextBuffer(sensor.getPatientId(), saved);

                if (saved.getIsAnomalous()) {
                log.warn("⚠️ ANOMALOUS reading detected! sensor={}, type={}, patientId={}",
                        sensor.getSensorCode(), sensor.getSensorType(), sensor.getPatientId());
            }
        }
    }

    // ====== Heart Rate Simulation ======

    private SensorReading generateHeartRateReading(Sensor sensor, long cycle) {
        // Get previous heart rate or initialize baseline (elderly resting: 65-78 BPM)
        double previousBpm = lastHeartRates.getOrDefault(sensor.getId(), 70.0 + random.nextGaussian() * 3);

        // Normal variation: ±2 BPM from last reading (smooth, realistic transitions)
        double newBpm = previousBpm + (random.nextGaussian() * 2.0);

        // Variation of -6 to +3 based on patientId to make patients feel unique
        double patientSpecificBaseline = 72.0 + (sensor.getPatientId() % 10) - 6;
        newBpm = newBpm + (patientSpecificBaseline - newBpm) * 0.05; // gentle pull toward baseline
        newBpm = Math.max(50, Math.min(newBpm, 110));

        // Check for random accident: cardiac anomaly
        boolean isAnomalous = false;
        if (shouldTriggerAccident(AbnormalEventType.CARDIAC_ANOMALY)) {
            // Simulate cardiac event: sudden spike or drop
            if (random.nextBoolean()) {
                newBpm = 135 + random.nextInt(30); // Tachycardia: 135-165 BPM
                log.error("🚨 CARDIAC ANOMALY TRIGGERED! Heart rate spiked to {} BPM for patientId={}",
                        String.format("%.1f", newBpm), sensor.getPatientId());
            } else {
                newBpm = 35 + random.nextInt(10); // Bradycardia: 35-45 BPM
                log.error("🚨 CARDIAC ANOMALY TRIGGERED! Heart rate dropped to {} BPM for patientId={}",
                        String.format("%.1f", newBpm), sensor.getPatientId());
            }
            isAnomalous = true;
        }

        // Detect anomaly even without forced trigger
        if (!isAnomalous && (newBpm < 50 || newBpm > 130)) {
            isAnomalous = true;
            log.warn("⚠️ Heart rate outside safe range: {} BPM for patientId={}",
                    String.format("%.1f", newBpm), sensor.getPatientId());
        }

        lastHeartRates.put(sensor.getId(), newBpm);

        log.info("📊 [HEART_RATE] patientId={} | bpm={} | anomalous={}",
                sensor.getPatientId(), String.format("%.1f", newBpm), isAnomalous);

        SensorReading reading = SensorReading.builder()
                .sensorId(sensor.getId())
                .patientId(sensor.getPatientId())
                .timestamp(LocalDateTime.now())
                .heartRate(Math.round(newBpm * 10.0) / 10.0)
                .isAnomalous(isAnomalous)
                .build();

        if (isAnomalous) {
            createAndSendAbnormalEvent(sensor, reading, AbnormalEventType.CARDIAC_ANOMALY,
                    String.format("Heart rate anomaly detected: %.1f BPM (safe range: 50-130 BPM)", newBpm));
        }

        return reading;
    }

    // ====== Accelerometer Simulation ======

    private SensorReading generateAccelerometerReading(Sensor sensor, long cycle) {
        // Normal elderly walking/sitting: small accelerations
        double ax = random.nextGaussian() * 0.3;  // X: lateral sway
        double ay = random.nextGaussian() * 0.2;  // Y: forward/backward
        double az = 1.0 + random.nextGaussian() * 0.1;  // Z: gravity (~1G standing)

        boolean isAnomalous = false;

        // Check for random fall
        if (shouldTriggerAccident(AbnormalEventType.FALL)) {
            // Fall signature: sudden spike in total acceleration, then near-zero
            ax = 2.5 + random.nextDouble() * 3.0;  // Violent lateral: 2.5-5.5G
            ay = 1.5 + random.nextDouble() * 2.0;  // Forward impact: 1.5-3.5G
            az = 3.0 + random.nextDouble() * 2.0;  // Vertical impact: 3.0-5.0G
            isAnomalous = true;
            log.error("🚨 FALL DETECTED! Acceleration spike: ax={}, ay={}, az={} for patientId={}",
                    String.format("%.2f", ax), String.format("%.2f", ay),
                    String.format("%.2f", az), sensor.getPatientId());
        }

        // Detect anomaly: total G-force > 3.0 indicates possible fall
        double totalG = Math.sqrt(ax * ax + ay * ay + az * az);
        if (!isAnomalous && totalG > 3.0) {
            isAnomalous = true;
            log.warn("⚠️ High G-force detected: {}G for patientId={}",
                    String.format("%.2f", totalG), sensor.getPatientId());
        }

        log.info("📊 [ACCELEROMETER] patientId={} | ax={} ay={} az={} | totalG={} | anomalous={}",
                sensor.getPatientId(),
                String.format("%.2f", ax), String.format("%.2f", ay), String.format("%.2f", az),
                String.format("%.2f", totalG), isAnomalous);

        SensorReading reading = SensorReading.builder()
                .sensorId(sensor.getId())
                .patientId(sensor.getPatientId())
                .timestamp(LocalDateTime.now())
                .accelerationX(Math.round(ax * 100.0) / 100.0)
                .accelerationY(Math.round(ay * 100.0) / 100.0)
                .accelerationZ(Math.round(az * 100.0) / 100.0)
                .isAnomalous(isAnomalous)
                .build();

        if (isAnomalous) {
            createAndSendAbnormalEvent(sensor, reading, AbnormalEventType.FALL,
                    String.format("Fall detected! Total G-force: %.2fG (threshold: 3.0G). " +
                            "Acceleration: X=%.2f, Y=%.2f, Z=%.2f", totalG, ax, ay, az));
        }

        return reading;
    }

    // ====== GPS Simulation ======

    private SensorReading generateGpsReading(Sensor sensor, long cycle) {
        // Get previous position or initialize at sensor's baseline
        double baselineLat = sensor.getBaseLatitude() != null ? sensor.getBaseLatitude() : geofenceCenterLat;
        double baselineLon = sensor.getBaseLongitude() != null ? sensor.getBaseLongitude() : geofenceCenterLon;

        double[] lastPos = lastPositions.getOrDefault(sensor.getId(),
                new double[]{baselineLat, baselineLon});

        // Simulate slow elderly walking: ~0.00001 degree change per cycle (~1 meter)
        double newLat = lastPos[0] + (random.nextGaussian() * 0.00005);
        double newLon = lastPos[1] + (random.nextGaussian() * 0.00005);

        // Strong pull back toward center (elderly typically stay close to home)
        // Use 15% pull-back so natural drift can't sustain a geofence breach
        newLat = newLat + (baselineLat - newLat) * 0.15;
        newLon = newLon + (baselineLon - newLon) * 0.15;

        // Individual geofence radius from sensor or default to 100m
        double radius = sensor.getGeofenceRadius() != null ? sensor.getGeofenceRadius() : 100.0;
        boolean isAnomalous = false;

        // Check for geofence breach trigger
        if (shouldTriggerAccident(AbnormalEventType.GEOFENCE_BREACH)) {
            // Teleport outside geofence: 200-400m away
            double angle = random.nextDouble() * 2 * Math.PI;
            double distance = 0.002 + random.nextDouble() * 0.002; // ~200-400m in degrees
            newLat = baselineLat + Math.cos(angle) * distance;
            newLon = baselineLon + Math.sin(angle) * distance;
            isAnomalous = true;
            log.error("🚨 GEOFENCE BREACH! Patient {} moved to ({}, {}), outside safe zone!",
                    sensor.getPatientId(), String.format("%.6f", newLat), String.format("%.6f", newLon));
        }

        // Calculate distance from center
        double distanceFromCenter = calculateDistanceMeters(
                baselineLat, baselineLon, newLat, newLon);

        if (!isAnomalous && distanceFromCenter > radius) {
            isAnomalous = true;
            log.warn("⚠️ Patient {} is {}m from center (limit: {}m)",
                    sensor.getPatientId(), String.format("%.0f", distanceFromCenter), radius);
        }

        lastPositions.put(sensor.getId(), new double[]{newLat, newLon});

        log.info("📊 [GPS] patientId={} | lat={} lon={} | distance={}m | anomalous={}",
                sensor.getPatientId(),
                String.format("%.6f", newLat), String.format("%.6f", newLon),
                String.format("%.1f", distanceFromCenter), isAnomalous);

        SensorReading reading = SensorReading.builder()
                .sensorId(sensor.getId())
                .patientId(sensor.getPatientId())
                .timestamp(LocalDateTime.now())
                .latitude(newLat)
                .longitude(newLon)
                .isAnomalous(isAnomalous)
                .build();

        if (isAnomalous) {
            createAndSendAbnormalEvent(sensor, reading, AbnormalEventType.GEOFENCE_BREACH,
                    String.format("Patient left safe zone! Distance from center: %.0fm (limit: %.0fm). " +
                            "Location: (%.6f, %.6f)", distanceFromCenter, geofenceRadiusMeters, newLat, newLon));
        }

        return reading;
    }

    // ====== Medication Box Simulation ======

    private SensorReading generateMedicationReading(Sensor sensor, long cycle) {
        LocalTime now = LocalTime.now();
        int currentHour = now.getHour();

        // Medication schedule: 8:00, 12:00, 20:00
        int[] scheduleHours = {8, 12, 20};
        String todayKey = LocalDateTime.now().toLocalDate().toString() + "-" + sensor.getPatientId();

        Boolean boxOpened = null;
        boolean isAnomalous = false;

        for (int scheduleHour : scheduleHours) {
            String medKey = todayKey + "-" + scheduleHour;

            // Check if we're in the window for this medication (within 1 hour)
            if (currentHour == scheduleHour && !medicationsTakenToday.contains(medKey)) {
                // High miss rate for Alzheimer's patients without supervision
                if (shouldTriggerAccident(AbnormalEventType.MISSED_MEDICATION)) {
                    boxOpened = false;
                    isAnomalous = true;
                    log.error("🚨 MEDICATION MISSED! PatientId={} did not take {}:00 medication",
                            sensor.getPatientId(), scheduleHour);
                } else {
                    boxOpened = true;
                    medicationsTakenToday.add(medKey);
                    log.info("💊 Patient {} took medication at {}:00", sensor.getPatientId(), scheduleHour);
                }
            }
        }

        // Outside medication hours: box stays closed, no anomaly
        if (boxOpened == null) {
            boxOpened = false;
        }

        log.info("📊 [MEDICATION_BOX] patientId={} | opened={} | hour={} | anomalous={}",
                sensor.getPatientId(), boxOpened, currentHour, isAnomalous);

        SensorReading reading = SensorReading.builder()
                .sensorId(sensor.getId())
                .patientId(sensor.getPatientId())
                .timestamp(LocalDateTime.now())
                .medicationBoxOpened(boxOpened)
                .isAnomalous(isAnomalous)
                .build();

        if (isAnomalous) {
            createAndSendAbnormalEvent(sensor, reading, AbnormalEventType.MISSED_MEDICATION,
                    String.format("Patient %d missed scheduled medication at %d:00",
                            sensor.getPatientId(), currentHour));
        }

        return reading;
    }

    // ====== Motion Detector Simulation ======

    private SensorReading generateMotionReading(Sensor sensor, long cycle) {
        LocalTime now = LocalTime.now();
        int hour = now.getHour();

        // Simulate daily routine: active during day, sleeping at night
        double activityProbability;
        if (hour >= 7 && hour <= 9) activityProbability = 0.85;       // Morning routine
        else if (hour >= 10 && hour <= 12) activityProbability = 0.70; // Late morning
        else if (hour >= 12 && hour <= 14) activityProbability = 0.60; // Lunch, resting
        else if (hour >= 14 && hour <= 17) activityProbability = 0.50; // Afternoon nap common
        else if (hour >= 17 && hour <= 20) activityProbability = 0.65; // Evening activity
        else if (hour >= 20 && hour <= 22) activityProbability = 0.40; // Winding down
        else activityProbability = 0.10;                                // Night: sleeping

        // Shift probability by ±10% per patient for uniqueness
        double patientActivityShift = ((sensor.getPatientId() % 5) - 2) * 0.05;
        activityProbability = Math.max(0.05, Math.min(0.95, activityProbability + patientActivityShift));

        boolean motionDetected = random.nextDouble() < activityProbability;

        // Track inactivity streaks
        int inactivityCount = inactivityCounters.getOrDefault(sensor.getId(), 0);
        boolean isAnomalous = false;

        if (!motionDetected) {
            inactivityCount++;
            inactivityCounters.put(sensor.getId(), inactivityCount);

            // During daytime (7-22): 18+ consecutive no-motion readings (= ~3 minutes) is concerning
            if (hour >= 7 && hour <= 22 && inactivityCount >= 18) {
                isAnomalous = true;
                log.error("🚨 PROLONGED INACTIVITY! PatientId={} - no motion for {} consecutive readings (~{} minutes)",
                        sensor.getPatientId(), inactivityCount, inactivityCount * 10 / 60);
            }
        } else {
            if (inactivityCount > 0) {
                log.debug("🔍 Inactivity counter reset for patientId={} (was {} readings)",
                        sensor.getPatientId(), inactivityCount);
            }
            inactivityCount = 0;
            inactivityCounters.put(sensor.getId(), 0);
        }

        // Force inactivity accident
        if (shouldTriggerAccident(AbnormalEventType.PROLONGED_INACTIVITY) && !isAnomalous) {
            motionDetected = false;
            inactivityCounters.put(sensor.getId(), 20); // Fake a long streak
            isAnomalous = true;
            log.error("🚨 PROLONGED INACTIVITY TRIGGERED! PatientId={}", sensor.getPatientId());
        }

        lastMotionStates.put(sensor.getId(), motionDetected);

        log.info("📊 [MOTION] patientId={} | detected={} | inactivityStreak={} | hour={} | anomalous={}",
                sensor.getPatientId(), motionDetected, inactivityCount, hour, isAnomalous);

        SensorReading reading = SensorReading.builder()
                .sensorId(sensor.getId())
                .patientId(sensor.getPatientId())
                .timestamp(LocalDateTime.now())
                .motionDetected(motionDetected)
                .isAnomalous(isAnomalous)
                .build();

        if (isAnomalous) {
            createAndSendAbnormalEvent(sensor, reading, AbnormalEventType.PROLONGED_INACTIVITY,
                    String.format("No motion detected for %d consecutive readings (~%d minutes) during daytime for patient %d",
                            inactivityCount, inactivityCount * 10 / 60, sensor.getPatientId()));
        }

        return reading;
    }

    // ====== Trigger Accidents Manually ======

    /**
     * Manually trigger a random accident for a specific patient.
     * Used for testing and showcase demos.
     */
    public AbnormalEvent triggerAccidentForPatient(Long patientId) {
        log.info("🎯 MANUAL ACCIDENT TRIGGER requested for patientId={}", patientId);

        List<Sensor> sensors = sensorRepository.findByPatientIdAndStatus(patientId, SensorStatus.ACTIVE);
        if (sensors.isEmpty()) {
            log.error("🚨 No active sensors found for patientId={}", patientId);
            throw new RuntimeException("No active sensors for patient " + patientId);
        }

        // Pick a random sensor type for the accident
        Sensor randomSensor = sensors.get(random.nextInt(sensors.size()));
        AbnormalEventType eventType = mapSensorTypeToEventType(randomSensor.getSensorType());

        return createManualAccident(randomSensor, eventType);
    }

    /**
     * Manually trigger a specific type of accident for a patient.
     */
    public AbnormalEvent triggerSpecificAccident(Long patientId, AbnormalEventType eventType) {
        log.info("🎯 MANUAL SPECIFIC ACCIDENT TRIGGER: type={} for patientId={}", eventType, patientId);

        List<Sensor> sensors = sensorRepository.findByPatientIdAndStatus(patientId, SensorStatus.ACTIVE);
        if (sensors.isEmpty()) {
            log.error("🚨 No active sensors found for patientId={}", patientId);
            throw new RuntimeException("No active sensors for patient " + patientId);
        }

        // Find the appropriate sensor for this event type, or use first available
        Sensor targetSensor = sensors.stream()
                .filter(s -> mapSensorTypeToEventType(s.getSensorType()) == eventType)
                .findFirst()
                .orElse(sensors.get(0));

        return createManualAccident(targetSensor, eventType);
    }

    private AbnormalEvent createManualAccident(Sensor sensor, AbnormalEventType eventType) {
        log.info("🔧 Creating manual accident: sensor={}, type={}, patientId={}",
                sensor.getSensorCode(), eventType, sensor.getPatientId());

        // Generate an anomalous reading
        SensorReading reading = SensorReading.builder()
                .sensorId(sensor.getId())
                .patientId(sensor.getPatientId())
                .timestamp(LocalDateTime.now())
                .isAnomalous(true)
                .build();

        // Populate fields based on event type for realistic data
        switch (eventType) {
            case CARDIAC_ANOMALY -> {
                double bpm = random.nextBoolean() ? 145 + random.nextInt(20) : 38 + random.nextInt(8);
                reading.setHeartRate(bpm);
            }
            case FALL -> {
                reading.setAccelerationX(3.0 + random.nextDouble() * 2);
                reading.setAccelerationY(2.0 + random.nextDouble() * 1.5);
                reading.setAccelerationZ(4.0 + random.nextDouble() * 2);
            }
            case GEOFENCE_BREACH -> {
                double baselineLat = sensor.getBaseLatitude() != null ? sensor.getBaseLatitude() : geofenceCenterLat;
                double baselineLon = sensor.getBaseLongitude() != null ? sensor.getBaseLongitude() : geofenceCenterLon;
                double angle = random.nextDouble() * 2 * Math.PI;
                reading.setLatitude(baselineLat + Math.cos(angle) * 0.003);
                reading.setLongitude(baselineLon + Math.sin(angle) * 0.003);
            }
            case MISSED_MEDICATION -> reading.setMedicationBoxOpened(false);
            case PROLONGED_INACTIVITY -> reading.setMotionDetected(false);
            case SOS_TRIGGERED -> reading.setMotionDetected(true); // SOS button press
        }

        SensorReading savedReading = readingRepository.save(reading);
        log.info("💾 Saved anomalous reading id={} for manual accident", savedReading.getId());

        String description = String.format("[MANUAL TRIGGER] %s event for patient %d via sensor %s",
                eventType, sensor.getPatientId(), sensor.getSensorCode());

        AbnormalEvent event = AbnormalEvent.builder()
                .patientId(sensor.getPatientId())
                .sensorId(sensor.getId())
                .eventType(eventType)
                .detectedAt(LocalDateTime.now())
                .rawReadingId(savedReading.getId())
                .description(description)
                .alertSent(false)
                .build();

        AbnormalEvent savedEvent = eventRepository.save(event);
        log.info("💾 Saved abnormal event id={}", savedEvent.getId());

        // Send alert to Alert service with context
        alertService.sendAlertForEvent(savedEvent, getRecentContext(sensor.getPatientId()));

        return savedEvent;
    }

    // ====== Helper Methods ======

    /**
     * Determines if an accident should occur based on realistic Alzheimer's patient data.
     * Evaluated roughly every 10 seconds per sensor.
     */
    private boolean shouldTriggerAccident(AbnormalEventType eventType) {
        double specificProbability = switch (eventType) {
            case CARDIAC_ANOMALY -> accidentProbability * 0.05;  // Very rare (comorbidities exist but acute events are not 10s frequent)
            case FALL -> accidentProbability * 0.2;              // Rare on a 10s basis, but higher risk for elderly
            case GEOFENCE_BREACH -> accidentProbability * 1.5;   // Wandering is very common in Alzheimer's patients
            case PROLONGED_INACTIVITY -> accidentProbability * 2.0; // Apathy and daytime sleeping are highly prevalent
            case MISSED_MEDICATION -> 0.15; // 15% probability per scheduled med check (evaluated hourly, not per 10s)
            default -> accidentProbability;
        };
        return random.nextDouble() < specificProbability;
    }

    private void createAndSendAbnormalEvent(Sensor sensor, SensorReading reading,
                                            AbnormalEventType eventType, String description) {
        // ====== COOLDOWN CHECK: prevent spamming the same alert type ======
        String cooldownKey = sensor.getPatientId() + ":" + eventType.name();
        LocalDateTime lastAlertTime = alertCooldownMap.get(cooldownKey);
        LocalDateTime now = LocalDateTime.now();

        if (lastAlertTime != null && Duration.between(lastAlertTime, now).compareTo(ALERT_COOLDOWN) < 0) {
            long minutesRemaining = ALERT_COOLDOWN.minus(Duration.between(lastAlertTime, now)).toMinutes();
            log.info("⏳ COOLDOWN ACTIVE for [{}] patientId={} — suppressing alert. Cooldown expires in ~{} min",
                    eventType, sensor.getPatientId(), minutesRemaining);
            return; // SKIP: do NOT create event or send alert
        }

        log.info("🔔 Creating abnormal event: type={}, sensor={}, patientId={}",
                eventType, sensor.getSensorCode(), sensor.getPatientId());

        // Save the reading first to get an ID
        SensorReading saved = readingRepository.save(reading);

        // Get context from buffer
        String context = getRecentContext(sensor.getPatientId());

        AbnormalEvent event = AbnormalEvent.builder()
                .patientId(sensor.getPatientId())
                .sensorId(sensor.getId())
                .eventType(eventType)
                .detectedAt(now)
                .rawReadingId(saved.getId())
                .description(description)
                .alertSent(false)
                .build();

        AbnormalEvent savedEvent = eventRepository.save(event);
        log.info("💾 Abnormal event saved with id={}", savedEvent.getId());

        // Record cooldown timestamp
        alertCooldownMap.put(cooldownKey, now);
        log.info("🕐 Cooldown set for [{}] patientId={} — next alert of this type allowed after {}",
                eventType, sensor.getPatientId(), now.plus(ALERT_COOLDOWN));

        // Send alert to Alert service with context
        alertService.sendAlertForEvent(savedEvent, context);
    }

    private void addToContextBuffer(Long patientId, SensorReading reading) {
        contextBuffer.computeIfAbsent(patientId, k -> new EvictingQueue<>(10)).add(reading);
    }

    private String getRecentContext(Long patientId) {
        EvictingQueue<SensorReading> buffer = contextBuffer.get(patientId);
        if (buffer == null || buffer.isEmpty()) return "No recent history available.";

        StringBuilder sb = new StringBuilder();
        List<SensorReading> readings = buffer.toList();
        for (int i = Math.max(0, readings.size() - 5); i < readings.size(); i++) {
            SensorReading r = readings.get(i);
            sb.append(String.format("[%s] ", r.getTimestamp()));
            if (r.getHeartRate() != null) sb.append("HR:").append(r.getHeartRate()).append(" ");
            if (r.getAccelerationX() != null) sb.append("Accel:").append(r.getAccelerationX()).append(",").append(r.getAccelerationY()).append(",").append(r.getAccelerationZ()).append(" ");
            if (r.getLatitude() != null) sb.append("GPS:").append(r.getLatitude()).append(",").append(r.getLongitude()).append(" ");
            if (r.getMotionDetected() != null) sb.append("Motion:").append(r.getMotionDetected()).append(" ");
            if (r.getMedicationBoxOpened() != null) sb.append("MedBox:").append(r.getMedicationBoxOpened()).append(" ");
            sb.append("| ");
        }
        return sb.toString();
    }

    // Small helper class for evicting queue
    private static class EvictingQueue<T> {
        private final int maxSize;
        private final LinkedList<T> list = new LinkedList<>();

        public EvictingQueue(int maxSize) { this.maxSize = maxSize; }

        public synchronized void add(T item) {
            if (list.size() >= maxSize) list.removeFirst();
            list.addLast(item);
        }

        public synchronized List<T> toList() { return new ArrayList<>(list); }
        public synchronized boolean isEmpty() { return list.isEmpty(); }
    }

    private AbnormalEventType mapSensorTypeToEventType(SensorType sensorType) {
        return switch (sensorType) {
            case HEART_RATE_MONITOR -> AbnormalEventType.CARDIAC_ANOMALY;
            case ACCELEROMETER -> AbnormalEventType.FALL;
            case GPS_TRACKER -> AbnormalEventType.GEOFENCE_BREACH;
            case MEDICATION_BOX -> AbnormalEventType.MISSED_MEDICATION;
            case MOTION_DETECTOR -> AbnormalEventType.PROLONGED_INACTIVITY;
        };
    }

    /**
     * Calculate distance between two GPS coordinates in meters (Haversine formula).
     */
    private double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private void resetMedicationTrackingIfNewDay() {
        LocalDateTime now = LocalDateTime.now();
        if (now.toLocalDate().isAfter(lastMedicationReset.toLocalDate())) {
            log.info("📅 New day detected. Resetting medication tracking.");
            medicationsTakenToday.clear();
            lastMedicationReset = now;
        }
    }
}
