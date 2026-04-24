export interface LoginRequest {
  email: string;
  password: string; // Matches 'password' in Java
  captchaToken?: string;
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
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
  captchaToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
