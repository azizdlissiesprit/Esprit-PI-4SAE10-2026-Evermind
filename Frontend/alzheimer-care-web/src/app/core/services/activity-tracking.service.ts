import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';

export interface ActivityPingRequest {
  userId: number;
  courseId: number;
  activityType: string;
  isActive: boolean;
}

export interface UserTimeStats {
  userId: number;
  courseId: number;
  totalTimeSpent: number;
  totalTimeSpentMinutes: number;
  sessionCount: number;
  formattedTime: string;
  estimatedCompletion: number;
}

export interface SessionStats {
  sessionId: number;
  userId: number;
  courseId: number;
  sessionStartTime: string;
  sessionEndTime: string;
  activeTimeInSeconds: number;
  formattedTime: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityTrackingService {
  private readonly API_URL = '/formation/activity';
  private lastActivityTime = new Date();
  private isMonitoring = false;
  private currentUserId: number | null = null;
  private currentCourseId: number | null = null;
  private readonly INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes en ms
  private readonly PING_INTERVAL = 30 * 1000; // 30 secondes

  private timeStatsSubject = new BehaviorSubject<UserTimeStats | null>(null);
  public timeStats$ = this.timeStatsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.setupActivityListeners();
  }

  /**
   * Démarre le tracking d'activité pour un utilisateur et un cours
   */
  startTracking(userId: number, courseId: number): void {
    if (this.isMonitoring && this.currentUserId === userId && this.currentCourseId === courseId) {
      console.log('Tracking already active for this user and course');
      return;
    }

    this.currentUserId = userId;
    this.currentCourseId = courseId;
    this.isMonitoring = true;
    this.lastActivityTime = new Date();

    console.log(`🟢 Tracking started for User ${userId}, Course ${courseId}`);

    // Envoyer un ping initial
    this.sendActivityPing('page_view');

    // Configurer les pings réguliers
    this.startPeriodicPing();
  }

  /**
   * Arrête le tracking d'activité
   */
  stopTracking(): void {
    if (this.isMonitoring && this.currentUserId && this.currentCourseId) {
      this.closeSession();
      this.isMonitoring = false;
      console.log('🔴 Tracking stopped');
    }
  }

  /**
   * Configure les écouteurs d'activité utilisateur
   */
  private setupActivityListeners(): void {
    // Détecter les clics
    document.addEventListener('click', (e: Event) => {
      this.recordActivity('click', e);
    }, { passive: true });

    // Détecter la saisie clavier
    document.addEventListener('keypress', (e: KeyboardEvent) => {
      this.recordActivity('keypress', e);
    }, { passive: true });

    // Détecter le scroll
    document.addEventListener('scroll', (e: Event) => {
      this.recordActivity('scroll', e);
    }, { passive: true });

    // Détecter les mouvements de souris
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.recordActivity('mousemove', e);
    }, { passive: true });

    // Fermer la session avant de quitter la page
    window.addEventListener('beforeunload', () => {
      this.closeSession();
    });

    // Fermer la session si l'onglet est désactivé
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.closeSession();
      } else {
        if (this.currentUserId && this.currentCourseId) {
          this.startTracking(this.currentUserId, this.currentCourseId);
        }
      }
    });
  }

  /**
   * Enregistre une activité utilisateur
   */
  private recordActivity(activityType: string, event: Event): void {
    if (!this.isMonitoring) return;

    this.lastActivityTime = new Date();
  }

  /**
   * Démarre les pings périodiques
   */
  private startPeriodicPing(): void {
    // Utiliser un intervalle personnalisé avec setInterval au lieu de RxJS pour plus de contrôle
    const pingInterval = window.setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(pingInterval);
        return;
      }

      const timeSinceLastActivity = new Date().getTime() - this.lastActivityTime.getTime();

      // Vérifier l'inactivité
      if (timeSinceLastActivity > this.INACTIVITY_THRESHOLD) {
        console.log('⏸️ Inactivity detected, stopping ping');
        clearInterval(pingInterval);
        this.closeSession();
        this.isMonitoring = false;
      } else {
        this.sendActivityPing('ping');
      }
    }, this.PING_INTERVAL);
  }

  /**
   * Envoie un ping d'activité au serveur
   */
  private sendActivityPing(activityType: string): void {
    if (!this.currentUserId || !this.currentCourseId) return;

    const request: ActivityPingRequest = {
      userId: this.currentUserId,
      courseId: this.currentCourseId,
      activityType: activityType,
      isActive: true
    };

    this.http.post<any>(`${this.API_URL}/ping`, request).subscribe({
      next: () => {
        console.log(`📤 Ping sent: ${activityType}`);
      },
      error: (err) => {
        console.error('Error sending ping:', err);
      }
    });
  }

  /**
   * Récupère les statistiques de temps pour un utilisateur et un cours
   */
  getUserTimeStats(userId: number, courseId: number): Observable<UserTimeStats> {
    return this.http.get<UserTimeStats>(`${this.API_URL}/stats/${userId}/${courseId}`);
  }

  /**
   * Récupère toutes les statistiques d'un utilisateur
   */
  getAllUserStats(userId: number): Observable<UserTimeStats[]> {
    return this.http.get<UserTimeStats[]>(`${this.API_URL}/user/${userId}`);
  }

  /**
   * Récupère le classement des meilleurs utilisateurs pour un cours
   */
  getLeaderboard(courseId: number, limit: number = 10): Observable<UserTimeStats[]> {
    return this.http.get<UserTimeStats[]>(`${this.API_URL}/leaderboard/${courseId}?limit=${limit}`);
  }

  /**
   * Récupère toutes les sessions d'un utilisateur pour un cours
   */
  getUserSessions(userId: number, courseId: number): Observable<SessionStats[]> {
    return this.http.get<SessionStats[]>(`${this.API_URL}/sessions/${userId}/${courseId}`);
  }

  /**
   * Récupère le temps estimé restant
   */
  getEstimatedTime(userId: number, courseId: number, totalMinutes: number): Observable<UserTimeStats | null> {
    return this.http.get<any>(`${this.API_URL}/estimated-time/${userId}/${courseId}/${totalMinutes}`);
  }

  /**
   * Ferme la session actuelle
   */
  private closeSession(): void {
    if (!this.currentUserId || !this.currentCourseId) return;

    this.http.post<any>(`${this.API_URL}/close-session/${this.currentUserId}/${this.currentCourseId}`, {})
      .subscribe({
        next: () => {
          console.log('✅ Session closed');
          this.fetchUpdatedStats();
        },
        error: (err) => console.error('Error closing session:', err)
      });
  }

  /**
   * Récupère les statistiques mises à jour
   */
  private fetchUpdatedStats(): void {
    if (this.currentUserId && this.currentCourseId) {
      this.getUserTimeStats(this.currentUserId, this.currentCourseId).subscribe({
        next: (stats) => {
          this.timeStatsSubject.next(stats);
        },
        error: (err) => console.error('Error fetching stats:', err)
      });
    }
  }

  /**
   * Réinitialise les statistiques (admin)
   */
  resetStats(userId: number, courseId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/reset/${userId}/${courseId}`);
  }

  /**
   * Retourne l'état du tracking
   */
  isTrackingActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Retourne le temps écoulé depuis la dernière activité
   */
  getTimeSinceLastActivity(): number {
    return new Date().getTime() - this.lastActivityTime.getTime();
  }
}
