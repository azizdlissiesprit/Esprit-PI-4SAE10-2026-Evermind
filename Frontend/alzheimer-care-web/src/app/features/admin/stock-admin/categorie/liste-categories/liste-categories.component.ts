import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Categorie } from '../../../../../core/models/categorie.model';
import { CategorieService } from '../../../../../core/services/categorie.service';

@Component({
  selector: 'app-liste-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in pb-5">
      <!-- Premium Application Header -->
      <div class="dashboard-hero mb-5 p-4 p-md-5 rounded-4 shadow-sm position-relative overflow-hidden d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
        <div style="position: relative; z-index: 2;">
          <h1 class="dashboard-hero-title mb-2 fw-bolder d-flex align-items-center gap-3">
            <div class="hero-icon-box shadow bg-info-gradient">
              <i class="bi bi-folder-fill"></i>
            </div>
            Catégories d'Équipement
          </h1>
          <p class="dashboard-hero-subtitle mb-0">Structuration et classification du catalogue des dispositifs médicaux Alzheimer.</p>
        </div>
        
        <!-- Primary Action -->
        <div class="d-flex gap-3 flex-wrap position-relative z-2">
           <a routerLink="/admin/stock/categories/ajouter" class="btn btn-premium-action shadow-lg rounded-pill px-4 py-3 d-flex align-items-center gap-2 text-decoration-none">
             <i class="bi bi-folder-plus fs-5"></i> <span class="fw-bold">Nouvelle Catégorie</span>
           </a>
        </div>
        
        <div class="hero-decoration bg-info-soft"></div>
        <div class="hero-decoration-2"></div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert d-flex align-items-center alert-dismissible slide-in shadow-sm border-0 mb-4 rounded-4" 
           [ngClass]="messageType === 'success' ? 'bg-success-soft text-success text-success-override' : 'bg-danger-soft text-danger custom-critical-alert'">
        <i class="bi me-3 fs-3" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <div class="flex-grow-1 fw-bold fs-6">{{ message }}</div>
        <button type="button" class="btn-close" (click)="message = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="p-5 text-center mt-5">
        <div class="spinner-border text-primary-custom" role="status" style="width: 3rem; height: 3rem;"></div>
        <h5 class="mt-4 text-secondary-custom fw-bold">Synchronisation du catalogue...</h5>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement">
        
        <!-- Toolbar -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3 stagger-fade-in">
          <div class="search-input flex-grow-1 w-100" style="max-width: 500px; position: relative;">
            <i class="bi bi-search text-muted fs-5" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%);"></i>
            <input type="text" class="form-control premium-search-input shadow-sm" placeholder="Rechercher un dossier par mot-clé..."
                   [(ngModel)]="recherche" (ngModelChange)="filtrer()">
          </div>
          <div class="d-flex align-items-center gap-4">
             <div class="text-secondary-custom fw-bold fs-6">{{ categoriesFiltrees.length }} {{ categoriesFiltrees.length !== 1 ? 'Dossiers Classifiés' : 'Dossier Classifié' }}</div>
             <div class="bg-card premium-toggle shadow-sm rounded-pill p-1 d-flex align-items-center border">
               <button class="btn rounded-pill border-0 fw-bold px-4" [class.active-view]="vue === 'grille'" [class.text-secondary]="vue !== 'grille'" (click)="vue = 'grille'" title="Vue Grille">
                  <i class="bi bi-grid-fill me-2"></i> Grille
               </button>
               <button class="btn rounded-pill border-0 fw-bold px-4" [class.active-view]="vue === 'liste'" [class.text-secondary]="vue !== 'liste'" (click)="vue = 'liste'" title="Vue Liste">
                  <i class="bi bi-view-list me-2"></i> Liste
               </button>
             </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="categoriesFiltrees.length === 0" class="text-center p-5 premium-card shadow-sm animate-fade-up">
           <div class="empty-icon-wrap bg-primary-soft mx-auto mb-4" style="width: 100px; height: 100px; font-size: 3rem;">
              <i class="bi bi-folder-x text-primary-override"></i>
           </div>
           <h4 class="fw-bolder text-primary-custom mb-3">Aucun dossier trouvé</h4>
           <p class="text-secondary-custom fs-5 mb-4" *ngIf="recherche">Modifiez vos critères de recherche pour "{{ recherche }}".</p>
           <p class="text-secondary-custom fs-5 mb-4" *ngIf="!recherche">Commencez par créer votre première classification d'équipement.</p>
           <button *ngIf="recherche" class="btn btn-premium-secondary rounded-pill px-5 py-2 fs-6 fw-bold shadow-sm" (click)="recherche = ''; filtrer()">
             <i class="bi bi-arrow-counterclockwise me-2"></i> Réinitialiser les filtres
           </button>
        </div>

        <!-- Grid View -->
        <div *ngIf="vue === 'grille' && categoriesFiltrees.length > 0" class="row g-4 stagger-fade-in">
          <div class="col-xl-3 col-lg-4 col-md-6" *ngFor="let categorie of categoriesPage; let i = index" [style.animation-delay]="(i * 0.05) + 's'">
            <div class="card premium-card h-100 border-0 position-relative">
              <div class="card-body p-4 d-flex flex-column h-100">
                 <!-- Actions -->
                 <div class="position-absolute top-0 end-0 p-3 z-3">
                    <div class="dropdown">
                      <button class="btn btn-sm btn-light-action rounded-circle border-0 shadow-sm" type="button" data-bs-toggle="dropdown" style="width: 36px; height: 36px;">
                        <i class="bi bi-three-dots-vertical fs-5"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 overflow-hidden pt-2 pb-2">
                        <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold text-primary-custom" [routerLink]="['/admin/stock/categories/modifier', categorie.id]"><i class="bi bi-pencil-fill text-primary-override"></i> Éditer Dossier</a></li>
                        <li><hr class="dropdown-divider opacity-10 my-1"></li>
                        <li><a class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold text-danger" href="javascript:void(0)" (click)="confirmerSuppression(categorie)"><i class="bi bi-trash3-fill"></i> Supprimer</a></li>
                      </ul>
                    </div>
                 </div>
                 
                 <!-- Icon & Title -->
                 <div class="stat-icon-solid bg-info-gradient shadow-sm mb-4" style="width: 64px; height: 64px; font-size: 1.8rem;">
                    <i class="bi bi-archive-fill text-white"></i>
                 </div>
                 
                 <h4 class="fw-bolder text-primary-custom mb-2">{{ categorie.nom }}</h4>
                 <p class="text-secondary-custom fs-7 mb-4 description-clamp fw-medium flex-grow-1 lh-base">{{ categorie.description || 'Dossier sans spécifications détaillées.' }}</p>
                 
                 <!-- Footer -->
                 <div class="border-top pt-4 d-flex justify-content-between align-items-center mt-auto border-opacity-25">
                    <span class="badge rounded-pill custom-status-badge status-info px-3 py-2 fw-bolder">
                      <i class="bi bi-box-seam me-1"></i> {{ categorie.nombreProduits }} articles
                    </span>
                    <span class="badge rounded-pill bg-inset text-secondary-custom border fw-bolder px-3 py-2 font-monospace fs-7 shadow-sm">
                      REF-C{{ categorie.id }}
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List/Table View -->
        <div *ngIf="vue === 'liste' && categoriesFiltrees.length > 0" class="card premium-list-card border-0 shadow-sm animate-fade-up">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0 clinical-table align-middle">
                <thead class="bg-inset border-bottom border-2">
                  <tr>
                    <th class="border-0 px-5 py-4 text-secondary-custom fw-bold text-uppercase fs-7 letter-spacing-1">Identifiant & Nom</th>
                    <th class="border-0 py-4 text-secondary-custom fw-bold text-uppercase fs-7 letter-spacing-1">Description Spécifique</th>
                    <th class="border-0 py-4 text-secondary-custom fw-bold text-center text-uppercase fs-7 letter-spacing-1">Volume Actif</th>
                    <th class="border-0 py-4 text-secondary-custom fw-bold text-uppercase fs-7 letter-spacing-1">Enregistrement</th>
                    <th class="border-0 px-5 py-4 text-end text-secondary-custom fw-bold text-uppercase fs-7 letter-spacing-1">Actions</th>
                  </tr>
                </thead>
                <tbody class="border-top-0">
                  <tr *ngFor="let categorie of categoriesPage" class="premium-list-item">
                    <td class="px-5 py-4">
                      <div class="d-flex align-items-center gap-4">
                        <div class="stat-icon-solid bg-info-gradient text-white shadow-sm" style="width: 48px; height: 48px;">
                          <i class="bi bi-archive-fill fs-5"></i>
                        </div>
                        <div>
                          <div class="fw-bolder fs-6 text-primary-custom mb-1">{{ categorie.nom }}</div>
                          <div class="badge rounded-pill bg-inset border text-secondary-custom font-monospace fw-bold fs-7 shadow-sm">REF-C{{ categorie.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 text-secondary-custom fw-semibold ds-7" style="max-width: 320px;">
                      <span class="d-inline-block text-truncate w-100">{{ categorie.description || 'N/A' }}</span>
                    </td>
                    <td class="py-4 text-center">
                      <span class="badge rounded-pill custom-status-badge status-info px-4 py-2 fw-bolder shadow-sm">
                        {{ categorie.nombreProduits }} articles
                      </span>
                    </td>
                    <td class="py-4 text-secondary-custom font-monospace fw-bold fs-7">
                      <i class="bi bi-calendar3 me-2 opacity-50"></i>{{ categorie.dateCreation | date:'dd MMM yyyy' }}
                    </td>
                    <td class="px-5 py-4 text-end">
                      <div class="d-flex justify-content-end gap-2">
                        <a [routerLink]="['/admin/stock/categories/modifier', categorie.id]" class="btn btn-light-action rounded-circle shadow-sm" style="width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;" title="Éditer">
                          <i class="bi bi-pencil-fill text-primary-override fs-5"></i>
                        </a>
                        <button class="btn btn-light-action rounded-circle shadow-sm" style="width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;" title="Supprimer" (click)="confirmerSuppression(categorie)">
                          <i class="bi bi-trash3-fill text-danger fs-5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-5 px-3">
          <span class="text-secondary-custom fw-bold fs-7">Affichage <span class="text-primary-custom">{{ debut + 1 }} - {{ fin }}</span> sur le catalogue de <span class="text-primary-custom">{{ categoriesFiltrees.length }}</span></span>
          <ul class="pagination m-0 gap-2 clinical-pagination">
             <li class="page-item" [class.disabled]="page === 1">
               <button class="page-link shadow-sm rounded-circle d-flex align-items-center justify-content-center" (click)="page = page - 1; paginer()" style="width: 40px; height: 40px;"><i class="bi bi-chevron-left fw-bold"></i></button>
             </li>
             <li class="page-item" *ngFor="let p of pages" [class.active]="p === page">
               <button class="page-link shadow-sm rounded-circle fw-bold d-flex align-items-center justify-content-center" (click)="page = p; paginer()" style="width: 40px; height: 40px;">{{ p }}</button>
             </li>
             <li class="page-item" [class.disabled]="page === totalPages">
               <button class="page-link shadow-sm rounded-circle d-flex align-items-center justify-content-center" (click)="page = page + 1; paginer()" style="width: 40px; height: 40px;"><i class="bi bi-chevron-right fw-bold"></i></button>
             </li>
          </ul>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div *ngIf="categorieASupprimer" class="modal fade show d-block z-3 position-fixed w-100 h-100 top-0 start-0">
        <div class="modal-backdrop fade show position-absolute w-100 h-100" style="backdrop-filter: blur(8px); background: rgba(15,23,42,0.4);" (click)="categorieASupprimer = null"></div>
        <div class="modal-dialog modal-dialog-centered" style="z-index: 1055; max-width: 450px;">
          <div class="modal-content shadow-lg border-0 bg-card rounded-4 p-2">
            <div class="modal-header border-0 d-flex justify-content-end p-3">
               <button type="button" class="btn-close" (click)="categorieASupprimer = null"></button>
            </div>
            <div class="modal-body px-5 pb-5 text-center">
              <div class="critical-icon-pulse flex-shrink-0 mx-auto shadow-lg d-flex justify-content-center align-items-center mb-4">
                <i class="bi bi-exclamation-octagon-fill fs-1 text-white"></i>
              </div>
              <h3 class="fw-bolder text-primary-custom mb-3">Confirmation D'Action</h3>
              <p class="text-secondary-custom fs-6 fw-medium mb-4 lh-lg">Suspension définitive de la catégorie <strong class="text-primary-custom d-block fw-bolder fs-5 mt-2">"{{ categorieASupprimer.nom }}"</strong> ?</p>
              
              <div class="alert custom-critical-alert border-0 shadow-sm text-start mb-5 p-3 rounded-3">
                 <i class="bi bi-exclamation-circle-fill text-danger me-2"></i> <span class="fw-bold text-danger fs-7">Action irréversible. Risque de perte des structures associées.</span>
              </div>
              
              <div class="d-flex gap-3 justify-content-center w-100">
                <button class="btn btn-premium-secondary flex-fill rounded-pill py-3 fw-bold shadow-sm" (click)="categorieASupprimer = null">Annuler</button>
                <button class="btn btn-danger flex-fill rounded-pill py-3 fw-bolder shadow-lg d-flex align-items-center justify-content-center gap-2" (click)="supprimer()">Confirmer <i class="bi bi-shield-lock-fill"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Typography & Variables synchronized with Dashboard */
    .dashboard-hero-title { color: var(--text-primary); font-size: 2rem; letter-spacing: -0.8px; }
    .dashboard-hero-subtitle { color: var(--text-secondary); font-size: 1.05rem; font-weight: 500; max-width: 600px; line-height: 1.5; margin-left: 68px; }
    .text-primary-custom { color: var(--text-primary) !important; }
    .text-secondary-custom { color: var(--text-secondary) !important; }
    .fs-7 { font-size: 0.85rem; }
    .letter-spacing-1 { letter-spacing: 0.5px; }
    
    .bg-card { background-color: var(--bg-card) !important; }
    .bg-inset { background-color: var(--bg-inset) !important; }

    /* Hero Unit */
    .dashboard-hero { background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: 0 10px 30px -10px rgb(0 0 0 / 0.05); }
    .hero-icon-box {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.5rem;
    }
    .hero-decoration { position: absolute; right: -5%; top: -50%; width: 400px; height: 400px; border-radius: 50%; pointer-events: none; z-index: 1; }
    .hero-decoration-2 { position: absolute; left: 20%; bottom: -30%; width: 200px; height: 200px; border-radius: 50%; pointer-events: none; z-index: 1; background: radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, rgba(0,0,0,0) 70%); }
    .bg-info-soft { background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0,0,0,0) 70%); }
    
    /* Buttons */
    .btn-premium-action { background: linear-gradient(135deg, var(--accent-color, #4E80EE) 0%, #3b6bcc 100%); color: white !important; border: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .btn-premium-action:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 20px -8px rgba(78, 128, 238, 0.6) !important; color: white !important; }
    
    .btn-premium-secondary { background-color: var(--bg-inset); color: var(--text-primary) !important; border: 1px solid var(--border-color); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .btn-premium-secondary:hover { background-color: var(--bg-main); border-color: var(--accent-color, #4E80EE); color: var(--accent-color, #4E80EE) !important; transform: translateY(-2px); box-shadow: 0 6px 12px -4px rgb(0 0 0 / 0.1); }
    
    .btn-light-action { background-color: var(--bg-inset); color: var(--text-secondary); border: 1px solid transparent; transition: all 0.2s; }
    .btn-light-action:hover { background-color: var(--primary-light, rgba(78, 128, 238, 0.1)); border-color: rgba(78, 128, 238, 0.3); color: var(--accent-color, #4E80EE); transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }

    /* Inputs & Toggles */
    .premium-search-input {
      border-radius: 12px; height: 50px; padding-left: 54px !important; transition: all 0.2s;
      background: var(--bg-inset); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 500; font-size: 1rem;
    }
    .premium-search-input:focus { background-color: var(--bg-main) !important; box-shadow: 0 0 0 4px rgba(78, 128, 238, 0.15) !important; border-color: var(--accent-color, #4E80EE); outline: none; }
    
    .premium-toggle.active-view { background: var(--accent-color); color: white; box-shadow: 0 4px 6px rgba(78, 128, 238, 0.2); }
    .premium-toggle .btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .premium-toggle .btn.active-view { background: var(--bg-main); color: var(--text-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid var(--border-color) !important; }
    
    /* Layout Cards */
    .premium-card {
      border: 1px solid var(--border-color); border-radius: 20px; background: var(--bg-card);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.02); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .premium-card:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); border-color: rgba(78, 128, 238, 0.4) !important; }
    .premium-list-card { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color) !important; overflow: hidden; }

    /* Text Utilities */
    .description-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3.2em; }

    /* Icons, Alerts, and Badges */
    .stat-icon-solid { border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .empty-icon-wrap { border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    
    .bg-info-gradient { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); }
    .text-primary-override { color: #4E80EE !important; }
    .text-success-override { color: #10B981 !important; }
    .bg-primary-soft { background-color: rgba(78,128,238,0.15) !important; }
    .bg-success-soft { background-color: rgba(16,185,129,0.15) !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.15) !important; }
    
    .custom-status-badge { font-size: 0.75rem; letter-spacing: 0.3px; }
    .status-info { background: rgba(14,165,233,0.12); color: #0EA5E9; border: 1px solid rgba(14,165,233,0.3); }
    .status-success { background: rgba(16,185,129,0.15); color: #10B981; border: 1px solid rgba(16,185,129,0.3); }
    .status-warning { background: rgba(245,158,11,0.15); color: #D97706; border: 1px solid rgba(245,158,11,0.3); }
    .status-danger { background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); }

    .custom-critical-alert { background: rgba(239, 68, 68, 0.08); }
    .critical-icon-pulse { background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); width: 72px; height: 72px; border-radius: 20px; }

    /* Tables & Pagination */
    .clinical-table tbody tr { transition: background-color 0.2s, padding 0.3s; background: var(--bg-card); cursor: default; border-bottom: 1px solid var(--border-color); }
    .clinical-table tbody tr:hover { background-color: var(--bg-inset); }
    .clinical-table tbody tr:last-child { border-bottom: none; }
    
    .clinical-pagination .page-link { background: var(--bg-inset); border-color: var(--border-color); color: var(--text-secondary); transition: all 0.2s; }
    .clinical-pagination .page-item.active .page-link { background-color: var(--accent-color, #4E80EE) !important; color: white !important; border-color: var(--accent-color, #4E80EE) !important; box-shadow: 0 4px 8px rgba(78, 128, 238, 0.3); }
    .clinical-pagination .page-link:hover:not(.active) { background-color: var(--bg-main); color: var(--accent-color, #4E80EE); border-color: var(--accent-color, #4E80EE); }
    
    /* Animations */
    .stagger-fade-in > * { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
    .animate-fade-up { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
    .slide-in { animation: slideInRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

    /* Dark Mode Defaults */
    html[data-theme="dark"] .premium-toggle .btn.active-view { background: #0F172A; }
  `]
})
export class ListeCategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  categoriesFiltrees: Categorie[] = [];
  categoriesPage: Categorie[] = [];
  message = '';
  messageType = '';
  categorieASupprimer: Categorie | null = null;
  chargement = true;
  recherche = '';
  vue: 'grille' | 'liste' = 'grille';

  // Pagination
  page = 1;
  parPage = 12;
  totalPages = 1;
  pages: number[] = [];
  debut = 0;
  fin = 0;

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.chargerCategories();
  }

  chargerCategories(): void {
    this.chargement = true;
    this.categorieService.listerTout().subscribe({
      next: (data) => {
        this.categories = data;
        this.filtrer();
        this.chargement = false;
      },
      error: (err) => {
        this.message = 'Erreur lors du chargement des rayons';
        this.messageType = 'error';
        this.chargement = false;
        console.error(err);
      }
    });
  }

  filtrer(): void {
    const q = this.recherche.toLowerCase().trim();
    this.categoriesFiltrees = this.categories.filter(c =>
      !q || c.nom.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
    this.page = 1;
    this.paginer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.categoriesFiltrees.length / this.parPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.debut = (this.page - 1) * this.parPage;
    this.fin = Math.min(this.debut + this.parPage, this.categoriesFiltrees.length);
    this.categoriesPage = this.categoriesFiltrees.slice(this.debut, this.fin);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  confirmerSuppression(categorie: Categorie): void {
    this.categorieASupprimer = categorie;
  }

  supprimer(): void {
    if (this.categorieASupprimer?.id) {
      this.categorieService.supprimer(this.categorieASupprimer.id).subscribe({
        next: () => {
          this.message = 'Dossier supprimé avec succès';
          this.messageType = 'success';
          this.categorieASupprimer = null;
          this.chargerCategories();
          setTimeout(() => this.message = '', 4000);
        },
        error: (err) => {
          this.message = 'Erreur lors de la suppression';
          this.messageType = 'error';
          this.categorieASupprimer = null;
          console.error(err);
        }
      });
    }
  }
}
