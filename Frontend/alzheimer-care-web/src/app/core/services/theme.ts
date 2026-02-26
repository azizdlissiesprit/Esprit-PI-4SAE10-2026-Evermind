import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    this.updateBodyClass();
    
    // Check if browser before saving
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
    }
  }

  private loadTheme() {
    // Check if browser before loading
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode.set(true);
        this.updateBodyClass();
      }
    }
  }

  private updateBodyClass() {
    // Check if browser before accessing 'document'
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode()) {
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
      }
    }
  }
}