import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityTrackingService, UserTimeStats, SessionStats } from '../../../core/services/activity-tracking.service';

@Component({
  selector: 'app-learning-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="learning-dashboard">
      <div class="dashboard-header">
        <h2>📊 Tableau de bord d'apprentissage</h2>
      </div>

      <!-- Section Statistiques globales -->
      <div class="section">
        <h3>📈 Vos statistiques</h3>
        <div class="stats-container" *ngIf="stats">
          <div class="stat-card">
            <div class="icon">⏱️</div>
            <div class="stat-content">
              <h4>Temps total</h4>
              <p class="large">{{ stats.formattedTime }}</p>
              <p class="small">{{ stats.totalTimeSpentMinutes }} minutes</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon">📚</div>
            <div class="stat-content">
              <h4>Nombre de sessions</h4>
              <p class="large">{{ stats.sessionCount }}</p>
              <p class="small">sessions complétées</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon">🎯</div>
            <div class="stat-content">
              <h4>Progression estimée</h4>
              <p class="large">{{ stats.estimatedCompletion | number: '1.0-0' }}%</p>
              <p class="small">du parcours</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon">⏰</div>
            <div class="stat-content">
              <h4>Temps estimé restant</h4>
              <p class="large">{{ (estimatedRemaining | async)?.formattedTime }}</p>
              <p class="small">pour compléter</p>
            </div>
          </div>
        </div>

        <div class="no-data" *ngIf="!stats">
          <p>Aucune donnée disponible. Commencez une session d'apprentissage!</p>
        </div>
      </div>

      <!-- Section Historique des sessions -->
      <div class="section">
        <h3>📋 Historique de vos sessions</h3>
        <div class="sessions-table" *ngIf="sessions && sessions.length > 0">
          <table>
            <thead>
              <tr>
                <th>Début de session</th>
                <th>Fin de session</th>
                <th>Temps actif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let session of sessions">
                <td>{{ session.sessionStartTime | date: 'short' }}</td>
                <td>{{ session.sessionEndTime ? (session.sessionEndTime | date: 'short') : '-' }}</td>
                <td>{{ session.formattedTime }}</td>
                <td>
                  <span class="status" [class.active]="session.isActive">
                    {{ session.isActive ? '🟢 En cours' : '✅ Complétée' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="no-data" *ngIf="!sessions || sessions.length === 0">
          <p>Aucune session enregistrée pour ce cours.</p>
        </div>
      </div>

      <!-- Section Leaderboard (Bonus) -->
      <div class="section" *ngIf="leaderboard">
        <h3>🏆 Classement des apprenants</h3>
        <div class="leaderboard-container">
          <div class="leaderboard-item" *ngFor="let user of leaderboard; let i = index">
            <div class="rank" [class.first]="i === 0" [class.second]="i === 1" [class.third]="i === 2">
              {{ i + 1 }}
            </div>
            <div class="user-stats">
              <p class="time">{{ user.formattedTime }}</p>
              <p class="sessions">{{ user.sessionCount }} sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .learning-dashboard {
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .dashboard-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .dashboard-header h2 {
      margin: 0;
      color: #333;
      font-size: 28px;
    }

    .section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .section h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
      font-size: 18px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    /* Stats Container */
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      display: flex;
      gap: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .icon {
      font-size: 32px;
      min-width: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }

    .large {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .small {
      margin: 4px 0 0 0;
      font-size: 12px;
      opacity: 0.8;
    }

    /* Sessions Table */
    .sessions-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #ddd;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      color: #666;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      background: #fff3cd;
      color: #856404;
      font-size: 12px;
      font-weight: 600;
    }

    .status.active {
      background: #d4edda;
      color: #155724;
    }

    /* Leaderboard */
    .leaderboard-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .rank {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #ddd;
      border-radius: 50%;
      font-weight: 700;
      margin-right: 12px;
      color: #666;
    }

    .rank.first {
      background: #FFD700;
      color: #333;
      font-size: 18px;
    }

    .rank.second {
      background: #C0C0C0;
      color: #333;
    }

    .rank.third {
      background: #CD7F32;
      color: white;
    }

    .user-stats {
      text-align: left;
    }

    .user-stats .time {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .user-stats .sessions {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .no-data {
      text-align: center;
      padding: 30px;
      color: #999;
      background: #f9f9f9;
      border-radius: 6px;
    }

    @media (max-width: 768px) {
      .learning-dashboard {
        padding: 16px;
      }

      .stats-container {
        grid-template-columns: 1fr;
      }

      table {
        font-size: 12px;
      }

      th, td {
        padding: 8px;
      }
    }
  `]
})
export class LearningDashboardComponent implements OnInit, OnDestroy {
  @Input() userId!: number;
  @Input() courseId!: number;

  stats: UserTimeStats | null = null;
  sessions: SessionStats[] = [];
  leaderboard: UserTimeStats[] = [];
  estimatedRemaining: Observable<UserTimeStats | null> | null = null;
  private destroy$ = new Subject<void>();

  constructor(private activityService: ActivityTrackingService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // Charger les statistiques
    this.activityService.getUserTimeStats(this.userId, this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: UserTimeStats) => {
          this.stats = stats;
        },
        error: (err: any) => console.error('Error loading stats:', err)
      });

    // Charger les sessions
    this.activityService.getUserSessions(this.userId, this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions: SessionStats[]) => {
          this.sessions = sessions;
        },
        error: (err: any) => console.error('Error loading sessions:', err)
      });

    // Charger le leaderboard
    this.activityService.getLeaderboard(this.courseId, 5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (leaderboard: any[]) => {
          this.leaderboard = leaderboard;
        },
        error: (err: any) => console.error('Error loading leaderboard:', err)
      });

    // Charger le temps estimé restant (100 minutes par cours)
    this.estimatedRemaining = this.activityService.getEstimatedTime(this.userId, this.courseId, 100);
  }
}
