import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar';
import { ThemeService } from '../../../../core/services/theme';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="admin-wrapper">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="top-bar">
          <h2 class="page-title">Back Office</h2>
          
          <div class="actions">
            <!-- NIGHT MODE TOGGLE -->
            <button class="theme-toggle" (click)="themeService.toggleTheme()">
              <i class="fa-solid" [ngClass]="themeService.isDarkMode() ? 'fa-sun' : 'fa-moon'"></i>
            </button>
            <button class="logout-btn">Logout</button>
          </div>
        </header>

        <div class="content-scroll">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./admin-layout.scss']
})
export class AdminLayoutComponent {
  themeService = inject(ThemeService);
}
