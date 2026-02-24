// User Types
export enum UserType {
  ADMIN = 'ADMIN',
  AIDANT = 'AIDANT', // Caregiver
  MEDECIN = 'MEDECIN', // Doctor
  RESPONSABLE = 'RESPONSABLE' // Manager/Guardian
}

// Alert Types
export enum TypeAlerte {
  CHUTE = 'CHUTE',
  ERRANCE = 'ERRANCE', // Wandering
  SORTIE_ZONE = 'SORTIE_ZONE', // Geofence breach
  INACTIVITE = 'INACTIVITE',
  AGITATION = 'AGITATION'
}

export enum Severite {
  CRITIQUE = 'CRITIQUE',
  ELEVEE = 'ELEVEE',
  MODEREE = 'MODEREE'
}

export enum StatutAlerte {
  NOUVELLE = 'NOUVELLE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE'
}

// Intervention Results
export enum ResultatIntervention {
  RESOLUE = 'RESOLUE',
  EN_ATTENTE = 'EN_ATTENTE',
  ESCALADE_MEDICALE = 'ESCALADE_MEDICALE'
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