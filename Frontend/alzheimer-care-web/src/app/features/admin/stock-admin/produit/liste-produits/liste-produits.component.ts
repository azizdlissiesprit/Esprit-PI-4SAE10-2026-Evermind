import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../../../../core/models/produit.model';
import { Categorie } from '../../../../../core/models/categorie.model';
import { ProduitService } from '../../../../../core/services/produit.service';
import { CategorieService } from '../../../../../core/services/categorie.service';

@Component({
  selector: 'app-liste-produits',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="page-title d-flex align-items-center gap-2 text-primary">
            <div class="icon-circle shadow-sm" style="background: rgba(16, 185, 129, 0.15); color: #10B981; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
               <i class="bi bi-box-seam-fill"></i>
            </div>
            Base de Données Équipements
          </h2>
          <p class="page-subtitle text-secondary ms-1 mt-1 mb-0 fw-semibold">{{ produitsFiltres.length }} {{ produitsFiltres.length !== 1 ? 'équipements au total' : 'équipement au total' }}</p>
        </div>
        <a routerLink="/admin/stock/produits/ajouter" class="btn btn-clinical-primary rounded-pill px-4 shadow-sm d-flex align-items-center gap-2">
          <i class="bi bi-plus-circle-fill"></i> Nouvel Équipement
        </a>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert alert-dismissible slide-in shadow-sm border-0" [ngClass]="messageType === 'success' ? 'bg-success-soft text-success border-success' : 'bg-danger-soft text-danger border-danger'" style="border-radius: 8px; border: 1px solid transparent;">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <span class="fw-bold">{{ message }}</span>
        <button type="button" class="btn-close" (click)="message = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="p-5 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-secondary fw-semibold small">Chargement du catalogue médical...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement">
        <!-- Search & Filter Bar -->
        <div class="card clinical-card mb-4 border-0 shadow-sm bg-card-surface">
          <div class="card-body p-3">
            <div class="d-flex flex-wrap gap-3">
              <div class="search-input flex-grow-1" style="min-width: 250px; position: relative;">
                <i class="bi bi-search text-secondary" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%);"></i>
                <input type="text" class="form-control clinical-input border-0 shadow-sm" placeholder="Rechercher par nom, référence ou laboratoire..."
                       [(ngModel)]="recherche" (ngModelChange)="filtrer()" style="padding-left: 44px !important; background: var(--bg-inset);">
              </div>
              <select class="form-select clinical-select border-0 shadow-sm" style="width: auto; min-width: 180px; background: var(--bg-inset);"
                      [(ngModel)]="filtreCategorie" (ngModelChange)="filtrer()">
                <option [ngValue]="0">Toutes familles</option>
                <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom }}</option>
              </select>
              <select class="form-select clinical-select border-0 shadow-sm" style="width: auto; min-width: 160px; background: var(--bg-inset);"
                      [(ngModel)]="filtreStock" (ngModelChange)="filtrer()">
                <option value="tous">État du stock (Tous)</option>
                <option value="normal">Normal (>10)</option>
                <option value="faible">Critique (≤10)</option>
                <option value="rupture">Rupture totale (0)</option>
              </select>
              <button *ngIf="recherche || filtreCategorie !== 0 || filtreStock !== 'tous'"
                      class="btn btn-outline-secondary bg-card-surface rounded border shadow-sm" style="width: 44px; height: 44px;" (click)="reinitialiserFiltres()" title="Effacer les filtres">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card clinical-card border-0 shadow-sm animate-fade-up" style="border-radius: 12px; overflow: hidden;">
          <div class="card-body p-0 bg-card-surface">
            <div class="table-responsive">
              <table class="table table-hover mb-0 clinical-table align-middle">
                <thead style="background: var(--bg-inset); border-bottom: 2px solid var(--border-color);">
                  <tr>
                    <th class="border-0 px-4 py-3 text-secondary fw-bold text-uppercase" style="width: 60px; font-size:0.75rem;">Ref</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="min-width: 300px; font-size:0.75rem;">Appareillage / Produit</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Valeur Unitaire (TND)</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="min-width: 150px; font-size:0.75rem;">Niveau Stock</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Catégorie (Famille)</th>
                    <th class="border-0 px-4 py-3 text-end text-secondary fw-bold text-uppercase" style="min-width: 120px; font-size:0.75rem;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="produitsFiltres.length === 0">
                    <td colspan="6" class="text-center p-5 bg-card-surface">
                      <!-- Empty State -->
                      <div class="icon-circle mx-auto mb-3" style="background: var(--bg-inset); color: var(--text-secondary); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                         <i class="bi bi-clipboard2-x"></i>
                      </div>
                      <h5 class="fw-bold text-primary">Aucun résultat</h5>
                      <p class="text-secondary fw-semibold" *ngIf="!recherche && filtreCategorie === 0 && filtreStock === 'tous'">Le catalogue d'équipements médicaux est vide.</p>
                      <p class="text-secondary fw-semibold" *ngIf="recherche || filtreCategorie !== 0 || filtreStock !== 'tous'">Vos filtres ne correspondent à aucune référence de notre base.</p>
                    </td>
                  </tr>
                  <!-- List of Products -->
                  <tr *ngFor="let produit of produitsPage" class="stagger-row" style="border-bottom: 1px solid var(--border-color);">
                    <td class="px-4 py-3 text-secondary font-monospace fw-bold small">REF-{{ produit.id }}</td>
                    <td class="py-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="product-img shadow-sm border" style="width: 48px; height: 48px; border-radius: 8px; background: var(--bg-card); overflow: hidden; display: flex; align-items: center; justify-content: center;">
                          <img *ngIf="produit.imageUrl" [src]="produit.imageUrl" style="width: 100%; height: 100%; object-fit: cover;">
                          <i *ngIf="!produit.imageUrl" class="bi bi-heart-pulse fs-4" style="color: var(--accent-color, #4E80EE);"></i>
                        </div>
                        <div class="d-flex flex-column" style="max-width: 250px;">
                          <span class="fw-bold text-primary text-truncate d-flex align-items-center gap-2">
                             {{ produit.nom }}
                             <i *ngIf="produit.enPromo" class="bi bi-star-fill text-warning" style="font-size: 0.70rem;" title="Indispensable/Prioritaire"></i>
                          </span>
                          <span class="small text-secondary fw-semibold text-truncate">{{ produit.description || 'Non classifié' }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3">
                      <div class="fw-bold text-primary">{{ produit.prix | number:'1.2-2' }}</div>
                      <div *ngIf="produit.prixOriginal && produit.prixOriginal > produit.prix" class="small text-decoration-line-through text-muted fw-semibold" style="font-size: 0.75rem;">
                         {{ produit.prixOriginal | number:'1.2-2' }}
                      </div>
                    </td>
                    <td class="py-3">
                      <div class="d-flex flex-column gap-1 w-100 pe-3">
                         <div class="d-flex justify-content-between align-items-center small">
                            <span class="badge" [ngClass]="produit.quantite > 10 ? 'bg-success-soft text-success border border-success' : produit.quantite > 0 ? 'bg-warning-soft text-warning border border-warning' : 'bg-danger-soft text-danger border border-danger'" style="padding: 4px 8px;">
                                {{ produit.quantite }} unités
                            </span>
                            <span *ngIf="produit.quantite === 0" class="fw-bold text-danger"><i class="bi bi-exclamation-triangle-fill"></i> Crit.</span>
                         </div>
                         <div class="progress shadow-sm" style="height: 6px; border-radius: 3px; background-color: var(--bg-inset);" *ngIf="produit.quantite > 0">
                            <div class="progress-bar" role="progressbar" 
                                 [ngClass]="produit.quantite > 10 ? 'bg-success' : 'bg-warning'"
                                 [style.width.%]="Math.min((produit.quantite / 50) * 100, 100)"></div>
                         </div>
                      </div>
                    </td>
                    <td class="py-3">
                      <span class="badge rounded bg-primary-soft text-primary border border-primary px-3 py-1 font-monospace" style="font-size:0.75rem;">
                         {{ produit.categorieNom }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <div class="btn-group gap-2">
                        <a [routerLink]="['/admin/stock/produits/modifier', produit.id]" class="btn btn-sm btn-light rounded shadow-sm bg-inset border" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;" title="Modifier Fiche">
                          <i class="bi bi-pencil" style="color: var(--accent-color, #4E80EE);"></i>
                        </a>
                        <button class="btn btn-sm btn-light rounded shadow-sm bg-inset border" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;" title="Retirer" (click)="confirmerSuppression(produit)">
                          <i class="bi bi-trash" style="color: #dc3545;"></i>
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
        <div *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
          <span class="text-secondary fw-semibold small px-2">Affichage {{ debut + 1 }} à {{ fin }} sur {{ produitsFiltres.length }}</span>
          <ul class="pagination pagination-sm m-0 gap-1 clinical-pagination">
             <li class="page-item" [class.disabled]="page === 1">
               <button class="page-link shadow-sm bg-card-surface border" (click)="page = page - 1; paginer()"><i class="bi bi-chevron-left"></i></button>
             </li>
             <li class="page-item" *ngFor="let p of pages" [class.active]="p === page">
               <button class="page-link shadow-sm bg-card-surface border" (click)="page = p; paginer()">{{ p }}</button>
             </li>
             <li class="page-item" [class.disabled]="page === totalPages">
               <button class="page-link shadow-sm bg-card-surface border" (click)="page = page + 1; paginer()"><i class="bi bi-chevron-right"></i></button>
             </li>
          </ul>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div *ngIf="produitASupprimer" class="modal fade show d-block">
        <div class="modal-backdrop fade show" style="backdrop-filter: blur(4px);" (click)="produitASupprimer = null"></div>
        <div class="modal-dialog modal-dialog-centered" style="z-index: 1055;">
          <div class="modal-content shadow-lg border-0 bg-card-surface" style="border-radius: 16px; overflow: hidden;">
            <div class="modal-header border-bottom-0 pt-4 pb-0">
               <button type="button" class="btn-close" (click)="produitASupprimer = null"></button>
            </div>
            <div class="modal-body px-4 pb-5 text-center">
              <div class="icon-circle mx-auto mb-4 bg-danger-soft text-danger d-flex align-items-center justify-content-center shadow-sm" style="width: 80px; height: 80px; border-radius: 16px;">
                 <i class="bi bi-exclamation-triangle-fill" style="font-size: 2.5rem;"></i>
              </div>
              <h4 class="fw-bold text-primary mb-3">Retirer du catalogue ?</h4>
              <p class="text-secondary fw-semibold mb-4">Êtes-vous sûr de vouloir supprimer définitivement la référence <br><strong class="text-primary font-monospace">"{{ produitASupprimer.nom }}"</strong> ?</p>
              
              <div class="d-flex gap-3 justify-content-center">
                <button class="btn btn-light rounded-pill px-4 fw-bold shadow-sm border" (click)="produitASupprimer = null">Annuler</button>
                <button class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" (click)="supprimer()">Confirmer Retrait</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clinical-card { background: var(--bg-card); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--border-color); }
    .bg-card-surface { background-color: var(--bg-card) !important; }
    .bg-inset { background-color: var(--bg-inset) !important; }
    
    .btn-clinical-primary {
      background-color: var(--accent-color, #4E80EE);
      color: white;
      border: 1px solid var(--accent-color, #4E80EE);
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-clinical-primary:hover {
      background-color: var(--accent-hover, #3b6bcc);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 128, 238, 0.3) !important;
    }
    
    .clinical-input, .clinical-select { border-radius: 8px; height: 44px; transition: all 0.2s; font-weight: 500; color: var(--text-primary); }
    .clinical-input:focus, .clinical-select:focus { background-color: var(--bg-card) !important; box-shadow: 0 0 0 3px rgba(78, 128, 238, 0.2) !important; outline: none; }
    
    .bg-success-soft { background-color: rgba(16, 185, 129, 0.1) !important; color: #10B981 !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.1) !important; color: #EF4444 !important; }
    .bg-warning-soft { background-color: rgba(245, 158, 11, 0.1) !important; color: #F59E0B !important; }
    .bg-primary-soft { background-color: rgba(78, 128, 238, 0.1) !important; color: var(--accent-color, #4E80EE) !important; }
    
    .clinical-pagination .page-link { border-radius: 8px !important; color: var(--text-secondary); font-weight: 600; transition: all 0.2s; }
    .clinical-pagination .page-item.active .page-link { background-color: var(--accent-color, #4E80EE) !important; color: white !important; border-color: var(--accent-color, #4E80EE) !important; }
    .clinical-pagination .page-link:hover:not(.active) { background-color: rgba(78, 128, 238, 0.1); color: var(--accent-color, #4E80EE); }
    
    .clinical-table tbody tr { transition: background-color 0.2s, transform 0.2s; background: var(--bg-card); cursor: default; }
    .clinical-table tbody tr:hover { background-color: var(--bg-inset) !important; transform: translateY(-1px); }

    .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .stagger-row { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .clinical-table tbody tr:nth-child(n) { animation-delay: calc(0.05s * n); }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    html[data-theme="dark"] .bg-card-surface { background-color: var(--bg-card) !important; }
    html[data-theme="dark"] .bg-inset { background-color: var(--bg-inset) !important; }
    html[data-theme="dark"] .text-primary { color: #f8fafc !important; }
    html[data-theme="dark"] .text-secondary { color: #94a3b8 !important; }
    html[data-theme="dark"] .clinical-input, html[data-theme="dark"] .clinical-select { color: #f8fafc; }
    html[data-theme="dark"] .modal-content { border: 1px solid var(--border-color) !important; }
  `]
})
export class ListeProduitsComponent implements OnInit {
  produits: Produit[] = [];
  produitsFiltres: Produit[] = [];
  produitsPage: Produit[] = [];
  categories: Categorie[] = [];
  
  message = '';
  messageType = '';
  produitASupprimer: Produit | null = null;
  chargement = true;
  Math = Math;

  recherche = '';
  filtreCategorie: number = 0;
  filtreStock = 'tous';

  // Pagination
  page = 1;
  parPage = 10;
  totalPages = 1;
  pages: number[] = [];
  debut = 0;
  fin = 0;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    
    this.categorieService.listerTout().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.chargerProduits();
      },
      error: (err) => {
        this.message = 'Erreur lors du chargement des catégories';
        this.messageType = 'error';
        this.chargerProduits();
      }
    });
  }

  chargerProduits(): void {
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        this.produits = prods;
        this.filtrer();
        this.chargement = false;
      },
      error: (err) => {
        this.message = 'Erreur lors du chargement des équipements';
        this.messageType = 'error';
        this.chargement = false;
        console.error(err);
      }
    });
  }

  filtrer(): void {
    let resultat = this.produits;

    if (this.recherche.trim()) {
      const q = this.recherche.toLowerCase().trim();
      resultat = resultat.filter(p => 
        p.nom.toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q) ||
        p.id?.toString() === q
      );
    }

    if (this.filtreCategorie !== 0) {
      resultat = resultat.filter(p => p.categorieId === this.filtreCategorie);
    }

    if (this.filtreStock !== 'tous') {
      if (this.filtreStock === 'rupture') {
        resultat = resultat.filter(p => p.quantite === 0);
      } else if (this.filtreStock === 'faible') {
        resultat = resultat.filter(p => p.quantite > 0 && p.quantite <= 10);
      } else if (this.filtreStock === 'normal') {
        resultat = resultat.filter(p => p.quantite > 10);
      }
    }

    this.produitsFiltres = resultat;
    this.page = 1;
    this.paginer();
  }
  
  reinitialiserFiltres(): void {
    this.recherche = '';
    this.filtreCategorie = 0;
    this.filtreStock = 'tous';
    this.filtrer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.produitsFiltres.length / this.parPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.debut = (this.page - 1) * this.parPage;
    this.fin = Math.min(this.debut + this.parPage, this.produitsFiltres.length);
    this.produitsPage = this.produitsFiltres.slice(this.debut, this.fin);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  confirmerSuppression(produit: Produit): void {
    this.produitASupprimer = produit;
  }

  supprimer(): void {
    if (this.produitASupprimer?.id) {
      this.produitService.supprimer(this.produitASupprimer.id).subscribe({
        next: () => {
          this.message = 'Équipement retiré du catalogue avec succès';
          this.messageType = 'success';
          this.produitASupprimer = null;
          this.chargerDonnees();
          setTimeout(() => this.message = '', 4000);
        },
        error: (err) => {
          this.message = 'Erreur lors du retrait du système';
          this.messageType = 'error';
          this.produitASupprimer = null;
          console.error(err);
        }
      });
    }
  }
}
