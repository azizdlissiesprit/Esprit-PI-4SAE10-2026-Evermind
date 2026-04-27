import { 
  TypeAlerte, 
  Severite, 
  StatutAlerte, 
  TypeEvent, 
  InterventionOutcome,
  InterventionStatus
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
  aiAnalysis?: string;
  aiRiskScore?: number; 
  context?: string;
}

export interface InterventionLog {
  id: number;
  timestamp: string;
  actionType: string;
  performedBy: number;
  notes: string;
}

export interface Intervention {
  id: number;
  alertId: number;
  userId: number;
  patientId: number;
  notes?: string;
  outcome?: InterventionOutcome;
  status: InterventionStatus;
  startedAt: string;
  completedAt?: string;
  durationInSeconds?: number;
  isEscalated?: boolean;
  escalatedToUserId?: number;
  logs?: InterventionLog[];
}