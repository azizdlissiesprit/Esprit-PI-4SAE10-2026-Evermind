package tn.esprit.sensorsimulator.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.ServiceInstance;
import tn.esprit.sensorsimulator.Entity.AbnormalEvent;
import tn.esprit.sensorsimulator.Entity.AbnormalEventType;
import tn.esprit.sensorsimulator.Repository.AbnormalEventRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Communicates with the Alert microservice when abnormal events are detected.
 * Uses Spring's RestClient with Eureka service discovery to locate the Alert service.
 */
@Service
@Slf4j
public class AlertIntegrationService {

    private final RestClient restClient;
    private final DiscoveryClient discoveryClient;
    private final AbnormalEventRepository abnormalEventRepository;

    @Autowired
    public AlertIntegrationService(DiscoveryClient discoveryClient,
                                   AbnormalEventRepository abnormalEventRepository) {
        this.restClient = RestClient.builder().build();
        this.discoveryClient = discoveryClient;
        this.abnormalEventRepository = abnormalEventRepository;
    }

    /**
     * Sends an alert to the Alert service for a detected abnormal event.
     * Maps AbnormalEventType -> TypeAlerte and assigns appropriate Severite.
     */
    public void sendAlertForEvent(AbnormalEvent event, String context) {
        log.info("📡 Preparing to send alert to Alert service for event id={}, type={}, patientId={}",
                event.getId(), event.getEventType(), event.getPatientId());

        try {
            String alertServiceUrl = resolveAlertServiceUrl();
            if (alertServiceUrl == null) {
                log.error("🚨 Cannot resolve Alert service URL from Eureka! Alert NOT sent.");
                return;
            }

            // Build the alert payload matching Alert entity structure
            Map<String, Object> alertPayload = buildAlertPayload(event, context);

            log.info("📡 Sending POST to {}/alert/add-alert with payload: {}", alertServiceUrl, alertPayload);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(alertServiceUrl + "/alert/add-alert")
                    .header("Content-Type", "application/json")
                    .body(alertPayload)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("alertId")) {
                Long alertId = ((Number) response.get("alertId")).longValue();
                event.setAlertSent(true);
                event.setAlertId(alertId);
                abnormalEventRepository.save(event);
                log.info("✅ Alert created successfully! alertId={} for abnormal event id={}", alertId, event.getId());
            } else {
                log.warn("⚠️ Alert service responded but no alertId in response: {}", response);
                event.setAlertSent(true);
                abnormalEventRepository.save(event);
            }

        } catch (Exception e) {
            log.error("🚨 FAILED to send alert to Alert service for event id={}: {}",
                    event.getId(), e.getMessage(), e);
        }
    }

    /**
     * Resolves the Alert service URL from Eureka discovery.
     */
    private String resolveAlertServiceUrl() {
        log.debug("🔍 Resolving Alert service URL from Eureka...");
        try {
            List<ServiceInstance> instances = discoveryClient.getInstances("ALERT");
            if (instances == null || instances.isEmpty()) {
                // Fallback: try lowercase
                instances = discoveryClient.getInstances("Alert");
            }
            if (instances == null || instances.isEmpty()) {
                log.warn("⚠️ No instances of 'Alert' service found in Eureka. Falling back to localhost:8081");
                return "http://localhost:8081";
            }
            ServiceInstance instance = instances.get(0);
            String url = instance.getUri().toString();
            log.info("📡 Resolved Alert service URL: {}", url);
            return url;
        } catch (Exception e) {
            log.warn("⚠️ Eureka discovery failed, falling back to localhost:8081. Error: {}", e.getMessage());
            return "http://localhost:8081";
        }
    }

    /**
     * Builds the JSON payload matching the Alert entity structure.
     */
    private Map<String, Object> buildAlertPayload(AbnormalEvent event, String context) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("patientId", event.getPatientId());
        payload.put("abnormalEventId", event.getId());
        payload.put("typeAlerte", mapEventTypeToAlertType(event.getEventType()));
        payload.put("severite", determineSeverity(event.getEventType()));
        payload.put("message", event.getDescription());
        payload.put("context", context);

        log.debug("🔍 Built alert payload: typeAlerte={}, severite={}, patientId={}",
                payload.get("typeAlerte"), payload.get("severite"), payload.get("patientId"));
        return payload;
    }

    /**
     * Maps SensorSimulator's AbnormalEventType to Alert's TypeAlerte enum name.
     */
    private String mapEventTypeToAlertType(AbnormalEventType eventType) {
        return switch (eventType) {
            case FALL -> "FALL_DETECTION";
            case CARDIAC_ANOMALY -> "HEART_RATE_ANOMALY";
            case GEOFENCE_BREACH -> "GEOFENCE_EXIT";
            case MISSED_MEDICATION -> "MEDICATION_MISSED";
            case PROLONGED_INACTIVITY -> "INACTIVITY";
            case SOS_TRIGGERED -> "SOS_BUTTON";
        };
    }

    /**
     * Determines alert severity based on event type.
     * Falls and cardiac anomalies are CRITIQUE, others are HAUTE or MOYENNE.
     */
    private String determineSeverity(AbnormalEventType eventType) {
        return switch (eventType) {
            case FALL, CARDIAC_ANOMALY, SOS_TRIGGERED -> "CRITIQUE";
            case GEOFENCE_BREACH -> "HAUTE";
            case MISSED_MEDICATION, PROLONGED_INACTIVITY -> "MOYENNE";
        };
    }
}
