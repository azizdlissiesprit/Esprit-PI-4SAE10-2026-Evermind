import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityTrackingService, UserTimeStats } from '../../../core/services/activity-tracking.service';

@Component({
  selector: 'app-time-tracker-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-tracker-widget">
      <div class="tracker-header">
        <h3>⏱️ Temps d'apprentissage</h3>
        <span class="status" [class.active]="isTracking">
          {{ isTracking ? '🟢 En cours' : '⭕ Arrêté' }}
        </span>
      </div>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-item">
          <label>Temps total</label>
          <p class="value">{{ stats.formattedTime }}</p>
        </div>

        <div class="stat-item">
          <label>En minutes</label>
          <p class="value">{{ stats.totalTimeSpentMinutes }} min</p>
        </div>

        <div class="stat-item">
          <label>Nombre de sessions</label>
          <p class="value">{{ stats.sessionCount }}</p>
        </div>

        <div class="stat-item">
          <label>Progression</label>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="stats.estimatedCompletion"></div>
          </div>
          <p class="percentage">{{ stats.estimatedCompletion | number: '1.0-0' }}%</p>
        </div>
      </div>

      <div class="controls">
        <button class="btn btn-primary" (click)="startTracking()" *ngIf="!isTracking">
          ▶️ Démarrer le suivi
        </button>
        <button class="btn btn-danger" (click)="stopTracking()" *ngIf="isTracking">
          ⏹️ Arrêter le suivi
        </button>
        <button class="btn btn-secondary" (click)="refreshStats()">
          🔄 Rafraîchir
        </button>
      </div>

      <div class="last-updated" *ngIf="stats">
        Mis à jour: {{ lastUpdated | date: 'short' }}
      </div>
    </div>
  `,
  styles: [`
    .time-tracker-widget {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 15px;
    }

    .tracker-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .status {
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.2);
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .status.active {
      background: rgba(76, 175, 80, 0.3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
      text-align: center;
    }

    .stat-item label {
      display: block;
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #fff;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      overflow: hidden;
      margin: 8px 0;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #81C784);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .percentage {
      font-size: 12px;
      margin: 0;
      opacity: 0.9;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .btn {
      flex: 1;
      min-width: 100px;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
    }

    .btn-primary:hover {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-danger {
      background: #f44336;
      color: white;
    }

    .btn-danger:hover {
      background: #da190b;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .last-updated {
      text-align: center;
      font-size: 11px;
      opacity: 0.8;
      margin-top: 10px;
    }

    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .controls {
        flex-direction: column;
      }

      .btn {
        min-width: auto;
      }
    }
  `]
})
export class TimeTrackerWidgetComponent implements OnInit, OnDestroy {
  @Input() userId!: number;
  @Input() courseId!: number;

  stats: UserTimeStats | null = null;
  isTracking = false;
  lastUpdated = new Date();
  private destroy$ = new Subject<void>();

  constructor(private activityService: ActivityTrackingService) {}

  ngOnInit(): void {
    this.refreshStats();
    this.activityService.timeStats$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats: UserTimeStats | null) => {
        if (stats) {
          this.stats = stats;
          this.lastUpdated = new Date();
        }
      });
    this.isTracking = this.activityService.isTrackingActive();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startTracking(): void {
    this.activityService.startTracking(this.userId, this.courseId);
    this.isTracking = true;
  }

  stopTracking(): void {
    this.activityService.stopTracking();
    this.isTracking = false;
    this.refreshStats();
  }

  refreshStats(): void {
    this.activityService.getUserTimeStats(this.userId, this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.lastUpdated = new Date();
        },
        error: (err) => {
          console.error('Error fetching stats:', err);
        }
      });
  }
}
