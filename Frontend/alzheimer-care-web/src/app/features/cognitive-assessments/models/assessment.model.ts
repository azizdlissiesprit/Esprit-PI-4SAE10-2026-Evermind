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
