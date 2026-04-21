// User Types
export enum UserType {
  ADMIN = 'ADMIN',
  AIDANT = 'AIDANT', // Caregiver
  MEDECIN = 'MEDECIN', // Doctor
  RESPONSABLE = 'RESPONSABLE' // Manager/Guardian
}

// Alert Types
export enum TypeAlerte {
  FALL_DETECTION = 'FALL_DETECTION',
  HEART_RATE_ANOMALY = 'HEART_RATE_ANOMALY', // Heart rate anomaly
  GEOFENCE_EXIT = 'GEOFENCE_EXIT', // Geofence breach
  MEDICATION_MISSED = 'MEDICATION_MISSED',
  INACTIVITY = 'INACTIVITY',
  SOS_BUTTON = 'SOS_BUTTON' // Emergency button pressed
}

export enum Severite {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE'
}

export enum StatutAlerte {
  NOUVELLE = 'NOUVELLE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  IGNOREE = 'IGNOREE'
}

// Intervention Status
export enum InterventionStatus {
  EN_ROUTE = 'EN_ROUTE',
  OFFERING_HELP = 'OFFERING_HELP',
  IN_PERSON_ASSISTANCE = 'IN_PERSON_ASSISTANCE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Intervention Outcomes
export enum InterventionOutcome {
  FALSE_ALARM = 'FALSE_ALARM',
  ASSISTANCE_GIVEN = 'ASSISTANCE_GIVEN',
  EMERGENCY_SERVICES = 'EMERGENCY_SERVICES',
  MEDICATION_GIVEN = 'MEDICATION_GIVEN',
  CONSULTATION_SCHEDULED = 'CONSULTATION_SCHEDULED'
}

// Sensor (Capteur) Types & Status
export enum TypeCapteur {
  BRACELET_GPS = 'BRACELET_GPS',
  CAPTEUR_MVT = 'CAPTEUR_MVT', // Movement sensor
  WEARABLE_ACCELEROMETRE = 'WEARABLE_ACCELEROMETRE'
}

export enum StatutCapteur {
  ACTIF = 'ACTIF',
  HORS_LIGNE = 'HORS_LIGNE', // Offline
  EN_PANNE = 'EN_PANNE' // Broken/Error
}

// Data Types (What the sensor measures)
export enum TypeDonnee {
  GPS_LAT = 'GPS_LAT',
  GPS_LONG = 'GPS_LONG',
  ACCELEROMETRE_X = 'ACCELEROMETRE_X',
  ACCELEROMETRE_Y = 'ACCELEROMETRE_Y',
  ACCELEROMETRE_Z = 'ACCELEROMETRE_Z',
  GYROSCOPE = 'GYROSCOPE'
}

// Abnormal Event Types
export enum TypeEvent {
  CHUTE_DETECTEE = 'CHUTE_DETECTEE',
  SORTIE_ZONE = 'SORTIE_ZONE',
  INACTIVITE_PROLONGEE = 'INACTIVITE_PROLONGEE'
}

// Patient Specific Enums (Inferred from diagram context)
export enum StadeAlzheimer {
  DEBUT = 'DEBUT',
  MODERE = 'MODERE',
  SEVERE = 'SEVERE'
}

export enum NiveauMobilite {
  AUTONOME = 'AUTONOME',
  AIDE_PARTIELLE = 'AIDE_PARTIELLE',
  ALITE = 'ALITE' // Bedridden
}

// Note Types (Inferred as the values weren't explicitly listed in diagram)
export enum TypeNote {
  MEDICALE = 'MEDICALE',
  OBSERVATION = 'OBSERVATION',
  URGENCE = 'URGENCE'
}