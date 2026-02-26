package tn.esprit.intervention.Entity;

public enum InterventionOutcome {
    FALSE_ALARM,            // Patient was fine, sensor error
    ASSISTANCE_GIVEN,       // Caregiver helped patient on site
    EMERGENCY_SERVICES,     // Ambulance/Police called
    MEDICATION_GIVEN,       // Meds administered
    CONSULTATION_SCHEDULED
}
