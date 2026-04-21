package tn.esprit.sensorsimulator.Config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.esprit.sensorsimulator.Entity.Sensor;
import tn.esprit.sensorsimulator.Entity.SensorStatus;
import tn.esprit.sensorsimulator.Entity.SensorType;
import tn.esprit.sensorsimulator.Repository.SensorRepository;
import java.time.LocalDateTime;

/**
 * Seeds demo sensor data on startup if the database is empty.
 * Creates 5 sensors (one per type) for patient ID 1.
 */
@Component
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final SensorRepository sensorRepository;

    public DataSeeder(SensorRepository sensorRepository) {
        this.sensorRepository = sensorRepository;
    }

    @Override
    public void run(String... args) {
        if (sensorRepository.count() >= 100) {
            log.info("📊 Database already has {} sensors. Skipping seeding.", sensorRepository.count());
            return;
        }

        log.info("🌱 ==========================================");
        log.info("🌱  SEEDING DEMO SENSOR DATA (20 PATIENTS)");
        log.info("🌱 ==========================================");

        for (long i = 1; i <= 20; i++) {
            seedSensorsForPatient(i);
        }

        log.info("🌱 ==========================================");
        log.info("🌱  SEEDING COMPLETE: {} total sensors in DB", sensorRepository.count());
        log.info("🌱 ==========================================");
    }

    private void seedSensorsForPatient(long patientId) {
        log.info("🌱 Seeding sensors for patientId={}...", patientId);

        // Matching PatientService geofences (i = patientId - 1) with 500m spacing
        double baseLat = 36.8065 + (((patientId - 1) / 5) * 0.005);
        double baseLon = 10.1815 + (((patientId - 1) % 5) * 0.005);
        int radius = 80 + (int)((patientId - 1) % 3) * 20;

        String pSuffix = String.format("%03d", patientId);

        saveIfMissing(Sensor.builder()
                .sensorCode("HR-" + pSuffix)
                .sensorType(SensorType.HEART_RATE_MONITOR)
                .patientId(patientId)
                .status(SensorStatus.ACTIVE)
                .baseLatitude(baseLat)
                .baseLongitude(baseLon)
                .geofenceRadius(radius)
                .installedAt(LocalDateTime.now())
                .build());

        saveIfMissing(Sensor.builder()
                .sensorCode("ACC-" + pSuffix)
                .sensorType(SensorType.ACCELEROMETER)
                .patientId(patientId)
                .status(SensorStatus.ACTIVE)
                .baseLatitude(baseLat)
                .baseLongitude(baseLon)
                .geofenceRadius(radius)
                .installedAt(LocalDateTime.now())
                .build());

        saveIfMissing(Sensor.builder()
                .sensorCode("GPS-" + pSuffix)
                .sensorType(SensorType.GPS_TRACKER)
                .patientId(patientId)
                .status(SensorStatus.ACTIVE)
                .baseLatitude(baseLat)
                .baseLongitude(baseLon)
                .geofenceRadius(radius)
                .installedAt(LocalDateTime.now())
                .build());

        saveIfMissing(Sensor.builder()
                .sensorCode("MED-" + pSuffix)
                .sensorType(SensorType.MEDICATION_BOX)
                .patientId(patientId)
                .status(SensorStatus.ACTIVE)
                .baseLatitude(baseLat)
                .baseLongitude(baseLon)
                .geofenceRadius(radius)
                .installedAt(LocalDateTime.now())
                .build());

        saveIfMissing(Sensor.builder()
                .sensorCode("MOT-" + pSuffix)
                .sensorType(SensorType.MOTION_DETECTOR)
                .patientId(patientId)
                .status(SensorStatus.ACTIVE)
                .baseLatitude(baseLat)
                .baseLongitude(baseLon)
                .geofenceRadius(radius)
                .installedAt(LocalDateTime.now())
                .build());
    }

    private void saveIfMissing(Sensor sensor) {
        if (!sensorRepository.existsBySensorCode(sensor.getSensorCode())) {
            sensorRepository.save(sensor);
            log.info("➕ Seeded sensor: {}", sensor.getSensorCode());
        }
    }
}
