import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, type Notification } from './notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-panel">
      <!-- En-tête avec compteur -->
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-controls">
          <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          <button 
            class="btn-icon" 
            (click)="togglePanel()"
            title="Fermer">
            ✕
          </button>
        </div>
      </div>

      <!-- Zone de notification vide -->
      <div *ngIf="notifications.length === 0" class="empty-state">
        <p>📭 Aucune notification</p>
      </div>

      <!-- Liste des notifications -->
      <div class="notification-list">
        <div 
          *ngFor="let notification of notifications"
          [ngClass]="['notification-item', notification.priority.toLowerCase(), { 'unread': !notification.isRead }]"
          (click)="handleNotificationClick(notification)">
          
          <!-- Indicateur de lecture -->
          <div class="unread-indicator" *ngIf="!notification.isRead"></div>

          <!-- Contenu -->
          <div class="notification-content">
            <div class="notification-top">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <span class="notification-type">{{ notification.notificationType }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <small class="notification-time">{{ formatTime(notification.createdAt) }}</small>
          </div>

          <!-- Actions -->
          <div class="notification-actions">
            <button 
              *ngIf="!notification.isRead"
              class="btn-mark-read"
              (click)="markAsRead(notification, $event)"
              title="Marquer comme lu">
              ✓
            </button>
            <button 
              class="btn-delete"
              (click)="deleteNotification(notification, $event)"
              title="Supprimer">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Footer avec actions -->
      <div class="notification-footer">
        <button 
          *ngIf="unreadCount > 0"
          class="btn-secondary"
          (click)="markAllAsRead()">
          Marquer tout comme lu
        </button>
        <button class="btn-primary" (click)="openPreferences()">
          Préférences
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-panel {
      position: fixed;
      right: 20px;
      top: 80px;
      width: 380px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 600px;
      display: flex;
      flex-direction: column;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .notification-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      background: #ff6b6b;
      color: white;
      border-radius: 50%;
      min-width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .btn-icon {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      padding: 0 8px;
      transition: opacity 0.2s;
    }

    .btn-icon:hover {
      opacity: 0.8;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: #999;
      font-size: 16px;
    }

    .notification-list {
      flex: 1;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background: #fafafa;
    }

    .notification-item.unread {
      background: #f9f9ff;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 4px;
    }

    .notification-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .notification-type {
      font-size: 11px;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      color: #666;
      white-space: nowrap;
    }

    .notification-message {
      margin: 4px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .notification-time {
      color: #999;
      font-size: 12px;
    }

    .notification-item.critical {
      border-left: 4px solid #ff6b6b;
      background: #fff5f5;
    }

    .notification-item.high {
      border-left: 4px solid #ffa500;
    }

    .notification-item.medium {
      border-left: 4px solid #667eea;
    }

    .notification-item.low {
      border-left: 4px solid #ccc;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }

    .btn-mark-read,
    .btn-delete {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      color: #999;
      transition: color 0.2s;
    }

    .btn-mark-read:hover {
      color: #667eea;
    }

    .btn-delete:hover {
      color: #ff6b6b;
    }

    .notification-footer {
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;
    }

    .btn-primary,
    .btn-secondary {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      border: 1px solid #e0e0e0;
    }

    .btn-secondary:hover {
      background: #f0f0f0;
    }

    /* Scrollbar personnalisée */
    .notification-list::-webkit-scrollbar {
      width: 6px;
    }

    .notification-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .notification-list::-webkit-scrollbar-thumb {
      background: #bbb;
      border-radius: 3px;
    }

    .notification-list::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {

  notifications: Notification[] = [];
  unreadCount: number = 0;
  previousUnreadCount: number = 0;
  private destroy$ = new Subject<void>();
  private currentUserId: number = 1; // À remplacer par le vrai ID utilisateur

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // S'abonner aux notifications
    this.notificationService.unreadNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.length;
        
        // Afficher une notification pop-up si de nouvelles notifications arrivent
        if (this.unreadCount > this.previousUnreadCount) {
          this.showNewNotificationAlert();
          this.previousUnreadCount = this.unreadCount;
        }
      });

    // Charger les notifications au démarrage
    this.notificationService.loadUnreadNotifications(this.currentUserId);

    // Charger les préférences
    this.notificationService.getPreferences(this.currentUserId).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Formate le temps d'une notification
   */
  formatTime(date: string): string {
    return this.notificationService.getRelativeTime(date);
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.currentUserId).subscribe();
  }

  /**
   * Supprime une notification
   */
  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id).subscribe();
  }

  /**
   * Gère le clic sur une notification
   */
  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.markAsRead(notification, new Event('click'));
    }
    
    // Naviguer selon le type de notification
    if (notification.actionLink) {
      window.location.href = notification.actionLink;
    }
  }

  /**
   * Bascule l'affichage du panneau
   */
  togglePanel(): void {
    // À implémenter selon votre architecture
    console.log('Fermer le panneau de notifications');
  }

  /**
   * Ouvre les préférences de notification
   */
  openPreferences(): void {
    // À implémenter - ouvrir un modal ou rediriger vers une page
    console.log('Ouvrir les préférences');
  }

  /**
   * Affiche une alerte pour les nouvelles notifications
   */
  private showNewNotificationAlert(): void {
    const latestNotification = this.notifications[0];
    if (latestNotification) {
      console.log('🔔 Nouvelle notification:', latestNotification.title);
      
      // Utiliser Notification API si disponible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EverMind', {
          body: latestNotification.message,
          icon: '/assets/icon-notification.png',
          tag: 'everMind-notification'
        });
      }
    }
  }
}
