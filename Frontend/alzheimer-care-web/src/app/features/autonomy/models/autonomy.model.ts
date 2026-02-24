export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  secuNumber: string;
  avatar: string;
  status: 'active' | 'inactive';
  alzheimerStage: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdate: string;
}

export interface AutonomyScores {
  hygiene: number;      // 0-5
  feeding: number;     // 0-5
  dressing: number;    // 0-5
  mobility: number;    // 0-5
  communication: number; // 0-5
}

export interface AutonomyAssessment {
  id: string;
  patientId: string;
  date: string;
  evaluator: string;
  scores: AutonomyScores;
  totalScore: number;  // 0-25 (sum of 5 domains)
  trend: 'up' | 'down' | 'stable';
  trendPoints?: number;
  assistanceLevel: string;
  observations?: string;
  recommendedDevices?: string[];
  caregiverRecommendations?: string[];
  evolutionByDomain?: { domain: string; change: number }[];
}

export interface AutonomyChartPoint {
  date: string;
  totalScore: number;
}

/** Réponse brute de l'API Autonomy (backend Java). */
export interface AutonomyAssessmentApiResponse {
  id: number;
  patientId: string;
  date: string;
  evaluator: string;
  scores: AutonomyScores | null;
  totalScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPoints: number | null;
  assistanceLevel: string;
  observations: string | null;
  recommendedDevicesJson: string | null;
  caregiverRecommendationsJson: string | null;
}
