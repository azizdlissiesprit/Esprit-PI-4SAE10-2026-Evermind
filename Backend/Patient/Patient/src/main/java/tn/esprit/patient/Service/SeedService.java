package tn.esprit.patient.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import tn.esprit.patient.Entity.MedicalReport;
import tn.esprit.patient.Entity.Patient;
import tn.esprit.patient.Entity.SeedLog;
import tn.esprit.patient.Repository.MedicalReportRepository;
import tn.esprit.patient.Repository.PatientRepository;
import tn.esprit.patient.Repository.SeedLogRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class SeedService {

    private final PatientRepository patientRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final SeedLogRepository seedLogRepository;

    private static final String ENTITY_PATIENT = "Patient";
    private static final String ENTITY_REPORT = "MedicalReport";

    // ─── Realistic Clinical Data Pools ───────────────────────────

    private static final String[] FIRST_NAMES = {
        "Habib", "Monia", "Salem", "Leila", "Ahmed", "Zohra", "Ridha", "Maya",
        "Brahim", "Sonia", "Karim", "Fatma", "Yassine", "Ines", "Hedi", "Amel",
        "Fathi", "Houda", "Adel", "Zina"
    };
    private static final String[] LAST_NAMES = {
        "Ben Salah", "Trabelsi", "Gharbi", "Mansour", "Hammami", "Dridi", "Ayari",
        "Khelil", "Jlassi", "Nasri", "Masmoudi", "Mejri", "Ben Ammar", "Lahlou",
        "Souissi", "Rekik", "Feki", "Abidi", "Slimane", "Zouari"
    };
    private static final String[] BLOOD_TYPES = {"A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"};
    private static final String[] GENDERS = {"M", "F"};

    private static final String[] DIAGNOSES = {
        "Alzheimer's Disease — Early-onset, Stage I (Mild). Episodic memory deficits noted. Independent in ADLs.",
        "Alzheimer's Disease — Stage II (Moderate). Progressive aphasia and visuospatial impairment. Requires supervision for complex tasks.",
        "Alzheimer's Disease — Stage III (Moderate-Severe). Significant disorientation, agitation episodes. Dependent for dressing/hygiene.",
        "Alzheimer's Disease — Stage IV (Severe). Profound cognitive decline, loss of speech. Full-time care required.",
        "Mixed Dementia (Alzheimer's + Vascular). MRI confirms white matter lesions. Fluctuating cognition.",
        "Alzheimer's Disease — Stage II (Moderate) with comorbid Hypertension. Controlled on Amlodipine 5mg.",
        "Alzheimer's Disease — Stage I (Mild). Preserved motor function. Mild anomic aphasia.",
        "Alzheimer's Disease — Stage II (Moderate) with Type 2 Diabetes. HbA1c 7.2%. Requires meal supervision.",
        "Alzheimer's Disease — Stage III (Moderate-Severe) with Osteoporosis. Fall risk elevated.",
        "Lewy Body Dementia with Parkinsonian features. Visual hallucinations reported. REM sleep behavior disorder."
    };

    private static final String[] ALLERGIES_POOL = {
        "Penicillin", "Sulfonamides", "NSAIDs (Ibuprofen)", "Latex", "Codeine",
        "Aspirin", "No known allergies", "Contrast dye", "Shellfish", "Egg protein"
    };

    private static final String[] MEDICATIONS_POOL = {
        "Donepezil 10mg QD, Memantine 20mg QD",
        "Rivastigmine 6mg BID, Amlodipine 5mg QD",
        "Galantamine 24mg QD (ER), Metformin 500mg BID",
        "Donepezil 5mg QD, Sertraline 50mg QD, Omeprazole 20mg QD",
        "Memantine 10mg BID, Atorvastatin 20mg QD",
        "Rivastigmine patch 9.5mg/24h, Levothyroxine 50mcg QD",
        "Donepezil 10mg QD, Quetiapine 25mg QHS (PRN agitation)",
        "Galantamine 16mg QD, Lisinopril 10mg QD, Aspirin 81mg QD",
        "Memantine 20mg QD, Trazodone 50mg QHS, Calcium-VitD supplement",
        "Donepezil 10mg QD, Metoprolol 25mg BID"
    };

    private static final String[] CONTACT_NAMES = {
        "Amira Ben Salah", "Mehdi Trabelsi", "Nour Gharbi", "Sami Mansour",
        "Rania Hammami", "Youssef Dridi", "Lina Ayari", "Omar Khelil",
        "Dorra Jlassi", "Khaled Nasri", "Samia Masmoudi", "Ali Mejri",
        "Mariem Ben Ammar", "Walid Lahlou", "Hajer Souissi", "Nizar Rekik",
        "Rim Feki", "Tarek Abidi", "Salma Slimane", "Rami Zouari"
    };
    private static final String[] CONTACT_RELATIONS = {
        "Son", "Daughter", "Spouse", "Grandson", "Granddaughter",
        "Nephew", "Niece", "Son-in-law", "Daughter-in-law", "Sibling"
    };

    private static final String[] DISEASE_STAGES = {
        "Mild", "Mild", "Moderate", "Moderate", "Moderate",
        "Moderate", "Moderate-Severe", "Moderate-Severe", "Severe", "Severe"
    };

    private static final String[] COGNITIVE_OBSERVATIONS = {
        "MMSE 22/30. Short-term memory retrieval impaired. Clock drawing test shows mild visuospatial deficit.",
        "MMSE 18/30. Significant word-finding difficulties. Unable to perform serial 7s. Orientation to time impaired.",
        "MMSE 14/30. Cannot recall any of 3 objects after 5 minutes. Disoriented to place and time.",
        "MoCA 20/30. Mild executive dysfunction on Trail Making B. Delayed recall 2/5.",
        "MMSE 25/30. Subtle memory deficits only. Higher-order reasoning intact.",
        "MMSE 16/30. Progressive decline from 20 three months ago. Language deterioration noted."
    };

    private static final String[] FUNCTIONAL_STATUSES = {
        "Independent in basic ADLs. Requires prompting for medication management and financial decisions.",
        "Requires assistance with bathing and dressing. Independent mobility with walker.",
        "Dependent for all basic ADLs. Continent with scheduled toileting program.",
        "Semi-independent. Can feed self but requires meal preparation. Ambulatory but unsteady.",
        "Requires 24-hour supervision. Mobile but at high fall risk. Uses wheelchair for longer distances.",
        "Independent in feeding and grooming. Needs supervision for bathing. Occasional urinary incontinence."
    };

    private static final String[] BEHAVIORAL_OBSERVATIONS_POOL = {
        "Mild sundowning with increased anxiety in late afternoon. Responds well to redirection and calming music.",
        "Episodes of verbal agitation 2-3 times weekly. Triggered by environmental overstimulation.",
        "Wandering behavior noted, especially at night. GPS monitoring active. Door alarms in place.",
        "Generally calm and cooperative. Occasional tearfulness related to awareness of cognitive decline.",
        "Repetitive questioning (3-4 times/hour). No aggression. Social engagement declining.",
        "Hallucinations reported (seeing deceased spouse). Not distressing to patient. Monitored."
    };

    private static final String[] TREATMENT_PLANS = {
        "Continue current medication regimen. Schedule follow-up cognitive assessment in 4 weeks. Refer to occupational therapy for ADL strategies.",
        "Increase Memantine to 20mg QD. Add structured daily routine. Family caregiver education session scheduled.",
        "Initiate Rivastigmine patch. Monitor for GI side effects. Fall prevention protocol activated.",
        "Medication stable. Focus on non-pharmacological interventions: music therapy, reminiscence therapy 2x/week.",
        "Consider adding low-dose Quetiapine for nocturnal agitation. Sleep hygiene optimization. Caregiver support group referral.",
        "Titrate Donepezil from 5mg to 10mg over 4 weeks. Neuropsychological re-evaluation in 3 months."
    };

    private final Random random = new Random(42); // Fixed seed for reproducibility

    // ─── Public API ─────────────────────────────────────────────

    public Map<String, Object> executeSeed() {
        if (seedLogRepository.countByEntityType(ENTITY_PATIENT) > 0) {
            log.info("🌱 Patient data already seeded — returning existing count");
            return Map.of(
                "status", "ALREADY_SEEDED",
                "message", "Data has already been seeded. Clear first to re-seed.",
                "patientCount", seedLogRepository.countByEntityType(ENTITY_PATIENT),
                "reportCount", seedLogRepository.countByEntityType(ENTITY_REPORT)
            );
        }

        log.info("🌱 ══════════════════════════════════════════");
        log.info("🌱  MEDICAL-GRADE PATIENT SEEDING STARTED");
        log.info("🌱 ══════════════════════════════════════════");

        int createdPatients = 0;
        int reusedPatients = 0;
        int failedPatients = 0;
        List<String> warnings = new ArrayList<>();

        List<Patient> patients = new ArrayList<>();

        for (int i = 0; i < 20; i++) {
            String deviceId = "SIM-WATCH-" + String.format("%03d", i + 1);
            try {
                // Check if patient already exists by wearable device ID
                Optional<Patient> existing = patientRepository.findByWearableDeviceId(deviceId);
                if (existing.isPresent()) {
                    // Reuse existing patient — register in seed_logs for tracking
                    Patient reused = existing.get();
                    patients.add(reused);
                    seedLogRepository.save(SeedLog.builder()
                        .entityType(ENTITY_PATIENT)
                        .entityId(reused.getId())
                        .build());
                    reusedPatients++;
                    log.info("🔄 Patient {}: {} {} already exists (ID: {}) — reusing",
                        i + 1, reused.getFirstName(), reused.getLastName(), reused.getId());
                } else {
                    // Create new patient
                    Patient p = buildPatient(i);
                    Patient saved = patientRepository.save(p);
                    patients.add(saved);
                    seedLogRepository.save(SeedLog.builder()
                        .entityType(ENTITY_PATIENT)
                        .entityId(saved.getId())
                        .build());
                    createdPatients++;
                    log.info("🌱 Patient {}: {} {} created (ID: {})",
                        i + 1, saved.getFirstName(), saved.getLastName(), saved.getId());
                }
            } catch (Exception e) {
                failedPatients++;
                String msg = String.format("Patient %d (%s %s) failed: %s",
                    i + 1, FIRST_NAMES[i], LAST_NAMES[i], e.getMessage());
                log.error("❌ {}", msg);
                warnings.add(msg);
            }
        }

        // Seed medical reports for all patients (created + reused)
        int skippedReports = 0;
        List<MedicalReport> reports = new ArrayList<>();
        for (int idx = 0; idx < patients.size(); idx++) {
            Patient patient = patients.get(idx);
            try {
                List<MedicalReport> patientReports = seedMedicalReportsForPatient(patient, idx);
                reports.addAll(patientReports);
            } catch (Exception e) {
                skippedReports++;
                String msg = String.format("Reports for patient %s %s failed: %s",
                    patient.getFirstName(), patient.getLastName(), e.getMessage());
                log.error("❌ {}", msg);
                warnings.add(msg);
            }
        }

        // Build clear summary message
        List<String> messageParts = new ArrayList<>();
        if (createdPatients > 0) messageParts.add(createdPatients + " patients created");
        if (reusedPatients > 0) messageParts.add(reusedPatients + " existing patients reused");
        if (failedPatients > 0) messageParts.add(failedPatients + " patients failed");
        if (skippedReports > 0) messageParts.add(skippedReports + " report batches failed");
        messageParts.add(reports.size() + " medical reports generated");

        String statusValue = failedPatients == 20 ? "FAILED" : "SUCCESS";

        log.info("🌱 ══════════════════════════════════════════");
        log.info("🌱  SEEDING COMPLETE: {} created, {} reused, {} failed, {} reports",
            createdPatients, reusedPatients, failedPatients, reports.size());
        log.info("🌱 ══════════════════════════════════════════");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", statusValue);
        result.put("patientCount", createdPatients + reusedPatients);
        result.put("newPatients", createdPatients);
        result.put("reusedPatients", reusedPatients);
        result.put("reportCount", reports.size());
        result.put("message", String.join(". ", messageParts) + ".");
        if (!warnings.isEmpty()) {
            result.put("warnings", warnings);
        }
        return result;
    }


    public Map<String, Object> clearSeed() {
        List<SeedLog> reportLogs = seedLogRepository.findByEntityType(ENTITY_REPORT);
        List<SeedLog> patientLogs = seedLogRepository.findByEntityType(ENTITY_PATIENT);

        int reportsDeleted = 0;
        int reportErrors = 0;
        for (SeedLog sl : reportLogs) {
            try {
                if (medicalReportRepository.existsById(sl.getEntityId())) {
                    medicalReportRepository.deleteById(sl.getEntityId());
                    reportsDeleted++;
                }
            } catch (Exception e) {
                reportErrors++;
                log.warn("⚠️ Failed to delete report ID {}: {}", sl.getEntityId(), e.getMessage());
            }
        }

        int patientsDeleted = 0;
        int patientErrors = 0;
        for (SeedLog sl : patientLogs) {
            try {
                if (patientRepository.existsById(sl.getEntityId())) {
                    patientRepository.deleteById(sl.getEntityId());
                    patientsDeleted++;
                }
            } catch (Exception e) {
                patientErrors++;
                log.warn("⚠️ Failed to delete patient ID {}: {}", sl.getEntityId(), e.getMessage());
            }
        }

        seedLogRepository.deleteByEntityType(ENTITY_REPORT);
        seedLogRepository.deleteByEntityType(ENTITY_PATIENT);

        log.info("🧹 Cleared {} patients and {} medical reports (errors: {} patients, {} reports)",
            patientsDeleted, reportsDeleted, patientErrors, reportErrors);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "CLEARED");
        result.put("patientsDeleted", patientsDeleted);
        result.put("reportsDeleted", reportsDeleted);
        if (patientErrors + reportErrors > 0) {
            result.put("errors", patientErrors + reportErrors);
            result.put("message", String.format("Cleared with %d errors. Some records may have been already deleted.",
                patientErrors + reportErrors));
        }
        return result;
    }

    public Map<String, Object> getStatus() {
        long seededPatients = seedLogRepository.countByEntityType(ENTITY_PATIENT);
        long seededReports = seedLogRepository.countByEntityType(ENTITY_REPORT);
        long totalPatients = patientRepository.count();
        long totalReports = medicalReportRepository.count();

        Optional<SeedLog> lastSeed = seedLogRepository.findByEntityType(ENTITY_PATIENT)
                .stream().max(Comparator.comparing(SeedLog::getSeededAt));

        Map<String, Object> status = new HashMap<>();
        status.put("seeded", seededPatients > 0);
        status.put("seededPatientCount", seededPatients);
        status.put("seededReportCount", seededReports);
        status.put("totalPatientCount", totalPatients);
        status.put("totalReportCount", totalReports);
        status.put("lastSeededAt", lastSeed.map(SeedLog::getSeededAt).orElse(null));
        return status;
    }

    // ─── Private Seed Methods ────────────────────────────────────

    private Patient buildPatient(int i) {
        double baseLat = 36.8065 + ((i / 5) * 0.005);
        double baseLon = 10.1815 + ((i % 5) * 0.005);

        return Patient.builder()
            .firstName(FIRST_NAMES[i])
            .lastName(LAST_NAMES[i])
            .dateOfBirth(LocalDate.of(1935 + (i % 16), (i % 12) + 1, (i * 3) % 28 + 1))
            .gender(GENDERS[i % 2])
            .roomNumber(String.valueOf(101 + i))
            .floorNumber(String.valueOf((i / 5) + 1))
            .bedNumber(i % 2 == 0 ? "A" : "B")
            .bloodType(BLOOD_TYPES[i % BLOOD_TYPES.length])
            .medicalDiagnosis(DIAGNOSES[i % DIAGNOSES.length])
            .allergies(ALLERGIES_POOL[i % ALLERGIES_POOL.length])
            .chronicMedications(MEDICATIONS_POOL[i % MEDICATIONS_POOL.length])
            .emergencyContactName(CONTACT_NAMES[i])
            .emergencyContactPhone("+216 " + (20 + random.nextInt(80)) + " " +
                (100 + random.nextInt(900)) + " " + (100 + random.nextInt(900)))
            .emergencyContactRelation(CONTACT_RELATIONS[i % CONTACT_RELATIONS.length])
            .wearableDeviceId("SIM-WATCH-" + String.format("%03d", i + 1))
            .baseLatitude(baseLat)
            .baseLongitude(baseLon)
            .geofenceRadius(80 + (i % 3) * 20)
            .build();
    }

    private List<MedicalReport> seedMedicalReportsForPatient(Patient patient, int patientIndex) {
        List<MedicalReport> reports = new ArrayList<>();
        String[] doctorNames = {"Dr. Mehdi Bouaziz", "Dr. Salma Karray", "Dr. Nabil Chaabane", "Dr. Amina Belhadj"};
        Long[] doctorIds = {1L, 2L, 3L, 4L};

        int reportCount = 3 + random.nextInt(3); // 3-5 reports per patient

        for (int r = 0; r < reportCount; r++) {
            try {
                int monthsAgo = (reportCount - r);
                LocalDateTime reportDate = LocalDateTime.now().minusMonths(monthsAgo).minusDays(random.nextInt(15));

                int doctorIdx = (patientIndex + r) % doctorNames.length;

                MedicalReport report = MedicalReport.builder()
                    .patientId(patient.getId())
                    .doctorId(doctorIds[doctorIdx])
                    .doctorName(doctorNames[doctorIdx])
                    .reportDate(reportDate)
                    .primaryDiagnosis(DIAGNOSES[patientIndex % DIAGNOSES.length])
                    .diseaseStage(DISEASE_STAGES[(patientIndex + r) % DISEASE_STAGES.length])
                    .cognitiveAssessment(COGNITIVE_OBSERVATIONS[(patientIndex + r) % COGNITIVE_OBSERVATIONS.length])
                    .functionalStatus(FUNCTIONAL_STATUSES[(patientIndex + r) % FUNCTIONAL_STATUSES.length])
                    .behavioralObservations(BEHAVIORAL_OBSERVATIONS_POOL[(patientIndex + r) % BEHAVIORAL_OBSERVATIONS_POOL.length])
                    .medicationReview(MEDICATIONS_POOL[(patientIndex + r) % MEDICATIONS_POOL.length])
                    .treatmentPlan(TREATMENT_PLANS[(patientIndex + r) % TREATMENT_PLANS.length])
                    .additionalNotes("Follow-up assessment " + (r + 1) + " of " + reportCount + 
                        ". Patient " + (r == 0 ? "baseline evaluation" : (r < reportCount - 1 ? "showing expected progression" : "latest evaluation")) + ".")
                    .build();

                MedicalReport saved = medicalReportRepository.save(report);
                reports.add(saved);

                seedLogRepository.save(SeedLog.builder()
                    .entityType(ENTITY_REPORT)
                    .entityId(saved.getId())
                    .build());
            } catch (DataIntegrityViolationException e) {
                log.warn("⚠️ Report {} for patient {} skipped — constraint violation: {}",
                    r + 1, patient.getFirstName(), extractRootCause(e));
            } catch (Exception e) {
                log.error("⚠️ Report {} for patient {} skipped — error: {}",
                    r + 1, patient.getFirstName(), e.getMessage());
            }
        }
        log.info("🌱 Created {} medical reports for patient {}", reports.size(), patient.getFirstName());
        return reports;
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
