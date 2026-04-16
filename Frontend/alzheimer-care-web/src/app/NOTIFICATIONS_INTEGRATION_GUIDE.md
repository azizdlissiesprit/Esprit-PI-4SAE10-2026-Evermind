/**
 * Guide d'intégration du système de notifications intelligent
 * 
 * Ce fichier montre comment intégrer les composants de notification
 * dans n'importe quel composant Angular de votre application EverMind.
 */

// 1. IMPORTER LES COMPOSANTS DANS APP.COMPONENT.TS
// ================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NotificationPanelComponent } from './features/notifications/notification-panel.component';
import { NotificationPreferencesComponent } from './features/notifications/notification-preferences.component';
import { NotificationService } from './features/notifications/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NotificationPanelComponent,
    NotificationPreferencesComponent
  ],
  providers: [NotificationService],
  template: `
    <div class="app-container">
      <!-- Le reste de votre application -->
      <main class="app-main">
        <!-- Votre contenu ici -->
      </main>

      <!-- Ajoutez le composant de panel des notifications -->
      <app-notification-panel 
        class="notifications-widget">
      </app-notification-panel>

      <!-- Composant de préférences (optionnel, peut être in une modal) -->
      <!-- <app-notification-preferences 
        *ngIf="showPreferencesModal"
        (closed)="showPreferencesModal = false">
      </app-notification-preferences> -->
    </div>
  `,
  styles: [`
    .app-container {
      position: relative;
      min-height: 100vh;
    }

    .app-main {
      flex: 1;
    }

    .notifications-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
  `]
})
export class AppComponent {
  title = 'EverMind - Système de Notifications';
  showPreferencesModal = false;

  constructor(private notificationService: NotificationService) {
    // Initialiser le service avec l'ID utilisateur actuel
    const userId = this.getCurrentUserId(); // Récupérer depuis auth service
    this.notificationService.initializeUserNotifications(userId);
  }

  getCurrentUserId(): number {
    // TODO: Récupérer l'ID utilisateur depuis votre service d'authentification
    return 1; // Placeholder
  }

  openPreferences(): void {
    this.showPreferencesModal = true;
  }

  closePreferences(): void {
    this.showPreferencesModal = false;
  }
}

// 2. UTILISER LE SERVICE DANS VOS COMPOSANTS
// =============================================

/*
 * Dans n'importe quel composant:
 */

import { Component, OnInit } from '@angular/core';
import { NotificationService, CreateNotificationRequest } from './features/notifications/notification.service';

@Component({
  selector: 'app-formation-detail',
  template: `...`
})
export class FormationDetailComponent implements OnInit {
  
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Observer les notifications non lues
    this.notificationService.unreadNotifications$.subscribe(notifications => {
      console.log('Notifications non lues:', notifications);
    });

    // Observer le nombre de notifications
    this.notificationService.notificationCount$.subscribe(count => {
      console.log('Nombre de notifications non lues:', count);
    });
  }

  // Envoyer une notification lors de la complétion d'une formation
  completedFormation(formationId: number): void {
    const notificationRequest: CreateNotificationRequest = {
      userId: this.getCurrentUserId(),
      type: 'ACHIEVEMENT', // ou 'ENCOURAGEMENT', 'REMINDER', etc.
      category: 'FORMATION',
      title: 'Formation Complétée! 🎉',
      message: 'Vous avez complété la formation avec succès.',
      priority: 'HIGH',
      formationId: formationId,
      actionLink: `/formations/${formationId}`
    };

    this.notificationService.createNotification(notificationRequest).subscribe({
      next: (notification) => {
        console.log('Notification créée:', notification);
      },
      error: (error) => {
        console.error('Erreur lors de la création de notification:', error);
      }
    });
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => console.log('Notification marquée comme lue'),
      error: (error) => console.error('Erreur:', error)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => console.log('Toutes les notifications marquées comme lues'),
      error: (error) => console.error('Erreur:', error)
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => console.log('Notification supprimée'),
      error: (error) => console.error('Erreur:', error)
    });
  }

  // Générer une notification de rappel d'inactivité
  checkInactivityAndNotify(): void {
    const userId = this.getCurrentUserId();
    
    this.notificationService.sendInactivityReminder(userId).subscribe({
      next: (notification: any) => {
        if (notification) {
          console.log('Notification d\'inactivité générée');
        }
      },
      error: (error: any) => console.error('Erreur:', error)
    });
  }

  // Générer une notification de courage/encouragement
  generateEncouragement(): void {
    const userId = this.getCurrentUserId();
    const encouragementRequest = {
      userId: userId,
      message: 'Continuez comme ça, vous êtes sur la bonne voie!'
    };

    this.notificationService.sendEncouragement(userId, encouragementRequest.message).subscribe({
      next: (notification: any) => {
        console.log('Notification d\'encouragement générée:', notification);
      },
      error: (error: any) => console.error('Erreur:', error)
    });
  }

  private getCurrentUserId(): number {
    // TODO: Récupérer depuis auth service
    return 1;
  }
}

