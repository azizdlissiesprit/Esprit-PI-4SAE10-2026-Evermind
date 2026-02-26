package tn.esprit.alert.Entity;

public enum TypeAlerte {
    FALL_DETECTION,         // Accelerometer detected fall
    HEART_RATE_ANOMALY,     // Pulse too high/low
    GEOFENCE_EXIT,          // Patient left the safe zone (House)
    MEDICATION_MISSED,      // Smart box didn't open at scheduled time
    INACTIVITY,             // No movement for X hours
    SOS_BUTTON
}
