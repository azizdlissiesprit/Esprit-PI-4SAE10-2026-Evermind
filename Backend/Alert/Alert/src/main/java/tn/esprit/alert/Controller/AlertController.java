package tn.esprit.alert.Controller;


import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.alert.Entity.Alert;
import tn.esprit.alert.Entity.StatutAlerte;
import tn.esprit.alert.Repository.AlertRepository;
import tn.esprit.alert.Service.IAlertService;
import tn.esprit.alert.Service.PredictiveAnalysisService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/alert")
public class AlertController {
    @Autowired
    IAlertService alertService;
    @Autowired
    PredictiveAnalysisService predictiveService;
    @Autowired
    AlertRepository alertRepository; // Or Service
    @GetMapping("/retrieve-all-alerts")
    List<Alert> getAlerts() {
        List<Alert> alert = alertService.retrieveAllAlerts();
        return alert;
    }
    @PostMapping("/add-alert")
    public Alert addAlert(@RequestBody Alert a) {
        Alert alert = alertService.addAlert(a);
        return alert;
    }
    @GetMapping("/retrieve-alert/{alert-id}")
    public Alert getAlert(@PathVariable("alert-id") long alertId) {
        Alert alert = alertService.retrieveAlert(alertId);
        return alert;
    }
    @PutMapping("/update-alert/{id}")
    public Alert updateAlert(@PathVariable Long id, @RequestBody Alert alert) {
        return alertService.updateAlert(id, alert);
    }
    @PatchMapping("/take-charge/{id}")
    public Alert takeCharge(@PathVariable Long id) {
        return alertService.updateStatus(id, StatutAlerte.EN_COURS);
    }
    @PatchMapping("/resolve/{id}")
    public Alert resolve(@PathVariable Long id) {
        return alertService.resolveAlert(id);
    }
    @PatchMapping("/ignore/{id}")
    public Alert ignore(@PathVariable Long id) {
        return alertService.ignoreAlert(id);
    }
    @DeleteMapping("/remove-alert/{alert-id}")
    public void removeAlert(@PathVariable("alert-id") Long alertId) {
        alertService.removeAlert(alertId);
    }
    @GetMapping("/predict/patient/{id}")
    public Map<String, Object> predictStability(@PathVariable Long id) {
        List<Alert> history = alertRepository.findTop10ByPatientIdOrderByDateCreationDesc(id);

        double slope = predictiveService.calculateStabilitySlope(history);
        String interpretation = predictiveService.interpretTrend(slope);

        Map<String, Object> result = new HashMap<>();
        result.put("patientId", id);
        result.put("stabilitySlope", slope);
        result.put("analysis", interpretation);
        result.put("sampleSize", history.size());

        return result;
    }
}
