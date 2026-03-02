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

export interface AssessmentScore {
  memory: number;
  orientation: number;
  language: number;
  executiveFunctions: number;
}

export interface Assessment {
  id: string;
  date: string;
  type: 'initial' | 'complete' | 'follow-up';
  evaluator: string;
  mmseScore: number;
  moocaScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPoints?: number;
  scores: AssessmentScore;
  observations: string;
  patientId: string;
}

export interface AssessmentHistory {
  assessments: Assessment[];
}

export interface ChartDataPoint {
  date: string;
  mmse: number;
  mooca: number;
}

export interface DomainScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
}

/** Raw response from the Cognitive Assessment REST API (Java backend). */
export interface AssessmentApiResponse {
  id: number;
  patientId: string;
  date: string;
  type: 'initial' | 'complete' | 'follow-up';
  evaluator: string;
  mmseScore: number;
  moocaScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPoints: number | null;
  scores: AssessmentScore | null;
  observations: string;
}

/** Aggregated stats for analytics (computed from API data). */
export interface AssessmentStats {
  totalCount: number;
  averageMmse: number;
  averageMoca: number;
  byType: { initial: number; complete: number; 'follow-up': number };
  trendDistribution: { up: number; down: number; stable: number };
}
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
  recommendedDevicesJson: string | null;
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
export enum TrendType {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}
export interface CognitiveAssessment {
  id?: number; // Optional because it's null on create
  patientId: string;
  date: string; // ISO String (e.g., "2023-10-27")
  type: AssessmentType;
  evaluator: string;
  mmseScore: number;
  moocaScore: number;
  trend: TrendType;
  trendPoints?: number;
  scores: CognitiveScores;
  observations?: string;
}
export enum AssessmentType {
  INITIAL = 'initial',
  COMPLETE = 'complete',
  FOLLOW_UP = 'follow-up'
}
export interface CognitiveScores {
  memory: number;
  orientation: number;
  language: number;
  executiveFunctions: number;
}