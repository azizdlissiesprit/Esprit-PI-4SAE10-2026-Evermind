import { Injectable } from '@angular/core';
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
  closing?: boolean; // Added for animation
  closed?: boolean; // Added for cleanup
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new Subject<NotificationMessage>();
  private currentNotifications: NotificationMessage[] = [];

  constructor() {}

  // Send notification
  show(notification: Omit<NotificationMessage, 'id' | 'timestamp'>) {
    const fullNotification: NotificationMessage = {
      id: this.generateId(),
      timestamp: new Date(),
      autoClose: true,
      duration: 5000,
      ...notification
    };

    this.notifications$.next(fullNotification);
    this.currentNotifications.push(fullNotification);

    // Auto close if specified
    if (fullNotification.autoClose) {
      timer(fullNotification.duration || 5000).subscribe(() => {
        this.close(fullNotification.id);
      });
    }
  }

  // Convenience methods
  success(title: string, message: string, options?: Partial<NotificationMessage>) {
    this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<NotificationMessage>) {
    this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<NotificationMessage>) {
    this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<NotificationMessage>) {
    this.show({
      type: 'error',
      title,
      message,
      autoClose: false, // Errors don't auto-close
      ...options
    });
  }

  // Close specific notification
  close(id: string) {
    this.currentNotifications = this.currentNotifications.filter(n => n.id !== id);
    this.notifications$.next({ ...this.currentNotifications.find(n => n.id)!, closed: true } as any);
  }

  // Close all notifications
  closeAll() {
    this.currentNotifications.forEach(n => this.close(n.id));
  }

  // Get notification stream
  getNotifications(): Observable<NotificationMessage> {
    return this.notifications$.asObservable();
  }

  // Get current notifications
  getCurrentNotifications(): NotificationMessage[] {
    return [...this.currentNotifications];
  }

  // Generate unique ID
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Score change notification
  notifyScoreChange(oldMmse: number, newMmse: number, oldMoca: number, newMoca: number, evaluator?: string) {
    const mmseChange = newMmse - oldMmse;
    const mocaChange = newMoca - oldMoca;
    
    if (mmseChange !== 0 || mocaChange !== 0) {
      const changeType = (mmseChange > 0 || mocaChange > 0) ? 'success' : 'warning';
      const changeText = this.getChangeText(mmseChange, mocaChange);
      
      this.show({
        type: changeType,
        title: 'Scores mis à jour',
        message: `Nouveaux scores: MMSE ${newMmse}/30, MoCA ${newMoca}/30 ${changeText}`,
        autoClose: true,
        duration: 8000
      });
    }
  }

  private getChangeText(mmseChange: number, mocaChange: number): string {
    const changes = [];
    if (mmseChange !== 0) {
      changes.push(`MMSE ${mmseChange > 0 ? '+' : ''}${mmseChange}`);
    }
    if (mocaChange !== 0) {
      changes.push(`MoCA ${mocaChange > 0 ? '+' : ''}${mocaChange}`);
    }
    return changes.length > 0 ? `(${changes.join(', ')})` : '';
  }
}
