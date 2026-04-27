import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableauDeBordService } from '../../../../core/services/tableau-de-bord.service';
import { TableauDeBord } from '../../../../core/models/tableau-de-bord.model';
import { Categorie } from '../../../../core/models/categorie.model';
import { Commande } from '../../../../core/models/commande.model';
import { Produit } from '../../../../core/models/produit.model';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in pb-5">
      
      <!-- Premium Application Header with Integrated Actions -->
      <div class="dashboard-hero mb-5 p-4 p-md-5 rounded-4 shadow-sm position-relative overflow-hidden d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
        <div style="position: relative; z-index: 2;">
          <h1 class="dashboard-hero-title mb-2 fw-bolder d-flex align-items-center gap-3">
            <div class="hero-icon-box shadow">
              <i class="bi bi-heart-pulse-fill"></i>
            </div>
            Centre de Contrôle Stock
          </h1>
          <p class="dashboard-hero-subtitle mb-0">Vue panoramique et gestion dynamique des équipements de santé et de sécurité Alzheimer.</p>
        </div>
        
        <!-- Primary Quick Actions safely housed in the header -->
        <div class="d-flex gap-3 flex-wrap position-relative z-2">
           <a routerLink="/admin/stock/produits/ajouter" class="btn btn-premium-action shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 text-decoration-none">
             <i class="bi bi-plus-lg fs-5"></i> <span class="fw-bold">Nouvel Équipement</span>
           </a>
           <a routerLink="/admin/stock/categories/ajouter" class="btn btn-premium-secondary shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 text-decoration-none">
             <i class="bi bi-folder-plus fs-5"></i> <span class="fw-bold">Catégorie</span>
           </a>
           <a routerLink="/admin/stock/analyse" class="btn btn-premium-secondary shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 text-decoration-none">
             <i class="bi bi-clipboard2-pulse fs-5"></i> <span class="fw-bold">Diagnostics</span>
           </a>
        </div>
        
        <!-- Decorative subtle medical element -->
        <div class="hero-decoration"></div>
        <div class="hero-decoration-2"></div>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="chargement" class="row g-4 mb-5">
        <div class="col-lg-3 col-md-6" *ngFor="let i of [1,2,3,4]">
          <div class="stat-card skeleton-card clinical-card p-4">
            <div class="skeleton-icon mb-3"></div>
            <div class="skeleton-text w-50 mb-2"></div>
            <div class="skeleton-text w-75"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="erreur" class="alert alert-danger d-flex align-items-center shadow-sm mb-5 p-4 rounded-4" role="alert">
        <i class="bi bi-exclamation-triangle-fill text-danger me-3 fs-3"></i>
        <div class="flex-grow-1 fw-bold fs-5 text-danger">
          Attention: Flux de données interrompu.
        </div>
        <button class="btn btn-outline-danger shadow-sm rounded-pill px-4" (click)="chargerDonnees()">
          <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
        </button>
      </div>

      <!-- Main Content Container -->
      <div *ngIf="!chargement && !erreur">
        
        <!-- Section: Alertes Critiques -->
        <div *ngIf="produitsEnRupture > 0" class="mb-5 animate-fade-up">
          <div class="alert custom-critical-alert d-flex align-items-center p-4 shadow-sm border-0">
            <div class="critical-icon-pulse flex-shrink-0 me-4 shadow d-flex justify-content-center align-items-center">
              <i class="bi bi-exclamation-octagon-fill fs-3 text-white"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bolder mb-1 text-danger">Alerte Rupture de Stock</h5>
              <span class="fs-6 opacity-75 text-danger">{{ produitsEnRupture }} {{ produitsEnRupture !== 1 ? 'équipements médicaux nécessitent' : 'équipement médical nécessite' }} un réapprovisionnement immédiat.</span>
            </div>
            <a routerLink="/admin/stock/produits" class="btn btn-danger shadow rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 text-decoration-none">
              <i class="bi bi-box-arrow-in-right"></i> Intervenir
            </a>
          </div>
        </div>

        <!-- Section: Métriques Clés -->
        <h4 class="section-heading mb-4 fw-bolder d-flex align-items-center gap-2">
          <i class="bi bi-activity text-accent"></i> Indicateurs de Performance
        </h4>
        
        <div class="row g-4 mb-5 stagger-fade-in">
          <!-- CA -->
          <div class="col-lg-3 col-md-6">
             <div class="stat-card premium-card h-100">
               <div class="d-flex align-items-center mb-4">
                 <div class="stat-icon-solid bg-primary-gradient shadow-sm">
                   <i class="bi bi-currency-euro text-white fs-4"></i>
                 </div>
                 <h6 class="stat-label ms-3 mb-0 fw-bold text-uppercase">Commandes Validées</h6>
               </div>
               <div class="stat-value text-primary-custom">{{ chiffreAffaires | number:'1.0-0' }} <span class="stat-unit">TND</span></div>
             </div>
          </div>
          <!-- Commandes -->
          <div class="col-lg-3 col-md-6">
             <a routerLink="/admin/stock/commandes" class="stat-card premium-card h-100 text-decoration-none d-block">
               <div class="d-flex align-items-center mb-4">
                 <div class="stat-icon-solid bg-success-gradient shadow-sm">
                   <i class="bi bi-card-checklist text-white fs-4"></i>
                 </div>
                 <h6 class="stat-label ms-3 mb-0 fw-bold text-uppercase">Requêtes (Mois)</h6>
               </div>
               <div class="d-flex justify-content-between align-items-end">
                 <div class="stat-value text-primary-custom">{{ totalCommandes }}</div>
                 <div *ngIf="commandesEnAttente > 0" class="badge rounded-pill bg-warning-solid text-dark shadow-sm mb-2 px-3 py-2 fw-bolder">
                   {{ commandesEnAttente }} en attente
                 </div>
               </div>
             </a>
          </div>
          <!-- Valeur Stock -->
          <div class="col-lg-3 col-md-6">
             <div class="stat-card premium-card h-100">
               <div class="d-flex align-items-center mb-4">
                 <div class="stat-icon-solid bg-info-gradient shadow-sm">
                   <i class="bi bi-shield-plus text-white fs-4"></i>
                 </div>
                 <h6 class="stat-label ms-3 mb-0 fw-bold text-uppercase">Valeur Appareillages</h6>
               </div>
               <div class="stat-value text-primary-custom">{{ valeurTotaleStock | number:'1.0-0' }} <span class="stat-unit">TND</span></div>
             </div>
          </div>
          <!-- Low Stock -->
          <div class="col-lg-3 col-md-6">
             <a routerLink="/admin/stock/produits" [queryParams]="{ filtre: 'faible' }" class="stat-card premium-card h-100 text-decoration-none d-block">
               <div class="d-flex align-items-center mb-4">
                 <div class="stat-icon-solid bg-warning-gradient shadow-sm">
                   <i class="bi bi-exclamation-triangle text-white fs-4"></i>
                 </div>
                 <h6 class="stat-label ms-3 mb-0 fw-bold text-uppercase">Stocks Critiques</h6>
               </div>
               <div class="stat-value text-primary-custom">{{ produitsStockBas }}</div>
             </a>
          </div>
        </div>

        <!-- Section: Flux de Données -->
        <h4 class="section-heading mb-4 fw-bolder d-flex align-items-center gap-2 mt-5 pt-3">
          <i class="bi bi-view-list text-accent"></i> Activité Opérationnelle
        </h4>

        <div class="row g-4 stagger-fade-in-delayed">
          
          <!-- Dernières Commandes -->
          <div class="col-lg-6">
            <div class="card premium-list-card h-100 border-0 shadow-sm">
              <div class="card-header border-0 bg-transparent pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bolder d-flex align-items-center gap-3">
                   <div class="icon-indicator bg-primary-soft text-primary-override rounded-circle">
                     <i class="bi bi-journal-medical"></i>
                   </div>
                   <span class="text-primary-custom">Requêtes Récentes</span>
                </h5>
                <a routerLink="/admin/stock/commandes" class="btn btn-sm btn-light-action rounded-pill fw-bold text-decoration-none px-3">
                  Explorer <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0 pb-3">
                <div *ngIf="commandes.length === 0" class="p-5 text-center empty-state">
                  <div class="empty-icon-wrap mx-auto mb-3"><i class="bi bi-inbox fs-2"></i></div>
                  <p class="text-muted fw-semibold mb-0">La file d'attente est vide.</p>
                </div>
                <div class="list-group list-group-flush" *ngIf="commandes.length > 0">
                  <a *ngFor="let cmd of commandes" [routerLink]="['/admin/stock/commandes', cmd.id]"
                     class="list-group-item list-group-item-action border-0 px-4 py-3 d-flex justify-content-between align-items-center premium-list-item text-decoration-none">
                    <div class="d-flex align-items-center gap-3">
                       <div class="avatar-bold rounded-4 shadow-sm text-white bg-primary-gradient">
                          {{ cmd.nomClient ? cmd.nomClient.charAt(0).toUpperCase() : '?' }}
                       </div>
                       <div>
                          <div class="fw-bolder fs-6 text-primary-custom mb-1 text-decoration-none">{{ cmd.nomClient }}</div>
                          <div class="fs-7 text-secondary-custom font-monospace">REF: {{ cmd.reference }}</div>
                       </div>
                    </div>
                    <div class="text-end">
                      <div class="fw-bolder fs-6 text-primary-custom mb-2">{{ cmd.montantTotal | number:'1.2-2' }} <span class="fs-7 text-muted">TND</span></div>
                      <span class="badge rounded-pill fw-bold px-3 py-1 custom-status-badge" [ngClass]="{
                          'status-warning': cmd.statut === 'EN_ATTENTE',
                          'status-info': cmd.statut === 'CONFIRMEE',
                          'status-primary': cmd.statut === 'EN_PREPARATION',
                          'status-secondary': cmd.statut === 'EXPEDIEE',
                          'status-success': cmd.statut === 'LIVREE',
                          'status-danger': cmd.statut === 'ANNULEE'
                        }">{{ cmd.statut }}</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Produits Récents -->
          <div class="col-lg-6">
            <div class="card premium-list-card h-100 border-0 shadow-sm">
              <div class="card-header border-0 bg-transparent pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bolder d-flex align-items-center gap-3">
                   <div class="icon-indicator bg-success-soft text-success-override rounded-circle">
                     <i class="bi bi-box2-heart"></i>
                   </div>
                   <span class="text-primary-custom">Nouveaux Équipements</span>
                </h5>
                <a routerLink="/admin/stock/produits" class="btn btn-sm btn-light-action rounded-pill fw-bold text-decoration-none px-3">
                  Catalogue <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0 pb-3">
                <div *ngIf="produits.length === 0" class="p-5 text-center empty-state">
                  <div class="empty-icon-wrap mx-auto mb-3"><i class="bi bi-box2 fs-2"></i></div>
                  <p class="text-muted fw-semibold mb-0">L'inventaire est vierge.</p>
                </div>
                <div class="list-group list-group-flush" *ngIf="produits.length > 0">
                  <a *ngFor="let prod of produits" [routerLink]="['/admin/stock/produits/modifier', prod.id]" 
                       class="list-group-item list-group-item-action border-0 px-4 py-3 d-flex justify-content-between align-items-center premium-list-item text-decoration-none">
                    <div class="d-flex align-items-center gap-3">
                       <div class="product-thumb-bold rounded-4 shadow-sm flex-shrink-0">
                          <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" class="rounded-4 w-100 h-100" style="object-fit: cover;">
                          <i *ngIf="!prod.imageUrl" class="bi bi-shield-plus text-primary-override fs-3"></i>
                       </div>
                       <div>
                          <div class="fw-bolder fs-6 text-primary-custom mb-1 d-flex align-items-center gap-2 text-decoration-none">
                            {{ prod.nom }}
                            <i *ngIf="prod.enPromo" class="bi bi-star-fill text-warning fs-7" title="Prioritaire"></i>
                          </div>
                          <div class="fs-7 text-secondary-custom fw-medium">{{ prod.categorieNom }}</div>
                       </div>
                    </div>
                    <div class="text-end">
                      <div class="fw-bolder fs-6 text-primary-custom mb-2">{{ prod.prix | number:'1.2-2' }} <span class="fs-7 text-muted">TND</span></div>
                      <span class="badge rounded-pill fw-bold px-3 py-1 custom-status-badge" [ngClass]="prod.quantite > 10 ? 'status-success' : prod.quantite > 0 ? 'status-warning' : 'status-danger'">
                        Qté: {{ prod.quantite }}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Typography & Variables */
    .dashboard-hero-title {
      color: var(--text-primary);
      font-size: 2rem;
      letter-spacing: -0.8px;
    }
    
    .dashboard-hero-subtitle {
      color: var(--text-secondary);
      font-size: 1.05rem;
      font-weight: 500;
      max-width: 600px;
      line-height: 1.5;
    }

    .section-heading {
      color: var(--text-primary);
      font-size: 1.4rem;
      letter-spacing: -0.5px;
    }

    .stat-label {
      color: var(--text-secondary);
      letter-spacing: 0.8px;
      font-size: 0.75rem;
    }

    .stat-value {
      color: var(--text-primary);
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1;
      padding-top: 0.5rem;
    }

    .stat-unit {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-left: 4px;
    }

    .text-primary-custom { color: var(--text-primary) !important; }
    .text-secondary-custom { color: var(--text-secondary) !important; }
    .text-accent { color: var(--accent-color, #4E80EE) !important; }
    
    .fs-7 { font-size: 0.8rem; }

    /* Dashboard Hero (Header) */
    .dashboard-hero {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      box-shadow: 0 10px 30px -10px rgb(0 0 0 / 0.05);
    }

    .hero-icon-box {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--accent-color, #4E80EE) 0%, rgba(78,128,238,0.8) 100%);
      color: white;
      font-size: 1.5rem;
    }

    .hero-decoration {
      position: absolute; right: -5%; top: -50%; width: 400px; height: 400px; 
      background: radial-gradient(circle, rgba(78, 128, 238, 0.06) 0%, rgba(0,0,0,0) 70%); 
      border-radius: 50%; pointer-events: none; z-index: 1;
    }
    
    .hero-decoration-2 {
      position: absolute; left: 20%; bottom: -30%; width: 200px; height: 200px; 
      background: radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, rgba(0,0,0,0) 70%); 
      border-radius: 50%; pointer-events: none; z-index: 1;
    }

    /* Premium Buttons */
    .btn.btn-premium-action {
      background: linear-gradient(135deg, var(--accent-color, #4E80EE) 0%, #3b6bcc 100%);
      color: white !important;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn.btn-premium-action:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 20px -8px rgba(78, 128, 238, 0.6) !important;
      color: white !important;
    }

    .btn.btn-premium-secondary {
      background-color: var(--bg-inset);
      color: var(--text-primary) !important;
      border: 1px solid var(--border-color);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn.btn-premium-secondary:hover {
      background-color: var(--bg-main);
      border-color: var(--accent-color, #4E80EE);
      color: var(--accent-color, #4E80EE) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px -4px rgb(0 0 0 / 0.1);
    }

    .btn-light-action {
      background-color: var(--bg-inset);
      color: var(--text-secondary);
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .btn-light-action:hover {
      background-color: var(--primary-light, rgba(78, 128, 238, 0.1));
      color: var(--accent-color, #4E80EE);
    }

    /* Premium Cards */
    .premium-card {
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 24px;
      background: var(--bg-card);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stat-card.premium-card:hover {  
      transform: translateY(-6px);
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      border-color: rgba(78, 128, 238, 0.4);
    }

    .premium-list-card {
      background: var(--bg-card);
      border-radius: 20px;
      border: 1px solid var(--border-color) !important;
    }

    /* Solid Gradient Backgrounds for Extreme Contrast */
    .bg-primary-gradient { background: linear-gradient(135deg, #4E80EE 0%, #3B6BCC 100%); }
    .bg-success-gradient { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
    .bg-info-gradient { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); }
    .bg-warning-gradient { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
    .bg-warning-solid { background: #FBBF24; }

    .text-primary-override { color: #4E80EE !important; }
    .text-success-override { color: #10B981 !important; }
    .bg-primary-soft { background-color: rgba(78,128,238,0.15); }
    .bg-success-soft { background-color: rgba(16,185,129,0.15); }

    .stat-icon-solid {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }

    .icon-indicator {
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
    }

    /* Badges */
    .custom-status-badge {
      font-size: 0.70rem;
      letter-spacing: 0.3px;
    }
    .status-primary { background: rgba(78,128,238,0.15); color: #4E80EE; border: 1px solid rgba(78,128,238,0.3); }
    .status-success { background: rgba(16,185,129,0.15); color: #10B981; border: 1px solid rgba(16,185,129,0.3); }
    .status-warning { background: rgba(245,158,11,0.15); color: #D97706; border: 1px solid rgba(245,158,11,0.3); }
    .status-danger { background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); }
    .status-info { background: rgba(14,165,233,0.15); color: #0EA5E9; border: 1px solid rgba(14,165,233,0.3); }
    .status-secondary { background: rgba(100,116,139,0.15); color: #64748B; border: 1px solid rgba(100,116,139,0.3); }

    /* Lists */
    .premium-list-item {
      background-color: transparent;
      border-bottom: 1px solid var(--border-color) !important;
      transition: background-color 0.2s, padding-left 0.3s;
      outline: none;
    }
    .premium-list-item:hover {
      background-color: var(--bg-inset);
      padding-left: 2rem !important;
      text-decoration: none !important;
    }
    .premium-list-item:last-child {
      border-bottom: none !important;
    }
    
    .avatar-bold {
      width: 48px; height: 48px; 
      display: flex; align-items: center; justify-content: center; 
      font-weight: 800; font-size: 1.2rem;
    }
    
    .product-thumb-bold {
      width: 48px; height: 48px; 
      background: var(--bg-inset); 
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--border-color);
    }

    .empty-state {
      opacity: 0.7;
    }
    .empty-icon-wrap {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--bg-inset); display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary);
    }

    /* Alerts */
    .custom-critical-alert {
      background: rgba(239, 68, 68, 0.08); /* Dark mode safe */
      border-radius: 20px;
    }
    .critical-icon-pulse {
      background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
      width: 56px; height: 56px; 
      border-radius: 16px;
    }

    /* Animations */
    .stagger-fade-in > * {
      animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      opacity: 0; transform: translateY(20px);
    }
    .stagger-fade-in > *:nth-child(1) { animation-delay: 0.05s; }
    .stagger-fade-in > *:nth-child(2) { animation-delay: 0.1s; }
    .stagger-fade-in > *:nth-child(3) { animation-delay: 0.15s; }
    .stagger-fade-in > *:nth-child(4) { animation-delay: 0.2s; }

    .stagger-fade-in-delayed > * {
      animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      opacity: 0; transform: translateY(20px);
    }
    .stagger-fade-in-delayed > *:nth-child(1) { animation-delay: 0.2s; }
    .stagger-fade-in-delayed > *:nth-child(2) { animation-delay: 0.3s; }
    
    .animate-fade-up {
      animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.4s forwards;
      opacity: 0;
    }

    .pulse-alert { animation: softPulse 2.5s infinite; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes softPulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); }
      50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    
    /* Skeleton */
    .skeleton-card { border-radius: 20px; }
    .skeleton-icon { height: 48px; width: 48px; border-radius: 14px; background: var(--bg-inset); }
    .skeleton-text { height: 18px; border-radius: 6px; background: var(--bg-inset); }
  `]
})
export class TableauDeBordComponent implements OnInit {
  commandes: Commande[] = [];
  produits: Produit[] = [];
  
  chiffreAffaires = 0;
  totalCommandes = 0;
  valeurTotaleStock = 0;
  produitsStockBas = 0;
  produitsEnRupture = 0;
  commandesEnAttente = 0;

  chargement = true;
  erreur = false;

  constructor(private dashboardService: TableauDeBordService) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = false;

    this.dashboardService.obtenirTableauDeBord().subscribe({
      next: (data: TableauDeBord) => {
        this.chiffreAffaires = data.chiffreAffaires;
        this.totalCommandes = data.totalCommandes;
        this.valeurTotaleStock = data.valeurTotaleStock;
        this.produitsStockBas = data.produitsStockBas;
        this.produitsEnRupture = data.produitsEnRupture;
        this.commandesEnAttente = data.commandesEnAttente;
        
        this.commandes = data.dernieresCommandes || [];
        this.produits = data.derniersProduits || [];
        
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur chargement tableau de bord', err);
        this.chargement = false;
        this.erreur = true;
      }
    });
  }
}

