package tn.esprit.alert.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.alert.Entity.Alert;
import tn.esprit.alert.Entity.Severite;
import tn.esprit.alert.Entity.StatutAlerte;
import tn.esprit.alert.Repository.AlertRepository;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class AlertServiceImpl implements IAlertService {

    private final GoogleGeminiService googleGeminiService;
    private final PatientClient patientClient;
    private final AlertRepository alertRepository;
    
    public Alert addAlert(Alert a) {
        log.info("🚨 New Alert Received: {}", a.getTypeAlerte());

        a.setDateCreation(LocalDateTime.now());
        a.setStatut(StatutAlerte.NOUVELLE);

        // Fetch Real Patient Context via Feign
        String patientContext = "Unknown Patient Context";
        try {
            log.info("📡 Fetching patient {} context from PATIENT-SERVICE...", a.getPatientId());
            var patientData = patientClient.getPatientById(a.getPatientId());
            if (patientData != null) {
                String dob = (String) patientData.get("dateOfBirth");
                String diagnosis = (String) patientData.get("medicalDiagnosis");
                String meds = (String) patientData.get("chronicMedications");
                
                patientContext = String.format("DOB: %s. Known Diagnosis: %s. Chronic Meds: %s", 
                    dob != null ? dob : "Unknown",
                    diagnosis != null ? diagnosis : "None recorded",
                    meds != null ? meds : "None recorded");
            }
        } catch (Exception e) {
            log.warn("⚠️ Failed to fetch patient context for AI. Using default.", e);
            patientContext = "Could not retrieve medical history.";
        }

        // Call Google AI with enriched context if provided
        String analysis = googleGeminiService.analyzeAlert(
                a.getTypeAlerte().toString(),
                a.getMessage() + (a.getContext() != null ? "\nEnvironmental Context: " + a.getContext() : ""),
                patientContext
        );

        a.setAiAnalysis(analysis);

        // Advanced AI Scoring Logic based on Clinical Correlation
        int score = 45; // Default moderate risk
        Severite severity = Severite.MOYENNE;
        
        String lowerAnalysis = analysis.toLowerCase();
        String lowerContext = patientContext.toLowerCase();
        
        if (lowerAnalysis.contains("urgent") || lowerAnalysis.contains("critical") || 
            lowerAnalysis.contains("immediate") || lowerAnalysis.contains("emergency")) {
            score = 90;
            severity = Severite.CRITIQUE;
        } else if (lowerAnalysis.contains("warning") || lowerAnalysis.contains("high risk")) {
            score = 75;
            severity = Severite.HAUTE;
        }
        
        // CRITICAL CORRELATION FACTOR: Bump score if they have risky pre-existing conditions
        if ((lowerContext.contains("hypertension") || lowerContext.contains("heart") || lowerContext.contains("cardiac")) && a.getTypeAlerte().toString().contains("CARDIAQUE")) {
            score = Math.min(100, score + 20); // Massive bump for correlated cardiac risk
            severity = Severite.CRITIQUE;
            a.setAiAnalysis("🚨 CLINICAL CORRELATION WARNING: " + a.getAiAnalysis());
        }

        a.setAiRiskScore(score);
        a.setSeverite(severity);

        return alertRepository.save(a);
    }
    public List<Alert> retrieveAllAlerts(){
        return alertRepository.findAll();
    };
    public Alert retrieveAlert(Long alertId){
        return alertRepository.findById(alertId).get();
    };
 
    @Transactional
    public Alert updateStatus(Long alertId, StatutAlerte newStatus) {
        log.info("📡 Request to update Alert {} status to {}", alertId, newStatus);
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found"));
 
        alert.setStatut(newStatus);
        Alert saved = alertRepository.save(alert);
        log.info("✅ Alert {} status updated and saved successfully in DB", alertId);
        return saved;
    }


    @Override
    public Alert updateAlert(Long id, Alert updatedAlert) {
        Alert existing = retrieveAlert(id);
        // Update editable fields
        existing.setMessage(updatedAlert.getMessage());
        existing.setSeverite(updatedAlert.getSeverite());
        existing.setTypeAlerte(updatedAlert.getTypeAlerte());
        existing.setStatut(updatedAlert.getStatut());
        // Don't update PatientID or DateCreation usually
        return alertRepository.save(existing);
    }
    public Alert resolveAlert(Long alertId) {
        return updateStatus(alertId, StatutAlerte.RESOLUE);
    }
    public Alert ignoreAlert(Long alertId) {
        return updateStatus(alertId, StatutAlerte.IGNOREE);
    }
    public void removeAlert(Long alertId){
        alertRepository.deleteById(alertId);
    };

    @Override
    public List<Alert> retrieveAlertsByIds(List<Long> alertIds) {
        return alertRepository.findAllById(alertIds);
    }
}
