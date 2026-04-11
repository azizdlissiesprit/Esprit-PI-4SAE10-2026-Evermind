import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MlDetectionResponse } from '../../../core/models/game.models';

@Component({
  selector: 'app-ml-alert',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div *ngIf="detection && detection.alert" class="ml-alert" [class]="alertClass">
      <div class="alert-icon">
        <span *ngIf="detection.alertLevel === 'WARNING'">⚠️</span>
        <span *ngIf="detection.alertLevel === 'DANGER'">🚨</span>
      </div>
      <div class="alert-content">
        <h4 class="alert-title">{{ alertTitle }}</h4>
        <p class="alert-message">{{ detection.message }}</p>

        <div class="metrics-grid" *ngIf="detection.metrics">
          <div class="metric">
            <span class="label">Score moyen</span>
            <span class="value">{{ detection.metrics.avg_score | number:'1.0-0' }}%</span>
          </div>
          <div class="metric">
            <span class="label">Temps réaction</span>
            <span class="value">{{ detection.metrics.avg_reaction_time | number:'1.0-0' }}ms</span>
          </div>
          <div class="metric">
            <span class="label">Taux erreur</span>
            <span class="value">{{ (detection.metrics.avg_error_rate * 100) | number:'1.0-0' }}%</span>
          </div>
          <div class="metric">
            <span class="label">Tendance</span>
            <span class="value" [class]="trendClass">
              {{ detection.metrics.performance_trend > 0 ? '↑' : '↓' }}
              {{ detection.metrics.performance_trend | number:'1.1-1' }}
            </span>
          </div>
        </div>

        <div class="risk-bar">
          <label>Score de risque ML</label>
          <div class="bar-track">
            <div class="bar-fill"
                 [style.width.%]="(detection.riskScore ?? 0) * 100"
                 [style.background]="riskColor">
            </div>
          </div>
          <span>{{ ((detection.riskScore ?? 0) * 100) | number:'1.0-0' }}%</span>
        </div>
      </div>
    </div>

    <div *ngIf="detection && !detection.alert" class="ml-alert alert-ok">
      <span>✅</span>
      <p>{{ detection.message }}</p>
    </div>
  `,
  styles: [`
    .ml-alert {
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .alert-warning {
      background: #fff8e1;
      border-color: #f59e0b;
      color: #92400e;
    }
    .alert-danger {
      background: #fee2e2;
      border-color: #ef4444;
      color: #7f1d1d;
    }
    .alert-ok {
      background: #ecfdf5;
      border-color: #10b981;
      color: #064e3b;
    }
    .alert-icon { 
      font-size: 2rem; 
      flex-shrink: 0;
    }
    .alert-title { 
      font-weight: 700; 
      margin: 0 0 8px; 
      font-size: 1rem; 
    }
    .alert-message { 
      margin: 0 0 12px; 
      font-size: 0.9rem; 
      line-height: 1.4;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .metric {
      background: rgba(255,255,255,0.6);
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
    }
    .label { 
      font-size: 0.75rem; 
      opacity: 0.7; 
      font-weight: 500;
    }
    .value { 
      font-weight: 700; 
      font-size: 0.9rem; 
    }
    .risk-bar label { 
      font-size: 0.8rem; 
      display: block; 
      margin-bottom: 4px; 
      font-weight: 600;
    }
    .bar-track {
      height: 8px;
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    .trend-up { color: #10b981; }
    .trend-down { color: #ef4444; }
  `]
})
export class MlAlertComponent {
  @Input() detection: MlDetectionResponse | null = null;

  get alertClass(): string {
    if (!this.detection) return '';
    return this.detection.alertLevel === 'DANGER' ? 'alert-danger' : 'alert-warning';
  }

  get alertTitle(): string {
    if (this.detection?.alertLevel === 'DANGER') return 'Baisse significative détectée';
    return 'Légère baisse de performance détectée';
  }

  get riskColor(): string {
    const score = this.detection?.riskScore ?? 0;
    if (score > 0.7) return '#ef4444';
    if (score > 0.4) return '#f59e0b';
    return '#10b981';
  }

  get trendClass(): string {
    return (this.detection?.metrics?.performance_trend ?? 0) >= 0
      ? 'trend-up' : 'trend-down';
  }
}
