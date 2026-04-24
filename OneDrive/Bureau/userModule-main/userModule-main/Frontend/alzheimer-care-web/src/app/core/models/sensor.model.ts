import { TypeCapteur, StatutCapteur, TypeDonnee } from './enums';

export interface Capteur {
  capteurId: number; // PK
  patientId: number; // FK
  typeCapteur: TypeCapteur;
  nom: string; // Friendly name (e.g., "Dad's Watch")
  numeroSerie: string;
  statut: StatutCapteur;
  derniereCommunication: Date;
  batterie: number; // Percentage 0-100
}

export interface CapteurData {
  dataId: number; // PK
  capteurId: number; // FK
  patientId: number; // FK
  typeDonnee: TypeDonnee;
  valeur: number; // float
  unite: string; // e.g., "m/s", "degrees", "lat"
  timestamp: Date;
}