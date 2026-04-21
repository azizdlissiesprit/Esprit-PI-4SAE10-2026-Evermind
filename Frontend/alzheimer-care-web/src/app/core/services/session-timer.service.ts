import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionTimerService implements OnDestroy {
  private loginTime: number | null = null;
  private timerSubscription: Subscription | null = null;
  
  private elapsedSecondsSource = new BehaviorSubject<number>(0);
  public elapsedSeconds$ = this.elapsedSecondsSource.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initTimer();
    }
  }

  private initTimer() {
    // Try to get existing login time from session (survives refreshes)
    const storedTime = sessionStorage.getItem('session_start_time');
    if (storedTime) {
      this.loginTime = parseInt(storedTime, 10);
      this.startTimer();
    }
  }

  startSession() {
    if (isPlatformBrowser(this.platformId)) {
      this.loginTime = Date.now();
      sessionStorage.setItem('session_start_time', this.loginTime.toString());
      this.startTimer();
    }
  }

  stopSession() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('session_start_time');
      this.loginTime = null;
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      this.elapsedSecondsSource.next(0);
    }
  }

  private startTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.loginTime) {
        const seconds = Math.floor((Date.now() - this.loginTime) / 1000);
        this.elapsedSecondsSource.next(seconds);
      }
    });
  }

  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
