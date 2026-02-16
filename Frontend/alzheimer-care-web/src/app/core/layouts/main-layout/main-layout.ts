import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar'; // Import sidebar

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent], // Add Sidebar here
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
      display: flex; /* Or Grid */
      width: 100%;
      min-height: 100vh;
      background-color: #F4F7FC;
    }

    .main-content {
      flex: 1; /* Takes remaining space */
      /* No padding here because your page components have their own container/padding */
      overflow-y: auto;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {}