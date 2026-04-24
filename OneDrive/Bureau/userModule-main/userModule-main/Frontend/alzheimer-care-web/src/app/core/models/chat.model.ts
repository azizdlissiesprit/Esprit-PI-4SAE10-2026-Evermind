import { TypeNote } from './enums';

export interface Conversation {
  conversationId: number; // PK
  patientId: number; // Context of the conversation
  titre: string;
  dateCreation: Date;
  actif: boolean;
}

export interface Message {
  messageId: number; // PK
  conversationId: number; // FK
  auteurId: number; // User sending the message
  contenu: string; // Text
  dateEnvoi: Date;
  lu: boolean; // Read status
}

export interface Note {
  noteId: number; // PK
  auteurId: number; // User creating the note
  patientId: number;
  alertId?: number; // Optional: linked to a specific alert
  dateCreation: Date;
  typeNote: TypeNote;
  contenu: string;
}