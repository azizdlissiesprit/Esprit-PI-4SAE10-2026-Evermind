import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { ThemeService } from '../../../../core/services/theme';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay mobile -->
    <div *ngIf="mobileOpen" class="sidebar-overlay" (click)="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" [class.open]="mobileOpen">
      <a routerLink="/admin" class="sidebar-brand" (click)="mobileOpen = false">
        <div class="sidebar-brand-icon">
          <i class="bi bi-heart-pulse"></i>
        </div>
        <div class="sidebar-brand-text">
          Gestion Stock
          <small>Gestion StockSub</small>
        </div>
      </a>

      <nav class="sidebar-nav">
        <div class="sidebar-nav-label">sidebar.principal</div>

        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-grid-1x2-fill"></i>
          Tableau de Bord
        </a>

        <div class="sidebar-nav-label">sidebar.gestion</div>

        <a routerLink="/admin/stock/categories" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-tags-fill"></i>
          Catégories
        </a>

        <a routerLink="/admin/stock/produits" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-box-seam-fill"></i>
          Produits
        </a>

        <a routerLink="/admin/stock/commandes" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-receipt-cutoff"></i>
          Commandes
        </a>

        <div class="sidebar-nav-label">Analyse</div>

        <a routerLink="/admin/analyse-stock" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-graph-up"></i>
          Analyse de Stock
        </a>

        <div class="sidebar-nav-label">sidebar.actionsRapides</div>

        <a routerLink="/admin/stock/categories/ajouter" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-plus-circle"></i>
          sidebar.nouvelleCat
        </a>

        <a routerLink="/admin/stock/produits/ajouter" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-plus-circle"></i>
          sidebar.nouveauProd
        </a>
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/" class="sidebar-footer-site-link">
          <i class="bi bi-box-arrow-up-right"></i>
          <span>sidebar.voirSite</span>
        </a>
        <div class="sidebar-footer-info">
          <i class="bi bi-database-fill"></i>
          <span>sidebar.tech</span>
        </div>
      </div>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <button class="topbar-toggle" (click)="mobileOpen = !mobileOpen">
          <i class="bi bi-list"></i>
        </button>
        <nav class="breadcrumb-nav">
          <a routerLink="/admin">breadcrumb.accueil</a>
          <span *ngIf="currentPage" class="separator">/</span>
          <span *ngIf="currentPage" class="current">{{ currentPage }}</span>
        </nav>
      </div>
      <div class="topbar-right">
        <!-- Language Toggle -->
        <div class="lang-toggle lang-toggle-bo">
          <!-- NO LANG TOGGLE -->
        </div>
        <button class="theme-toggle" (click)="th.toggleTheme()" [attr.title]="th.isDarkMode() ? 'Light Mode' : 'Dark Mode'">
          <i class="bi" [class.bi-moon-fill]="!th.isDarkMode()" [class.bi-sun-fill]="th.isDarkMode()"></i>
        </button>
        <span class="topbar-clock">
          <i class="bi bi-clock me-1"></i>{{ currentTime }}
        </span>
      </div>
    </header>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  mobileOpen = false;
  currentPage = '';
  currentTime = '';
  private routerSub!: Subscription;
  private timerInterval: any;

  constructor(private router: Router, public th: ThemeService) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateBreadcrumb(e.urlAfterRedirects || e.url));

    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 60000);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private updateBreadcrumb(url: string): void {
    const map: Record<string, string> = {
      '/admin': '',
      '/admin/stock/categories': 'breadcrumb.categories',
      '/admin/stock/categories/ajouter': 'breadcrumb.nouvelleCat',
      '/admin/stock/produits': 'breadcrumb.produits',
      '/admin/stock/produits/ajouter': 'breadcrumb.nouveauProd',
      '/admin/stock/commandes': 'breadcrumb.commandes',
      '/admin/analyse-stock': 'breadcrumb.analyseStock'
    };
    if (map[url] !== undefined) {
      this.currentPage = map[url];
    } else if (url.startsWith('/admin/stock/categories/modifier')) {
      this.currentPage = 'breadcrumb.modifierCat';
    } else if (url.startsWith('/admin/stock/produits/modifier')) {
      this.currentPage = 'breadcrumb.modifierProd';
    } else if (url.startsWith('/admin/stock/commandes/')) {
      this.currentPage = 'breadcrumb.detailCommande';
    } else {
      this.currentPage = '';
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleDateString('fr', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}
