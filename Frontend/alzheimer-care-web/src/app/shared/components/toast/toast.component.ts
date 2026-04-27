import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of notificationService.toastsList(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.type" (click)="notificationService.remove(toast.id)">
          <div class="toast-icon">
            @if (toast.type === 'success') { <i class="fa-solid fa-circle-check"></i> }
            @else if (toast.type === 'error') { <i class="fa-solid fa-circle-xmark"></i> }
            @else if (toast.type === 'warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
            @else { <i class="fa-solid fa-circle-info"></i> }
          </div>
          <div class="toast-content">{{ toast.message }}</div>
          <button class="toast-close">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      min-width: 300px;
      max-width: 450px;
      padding: 16px;
      border-radius: 12px;
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      border-left: 6px solid #ccc;
      transition: transform 0.2s;
    }

    .toast-item:hover {
      transform: translateY(-2px);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast-item.success { border-left-color: #10B981; }
    .toast-item.error { border-left-color: #EF4444; }
    .toast-item.warning { border-left-color: #F59E0B; }
    .toast-item.info { border-left-color: #3B82F6; }

    .toast-icon {
      font-size: 1.25rem;
    }

    .toast-item.success .toast-icon { color: #10B981; }
    .toast-item.error .toast-icon { color: #EF4444; }
    .toast-item.warning .toast-icon { color: #F59E0B; }
    .toast-item.info .toast-icon { color: #3B82F6; }

    .toast-content {
      flex: 1;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