// 3. CONFIGURER CORS DANS LE FICHIER proxy.conf.json
// ====================================================

/*
 * Dans src/proxy.conf.json, assurez-vous d'ajouter:
 */

export const proxyConfig = {
  "/formation": {
    "target": "http://localhost:9086",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/formation": "/formation"
    },
    "logLevel": "debug"
  }
};

// 4. LANCER LE FRONTEND AVEC LE PROXY
// ====================================

/*
 * Dans le terminal, lancez:
 * npm start -- --port 4201 --proxy-config proxy.conf.json
 */

// 5. APPELS API DISPONIBLES
// ==========================

/*
 * Service de Notification - Méthodes disponibles:
 * 
 * ✅ createNotification(request: CreateNotificationRequest)
 * ✅ createDetailedNotification(details: any)
 * ✅ getUserNotifications(userId: number, page?: number)
 * ✅ getUnreadNotifications(userId: number)
 * ✅ markAsRead(notificationId: number)
 * ✅ markAllAsRead()
 * ✅ deleteNotification(notificationId: number)
 * ✅ getStats(userId: number)
 * ✅ getEngagementRate(userId: number)
 * ✅ generateInactivityReminder(userId: number)
 * ✅ generateEncouragementNotification(params: any)
 * ✅ generateMilestoneNotification(params: any)
 * ✅ getPreferences(userId: number)
 * ✅ updatePreferences(userId: number, prefs: any)
 * ✅ toggleEmailNotifications(userId: number)
 * ✅ setQuietHours(userId: number, start: number, end: number)
 * ✅ setReminderFrequency(userId: number, hours: number)
 */

// 6. EXEMPLE COMPLET D'UTILISATION DANS UNE PAGE
// ================================================

/*
 * formation.component.ts
 */

// export class FormationComponent implements OnInit {
//   formations$ = new Observable();
//   unreadCount$ = new Observable();
//   selectedFormation: any;

//   constructor(
//     private notificationService: NotificationService,
//     private formationService: FormationService
//   ) {
//     this.unreadCount$ = this.notificationService.notificationCount$;
//   }

//   ngOnInit(): void {
//     this.formations$ = this.formationService.getFormations();
//   }

//   selectFormation(formation: any): void {
//     this.selectedFormation = formation;
    
//     // Envoyer une notification de vue
//     this.notificationService.createNotification({
//       userId: this.getCurrentUserId(),
//       type: 'PROGRESS_UPDATE',
//       category: 'FORMATION',
//       title: `Voir: ${formation.title}`,
//       message: `Vous consultez une nouvelle formation`,
//       formationId: formation.id
//     }).subscribe();
//   }

//   completeFormation(): void {
//     this.selectedFormation.completed = true;
    
//     // Créer une notification de réussite
//     this.notificationService.createNotification({
//       userId: this.getCurrentUserId(),
//       type: 'ACHIEVEMENT',
//       category: 'FORMATION',
//       title: 'Formation Complétée! 🎉',
//       message: `Bravo! Vous avez complété "${this.selectedFormation.title}"`,
//       priority: 'HIGH',
//       formationId: this.selectedFormation.id,
//       actionLink: `/formations/${this.selectedFormation.id}/certificate`
//     }).subscribe();
//   }
// }

// 7. STYLESHEET POUR LES NOTIFICATIONS
// =======================================

/*
 * src/app/features/notifications/notification.styles.css
 */

export const notificationStyles = `
  .notification-panel {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .notification-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    border-radius: 8px 8px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .notification-item {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }

  .notification-item:hover {
    background-color: #f5f5f5;
  }

  .notification-item.unread {
    background-color: #f0f4ff;
    border-left: 4px solid #667eea;
  }

  .notification-priority-HIGH {
    border-left: 4px solid #ff6b6b;
  }

  .notification-priority-CRITICAL {
    border-left: 4px solid #d62828;
    background-color: #fff5f5;
  }

  .badge {
    background-color: #ff6b6b;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: bold;
  }
`;
