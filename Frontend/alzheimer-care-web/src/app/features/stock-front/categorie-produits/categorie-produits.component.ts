import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CategorieService } from '../../../core/services/categorie.service';
import { ProduitService } from '../../../core/services/produit.service';
import { PanierService } from '../../../core/services/panier.service';
import { Categorie } from '../../../core/models/categorie.model';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-categorie-produits',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fo-section" *ngIf="!loading">
      <div class="fo-section-container fo-view-shell">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/app/store">Accueil</a>
          <span>/</span>
          <span>{{ categorie?.nom }}</span>
        </div>

        <!-- Category Header -->
        <div class="fo-category-header fo-view-intro fo-view-intro-compact" *ngIf="categorie">
          <div class="fo-category-header-icon">
            <i class="bi bi-tag-fill"></i>
          </div>
          <div>
            <span class="fo-view-kicker mb-2"><i class="bi bi-grid-3x3-gap"></i>Categorie</span>
            <h1>{{ categorie.nom }}</h1>
            <p>{{ categorie.description }}</p>
            <div class="fo-view-meta mt-3">
              <span class="fo-view-meta-item"
                ><i class="bi bi-box-seam"></i>{{ products.length }} produits</span
              >
              <span class="fo-view-meta-item"
                ><i class="bi bi-funnel"></i>Filtres intelligents</span
              >
            </div>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="fo-filter-bar">
          <div class="fo-search-box">
            <i class="bi bi-search"></i>
            <input
              type="text"
              title="Rechercher dans cette catégorie..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
            />
          </div>
          <select
            class="fo-filter-select fo-filter-stock"
            [(ngModel)]="selectedStock"
            (ngModelChange)="applyFilters()"
          >
            <option value="tous">Tous</option>
            <option value="en-stock">Disponible</option>
          </select>
          <a routerLink="/app/store/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-1"></i>Tout parcourir
          </a>
        </div>

        <!-- Toolbar: Sort + Results Count -->
        <div class="fo-toolbar">
          <div class="fo-toolbar-left">
            <span class="fo-results-count">
              <strong>{{ filteredProducts.length }}</strong>
              {{ filteredProducts.length !== 1 ? 'produits' : 'produit' }}
              <span *ngIf="hasActiveFilters()" class="fo-results-filtered">
                (filtré{{ filteredProducts.length !== 1 ? 's' : '' }})
                <button class="fo-clear-filters" (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i> Tout effacer
                </button>
              </span>
            </span>
          </div>
          <div class="fo-toolbar-right">
            <div class="fo-sort-control">
              <label><i class="bi bi-sort-down me-1"></i>Trier par</label>
              <select [(ngModel)]="sortBy" (ngModelChange)="applySort()">
                <option value="nom-asc">Nom A → Z</option>
                <option value="nom-desc">Nom Z → A</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                <option value="date-desc">Plus récents</option>
                <option value="date-asc">Plus anciens</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Active Filters Chips -->
        <div class="fo-filter-chips" *ngIf="hasActiveFilters()">
          <span class="fo-chip" *ngIf="searchTerm">
            Recherche : &laquo; {{ searchTerm }} &raquo;
            <button (click)="searchTerm = ''; applyFilters()"><i class="bi bi-x"></i></button>
          </span>
          <span class="fo-chip" *ngIf="selectedStock !== 'tous'">
            Stock : {{ getStockLabel(selectedStock) }}
            <button (click)="selectedStock = 'tous'; applyFilters()">
              <i class="bi bi-x"></i>
            </button>
          </span>
        </div>

        <!-- Product Grid (paginated) -->
        <div class="fo-product-grid" *ngIf="pagedProducts.length > 0">
          <a
            *ngFor="let prod of pagedProducts; let i = index"
            [routerLink]="['/app/store/catalogue', prod.id]"
            class="fo-product-card staggered-item"
            [style.animation-delay]="i * 0.05 + 's'"
          >
            <div class="fo-product-card-img" style="position: relative;">
              <div *ngIf="prod.enPromo" class="fo-badge-promo">-{{ prod.remise }}%</div>
              <img
                *ngIf="prod.imageUrl"
                [src]="prod.imageUrl"
                [alt]="prod.nom"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
            </div>
            <div class="fo-product-card-body">
              <span class="fo-product-card-category">{{ prod.categorieNom }}</span>
              <h4 class="fw-bold">{{ prod.nom }}</h4>
              <p>
                {{ prod.description | slice: 0 : 80
                }}{{ prod.description && prod.description.length > 80 ? '...' : '' }}
              </p>

              <div
                *ngIf="prod.joursAvantExpiration && prod.joursAvantExpiration <= 30"
                class="fo-alert-expiry d-flex align-items-center gap-1 mb-2"
              >
                <i class="bi bi-exclamation-triangle"></i> Expire bientôt
              </div>

              <div class="fo-product-card-footer mt-auto">
                <div class="d-flex align-items-center gap-2">
                  <span *ngIf="prod.enPromo" class="fo-price-original" style="font-size: 0.8rem;">{{
                    prod.prixOriginal | number: '1.2-2'
                  }}</span>
                  <span class="fo-product-price text-primary" style="font-size: 1.1rem;"
                    >{{ prod.prix | number: '1.2-2' }} TND</span
                  >
                </div>
                <span
                  class="fo-product-stock small rounded-pill px-2 py-1"
                  [class.in-stock]="prod.quantite > 0"
                  [class.out-of-stock]="prod.quantite === 0"
                >
                  {{ prod.quantite > 0 ? 'En stock' : 'Rupture' }}
                </span>
              </div>

              <button
                *ngIf="prod.quantite > 0"
                class="fo-add-cart-btn btn-active-scale mt-3"
                (click)="ajouterAuPanier($event, prod)"
                [disabled]="ajoutEnCours === prod.id"
              >
                <span
                  *ngIf="ajoutEnCours === prod.id"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <i
                  *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id"
                  class="bi bi-cart-plus me-1"
                ></i>
                <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                {{ ajoutOk === prod.id ? 'Ajouté !' : 'Ajouter au panier' }}
              </button>
            </div>
          </a>
        </div>

        <!-- Pagination -->
        <div class="fo-pagination" *ngIf="totalPages > 1">
          <div class="fo-pagination-info">
            Affichage {{ startIndex + 1 }}–{{ endIndex }} sur {{ filteredProducts.length }}
          </div>
          <div class="fo-pagination-controls">
            <button (click)="goToPage(1)" [disabled]="page === 1" title="Première page">
              <i class="bi bi-chevron-double-left"></i>
            </button>
            <button (click)="goToPage(page - 1)" [disabled]="page === 1" title="Page précédente">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              *ngFor="let p of visiblePages"
              (click)="goToPage(p)"
              [class.active]="p === page"
            >
              {{ p }}
            </button>
            <button
              (click)="goToPage(page + 1)"
              [disabled]="page === totalPages"
              title="Page suivante"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
            <button
              (click)="goToPage(totalPages)"
              [disabled]="page === totalPages"
              title="Dernière page"
            >
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </div>
          <div class="fo-pagination-size">
            <label>Par page :</label>
            <select [(ngModel)]="perPage" (ngModelChange)="onPerPageChange()">
              <option [ngValue]="6">6</option>
              <option [ngValue]="12">12</option>
              <option [ngValue]="24">24</option>
              <option [ngValue]="48">48</option>
            </select>
          </div>
        </div>

        <!-- Cart Error Toast -->
        <div *ngIf="ajoutErreur" class="fo-toast fo-toast-error fade-in">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ ajoutErreur }}
          <button
            (click)="ajoutErreur = ''"
            style="background: none; border: none; color: inherit; margin-left: 12px; cursor: pointer; font-size: 1.1rem;"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredProducts.length === 0 && !loading" class="fo-empty-state">
          <i class="bi bi-inbox"></i>
          <p *ngIf="!hasActiveFilters()">Aucun produit dans cette catégorie.</p>
          <p *ngIf="hasActiveFilters()">Aucun produit trouvé pour vos critères.</p>
          <button *ngIf="hasActiveFilters()" class="fo-btn fo-btn-outline" (click)="resetFilters()">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser les filtres
          </button>
          <a *ngIf="!hasActiveFilters()" routerLink="/app/store/catalogue" class="fo-btn fo-btn-outline"
            >Parcourir le catalogue</a
          >
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="fo-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  `,
})
export class CategorieProduitsComponent implements OnInit {
  // Data
  categorie: Categorie | null = null;
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  pagedProducts: Produit[] = [];

