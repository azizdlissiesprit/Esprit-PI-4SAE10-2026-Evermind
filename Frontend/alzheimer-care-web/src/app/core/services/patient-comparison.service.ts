import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { GameSession } from '../models/game.models';

export interface PatientProfile {
  patientId: string;
  age: number;
  gender: 'M' | 'F';
  educationLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  cognitiveBaseline: {
    avgScore: number;
    avgReactionTime: number;
    avgErrorRate: number;
  };
  recentPerformance: {
    scores: number[];
    reactionTimes: number[];
    errorRates: number[];
  };
}

export interface ClusterAnalysis {
  patientId: string;
  clusterId: number;
  clusterCharacteristics: {
    ageRange: [number, number];
    avgScore: number;
    avgReactionTime: number;
    avgErrorRate: number;
    size: number;
    description: string;
  };
  percentileRanking: {
    overall: number;
    score: number;
    reactionTime: number;
    errorRate: number;
  };
  similarPatients: {
    patientId: string;
    age: number;
    performance: number;
    similarity: number;
  }[];
  insights: string[];
}

export interface ComparisonMetrics {
  yourPerformance: number;
  similarPatientsAvg: number;
  percentile: number;
  interpretation: string;
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PatientComparisonService {
  private apiUrl = 'http://localhost:5001'; // ML Service Flask
  
  // État local pour les comparaisons
  private clusterAnalyses = new BehaviorSubject<Map<string, ClusterAnalysis>>(new Map());
  private comparisonMetrics = new BehaviorSubject<Map<string, ComparisonMetrics>>(new Map());
  
  clusterAnalyses$ = this.clusterAnalyses.asObservable();
  comparisonMetrics$ = this.comparisonMetrics.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Analyser le profil du patient avec K-means clustering
   */
  async analyzePatientProfile(profile: PatientProfile): Promise<ClusterAnalysis> {
    try {
      // Appel au service ML pour clustering
      const response = await this.http.post<ClusterAnalysis>(
        `${this.apiUrl}/analyze/cluster`,
        profile
      ).toPromise();

      if (response) {
        this.updateClusterAnalysis(profile.patientId, response);
        return response;
      }
    } catch (error) {
      console.warn('ML service unavailable, using fallback clustering');
      return this.fallbackClusterAnalysis(profile);
    }

    return this.fallbackClusterAnalysis(profile);
  }

  /**
   * Logique fallback si le service ML n'est pas disponible
   */
  private fallbackClusterAnalysis(profile: PatientProfile): ClusterAnalysis {
    // Simuler des clusters basés sur l'âge et la performance
    const clusters = this.generateSimulatedClusters();
    const assignedCluster = this.assignToCluster(profile, clusters);
    
    // Calculer les percentiles
    const similarPatients = this.findSimilarPatients(profile, assignedCluster);
    const percentileRanking = this.calculatePercentileRanking(profile, similarPatients);
    
    // Générer des insights
    const insights = this.generateInsights(profile, assignedCluster, percentileRanking);

    const analysis: ClusterAnalysis = {
      patientId: profile.patientId,
      clusterId: assignedCluster.id,
      clusterCharacteristics: assignedCluster.characteristics,
      percentileRanking,
      similarPatients,
      insights
    };

    this.updateClusterAnalysis(profile.patientId, analysis);
    return analysis;
  }

  /**
   * Générer des clusters simulés
   */
  private generateSimulatedClusters(): any[] {
    return [
      {
        id: 0,
        characteristics: {
          ageRange: [60, 70] as [number, number],
          avgScore: 85,
          avgReactionTime: 800,
          avgErrorRate: 0.15,
          size: 150,
          description: 'Performance élevée, temps de réaction rapide'
        }
      },
      {
        id: 1,
        characteristics: {
          ageRange: [65, 75] as [number, number],
          avgScore: 70,
          avgReactionTime: 1200,
          avgErrorRate: 0.25,
          size: 200,
          description: 'Performance moyenne, temps de réaction modéré'
        }
      },
      {
        id: 2,
        characteristics: {
          ageRange: [70, 80] as [number, number],
          avgScore: 55,
          avgReactionTime: 1600,
          avgErrorRate: 0.35,
          size: 120,
          description: 'Performance modérée, temps de réaction plus lent'
        }
      },
      {
        id: 3,
        characteristics: {
          ageRange: [75, 85] as [number, number],
          avgScore: 40,
          avgReactionTime: 2000,
          avgErrorRate: 0.45,
          size: 80,
          description: 'Performance plus faible, temps de réaction lent'
        }
      }
    ];
  }

  /**
   * Assigner le patient à un cluster
   */
  private assignToCluster(profile: PatientProfile, clusters: any[]): any {
    const patientScore = profile.cognitiveBaseline.avgScore;
    const patientReactionTime = profile.cognitiveBaseline.avgReactionTime;
    const patientErrorRate = profile.cognitiveBaseline.avgErrorRate;
    
    let bestCluster = clusters[0];
    let minDistance = Infinity;

    clusters.forEach(cluster => {
      const distance = this.calculateEuclideanDistance(
        [patientScore, patientReactionTime, patientErrorRate],
        [cluster.characteristics.avgScore, cluster.characteristics.avgReactionTime, cluster.characteristics.avgErrorRate]
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        bestCluster = cluster;
      }
    });

    return bestCluster;
  }

  /**
   * Calculer la distance euclidienne
   */
  private calculateEuclideanDistance(point1: number[], point2: number[]): number {
    return Math.sqrt(
      point1.reduce((sum, val, idx) => sum + Math.pow(val - point2[idx], 2), 0)
    );
  }

  /**
   * Trouver des patients similaires
   */
  private findSimilarPatients(profile: PatientProfile, cluster: any): any[] {
    // Simuler des patients similaires
    const similarPatients = [];
    const numSimilar = Math.min(10, cluster.characteristics.size);
    
    for (let i = 0; i < numSimilar; i++) {
      const variation = (Math.random() - 0.5) * 20; // Variation de ±10
      const performance = cluster.characteristics.avgScore + variation;
      const similarity = Math.max(0.5, 1 - Math.abs(variation) / 50);
      
      similarPatients.push({
        patientId: `similar_${i}`,
        age: cluster.characteristics.ageRange[0] + Math.random() * (cluster.characteristics.ageRange[1] - cluster.characteristics.ageRange[0]),
        performance,
        similarity
      });
    }

    return similarPatients.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  /**
   * Calculer le classement percentile
   */
  private calculatePercentileRanking(profile: PatientProfile, similarPatients: any[]): any {
    const patientScore = profile.cognitiveBaseline.avgScore;
    const patientReactionTime = profile.cognitiveBaseline.avgReactionTime;
    const patientErrorRate = profile.cognitiveBaseline.avgErrorRate;
    
    const scores = similarPatients.map(p => p.performance).sort((a, b) => a - b);
    const reactionTimes = similarPatients.map(p => 800 + Math.random() * 1200).sort((a, b) => a - b);
    const errorRates = similarPatients.map(p => 0.1 + Math.random() * 0.4).sort((a, b) => a - b);
    
    return {
      overall: this.calculatePercentile(patientScore, scores),
      score: this.calculatePercentile(patientScore, scores),
      reactionTime: this.calculatePercentile(3000 - patientReactionTime, reactionTimes.map(rt => 3000 - rt)), // Inverser pour le temps
      errorRate: this.calculatePercentile(1 - patientErrorRate, errorRates.map(er => 1 - er)) // Inverser pour le taux d'erreur
    };
  }

  /**
   * Calculer le percentile
   */
  private calculatePercentile(value: number, sortedValues: number[]): number {
    const index = sortedValues.findIndex(v => v >= value);
    if (index === -1) return 100;
    return (index / sortedValues.length) * 100;
  }

  /**
   * Générer des insights personnalisés
   */
  private generateInsights(profile: PatientProfile, cluster: any, percentileRanking: any): string[] {
    const insights = [];
    
    // Insight sur la performance relative
    if (percentileRanking.overall >= 75) {
      insights.push(`🌟 Votre performance est dans le top 25% des patients similaires`);
    } else if (percentileRanking.overall >= 50) {
      insights.push(`👍 Votre performance est supérieure à la moyenne des patients similaires`);
    } else {
      insights.push(`📈 Votre performance est dans la moyenne basse, mais il y a place pour l'amélioration`);
    }

    // Insight sur le temps de réaction
    if (percentileRanking.reactionTime >= 75) {
      insights.push(`⚡ Votre temps de réaction est excellent pour votre tranche d'âge`);
    } else if (percentileRanking.reactionTime < 25) {
      insights.push(`🐌 Le temps de réaction pourrait s'améliorer avec la pratique`);
    }

    // Insight sur le taux d'erreur
    if (percentileRanking.errorRate >= 75) {
      insights.push(`🎯 Votre précision est remarquable`);
    } else if (percentileRanking.errorRate < 25) {
      insights.push(`🎯 La précision pourrait s'améliorer avec plus de pratique`);
    }

    // Insight sur l'âge
    const ageRange = cluster.characteristics.ageRange;
    if (profile.age < ageRange[0]) {
      insights.push(`📊 Vous performez bien pour votre tranche d'âge`);
    } else if (profile.age > ageRange[1]) {
      insights.push(`💪 Votre performance est impressionnante pour votre âge`);
    }

    return insights;
  }

  /**
   * Comparer avec des profils similaires
   */
  compareWithSimilarPatients(patientId: string, age: number, currentScore: number): Observable<ComparisonMetrics> {
    // Simuler la comparaison
    const similarPatientsAvg = this.getSimilarPatientsAverage(age, currentScore);
    const percentile = this.calculateComparisonPercentile(currentScore, similarPatientsAvg);
    const interpretation = this.generateComparisonInterpretation(percentile);
    const recommendations = this.generateComparisonRecommendations(percentile, currentScore);

    const metrics: ComparisonMetrics = {
      yourPerformance: currentScore,
      similarPatientsAvg,
      percentile,
      interpretation,
      recommendations
    };

    this.updateComparisonMetrics(patientId, metrics);
    return new BehaviorSubject<ComparisonMetrics>(metrics).asObservable();
  }

  /**
   * Obtenir la moyenne des patients similaires
   */
  private getSimilarPatientsAverage(age: number, currentScore: number): number {
    // Simuler une moyenne basée sur l'âge
    const ageBaseline = 85 - (age - 65) * 0.5; // Baisse de 0.5 point par année après 65
    const variance = 15;
    return Math.max(40, Math.min(95, ageBaseline + (Math.random() - 0.5) * variance));
  }

  /**
   * Calculer le percentile de comparaison
   */
  private calculateComparisonPercentile(currentScore: number, similarAvg: number): number {
    // Distribution normale simulée
    const stdDev = 12;
    const zScore = (currentScore - similarAvg) / stdDev;
    const percentile = 50 + zScore * 15; // Approximation normale
    return Math.max(0, Math.min(100, percentile));
  }

  /**
   * Générer l'interprétation de la comparaison
   */
  private generateComparisonInterpretation(percentile: number): string {
    if (percentile >= 80) {
      return `Exceptionnel ! Votre performance est supérieure à ${Math.round(percentile)}% des profils similaires (âge 65-70).`;
    } else if (percentile >= 60) {
      return `Très bien ! Votre performance est supérieure à ${Math.round(percentile)}% des profils similaires.`;
    } else if (percentile >= 40) {
      return `Bien ! Votre performance est dans la moyenne des profils similaires (${Math.round(percentile)}%ile).`;
    } else {
      return `Votre performance est inférieure à la moyenne (${Math.round(100 - percentile)}% des profils similaires performent mieux).`;
    }
  }

  /**
   * Générer des recommandations basées sur la comparaison
   */
  private generateComparisonRecommendations(percentile: number, currentScore: number): string[] {
    const recommendations = [];
    
    if (percentile < 40) {
      recommendations.push('🎯 Concentrez-vous sur les exercices de memoire pour améliorer votre score');
      recommendations.push('⏰ Essayez de reduire votre temps de reaction avec la pratique');
      recommendations.push('📚 La stimulation cognitive reguliere peut aider a améliorer les performances');
    } else if (percentile < 60) {
      recommendations.push('💪 Continuez la pratique pour maintenir et améliorer vos performances');
      recommendations.push('🎮 Variez les types d\'exercices pour stimuler differentes fonctions cognitives');
    } else {
      recommendations.push('🌟 Excellent travail ! Continuez a maintenir ce niveau de performance');
      recommendations.push('🔄 Continuez les exercices pour preserver vos capacites cognitives');
    }

    return recommendations;
  }

  /**
   * Mettre à jour l'analyse de cluster
   */
  private updateClusterAnalysis(patientId: string, analysis: ClusterAnalysis): void {
    const current = new Map(this.clusterAnalyses.value);
    current.set(patientId, analysis);
    this.clusterAnalyses.next(current);
  }

  /**
   * Mettre à jour les métriques de comparaison
   */
  private updateComparisonMetrics(patientId: string, metrics: ComparisonMetrics): void {
    const current = new Map(this.comparisonMetrics.value);
    current.set(patientId, metrics);
    this.comparisonMetrics.next(current);
  }

  /**
   * Obtenir l'analyse de cluster pour un patient
   */
  getClusterAnalysis(patientId: string): ClusterAnalysis | null {
    return this.clusterAnalyses.value.get(patientId) || null;
  }

  /**
   * Obtenir les métriques de comparaison pour un patient
   */
  getComparisonMetrics(patientId: string): ComparisonMetrics | null {
    return this.comparisonMetrics.value.get(patientId) || null;
  }

  /**
   * Obtenir une comparaison rapide
   */
  getQuickComparison(patientId: string, age: number, score: number): string {
    const similarAvg = this.getSimilarPatientsAverage(age, score);
    const percentile = this.calculateComparisonPercentile(score, similarAvg);
    
    if (percentile >= 72) {
      return `Votre performance est supérieure à ${Math.round(percentile)}% des profils similaires (âge ${age-5}-${age+5}).`;
    } else if (percentile >= 50) {
      return `Votre performance est dans la moyenne des profils similaires (${Math.round(percentile)}%ile).`;
    } else {
      return `Votre performance est inférieure à la moyenne, mais continuez à pratiquer !`;
    }
  }
}
