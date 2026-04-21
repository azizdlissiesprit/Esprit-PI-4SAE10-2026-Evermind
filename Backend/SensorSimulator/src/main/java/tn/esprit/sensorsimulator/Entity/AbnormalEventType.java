package tn.esprit.sensorsimulator.Entity;

/**
 * Maps 1:1 to the Alert service's TypeAlerte enum:
 *   FALL              -> FALL_DETECTION
 *   CARDIAC_ANOMALY   -> HEART_RATE_ANOMALY
 *   GEOFENCE_BREACH   -> GEOFENCE_EXIT
 *   MISSED_MEDICATION -> MEDICATION_MISSED
 *   PROLONGED_INACTIVITY -> INACTIVITY
 *   SOS_TRIGGERED     -> SOS_BUTTON
 */
public enum AbnormalEventType {
    FALL,
    CARDIAC_ANOMALY,
    GEOFENCE_BREACH,
    MISSED_MEDICATION,
    PROLONGED_INACTIVITY,
    SOS_TRIGGERED
}
