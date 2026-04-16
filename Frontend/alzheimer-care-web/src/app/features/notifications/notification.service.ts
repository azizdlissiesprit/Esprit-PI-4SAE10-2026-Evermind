import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * Interface pour une notification
 */
export interface Notification {
  id: number;
  userId: number;
  notificationType: string;
  category: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
  actionLink?: string;
  formationId?: number;
  moduleId?: number;
  quizId?: number;
  active: boolean;
  viewCount: number;
  details?: string;
}

/**
 * Interface pour créer une notification
 */
export interface CreateNotificationRequest {
  userId: number;
  type: string;
  category: string;
  title: string;
  message: string;
  priority?: string;
  formationId?: number;
  moduleId?: number;
  quizId?: number;
  actionLink?: string;
  templateId?: string;
}

/**
 * Interface pour les préférences de notification
 */
export interface NotificationPreference {
  id: number;
  userId: number;
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
  encouragementEnabled: boolean;
  achievementsEnabled: boolean;
  inactivityWarningsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  quietHourStart: number;
  quietHourEnd: number;
  reminderFrequencyHours: number;
  maxNotificationsPerDay: number;
  preferredLanguage: string;
}

/**
 * Service de gestion des notifications
 * Communique avec le backend Formation sur le port 9086
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:9086/formation/notifications';
  
  // BehaviorSubjects pour les observables en temps réel
  private unreadNotificationsSubject = new BehaviorSubject<Notification[]>([]);
  private notificationCountSubject = new BehaviorSubject<number>(0);
  private preferencesSubject = new BehaviorSubject<NotificationPreference | null>(null);

  // Exporters les observables publics
  public unreadNotifications$ = this.unreadNotificationsSubject.asObservable();
  public notificationCount$ = this.notificationCountSubject.asObservable();
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Polling toutes les 30 secondes pour les nouvelles notifications
    interval(30000).subscribe(() => {
      const currentUser = this.getCurrentUserId();
      if (currentUser) {
        this.loadUnreadNotifications(currentUser);
      }
    });
  }

  /**
   * ==================== GESTION DES NOTIFICATIONS ====================
   */

  /**
   * Crée une nouvelle notification
   */
  createNotification(request: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/create`, request);
  }

  /**
   * Récupère toutes les notifications d'un utilisateur
   */
  getUserNotifications(userId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}?page=${page}&size=${size}`);
  }

  /**
   * Récupère les notifications non lues
   */
  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread/${userId}`);
  }

  /**
   * Charge les notifications non lues et met à jour le subject
   */
  loadUnreadNotifications(userId: number): void {
    this.getUnreadNotifications(userId).subscribe({
      next: (notifications) => {
        this.unreadNotificationsSubject.next(notifications);
        this.notificationCountSubject.next(notifications.length);
      },
      error: (error) => console.error('Erreur lors du chargement des notifications', error)
    });
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Récharger les notifications non lues
        const currentUser = this.getCurrentUserId();
        if (currentUser) {
          this.loadUnreadNotifications(currentUser);
        }
      })
    );
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead(userId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/user/${userId}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadNotificationsSubject.next([]);
        this.notificationCountSubject.next(0);
      })
    );
  }

  /**
   * Supprime une notification
   */
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        // Récharger les notifications non lues
        const currentUser = this.getCurrentUserId();
        if (currentUser) {
          this.loadUnreadNotifications(currentUser);
        }
      })
    );
  }

  /**
   * ==================== FILTRAGE ET STATISTIQUES ====================
   */

  /**
   * Récupère les notifications par priorité
   */
  getByPriority(userId: number, priority: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/by-priority/${userId}/${priority}`);
  }

  /**
   * Récupère les notifications par type
   */
  getByType(userId: number, type: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/by-type/${userId}/${type}`);
  }

  /**
   * Récupère les statistiques de notifications
   */
  getStatistics(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/${userId}`);
  }

  /**
   * Récupère le taux d'engagement
   */
  getEngagementRate(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/engagement-rate/${userId}`);
  }

  /**
   * ==================== PRÉFÉRENCES ====================
   */

  /**
   * Crée ou met à jour les préférences
   */
  createPreferences(userId: number, preferences: Partial<NotificationPreference>): Observable<NotificationPreference> {
    return this.http.post<NotificationPreference>(`${this.apiUrl}/preferences/${userId}`, preferences).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs))
    );
  }

  /**
   * Récupère les préférences utilisateur
   */
  getPreferences(userId: number): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(`${this.apiUrl}/preferences/${userId}`).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs))
    );
  }

  /**
   * Met à jour les préférences
   */
  updatePreferences(userId: number, preferences: Partial<NotificationPreference>): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(`${this.apiUrl}/preferences/${userId}`, preferences).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs))
    );
  }

  /**
   * Active/désactive les notifications
   */
  toggleNotifications(userId: number, enabled: boolean): Observable<NotificationPreference> {
    return this.http.patch<NotificationPreference>(
      `${this.apiUrl}/preferences/${userId}/toggle`,
      { enabled }
    ).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs))
    );
  }

  /**
   * Modifie les heures silencieuses
   */
  setQuietHours(userId: number, startHour: number, endHour: number): Observable<NotificationPreference> {
    return this.http.patch<NotificationPreference>(
      `${this.apiUrl}/preferences/${userId}/quiet-hours`,
      { quietHourStart: startHour, quietHourEnd: endHour }
    ).pipe(
      tap((prefs) => this.preferencesSubject.next(prefs))
    );
  }

  /**
   * ==================== NOTIFICATIONS INTELLIGENTES ====================
   */

  /**
   * Génère une notification de rappel d'inactivité
   */
  sendInactivityReminder(userId: number, message?: string): Observable<Notification> {
    const request = {
      userId,
      message: message || 'Il est temps de continuer votre formation!',
      inactivityDays: 3
    };
    return this.http.post<Notification>(`${this.apiUrl}/reminder-inactivity`, request);
  }

  /**
   * Génère une notification d'encouragement
   */
  sendEncouragement(userId: number, message?: string): Observable<Notification> {
    const request = {
      userId,
      message: message || 'Continuez comme ça, vous faites du super progrès!'
    };
    return this.http.post<Notification>(`${this.apiUrl}/encouragement`, request);
  }

  /**
   * Génère une notification de jalon atteint
   */
  sendMilestoneNotification(userId: number, milestone: string): Observable<Notification> {
    const request = {
      userId,
      milestone
    };
    return this.http.post<Notification>(`${this.apiUrl}/milestone`, request);
  }

  /**
   * Nettoyage des notifications expirées
   */
  cleanupExpiredNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cleanup`);
  }

  /**
   * ==================== UTILITAIRES ====================
   */

  /**
   * Obtient l'ID de l'utilisateur actuel
   * À adapter selon votre système d'authentification
   */
  private getCurrentUserId(): number {
    // TODO: Récupérer depuis le service d'authentification
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

  /**
   * Formate la date relative (ex: "il y a 2 heures")
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Obtient la classe CSS pour les couleurs de priorité
   */
  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  }
}
