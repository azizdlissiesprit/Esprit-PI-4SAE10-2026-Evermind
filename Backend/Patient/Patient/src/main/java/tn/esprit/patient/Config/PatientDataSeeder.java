package tn.esprit.patient.Config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.esprit.patient.Entity.Patient;
import tn.esprit.patient.Repository.PatientRepository;

import java.time.LocalDate;

/**
 * Seeds a realistic demo patient on startup if the database is empty.
 * This ensures the SensorSimulator service has a patient (id=1) to simulate for.
 */
@Component
@Slf4j
public class PatientDataSeeder implements CommandLineRunner {

    private final PatientRepository patientRepository;

    public PatientDataSeeder(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public void run(String... args) {
        if (patientRepository.count() >= 20) {
            log.info("📊 Database already has {} patients. Skipping seeding.", patientRepository.count());
            return;
        }

        log.info("🌱 ==========================================");
        log.info("🌱  SEEDING DEMO PATIENT DATA (20 PATIENTS)");
        log.info("🌱 ==========================================");

        String[] firstNames = {"Habib", "Monia", "Salem", "Leila", "Ahmed", "Zohra", "Ridha", "Maya", "Brahim", "Sonia", 
                               "Karim", "Fatma", "Yassine", "Ines", "Hedi", "Amel", "Fathi", "Houda", "Adel", "Zina"};
        String[] lastNames = {"Ben Salah", "Trabelsi", "Gharbi", "Mansour", "Hammami", "Dridi", "Ayari", "Khelil", "Jlassi", "Nasri",
                              "Masmoudi", "Mejri", "Ben Ammar", "Lahlou", "Souissi", "Rekik", "Feki", "Abidi", "Slimane", "Zouari"};
        
        for (int i = 0; i < 20; i++) {
            // Spacing increased to ~500m (0.005 degrees) to avoid geofence overlap
            double baseLat = 36.8065 + ((i / 5) * 0.005);
            double baseLon = 10.1815 + ((i % 5) * 0.005);

            Patient p = Patient.builder()
                    .firstName(firstNames[i])
                    .lastName(lastNames[i])
                    .dateOfBirth(LocalDate.of(1940 + (i % 8), (i % 12) + 1, (i * 3) % 28 + 1))
                    .gender(i % 2 == 0 ? "M" : "F")
                    .roomNumber(String.valueOf(101 + i))
                    .floorNumber(String.valueOf((i / 5) + 1))
                    .bedNumber(i % 2 == 0 ? "A" : "B")
                    .bloodType(i % 3 == 0 ? "A+" : (i % 3 == 1 ? "B-" : "O+"))
                    .medicalDiagnosis("Diagnosis for " + firstNames[i])
                    .baseLatitude(baseLat)
                    .baseLongitude(baseLon)
                    .geofenceRadius(80 + (i % 3) * 20)
                    .wearableDeviceId("SIM-WATCH-" + String.format("%03d", i + 1))
                    .build();
            
            patientRepository.save(p);
            log.info("🌱 Created patient {}: {} {} (ID: {})", i + 1, p.getFirstName(), p.getLastName(), p.getId());
        }

        log.info("🌱 ==========================================");
        log.info("🌱  PATIENT SEEDING COMPLETE: {} total patients", patientRepository.count());
        log.info("🌱 ==========================================");
    }
}
