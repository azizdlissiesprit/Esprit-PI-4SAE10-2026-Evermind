import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MlDifficultyResponse, MlDetectionResponse } from '../../../core/models/game.models';
import { MlDifficultyService, PerformanceTrend } from '../../../core/services/ml-difficulty.service';
import { EarlyDetectionService, PerformanceEvolution } from '../../../core/services/early-detection.service';
import { PatientComparisonService, ClusterAnalysis, ComparisonMetrics } from '../../../core/services/patient-comparison.service';
import { Observable, combineLatest } from 'rxjs';

@Component({
  selector: 'app-ml-insights',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="ml-insights-container">
      <div class="insights-header">
        <h2>🧠 Intelligence Artificielle Cognitive</h2>
        <p>Analyse avancée de vos performances avec Machine Learning</p>
      </div>

      <!-- ===== ADAPTATION AUTOMATIQUE DE DIFFICULTÉ ===== -->
      <div class="insight-section">
        <h3>🔹 Adaptation Automatique de Difficulté</h3>
        <div class="insight-card">
          <div class="difficulty-adaptation">
            <div class="current-difficulty">
              <span class="label">Difficulté Actuelle:</span>
              <span class="difficulty-badge" [class]="currentDifficulty.toLowerCase()">
                {{ currentDifficulty || 'MEDIUM' }}
              </span>
            </div>
            
            <div class="ml-recommendation" *ngIf="difficultyResponse">
              <h4>🤖 Recommandation ML</h4>
              <p class="recommendation-text">{{ difficultyResponse.recommendedDifficulty }}</p>
              <div class="confidence-bar">
                <span>Confiance: {{ (difficultyResponse.confidence * 100) | number:'1.0-0' }}%</span>
                <div class="confidence-track">
                  <div class="confidence-fill" [style.width.%]="difficultyResponse.confidence * 100"></div>
                </div>
              </div>
              <div class="reasoning" *ngIf="difficultyResponse.reasoning">
                <strong>Raison:</strong> {{ difficultyResponse.reasoning }}
              </div>
            </div>

            <div class="probabilities" *ngIf="difficultyResponse?.probabilities">
              <h5>Probabilités ML:</h5>
              <div class="prob-item" *ngFor="let prob of getProbabilityItems(difficultyResponse?.probabilities || {})">
                <span class="prob-label">{{ prob.level }}</span>
                <div class="prob-bar">
                  <div class="prob-fill" [style.width.%]="prob.value * 100"></div>
                </div>
                <span class="prob-value">{{ (prob.value * 100) | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== DÉTECTION PRÉCOCE ===== -->
      <div class="insight-section">
        <h3>🧠 Détection Précoce via Jeux</h3>
        <div class="insight-card">
          <div class="early-detection">
            <div class="detection-status" [class]="detectionResponse?.alertLevel?.toLowerCase()">
              <div class="status-icon">
                <span *ngIf="detectionResponse?.alertLevel === 'NONE'">✅</span>
                <span *ngIf="detectionResponse?.alertLevel === 'WARNING'">⚠️</span>
                <span *ngIf="detectionResponse?.alertLevel === 'DANGER'">🚨</span>
              </div>
              <div class="status-content">
                <h4>{{ detectionResponse?.message || 'Analyse en cours...' }}</h4>
                <div class="risk-score" *ngIf="detectionResponse">
                  <span>Score de Risque: {{ (detectionResponse.riskScore * 100) | number:'1.0-0' }}%</span>
                  <div class="risk-bar">
                    <div class="risk-fill" [style.width.%]="detectionResponse.riskScore * 100" 
                         [style.background]="getRiskColor(detectionResponse.riskScore)"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="performance-metrics" *ngIf="detectionResponse?.metrics">
              <h5>Métriques de Performance:</h5>
              <div class="metrics-grid">
                <div class="metric">
                  <span class="metric-label">Score Moyen</span>
                  <span class="metric-value">{{ detectionResponse?.metrics?.avg_score | number:'1.0-0' }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Temps Réaction</span>
                  <span class="metric-value">{{ detectionResponse?.metrics?.avg_reaction_time | number:'1.0-0' }}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Taux Erreur</span>
                  <span class="metric-value">{{ ((detectionResponse?.metrics?.avg_error_rate || 0) * 100) | number:'1.0-0' }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Tendance</span>
                  <span class="metric-value" [class]="getTrendClass(detectionResponse?.metrics?.performance_trend || 0)">
                    {{ (detectionResponse?.metrics?.performance_trend || 0) > 0 ? '↑' : '↓' }}
                    {{ detectionResponse?.metrics?.performance_trend | number:'1.1-1' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="evolution-chart" *ngIf="performanceEvolution">
              <h5>Évolution Temporelle</h5>
              <div class="trend-info">
                <span>Direction: {{ performanceEvolution.trend.direction }}</span>
                <span>Significance: {{ (performanceEvolution.trend.significance * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="alerts" *ngIf="performanceEvolution.alerts.length > 0">
                <div class="alert-item" *ngFor="let alert of performanceEvolution.alerts" [class]="alert.severity">
                  <span class="alert-icon">{{ getAlertIcon(alert.type) }}</span>
                  <span class="alert-message">{{ alert.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== COMPARAISON ANONYME ===== -->
      <div class="insight-section">
        <h3>📊 Comparaison Anonyme avec Profil Similaire</h3>
        <div class="insight-card">
          <div class="patient-comparison">
            <div class="cluster-info" *ngIf="clusterAnalysis">
              <h4>🎯 Groupe Similaire</h4>
              <p>{{ clusterAnalysis.clusterCharacteristics.description }}</p>
              <div class="cluster-stats">
                <span>Âge: {{ clusterAnalysis.clusterCharacteristics.ageRange[0] }}-{{ clusterAnalysis.clusterCharacteristics.ageRange[1] }} ans</span>
                <span>Taille: {{ clusterAnalysis.clusterCharacteristics.size }} patients</span>
              </div>
            </div>

            <div class="percentile-ranking" *ngIf="clusterAnalysis?.percentileRanking">
              <h4>📈 Classement Percentile</h4>
              <div class="percentile-grid">
                <div class="percentile-item">
                  <span class="percentile-label">Global</span>
                  <div class="percentile-bar">
                    <div class="percentile-fill" [style.width.%]="clusterAnalysis?.percentileRanking?.overall || 0"></div>
                  </div>
                  <span class="percentile-value">{{ clusterAnalysis?.percentileRanking?.overall | number:'1.0-0' }}%</span>
                </div>
                <div class="percentile-item">
                  <span class="percentile-label">Score</span>
                  <div class="percentile-bar">
                    <div class="percentile-fill" [style.width.%]="clusterAnalysis?.percentileRanking?.score || 0"></div>
                  </div>
                  <span class="percentile-value">{{ clusterAnalysis?.percentileRanking?.score | number:'1.0-0' }}%</span>
                </div>
                <div class="percentile-item">
                  <span class="percentile-label">Temps</span>
                  <div class="percentile-bar">
                    <div class="percentile-fill" [style.width.%]="clusterAnalysis?.percentileRanking?.reactionTime || 0"></div>
                  </div>
                  <span class="percentile-value">{{ clusterAnalysis?.percentileRanking?.reactionTime | number:'1.0-0' }}%</span>
                </div>
                <div class="percentile-item">
                  <span class="percentile-label">Précision</span>
                  <div class="percentile-bar">
                    <div class="percentile-fill" [style.width.%]="clusterAnalysis?.percentileRanking?.errorRate || 0"></div>
                  </div>
                  <span class="percentile-value">{{ clusterAnalysis?.percentileRanking?.errorRate | number:'1.0-0' }}%</span>
                </div>
              </div>
            </div>

            <div class="comparison-metrics" *ngIf="comparisonMetrics">
              <h4>🎯 Performance Relative</h4>
              <div class="comparison-summary">
                <div class="your-performance">
                  <span class="label">Votre Performance:</span>
                  <span class="value">{{ comparisonMetrics.yourPerformance | number:'1.0-0' }}%</span>
                </div>
                <div class="similar-avg">
                  <span class="label">Moyenne Similaire:</span>
                  <span class="value">{{ comparisonMetrics.similarPatientsAvg | number:'1.0-0' }}%</span>
                </div>
                <div class="percentile">
                  <span class="label">Percentile:</span>
                  <span class="value highlight">{{ comparisonMetrics.percentile | number:'1.0-0' }}%</span>
                </div>
              </div>
              
              <div class="interpretation">
                <p>{{ comparisonMetrics.interpretation }}</p>
              </div>

              <div class="recommendations" *ngIf="comparisonMetrics.recommendations.length > 0">
                <h5>💡 Recommandations:</h5>
                <ul>
                  <li *ngFor="let rec of comparisonMetrics.recommendations">{{ rec }}</li>
                </ul>
              </div>
            </div>

            <div class="insights" *ngIf="clusterAnalysis && clusterAnalysis.insights && clusterAnalysis.insights.length > 0">
              <h4>🌟 Insights Personnalisés</h4>
              <ul>
                <li *ngFor="let insight of clusterAnalysis.insights">{{ insight }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ml-insights-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 20px;
    }

    .insights-header {
      text-align: center;
      margin-bottom: 32px;
      
      h2 {
        color: #2c3e50;
        font-size: 2rem;
        margin-bottom: 8px;
      }
      
      p {
        color: #7f8c8d;
        font-size: 1.1rem;
        margin: 0;
      }
    }

    .insight-section {
      margin-bottom: 32px;
      
      h3 {
        color: #34495e;
        font-size: 1.3rem;
        margin-bottom: 16px;
        padding-left: 12px;
        border-left: 4px solid #3498db;
      }
    }

    .insight-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .difficulty-adaptation {
      display: grid;
      gap: 20px;
    }

    .current-difficulty {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .label {
        font-weight: 600;
        color: #555;
      }
    }

    .difficulty-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 700;
      color: white;
      
      &.easy { background: #27ae60; }
      &.medium { background: #f39c12; }
      &.hard { background: #e74c3c; }
    }

    .ml-recommendation {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid #3498db;
      
      h4 {
        margin: 0 0 8px 0;
        color: #2c3e50;
      }
      
      .recommendation-text {
        font-size: 1.1rem;
        font-weight: 600;
        color: #3498db;
        margin-bottom: 12px;
      }
    }

    .confidence-bar, .risk-bar {
      margin: 8px 0;
      
      span {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 4px;
      }
    }

    .confidence-track, .risk-bar {
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2980b9);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .risk-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .reasoning {
      margin-top: 12px;
      font-size: 0.9rem;
      color: #555;
      font-style: italic;
    }

    .probabilities {
      h5 {
        margin: 0 0 12px 0;
        color: #2c3e50;
      }
    }

    .prob-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .prob-label {
        width: 80px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      
      .prob-bar {
        flex: 1;
        height: 6px;
        background: #ecf0f1;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .prob-fill {
        height: 100%;
        background: linear-gradient(90deg, #9b59b6, #8e44ad);
        border-radius: 3px;
        transition: width 0.5s ease;
      }
      
      .prob-value {
        width: 50px;
        text-align: right;
        font-size: 0.8rem;
        font-weight: 600;
      }
    }

    .detection-status {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      
      &.none { background: #d5f4e6; }
      &.warning { background: #fff3cd; }
      &.danger { background: #f8d7da; }
      
      .status-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }
      
      .status-content {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
        }
      }
    }

    .performance-metrics {
      margin-bottom: 20px;
      
      h5 {
        margin: 0 0 12px 0;
        color: #2c3e50;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .metric {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      
      .metric-label {
        display: block;
        font-size: 0.8rem;
        color: #555;
        margin-bottom: 4px;
      }
      
      .metric-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: #2c3e50;
      }
    }

    .trend-up { color: #27ae60; }
    .trend-down { color: #e74c3c; }

    .evolution-chart {
      .trend-info {
        display: flex;
        gap: 20px;
        margin-bottom: 12px;
        font-size: 0.9rem;
      }
    }

    .alerts {
      .alert-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 6px;
        
        &.mild { background: #fff3cd; }
        &.moderate { background: #ffeaa7; }
        &.severe { background: #f8d7da; }
        
        .alert-icon {
          font-size: 1rem;
        }
        
        .alert-message {
          font-size: 0.9rem;
        }
      }
    }

    .cluster-info {
      background: #e8f4fd;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      
      h4 {
        margin: 0 0 8px 0;
        color: #2c3e50;
      }
      
      .cluster-stats {
        display: flex;
        gap: 20px;
        font-size: 0.9rem;
        color: #555;
      }
    }

    .percentile-ranking {
      margin-bottom: 20px;
      
      h4 {
        margin: 0 0 12px 0;
        color: #2c3e50;
      }
    }

    .percentile-grid {
      display: grid;
      gap: 12px;
    }

    .percentile-item {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .percentile-label {
        width: 80px;
        font-size: 0.9rem;
        font-weight: 600;
      }
      
      .percentile-bar {
        flex: 1;
        height: 8px;
        background: #ecf0f1;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .percentile-fill {
        height: 100%;
        background: linear-gradient(90deg, #1abc9c, #16a085);
        border-radius: 4px;
        transition: width 0.5s ease;
      }
      
      .percentile-value {
        width: 50px;
        text-align: right;
        font-size: 0.8rem;
        font-weight: 600;
      }
    }

    .comparison-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
      
      > div {
        text-align: center;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        
        .label {
          display: block;
          font-size: 0.8rem;
          color: #555;
          margin-bottom: 4px;
        }
        
        .value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2c3e50;
          
          &.highlight {
            color: #3498db;
            font-size: 1.4rem;
          }
        }
      }
    }

    .interpretation {
      background: #e8f4fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      
      p {
        margin: 0;
        color: #2c3e50;
        font-weight: 500;
      }
    }

    .recommendations {
      h5 {
        margin: 0 0 8px 0;
        color: #2c3e50;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 6px;
          color: #555;
        }
      }
    }

    .insights {
      h4 {
        margin: 0 0 12px 0;
        color: #2c3e50;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 8px;
          color: #555;
          
          &::marker {
            color: #3498db;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .ml-insights-container {
        padding: 16px;
      }
      
      .metrics-grid,
      .comparison-summary {
        grid-template-columns: 1fr;
      }
      
      .detection-status {
        flex-direction: column;
        text-align: center;
      }
      
      .cluster-stats,
      .trend-info {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class MlInsightsComponent implements OnInit {
  @Input() patientId: string = '';
  @Input() currentDifficulty: string = 'MEDIUM';

  difficultyResponse: MlDifficultyResponse | null = null;
  detectionResponse: MlDetectionResponse | null = null;
  performanceEvolution: PerformanceEvolution | null = null;
  clusterAnalysis: ClusterAnalysis | null = null;
  comparisonMetrics: ComparisonMetrics | null = null;

  constructor(
    private mlDifficultyService: MlDifficultyService,
    private earlyDetectionService: EarlyDetectionService,
    private patientComparisonService: PatientComparisonService
  ) {}

  ngOnInit() {
    this.loadMlInsights();
  }

  loadMlInsights() {
    // Simuler des données ML pour la démo
    this.simulateMlData();
  }

  simulateMlData() {
    // Simuler la réponse de difficulté ML
    setTimeout(() => {
      this.difficultyResponse = {
        recommendedDifficulty: 'MEDIUM',
        probabilities: { EASY: 0.2, MEDIUM: 0.6, HARD: 0.2 },
        confidence: 0.85,
        reasoning: 'Performance stable avec légère amélioration du temps de réaction'
      };
    }, 1000);

    // Simuler la réponse de détection précoce
    setTimeout(() => {
      this.detectionResponse = {
        status: 'NORMAL',
        alert: false,
        alertLevel: 'NONE',
        message: '✅ Performance cognitive dans les normes attendues.',
        riskScore: 0.15,
        metrics: {
          avg_score: 75,
          avg_reaction_time: 850,
          avg_error_rate: 0.18,
          performance_trend: 0.5
        }
      };
    }, 1500);

    // Simuler l'analyse de cluster
    setTimeout(() => {
      this.clusterAnalysis = {
        patientId: this.patientId,
        clusterId: 1,
        clusterCharacteristics: {
          ageRange: [65, 70],
          avgScore: 70,
          avgReactionTime: 1200,
          avgErrorRate: 0.25,
          size: 200,
          description: 'Performance moyenne, temps de réaction modéré'
        },
        percentileRanking: {
          overall: 72,
          score: 68,
          reactionTime: 75,
          errorRate: 80
        },
        similarPatients: [],
        insights: [
          '🌟 Votre performance est dans le top 28% des patients similaires',
          '⚡ Votre temps de réaction est excellent pour votre tranche d\'âge',
          '🎯 Votre précision est remarquable',
          '💪 Votre performance est impressionnante pour votre âge'
        ]
      };
    }, 2000);

    // Simuler les métriques de comparaison
    setTimeout(() => {
      this.comparisonMetrics = {
        yourPerformance: 75,
        similarPatientsAvg: 68,
        percentile: 72,
        interpretation: 'Exceptionnel ! Votre performance est supérieure à 72% des profils similaires (âge 65-70).',
        recommendations: [
          '🌟 Excellent travail ! Continuez à maintenir ce niveau de performance',
          '🔄 Continuez les exercices pour preserver vos capacites cognitives'
        ]
      };
    }, 2500);
  }

  getProbabilityItems(probabilities: any) {
    return Object.entries(probabilities).map(([level, value]) => ({
      level,
      value: value as number
    }));
  }

  getRiskColor(riskScore: number): string {
    if (riskScore < 0.3) return '#27ae60';
    if (riskScore < 0.7) return '#f39c12';
    return '#e74c3c';
  }

  getTrendClass(trend: number): string {
    return trend >= 0 ? 'trend-up' : 'trend-down';
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'reaction_time': return '⏰';
      case 'error_rate': return '🎯';
      case 'score_decline': return '📉';
      default: return '⚠️';
    }
  }
}
