import { UserType } from './enums';

export interface User {
  userId: number; // PK
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  // Note: Password hash is usually not brought to the frontend for security, 
  // but if your DTO includes it, it's here:
  motDePasseHash?: string; 
  userType: UserType;
  dateCreation: Date; // or string if raw JSON
  dateDerniereConnexion: Date;
  actif: boolean;
}