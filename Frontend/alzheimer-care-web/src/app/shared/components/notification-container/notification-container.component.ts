import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationMessage, NotificationService } from '../../../core/services/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { IconifyIconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, IconifyIconComponent],
  template: `
    <div class="notification-container" *ngIf="notifications.length > 0">
      <div 
        *ngFor="let notification of notifications" 
        class="notification"
        [class]="'notification-' + notification.type"
        [class.notification-closing]="notification.closing"
        (click)="closeNotification(notification.id)"
      >
        <div class="notification-content">
          <div class="notification-header">
            <iconify-icon 
              [icon]="getIcon(notification.type)" 
              class="notification-icon"
              [class]="'icon-' + notification.type"
              style="font-size: 20px"
            ></iconify-icon>
            <span class="notification-title">{{ notification.title }}</span>
            <button class="notification-close" (click)="closeNotification(notification.id)">
              <iconify-icon icon="lucide:x" style="font-size: 16px"></iconify-icon>
            </button>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ notification.timestamp | date:'HH:mm:ss' }}</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./notification-container.scss']
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        if (notification.closed) {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
        } else {
          this.notifications.push(notification);
          // Remove after animation
          setTimeout(() => {
            notification.closing = true;
            setTimeout(() => {
              this.notifications = this.notifications.filter(n => n.id !== notification.id);
            }, 300);
          }, (notification.duration || 5000) - 300);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeNotification(id: string) {
    this.notificationService.close(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'lucide:check-circle';
      case 'warning': return 'lucide:alert-triangle';
      case 'error': return 'lucide:x-circle';
      case 'info': return 'lucide:info';
      default: return 'lucide:info';
    }
  }
}
