import { StadeAlzheimer, NiveauMobilite } from './enums';

export interface Patient {
  patientId: number; // PK
  nom: string;
  prenom: string;
  dateNaissance: Date; // or string
  adresse: string;
  stadeMaladie: StadeAlzheimer;
  niveauMobilite: NiveauMobilite;
  contactUrgence: string;
  userIdResponsable: number; // FK to User
  geofenceRadius?: number;
  baseLatitude?: number;
  baseLongitude?: number;
}