  // Filters
  searchTerm = '';
  selectedStock = 'tous';

  // Sort
  sortBy = 'nom-asc';

  // Pagination
  page = 1;
  perPage = 12;
  totalPages = 1;
  visiblePages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  loading = true;
  ajoutEnCours: number | null = null;
  ajoutOk: number | null = null;
  ajoutErreur = '';

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService,
    private produitService: ProduitService,
    private panierService: PanierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      this.loading = true;

      forkJoin({
        cat: this.categorieService.obtenirParId(id).pipe(catchError(() => of(null))),
        prods: this.produitService.listerParCategorie(id).pipe(catchError(() => of([]))),
      })
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }),
        )
        .subscribe(({ cat, prods }) => {
          this.categorie = cat;
          this.products = prods;
          this.applyFilters();
        });
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter((p) => {
      const matchSearch =
        !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      let matchStock = true;
      if (this.selectedStock === 'en-stock') matchStock = p.quantite > 0;
      return matchSearch && matchStock;
    });
    this.applySort();
  }

  applySort(): void {
    const [field, direction] = this.sortBy.split('-');
    this.filteredProducts.sort((a, b) => {
      let cmp = 0;
      switch (field) {
        case 'nom':
          cmp = a.nom.localeCompare(b.nom, 'fr');
          break;
        case 'prix':
          cmp = a.prix - b.prix;
          break;
        case 'date':
          cmp = (a.dateCreation || '').localeCompare(b.dateCreation || '');
          break;
      }
      return direction === 'desc' ? -cmp : cmp;
    });
    this.page = 1;
    this.paginate();
  }

  paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.perPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.startIndex = (this.page - 1) * this.perPage;
    this.endIndex = Math.min(this.startIndex + this.perPage, this.filteredProducts.length);
    this.pagedProducts = this.filteredProducts.slice(this.startIndex, this.endIndex);
    this.computeVisiblePages();
  }

  computeVisiblePages(): void {
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.paginate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPerPageChange(): void {
    this.page = 1;
    this.paginate();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || this.selectedStock !== 'tous';
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStock = 'tous';
    this.sortBy = 'nom-asc';
    this.applyFilters();
  }

  getStockLabel(value: string): string {
    const labels: Record<string, string> = {
      'en-stock': 'Disponible',
    };
    return labels[value] || value;
  }

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours) return;
    this.ajoutEnCours = produit.id;
    this.ajoutOk = null;
    this.ajoutErreur = '';
    this.panierService.ajouterProduit(produit.id, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null;
        this.ajoutOk = produit.id!;
        setTimeout(() => {
          if (this.ajoutOk === produit.id) this.ajoutOk = null;
        }, 2000);
      },
      error: (err) => {
        this.ajoutEnCours = null;
        this.ajoutErreur = err.error?.message || "Erreur lors de l'ajout au panier.";
        setTimeout(() => (this.ajoutErreur = ''), 5000);
      },
    });
  }
}
