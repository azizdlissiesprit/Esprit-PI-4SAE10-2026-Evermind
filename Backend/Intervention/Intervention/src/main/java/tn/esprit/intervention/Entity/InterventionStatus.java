package tn.esprit.intervention.Entity;

public enum InterventionStatus {
    EN_ROUTE,           // Caregiver is moving to patient
    OFFERING_HELP,      // Caregiver is communicating via smart speaker/phone
    IN_PERSON_ASSISTANCE, // Caregiver has arrived
    COMPLETED,          // Intervention is finished
    CANCELLED           // False alarm or other reason
}
