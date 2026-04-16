export interface LoginRequest {
  email: string;
  motDePasse: string; // Matches 'motDePasse' in Formation LoginDTO
}

export interface RegisterRequest {
  nom: string;         // Matches 'nom' in Formation SignUpDTO
  prenom: string;      // Matches 'prenom' in Formation SignUpDTO
  email: string;
  motDePasse: string;        // Matches 'motDePasse' in Formation SignUpDTO
  confirmMotDePasse: string; // Required by Formation SignUpDTO
  role: string;              // 'ADMIN' | 'AIDANT' — matches Formation SignUpDTO
}

export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  email: string;
  nom: string;    // Matches JwtResponse.nom
  prenom: string; // Matches JwtResponse.prenom
  roles: string[]; // Matches JwtResponse.roles (Set<String>)
  expiresIn: number;
}