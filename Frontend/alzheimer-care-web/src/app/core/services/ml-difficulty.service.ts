import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { GameDifficulty, GameMetrics, MlDifficultyResponse } from '../models/game.models';

export interface DifficultyAdaptationData {
  patientId: string;
  gameType: 'cards' | 'sequence' | 'pattern' | 'verbal';
  currentDifficulty: GameDifficulty;
  score: number;
  reactionTime: number;
  errorRate: number;
  sessionNumber: number;
  timestamp: string;
}

export interface PerformanceTrend {
  patientId: string;
  gameType: string;
  scores: number[];
  reactionTimes: number[];
  errorRates: number[];
  trend: 'improving' | 'stable' | 'declining';
  trendStrength: number; // 0-1
  recommendation: GameDifficulty;
}

@Injectable({
  providedIn: 'root'
})
export class MlDifficultyService {
  private apiUrl = 'http://localhost:5001'; // ML Service Flask
  
  // État local pour l'adaptation
  private currentDifficulty = new BehaviorSubject<Map<string, GameDifficulty>>(new Map());
  private performanceHistory = new BehaviorSubject<Map<string, DifficultyAdaptationData[]>>(new Map());
  
  currentDifficulty$ = this.currentDifficulty.asObservable();
  performanceHistory$ = this.performanceHistory.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Adapter automatiquement la difficulté avec Logistic Regression
   */
  async adaptDifficulty(data: DifficultyAdaptationData): Promise<MlDifficultyResponse> {
    try {
      // Appel au service ML pour prédiction
      const response = await this.http.post<MlDifficultyResponse>(
        `${this.apiUrl}/predict/difficulty`,
        data
      ).toPromise();

      if (response) {
        // Mettre à jour l'état local
        this.updateDifficultyState(data.gameType, response.recommendedDifficulty);
        this.addToPerformanceHistory(data);
        
        return response;
      }
    } catch (error) {
      console.warn('ML service unavailable, using fallback logic');
      return this.fallbackDifficultyAdaptation(data);
    }

    return this.fallbackDifficultyAdaptation(data);
  }

  /**
   * Logique fallback si le service ML n'est pas disponible
   */
  private fallbackDifficultyAdaptation(data: DifficultyAdaptationData): MlDifficultyResponse {
    const { score, currentDifficulty, errorRate, reactionTime } = data;
    
    let recommendedDifficulty: GameDifficulty = currentDifficulty;
    let confidence = 0.7;

    // Règles basées sur la performance
    if (score >= 85 && errorRate < 0.15 && reactionTime < 1000) {
      // Performance excellente -> augmenter difficulté
      if (currentDifficulty === 'EASY') {
        recommendedDifficulty = 'MEDIUM';
        confidence = 0.8;
      } else if (currentDifficulty === 'MEDIUM') {
        recommendedDifficulty = 'HARD';
        confidence = 0.75;
      }
    } else if (score < 60 || errorRate > 0.35 || reactionTime > 2000) {
      // Performance faible -> diminuer difficulté
      if (currentDifficulty === 'HARD') {
        recommendedDifficulty = 'MEDIUM';
        confidence = 0.8;
      } else if (currentDifficulty === 'MEDIUM') {
        recommendedDifficulty = 'EASY';
        confidence = 0.75;
      }
    }

    // Calculer les probabilités simulées
    const probabilities = this.calculateProbabilities(recommendedDifficulty, score);

    return {
      recommendedDifficulty,
      probabilities,
      confidence,
      reasoning: this.generateReasoning(score, errorRate, reactionTime, recommendedDifficulty)
    };
  }

  /**
   * Calculer les probabilités pour chaque niveau de difficulté
   */
  private calculateProbabilities(recommended: GameDifficulty, score: number): { EASY: number; MEDIUM: number; HARD: number } {
    const baseProbabilities: { EASY: number; MEDIUM: number; HARD: number } = {
      EASY: 0.33,
      MEDIUM: 0.34,
      HARD: 0.33
    };

    // Ajuster selon le score
    if (score >= 85) {
      baseProbabilities.HARD += 0.3;
      baseProbabilities.MEDIUM += 0.1;
      baseProbabilities.EASY -= 0.4;
    } else if (score < 60) {
      baseProbabilities.EASY += 0.3;
      baseProbabilities.MEDIUM += 0.1;
      baseProbabilities.HARD -= 0.4;
    }

    // Normaliser
    const total = Object.values(baseProbabilities).reduce((a, b) => a + b, 0);
    Object.keys(baseProbabilities).forEach(key => {
      baseProbabilities[key as keyof typeof baseProbabilities] /= total;
    });

    return baseProbabilities;
  }

