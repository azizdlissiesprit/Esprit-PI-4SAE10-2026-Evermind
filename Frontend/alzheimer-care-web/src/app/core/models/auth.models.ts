export interface LoginRequest {
  email: string;
  password: string; // Matches 'password' in Java
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: 'AIDANT' | 'MEDECIN' | 'RESPONSABLE'| 'ADMIN'; // Matches your Java Enum
}

export interface AuthenticationResponse {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userId?: number;
}