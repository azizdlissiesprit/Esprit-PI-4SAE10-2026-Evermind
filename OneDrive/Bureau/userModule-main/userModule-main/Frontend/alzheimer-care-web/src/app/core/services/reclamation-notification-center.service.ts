import { Inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReclamationNotification } from '../models/reclamation.model';
import { ReclamationService } from './reclamation.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReclamationNotificationCenterService {
  private readonly isBrowser: boolean;
  private pollHandle: number | null = null;
  private audioUnlocked = false;
  private audioContext: AudioContext | null = null;
  private knownNotificationIds = new Set<number>();

  readonly notifications = signal<ReclamationNotification[]>([]);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);

  constructor(
    private readonly reclamationService: ReclamationService,
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.installAudioUnlock();
    }
  }

  start(): void {
    if (!this.isBrowser || this.pollHandle !== null || !this.authService.isLoggedIn()) return;

    this.refresh();
    this.pollHandle = window.setInterval(() => this.refresh(), 8000);
  }

  stop(): void {
    if (this.pollHandle !== null) {
      window.clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  toggle(): void {
    this.isOpen.update((value) => !value);
  }

  close(): void {
    this.isOpen.set(false);
  }

  refresh(): void {
    if (!this.isBrowser || !this.authService.isLoggedIn()) return;

    this.isLoading.set(true);
    this.error.set('');

    const role = (this.authService.getRole() || '').toString().toUpperCase();
    const request$ =
      role === 'ADMIN' || role === 'ROLE_ADMIN'
        ? this.reclamationService.getAdminNotifications()
        : this.reclamationService.getMyNotifications();

    request$.subscribe({
      next: (notifications) => {
        this.isLoading.set(false);
        this.handleIncomingNotifications(notifications);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Notifications indisponibles.');
      }
    });
  }

  markAsRead(notificationId: number): void {
    this.reclamationService.markNotificationAsRead(notificationId).subscribe({
      next: (updated) => {
        this.notifications.update((items) =>
          items.map((item) => (item.notificationId === updated.notificationId ? updated : item))
        );
      }
    });
  }

  private handleIncomingNotifications(notifications: ReclamationNotification[]): void {
    const hadAnyBefore = this.knownNotificationIds.size > 0;
    const incomingIds = new Set(notifications.map((item) => item.notificationId));
    const hasNewNotification = notifications.some((item) => !this.knownNotificationIds.has(item.notificationId));

    this.notifications.set(notifications);
    this.knownNotificationIds = incomingIds;

    if (hadAnyBefore && hasNewNotification) {
      this.playNotificationSound();
    }
  }

  private installAudioUnlock(): void {
    const unlock = () => {
      this.audioUnlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  private playNotificationSound(): void {
    if (!this.audioUnlocked || !this.isBrowser) return;

    try {
      const AudioContextCtor =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) return;

      this.audioContext ??= new AudioContextCtor();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.35);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.36);
    } catch {
      // Best-effort cue only.
    }
  }
}
