// Enums
export enum AssessmentType {
  INITIAL = 'initial',
  COMPLETE = 'complete',
  FOLLOW_UP = 'follow-up'
}

export enum TrendType {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

// --- COGNITIVE ASSESSMENT INTERFACES ---

export interface CognitiveScores {
  memory: number;
  orientation: number;
  language: number;
  executiveFunctions: number;
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

// --- AUTONOMY ASSESSMENT INTERFACES ---

export interface AutonomyScores {
  hygiene: number;
  feeding: number;
  dressing: number;
  mobility: number;
  communication: number;
}

export interface AutonomyAssessment {
  id?: number;
  patientId: string;
  date: string;
  evaluator: string;
  scores: AutonomyScores;
  totalScore: number;
  trend: TrendType;
  trendPoints?: number;
  assistanceLevel: string;
  observations?: string;
  
  // These come from DB as JSON strings. 
  // Components should JSON.parse() them for display.
  recommendedDevicesJson?: string;     
  caregiverRecommendationsJson?: string; 
}