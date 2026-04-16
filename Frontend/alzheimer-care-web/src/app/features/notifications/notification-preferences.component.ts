import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationPreference } from './notification.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="preferences-container">
      <div class="preferences-header">
        <h2>⚙️ Préférences de Notifications</h2>
        <button class="btn-close" (click)="closeModal()">×</button>
      </div>

      <div class="preferences-content">
        <!-- Notifications activées/désactivées -->
        <section class="preference-section">
          <h3>Notifications Globales</h3>
          <label class="toggle-label">
            <input 
              type="checkbox" 
              [(ngModel)]="preferences.notificationsEnabled"
              (change)="savePreferences()"
              class="toggle-input">
            <span class="toggle-switch"></span>
            <span>Activer les notifications</span>
          </label>
          <p class="description">Recevez des notifications importantes et des rappels</p>
        </section>

        <!-- Types de notifications -->
        <section class="preference-section" *ngIf="preferences.notificationsEnabled">
          <h3>Types de Notifications</h3>
          
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="preferences.remindersEnabled"
              (change)="savePreferences()"
              class="checkbox-input">
            <span class="checkmark"></span>
            <span>Rappels de formation</span>
          </label>

          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="preferences.encouragementEnabled"
              (change)="savePreferences()"
              class="checkbox-input">
            <span class="checkmark"></span>
            <span>Messages d'encouragement</span>
          </label>

          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="preferences.achievementsEnabled"
              (change)="savePreferences()"
              class="checkbox-input">
            <span class="checkmark"></span>
            <span>Notifications de réalisations</span>
          </label>

          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="preferences.inactivityWarningsEnabled"
              (change)="savePreferences()"
              class="checkbox-input">
            <span class="checkmark"></span>
            <span>Alertes d'inactivité</span>
          </label>

          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="preferences.emailNotificationsEnabled"
              (change)="savePreferences()"
              class="checkbox-input">
            <span class="checkmark"></span>
            <span>Notifications par e-mail</span>
          </label>
        </section>

        <!-- Heures silencieuses -->
        <section class="preference-section" *ngIf="preferences.notificationsEnabled">
          <h3>🌙 Heures Silencieuses</h3>
          <p class="description">Aucune notification ne sera envoyée pendant ces heures</p>
          
          <div class="time-inputs">
            <div class="time-input-group">
              <label>De:</label>
              <input 
                type="number" 
                min="0" 
                max="23" 
                [(ngModel)]="preferences.quietHourStart"
                (change)="savePreferences()"
                class="time-input">
              <span>:00</span>
            </div>
            <span class="to">à</span>
            <div class="time-input-group">
              <label>À:</label>
              <input 
                type="number" 
                min="0" 
                max="23" 
                [(ngModel)]="preferences.quietHourEnd"
                (change)="savePreferences()"
                class="time-input">
              <span>:00</span>
            </div>
          </div>
        </section>

        <!-- Fréquence des rappels -->
        <section class="preference-section" *ngIf="preferences.notificationsEnabled">
          <h3>📅 Fréquence des Rappels</h3>
          <label class="select-label">
            <span>Rappels tous les:</span>
            <select 
              [(ngModel)]="preferences.reminderFrequencyHours"
              (change)="savePreferences()"
              class="select-input">
              <option value="12">12 heures</option>
              <option value="24">24 heures (1 jour)</option>
              <option value="72">72 heures (3 jours)</option>
              <option value="168">168 heures (1 semaine)</option>
            </select>
          </label>
        </section>

        <!-- Quota quotidien -->
        <section class="preference-section" *ngIf="preferences.notificationsEnabled">
          <h3>📊 Quota de Notifications</h3>
          <label class="slider-label">
            <span>Maximum par jour: {{ preferences.maxNotificationsPerDay }}</span>
            <input 
              type="range" 
              min="1" 
              max="50" 
              [(ngModel)]="preferences.maxNotificationsPerDay"
              (change)="savePreferences()"
              class="slider-input">
          </label>
          <p class="description">Limiter le nombre de notifications reçues quotidiennement</p>
        </section>

        <!-- Langue -->
        <section class="preference-section">
          <h3>🌐 Langue</h3>
          <label class="select-label">
            <span>Langue préférée:</span>
            <select 
              [(ngModel)]="preferences.preferredLanguage"
              (change)="savePreferences()"
              class="select-input">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </label>
        </section>

        <!-- Statistiques -->
        <section class="preference-section">
          <h3>📈 Statistiques</h3>
          <button class="btn-stats" (click)="viewStatistics()">
            Voir les statistiques
          </button>
        </section>
      </div>

      <!-- Boutons de footer -->
      <div class="preferences-footer">
        <button class="btn-cancel" (click)="closeModal()">Annuler</button>
        <button class="btn-save" (click)="savePreferences()">Enregistrer</button>
      </div>

      <!-- Message de succès -->
      <div class="success-message" *ngIf="showSuccessMessage">
        ✓ Préférences enregistrées avec succès
      </div>
    </div>
  `,
  styles: [`
    .preferences-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      max-width: 600px;
      margin: 0 auto;
      overflow: hidden;
    }

    .preferences-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .preferences-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      padding: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }

    .preferences-content {
      padding: 24px;
      max-height: 600px;
      overflow-y: auto;
    }

    .preference-section {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .preference-section:last-child {
      border-bottom: none;
    }

    .preference-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .description {
      font-size: 13px;
      color: #999;
      margin: 8px 0 0 0;
    }

    /* Toggle Switch */
    .toggle-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #333;
    }

    .toggle-input {
      display: none;
    }

    .toggle-switch {
      display: inline-block;
      width: 44px;
      height: 24px;
      background: #e0e0e0;
      border-radius: 12px;
      position: relative;
      margin-right: 12px;
      transition: background 0.3s;
    }

    .toggle-input:checked + .toggle-switch {
      background: #667eea;
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: left 0.3s;
    }

    .toggle-input:checked + .toggle-switch::after {
      left: 22px;
    }

    /* Checkbox */
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
    }

    .checkbox-input {
      display: none;
    }

    .checkmark {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      margin-right: 10px;
      transition: all 0.3s;
    }

    .checkbox-input:checked + .checkmark {
      background: #667eea;
      border-color: #667eea;
    }

    .checkbox-input:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    /* Time Inputs */
    .time-inputs {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .time-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .time-input-group label {
      font-size: 13px;
      color: #666;
      font-weight: 500;
    }

    .time-input {
      width: 50px;
      padding: 6px 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;
    }

    .to {
      color: #999;
      font-weight: 500;
    }

    /* Select */
    .select-label {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .select-label span,
    .select-label label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .select-input {
      padding: 8px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    /* Slider */
    .slider-label {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .slider-label span {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .slider-input {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #e0e0e0;
      outline: none;
      -webkit-appearance: none;
    }

    .slider-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
    }

    .slider-input::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: none;
    }

    /* Email Input */
    .email-input {
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      width: 100%;
    }

    /* Buttons */
    .btn-stats {
      width: 100%;
      padding: 10px;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-stats:hover {
      background: #efefef;
    }

    .preferences-footer {
      display: flex;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
    }

    .btn-cancel,
    .btn-save {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: white;
      border: 1px solid #e0e0e0;
      color: #333;
    }

    .btn-cancel:hover {
      background: #f5f5f5;
    }

    .btn-save {
      background: #667eea;
      color: white;
    }

    .btn-save:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }

    .success-message {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .preferences-content::-webkit-scrollbar {
      width: 6px;
    }

    .preferences-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .preferences-content::-webkit-scrollbar-thumb {
      background: #bbb;
      border-radius: 3px;
    }
  `]
})
export class NotificationPreferencesComponent implements OnInit {

  preferences: NotificationPreference = {
    id: 0,
    userId: 1,
    notificationsEnabled: true,
    remindersEnabled: true,
    encouragementEnabled: true,
    achievementsEnabled: true,
    inactivityWarningsEnabled: true,
    emailNotificationsEnabled: false,
    quietHourStart: 22,
    quietHourEnd: 7,
    reminderFrequencyHours: 24,
    maxNotificationsPerDay: 10,
    preferredLanguage: 'fr'
  };

  showSuccessMessage = false;
  private currentUserId: number = 1; // À remplacer par le vrai ID

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Charger les préférences au démarrage
    this.notificationService.getPreferences(this.currentUserId).subscribe({
      next: (prefs) => {
        this.preferences = prefs;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des préférences', error);
        // Créer les préférences par défaut si elles n'existent pas
        this.notificationService.createPreferences(this.currentUserId, this.preferences).subscribe();
      }
    });
  }

  /**
   * Enregistre les préférences
   */
  savePreferences(): void {
    this.notificationService.updatePreferences(this.currentUserId, this.preferences).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement des préférences', error);
      }
    });
  }

  /**
   * Ferme le modal
   */
  closeModal(): void {
    console.log('Fermer les préférences');
  }

  /**
   * Affiche les statistiques
   */
  viewStatistics(): void {
    this.notificationService.getStatistics(this.currentUserId).subscribe({
      next: (stats) => {
        console.log('Statistiques:', stats);
        // À implémenter : afficher les stats dans un modal
      }
    });
  }
}
