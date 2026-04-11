import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MlDifficultyResponse, GameDifficulty } from '../../../core/models/game.models';

@Component({
  selector: 'app-difficulty-badge',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="difficulty-panel">
      <h4>🤖 Difficulté recommandée par ML</h4>
      <div class="badge" [class]="badgeClass">
        {{ difficultyLabel }}
      </div>
      <div class="confidence" *ngIf="response">
        Confiance : {{ (response.confidence * 100) | number:'1.0-0' }}%
      </div>
      <div class="proba-bars" *ngIf="response?.probabilities">
        <div class="proba-row" *ngFor="let level of levels">
          <span class="proba-label">{{ level }}</span>
          <div class="proba-track">
            <div class="proba-fill"
                 [style.width.%]="getProba(level) * 100"
                 [class]="'fill-' + level.toLowerCase()">
            </div>
          </div>
          <span class="proba-value">{{ (getProba(level) * 100) | number:'1.0-0' }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .difficulty-panel {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    h4 { 
      margin: 0 0 12px; 
      color: #0369a1; 
      font-size: 0.9rem; 
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 8px;
      transition: all 0.3s ease;
    }
    .easy { background: #d1fae5; color: #065f46; }
    .medium { background: #fef3c7; color: #92400e; }
    .hard { background: #fee2e2; color: #7f1d1d; }
    .confidence { 
      font-size: 0.8rem; 
      color: #64748b; 
      margin-bottom: 12px; 
      font-weight: 500;
    }
    .proba-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .proba-label { 
      width: 60px; 
      font-size: 0.8rem; 
      font-weight: 600; 
      text-transform: uppercase;
    }
    .proba-track {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .proba-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    .fill-easy { background: #10b981; }
    .fill-medium { background: #f59e0b; }
    .fill-hard { background: #ef4444; }
    .proba-value { 
      width: 35px; 
      font-size: 0.75rem; 
      text-align: right; 
      font-weight: 600;
    }
  `]
})
export class DifficultyBadgeComponent {
  @Input() response: MlDifficultyResponse | null = null;
  @Input() current: GameDifficulty = 'EASY';

  levels = ['EASY', 'MEDIUM', 'HARD'];

  get badgeClass(): string {
    return (this.response?.recommendedDifficulty ?? this.current).toLowerCase();
  }

  get difficultyLabel(): string {
    const labels: Record<string, string> = {
      EASY: '🟢 Facile', MEDIUM: '🟡 Moyen', HARD: '🔴 Difficile'
    };
    return labels[this.response?.recommendedDifficulty ?? this.current];
  }

  getProba(level: string): number {
    return this.response?.probabilities?.[level as keyof typeof this.response.probabilities] ?? 0;
  }
}