  /**
   * Générer une explication pour la recommandation
   */
  private generateReasoning(score: number, errorRate: number, reactionTime: number, difficulty: GameDifficulty): string {
    const reasons = [];
    
    if (score >= 85) reasons.push('excellent score');
    else if (score < 60) reasons.push('score needs improvement');
    
    if (errorRate < 0.15) reasons.push('low error rate');
    else if (errorRate > 0.35) reasons.push('high error rate');
    
    if (reactionTime < 1000) reasons.push('fast reaction time');
    else if (reactionTime > 2000) reasons.push('slow reaction time');

    const action = difficulty === 'HARD' ? 'increased' : difficulty === 'EASY' ? 'decreased' : 'maintained';
    
    return `Difficulty ${action} based on: ${reasons.join(', ')}.`;
  }

  /**
   * Analyser les tendances de performance
   */
  analyzePerformanceTrend(patientId: string, gameType: string): Observable<PerformanceTrend> {
    const history = this.performanceHistory.value.get(`${patientId}-${gameType}`) || [];
    
    if (history.length < 3) {
      // Pas assez de données pour une tendance significative
      return new BehaviorSubject<PerformanceTrend>({
        patientId,
        gameType,
        scores: history.map(h => h.score),
        reactionTimes: history.map(h => h.reactionTime),
        errorRates: history.map(h => h.errorRate),
        trend: 'stable',
        trendStrength: 0.5,
        recommendation: 'MEDIUM'
      }).asObservable();
    }

    // Calculer la tendance
    const recentScores = history.slice(-5).map(h => h.score);
    const trend = this.calculateTrend(recentScores);
    const trendStrength = this.calculateTrendStrength(recentScores);
    
    // Recommander la difficulté basée sur la tendance
    const recommendation = this.recommendDifficultyFromTrend(trend, trendStrength, recentScores[recentScores.length - 1]);

    const performanceTrend: PerformanceTrend = {
      patientId,
      gameType,
      scores: history.map(h => h.score),
      reactionTimes: history.map(h => h.reactionTime),
      errorRates: history.map(h => h.errorRate),
      trend,
      trendStrength,
      recommendation
    };

    return new BehaviorSubject<PerformanceTrend>(performanceTrend).asObservable();
  }

  /**
   * Calculer la tendance (amélioration/stabilité/baisse)
   */
  private calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Calculer la force de la tendance (0-1)
   */
  private calculateTrendStrength(scores: number[]): number {
    if (scores.length < 3) return 0.5;
    
    // Calculer la corrélation linéaire simple
    const n = scores.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = scores.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices
    const sumY2 = scores.reduce((sum, y) => sum + y * y, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return Math.abs(correlation);
  }

  /**
   * Recommander une difficulté basée sur la tendance
   */
  private recommendDifficultyFromTrend(trend: string, strength: number, currentScore: number): GameDifficulty {
    if (trend === 'improving' && strength > 0.7 && currentScore > 80) {
      return 'HARD';
    } else if (trend === 'declining' && strength > 0.7 && currentScore < 70) {
      return 'EASY';
    }
    return 'MEDIUM';
  }

  /**
   * Mettre à jour l'état de difficulté
   */
  private updateDifficultyState(gameType: string, difficulty: GameDifficulty): void {
    const current = new Map(this.currentDifficulty.value);
    current.set(gameType, difficulty);
    this.currentDifficulty.next(current);
  }

  /**
   * Ajouter à l'historique de performance
   */
  private addToPerformanceHistory(data: DifficultyAdaptationData): void {
    const current = new Map(this.performanceHistory.value);
    const key = `${data.patientId}-${data.gameType}`;
    const history = current.get(key) || [];
    
    // Garder seulement les 10 dernières sessions
    const updatedHistory = [...history, data].slice(-10);
    current.set(key, updatedHistory);
    this.performanceHistory.next(current);
  }

  /**
   * Obtenir la difficulté actuelle pour un jeu
   */
  getCurrentDifficulty(gameType: string): GameDifficulty {
    return this.currentDifficulty.value.get(gameType) || 'MEDIUM';
  }

  /**
   * Obtenir l'historique de performance
   */
  getPerformanceHistory(patientId: string, gameType: string): DifficultyAdaptationData[] {
    return this.performanceHistory.value.get(`${patientId}-${gameType}`) || [];
  }
}
