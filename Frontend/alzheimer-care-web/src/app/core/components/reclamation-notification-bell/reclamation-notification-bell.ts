import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReclamationNotificationCenterService } from '../../services/reclamation-notification-center.service';
import { getRoleReclamationsRoute } from '../../utils/role-routing';

@Component({
  selector: 'app-reclamation-notification-bell',
  standalone: true,
  imports: [CommonModule, DatePipe, NgStyle, MatButtonModule, MatBadgeModule, MatCardModule],
  templateUrl: './reclamation-notification-bell.html',
  styleUrl: './reclamation-notification-bell.scss'
})
export class ReclamationNotificationBellComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly center = inject(ReclamationNotificationCenterService);
  @ViewChild('triggerButton') private readonly triggerButton?: ElementRef<HTMLButtonElement>;

  @Input() compact = false;
  @Input() adminMode = false;
  panelStyle: Record<string, string> = {};

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.notification-shell')) {
      this.center.close();
    }
  }

  @HostListener('window:resize')
  updatePanelPosition(): void {
    if (!this.center.isOpen()) return;
    this.setPanelPosition();
  }

  togglePanel(event: MouseEvent): void {
    event.stopPropagation();
    this.center.toggle();
    if (this.center.isOpen()) {
      queueMicrotask(() => this.setPanelPosition());
    }
  }

  openNotification(notificationId: number, reclamationId?: number | null): void {
    this.center.markAsRead(notificationId);
    this.center.close();

    if (reclamationId) {
      const route = this.adminMode
        ? getRoleReclamationsRoute('ADMIN', reclamationId)
        : getRoleReclamationsRoute(this.authService.getRole(), reclamationId);
      this.router.navigate([route]);
      return;
    }

    this.router.navigate([
      this.adminMode ? getRoleReclamationsRoute('ADMIN') : getRoleReclamationsRoute(this.authService.getRole())
    ]);
  }

  private setPanelPosition(): void {
    const button = this.triggerButton?.nativeElement;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const panelWidth = Math.min(320, viewportWidth - 32);
    const gap = 12;
    const left = Math.min(Math.max(16, rect.right + gap), viewportWidth - panelWidth - 16);
    const top = Math.max(16, rect.bottom + gap);

    this.panelStyle = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${panelWidth}px`
    };
  }
}
