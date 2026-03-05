package tn.esprit.alert.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.alert.Entity.Alert;
import tn.esprit.alert.Entity.Severite;
import tn.esprit.alert.Entity.StatutAlerte;
import tn.esprit.alert.Repository.AlertRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class AlertServiceImpl implements IAlertService {

    private final GoogleGeminiService googleGeminiService;
    AlertRepository alertRepository;
    public Alert addAlert(Alert a) {
        log.info("🚨 New Alert Received: {}", a.getTypeAlerte());

        a.setDateCreation(LocalDateTime.now());
        a.setStatut(StatutAlerte.NOUVELLE);

        // Simulation of Patient Context (Ideally fetched via Feign)
        String patientContext = "Age 82, Stage 2 Alzheimer's, High fall risk";

        // Call Google AI
        String analysis = googleGeminiService.analyzeAlert(
                a.getTypeAlerte().toString(),
                a.getMessage(),
                patientContext
        );

        a.setAiAnalysis(analysis);

        // Simple scoring logic based on text analysis
        if (analysis.toLowerCase().contains("urgent") || analysis.toLowerCase().contains("critical")) {
            a.setAiRiskScore(90);
            a.setSeverite(Severite.HAUTE);
        } else {
            a.setAiRiskScore(45);
        }



        return alertRepository.save(a);
    }
    public List<Alert> retrieveAllAlerts(){
        return alertRepository.findAll();
    };
    public Alert retrieveAlert(Long alertId){
        return alertRepository.findById(alertId).get();
    };
    public Alert updateStatus(Long alertId, StatutAlerte newStatus) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found"));

        alert.setStatut(newStatus);
        return alertRepository.save(alert);
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
}
