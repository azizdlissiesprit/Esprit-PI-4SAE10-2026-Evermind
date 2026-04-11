import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { MlDetectionResponse, GameMetrics } from '../models/game.models';

export interface EarlyDetectionData {
  patientId: string;
  age: number;
  gender: 'M' | 'F';
  educationLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  sessionMetrics: {
    timestamp: string;
    gameType: 'cards' | 'sequence' | 'pattern' | 'verbal';
    score: number;
    reactionTime: number;
    errorRate: number;
    completionTime: number;
  }[];
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  anomalyScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  contributingFactors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  recommendations: string[];
}

export interface PerformanceEvolution {
  patientId: string;
  timeSeries: {
    date: string;
    overallScore: number;
    cognitiveIndex: number;
    reactionTimeIndex: number;
    errorRateIndex: number;
  }[];
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    slope: number;
    significance: number;
  };
  alerts: {
    type: 'reaction_time' | 'error_rate' | 'score_decline';
    severity: 'mild' | 'moderate' | 'severe';
    message: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class EarlyDetectionService {
  private apiUrl = 'http://localhost:5001'; // ML Service Flask
  
  // État local pour la détection
  private detectionResults = new BehaviorSubject<Map<string, MlDetectionResponse>>(new Map());
  private performanceEvolutions = new BehaviorSubject<Map<string, PerformanceEvolution>>(new Map());
  
  detectionResults$ = this.detectionResults.asObservable();
  performanceEvolutions$ = this.performanceEvolutions.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Détecter les anomalies précoces avec Isolation Forest
   */
  async detectEarlyAnomalies(data: EarlyDetectionData): Promise<MlDetectionResponse> {
    try {
      // Appel au service ML pour détection d'anomalies
      const response = await this.http.post<MlDetectionResponse>(
        `${this.apiUrl}/detect/anomalies`,
        data
      ).toPromise();

      if (response) {
        this.updateDetectionResult(data.patientId, response);
        return response;
      }
    } catch (error) {
      console.warn('ML service unavailable, using fallback detection');
      return this.fallbackAnomalyDetection(data);
    }

    return this.fallbackAnomalyDetection(data);
  }

  /**
   * Logique fallback si le service ML n'est pas disponible
   */
  private fallbackAnomalyDetection(data: EarlyDetectionData): MlDetectionResponse {
    const recentMetrics = data.sessionMetrics.slice(-5); // 5 dernières sessions
    
    if (recentMetrics.length < 3) {
      return this.createInsufficientDataResponse();
    }

    const analysis = this.analyzePerformancePatterns(recentMetrics);
    const riskScore = this.calculateRiskScore(analysis);
    const alertLevel = this.determineAlertLevel(riskScore);
    const message = this.generateDetectionMessage(analysis, alertLevel);

    const response: MlDetectionResponse = {
      status: this.determineStatus(riskScore),
      alert: alertLevel !== 'NONE',
      alertLevel,
      message,
      riskScore,
      metrics: {
        avg_score: analysis.avgScore,
        avg_reaction_time: analysis.avgReactionTime,
        avg_error_rate: analysis.avgErrorRate,
        performance_trend: analysis.trendSlope
      }
    };

    this.updateDetectionResult(data.patientId, response);
    return response;
  }

  /**
   * Analyser les patterns de performance
   */
  private analyzePerformancePatterns(metrics: any[]): any {
    const scores = metrics.map(m => m.score);
    const reactionTimes = metrics.map(m => m.reactionTime);
    const errorRates = metrics.map(m => m.errorRate);

    // Calculer les tendances
    const trendSlope = this.calculateTrendSlope(scores);
    const reactionTimeTrend = this.calculateTrendSlope(reactionTimes);
    const errorRateTrend = this.calculateTrendSlope(errorRates);

    // Détecter les anomalies
    const scoreDecline = trendSlope < -2; // Baisse significative
    const reactionTimeIncrease = reactionTimeTrend > 50; // Augmentation du temps de réaction
    const errorRateIncrease = errorRateTrend > 0.05; // Augmentation du taux d'erreur

    return {
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      avgReactionTime: reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length,
      avgErrorRate: errorRates.reduce((a, b) => a + b, 0) / errorRates.length,
      trendSlope,
      reactionTimeTrend,
      errorRateTrend,
      anomalies: {
        scoreDecline,
        reactionTimeIncrease,
        errorRateIncrease
      }
    };
  }

  /**
   * Calculer le score de risque (0-1)
   */
  private calculateRiskScore(analysis: any): number {
    let riskScore = 0;

    // Score moyen (30%)
    if (analysis.avgScore < 60) riskScore += 0.3;
    else if (analysis.avgScore < 75) riskScore += 0.15;

    // Temps de réaction (25%)
    if (analysis.avgReactionTime > 2000) riskScore += 0.25;
    else if (analysis.avgReactionTime > 1500) riskScore += 0.12;

    // Taux d'erreur (25%)
    if (analysis.avgErrorRate > 0.35) riskScore += 0.25;
    else if (analysis.avgErrorRate > 0.25) riskScore += 0.12;

    // Tendance (20%)
    if (analysis.anomalies.scoreDecline) riskScore += 0.2;
    if (analysis.anomalies.reactionTimeIncrease) riskScore += 0.1;
    if (analysis.anomalies.errorRateIncrease) riskScore += 0.1;

    return Math.min(riskScore, 1);
  }

  /**
   * Déterminer le niveau d'alerte
   */
  private determineAlertLevel(riskScore: number): 'NONE' | 'WARNING' | 'DANGER' {
    if (riskScore < 0.3) return 'NONE';
    if (riskScore < 0.7) return 'WARNING';
    return 'DANGER';
  }

  /**
   * Déterminer le statut
   */
  private determineStatus(riskScore: number): 'NORMAL' | 'MODERATE_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_DATA' {
    if (riskScore < 0.3) return 'NORMAL';
    if (riskScore < 0.7) return 'MODERATE_RISK';
    return 'HIGH_RISK';
  }

  /**
   * Générer le message de détection
   */
  private generateDetectionMessage(analysis: any, alertLevel: string): string {
    if (alertLevel === 'NONE') {
      return '✅ Performance cognitive dans les normes attendues.';
    }

    const issues = [];
    if (analysis.anomalies.scoreDecline) issues.push('baisse des scores');
    if (analysis.anomalies.reactionTimeIncrease) issues.push('augmentation du temps de réaction');
    if (analysis.anomalies.errorRateIncrease) issues.push('augmentation du taux d\'erreur');

    if (alertLevel === 'WARNING') {
      return `⚠️ Légère baisse de performance détectée: ${issues.join(', ')}. Surveillance recommandée.`;
    }

    return `🚨 Baisse significative de performance détectée: ${issues.join(', ')}. Nous recommandons une évaluation clinique.`;
  }

  /**
   * Calculer la pente de tendance
   */
  private calculateTrendSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Analyser l'évolution de performance dans le temps
   */
  analyzePerformanceEvolution(patientId: string, sessions: any[]): Observable<PerformanceEvolution> {
    if (sessions.length < 2) {
      const emptyEvolution: PerformanceEvolution = {
        patientId,
        timeSeries: [],
        trend: {
          direction: 'stable',
          slope: 0,
          significance: 0
        },
        alerts: []
      };
      return new BehaviorSubject<PerformanceEvolution>(emptyEvolution).asObservable();
    }

    // Créer la série temporelle
    const timeSeries = sessions.map(session => ({
      date: session.timestamp,
      overallScore: this.calculateOverallScore(session),
      cognitiveIndex: this.calculateCognitiveIndex(session),
      reactionTimeIndex: this.calculateReactionTimeIndex(session.reactionTime),
      errorRateIndex: this.calculateErrorRateIndex(session.errorRate)
    }));

    // Analyser la tendance
    const overallScores = timeSeries.map(ts => ts.overallScore);
    const slope = this.calculateTrendSlope(overallScores);
    const direction = slope > 1 ? 'improving' : slope < -1 ? 'declining' : 'stable';
    const significance = Math.abs(slope) / 10; // Normalisation

    // Détecter les alertes
    const alerts = this.detectPerformanceAlerts(timeSeries);

    const evolution: PerformanceEvolution = {
      patientId,
      timeSeries,
      trend: {
        direction,
        slope,
        significance
      },
      alerts
    };

    this.updatePerformanceEvolution(patientId, evolution);
    return new BehaviorSubject<PerformanceEvolution>(evolution).asObservable();
  }

  /**
   * Calculer le score global
   */
  private calculateOverallScore(session: any): number {
    return session.score;
  }

  /**
   * Calculer l'index cognitif
   */
  private calculateCognitiveIndex(session: any): number {
    // Combinaison pondérée du score et du temps de réaction
    const scoreWeight = 0.7;
    const timeWeight = 0.3;
    const normalizedTime = Math.max(0, 1 - (session.reactionTime / 3000)); // Normaliser sur 3s max
    
    return (session.score * scoreWeight) + (normalizedTime * 100 * timeWeight);
  }

  /**
   * Calculer l'index de temps de réaction
   */
  private calculateReactionTimeIndex(reactionTime: number): number {
    // Index inversé : plus le temps est faible, meilleur est l'index
    return Math.max(0, 100 - (reactionTime / 30)); // Normaliser sur 3s max
  }

  /**
   * Calculer l'index de taux d'erreur
   */
  private calculateErrorRateIndex(errorRate: number): number {
    return Math.max(0, 100 - (errorRate * 100));
  }

  /**
   * Détecter les alertes de performance
   */
  private detectPerformanceAlerts(timeSeries: any[]): {
    type: 'reaction_time' | 'error_rate' | 'score_decline';
    severity: 'mild' | 'moderate' | 'severe';
    message: string;
  }[] {
    const alerts: {
      type: 'reaction_time' | 'error_rate' | 'score_decline';
      severity: 'mild' | 'moderate' | 'severe';
      message: string;
    }[] = [];
    
    if (timeSeries.length < 3) return alerts;

    const recent = timeSeries.slice(-3);
    const previous = timeSeries.slice(-6, -3);

    if (previous.length > 0) {
      const recentAvg = recent.reduce((sum, ts) => sum + ts.overallScore, 0) / recent.length;
      const previousAvg = previous.reduce((sum, ts) => sum + ts.overallScore, 0) / previous.length;
      
      if (recentAvg < previousAvg - 10) {
        alerts.push({
          type: 'score_decline',
          severity: recentAvg < previousAvg - 20 ? 'severe' : 'moderate',
          message: `Baisse de ${Math.round(previousAvg - recentAvg)} points détectée`
        });
      }
    }

    // Vérifier le temps de réaction
    const recentReactionTimes = recent.map(ts => ts.reactionTimeIndex);
    if (recentReactionTimes.every(rt => rt < 70)) {
      alerts.push({
        type: 'reaction_time',
        severity: 'moderate',
        message: 'Temps de réaction plus lent que la normale'
      });
    }

    return alerts;
  }

  /**
   * Créer une réponse pour données insuffisantes
   */
  private createInsufficientDataResponse(): MlDetectionResponse {
    return {
      status: 'INSUFFICIENT_DATA',
      alert: false,
      alertLevel: 'NONE',
      message: '📊 Données insuffisantes pour l\'analyse. Continuez à jouer pour obtenir une évaluation précise.',
      riskScore: 0,
      metrics: {
        avg_score: 0,
        avg_reaction_time: 0,
        avg_error_rate: 0,
        performance_trend: 0
      }
    };
  }

  /**
   * Mettre à jour le résultat de détection
   */
  private updateDetectionResult(patientId: string, result: MlDetectionResponse): void {
    const current = new Map(this.detectionResults.value);
    current.set(patientId, result);
    this.detectionResults.next(current);
  }

  /**
   * Mettre à jour l'évolution de performance
   */
  private updatePerformanceEvolution(patientId: string, evolution: PerformanceEvolution): void {
    const current = new Map(this.performanceEvolutions.value);
    current.set(patientId, evolution);
    this.performanceEvolutions.next(current);
  }

  /**
   * Obtenir le résultat de détection pour un patient
   */
  getDetectionResult(patientId: string): MlDetectionResponse | null {
    return this.detectionResults.value.get(patientId) || null;
  }

  /**
   * Obtenir l'évolution de performance pour un patient
   */
  getPerformanceEvolution(patientId: string): PerformanceEvolution | null {
    return this.performanceEvolutions.value.get(patientId) || null;
  }
}
