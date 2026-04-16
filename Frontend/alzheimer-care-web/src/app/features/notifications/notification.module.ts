import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { NotificationPanelComponent } from './notification-panel.component';
import { NotificationPreferencesComponent } from './notification-preferences.component';

/**
 * Module pour les notifications intelligentes
 * Importe tous les services et composants de notification
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NotificationPanelComponent,
    NotificationPreferencesComponent
  ],
  providers: [NotificationService],
  exports: [
    NotificationPanelComponent,
    NotificationPreferencesComponent
  ]
})
export class NotificationModule { }
