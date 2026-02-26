package tn.esprit.intervention.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InterventionResponse {
    private Long id;
    private String notes;
    private String outcome;
    private String duration;

    // Enriched Data (Fetched from other Services)
    private String caregiverName; // Fetched from User-Service via Feign
    private String alertType;     // Fetched from Alert Repository
}