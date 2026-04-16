import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { NavbarComponent } from '../../components/navbar/navbar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="layout-container">
      <app-navbar></app-navbar>
      <div class="app-container" [class.full-width]="hideSidebar">
        <app-sidebar *ngIf="!hideSidebar"></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-container {
      display: flex;
      width: 100%;
      flex: 1;
      background-color: #F4F7FC;
    }

    .app-container.full-width {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    }
    .app-container.full-width .main-content {
      width: 100%;
      background: transparent;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {
  hideSidebar = false;

  constructor(private router: Router) {
    this.updateSidebarVisibility();
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => this.updateSidebarVisibility());
  }

  private updateSidebarVisibility() {
    this.hideSidebar = this.router.url.includes('/user-interface');
  }
}