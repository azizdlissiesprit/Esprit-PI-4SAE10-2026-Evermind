import { 
  TypeAlerte, 
  Severite, 
  StatutAlerte, 
  TypeEvent, 
  ResultatIntervention 
} from './enums';

export interface AbnormalEvent {
  eventId: number; // PK
  patientId: number;
  capteurDataId: number; // Link to the specific raw data that triggered it
  typeEvent: TypeEvent;
  timestamp: Date;
  description: string;
}

export interface Alert {
  alertId: number; // PK
  patientId: number;
  abnormalEventId: number; // FK
  typeAlerte: TypeAlerte;
  severite: Severite;
  dateCreation: string;
  statut: StatutAlerte;
  message: string;
    aiAnalysis?: string;   // Optional because old alerts might not have it
  aiRiskScore?: number; 
}

export interface Intervention {
  interventionId: number; // PK
  userId: number; // The caregiver/doctor handling it
  alertId: number; // FK to the specific Alert
  dateDebut: Date;
  dateFin?: Date; // Optional if not finished
  description: string;
  resultat: ResultatIntervention;
}