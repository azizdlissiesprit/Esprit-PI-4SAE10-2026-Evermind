import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <!-- 1. The Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- 2. The Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet> <!-- Pages load here -->
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background-color: var(--bg-main, #F4F7FC);
      transition: background-color 0.3s ease;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {}