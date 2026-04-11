export interface GameResultDto {
  patientId: string;
  cardsScore: number;
  sequenceScore: number;
  patternScore: number;
  verbalScore: number;
  reactionTime: number;
  errorRate: number;
  difficulty: string;
  sessionNumber: number;
}

export interface GameSession {
  id: number;
  patientId: string;
  cardsScore: number;
  sequenceScore: number;
  patternScore: number;
  verbalScore: number;
  totalScore: number;
  reactionTime: number;
  errorRate: number;
  difficulty: string;
  cognitiveStage: string;
  mlDifficultyRecommended: string;
  mlRiskScore: number;
  mlAlertLevel: 'NONE' | 'WARNING' | 'DANGER';
  mlMessage: string;
  sessionDate: string;
  sessionNumber: number;
}

export interface MlDifficultyResponse {
  recommendedDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  probabilities: { EASY: number; MEDIUM: number; HARD: number };
  confidence: number;
  reasoning?: string; // Explication de la décision ML
}

export interface MlDetectionResponse {
  status: 'NORMAL' | 'MODERATE_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_DATA';
  alert: boolean;
  alertLevel: 'NONE' | 'WARNING' | 'DANGER';
  message: string;
  riskScore: number;
  metrics: {
    avg_score: number;
    avg_reaction_time: number;
    avg_error_rate: number;
    performance_trend: number;
  };
}

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameConfig {
  difficulty: GameDifficulty;
  cardsCount: number;       // EASY:4, MEDIUM:6, HARD:8
  sequenceLength: number;   // EASY:3, MEDIUM:5, HARD:7
  patternSize: number;      // EASY:3x3, MEDIUM:4x4, HARD:5x5
  verbalQuestions: number;  // EASY:3, MEDIUM:5, HARD:7
  timeLimit: number;        // EASY:60s, MEDIUM:45s, HARD:30s
}

export interface GameMetrics {
  reactionTime: number;
  errorRate: number;
  totalQuestions: number;
  errors: number;
}

export interface MiniGameResult {
  type: 'cards' | 'sequence' | 'pattern' | 'verbal';
  score: number;
  metrics: GameMetrics;
}
