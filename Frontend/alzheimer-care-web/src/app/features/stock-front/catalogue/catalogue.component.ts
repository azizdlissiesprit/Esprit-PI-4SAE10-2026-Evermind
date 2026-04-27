import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ProduitService } from '../../../core/services/produit.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { PanierService } from '../../../core/services/panier.service';
import { Produit } from '../../../core/models/produit.model';
import { Categorie } from '../../../core/models/categorie.model';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    .catalogue-bg {
      background-color: #f8fafc;
      min-height: 100vh;
    }
    html[data-theme='dark'] .catalogue-bg {
      background-color: var(--bg-main);
    }
    .filter-sidebar {
      position: sticky;
      top: 100px;
      z-index: 10;
      transition: all 0.3s ease;
    }
    html[data-theme='dark'] .filter-sidebar,
    html[data-theme='dark'] .bg-white {
      background-color: var(--bg-card) !important;
      border-color: var(--border) !important;
    }
    .modern-input {
      background: #f1f5f9;
      border: 1px solid transparent;
      border-radius: 1rem;
      padding: 0.8rem 1.2rem;
      font-size: 0.95rem;
      transition: all 0.2s;
      width: 100%;
    }
    html[data-theme='dark'] .modern-input {
      background: var(--bg-main);
      color: var(--text-primary);
    }
    .modern-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
    html[data-theme='dark'] .modern-input:focus {
      background: var(--bg-main);
    }
    
    .cat-list-item {
      padding: 0.6rem 1rem;
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      color: #475569;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    html[data-theme='dark'] .cat-list-item {
      color: var(--text-secondary);
    }
    .cat-list-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    html[data-theme='dark'] .cat-list-item:hover {
      background: var(--primary-light);
      color: var(--accent-color);
    }
    .cat-list-item.active {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 700;
    }
    html[data-theme='dark'] .cat-list-item.active {
      background: rgba(37, 99, 235, 0.2);
      color: #60a5fa;
    }
    
    .price-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 5px;
      outline: none;
    }
    html[data-theme='dark'] .price-slider {
      background: var(--border);
    }
    .price-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2563eb;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(37,99,235,0.4);
      transition: transform 0.1s;
    }
    .price-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    
    .filter-section-title {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 1rem;
    }
    
    /* Toolbar / Sort */
    .modern-select {
      appearance: none;
      background: #f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E") no-repeat right 1rem center;
      background-size: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 0.6rem 2.5rem 0.6rem 1.2rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    html[data-theme='dark'] .modern-select {
      background-color: var(--bg-main);
      border-color: var(--border);
      color: var(--text-primary);
    }
    .modern-select:focus {
      outline: none;
      border-color: #3b82f6;
    }
    
    /* Product Grid Modernization */
    .product-card-modern {
      background: #fff;
      border-radius: 1.5rem;
      border: 1px solid rgba(0,0,0,0.04);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      text-decoration: none;
    }
    html[data-theme='dark'] .product-card-modern {
      background: var(--bg-card);
      border-color: var(--border);
    }
    .product-card-modern:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      border-color: rgba(37,99,235,0.2);
    }
    html[data-theme='dark'] .product-card-modern:hover {
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      border-color: var(--accent-color);
    }
    .product-img-container {
      position: relative;
      height: 220px;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    html[data-theme='dark'] .product-img-container {
      background: linear-gradient(135deg, #2a2d35, #1e2028);
    }
    .product-img-container img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
      transition: transform 0.5s ease;
    }
    .product-card-modern:hover .product-img-container img {
      transform: scale(1.08);
    }
    .promo-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 1rem;
      font-weight: 800;
      font-size: 0.8rem;
      box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);
      z-index: 2;
    }
    
    /* Toggle Switch */
    .stock-toggle {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }
    .stock-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #cbd5e1;
      transition: .4s;
      border-radius: 34px;
    }
    html[data-theme='dark'] .toggle-slider {
      background-color: var(--border);
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .toggle-slider {
      background-color: #10b981;
    }
    input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
    
    .active-filter-chip {
      background: #eff6ff;
      color: #1e40af;
      padding: 0.4rem 1rem;
      border-radius: 2rem;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #bfdbfe;
    }
    html[data-theme='dark'] .active-filter-chip {
      background: rgba(37, 99, 235, 0.2);
      color: #60a5fa;
      border-color: rgba(37, 99, 235, 0.4);
    }
    .active-filter-chip button {
      background: none;
      border: none;
      color: inherit;
      padding: 0;
      display: flex;
      align-items: center;
      opacity: 0.6;
    }
    .active-filter-chip button:hover {
      opacity: 1;
    }
  `],
  template: `
    <div class="fo-section py-4 py-lg-5 catalogue-bg">
      <div class="container-fluid px-4 px-lg-5" style="max-width: 1500px;">
        
        <!-- Header -->
        <div class="mb-5 text-center text-lg-start">
          <span class="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase" style="letter-spacing: 1px;">
            <i class="bi bi-heart-pulse me-2"></i>E-Shop Paramédical
          </span>
          <h1 class="display-5 fw-bolder text-dark mb-3">Catalogue des Produits</h1>
          <p class="text-secondary lead mb-0">Parcourez notre équipement de qualité médicale, disponible immédiatement.</p>
        </div>

        <div class="row g-4 g-xl-5">
          <!-- Left Sidebar Filters -->
          <div class="col-lg-3">
            <div class="filter-sidebar bg-white p-4 rounded-4 shadow-sm border border-light-subtle">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <h4 class="fw-bold m-0 text-dark"><i class="bi bi-funnel me-2 text-primary"></i> Filtres</h4>
                <button *ngIf="hasActiveFilters()" class="btn btn-link text-danger p-0 text-decoration-none fw-semibold fs-6" (click)="resetFilters()">
                  Effacer
                </button>
              </div>

              <!-- Search -->
              <div class="mb-4">
                <div class="filter-section-title">Recherche</div>
                <div class="position-relative">
                  <i class="bi bi-search position-absolute top-50 translate-middle-y text-secondary" style="left: 1.2rem;"></i>
                  <input type="text" class="modern-input" style="padding-left: 2.8rem;" placeholder="Nom du produit..." 
                         [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()">
                </div>
              </div>

              <hr class="border-light-subtle my-4">

              <!-- Categories -->
              <div class="mb-4">
                <div class="filter-section-title">Catégories</div>
                <div class="d-flex flex-column gap-2">
                  <div class="cat-list-item" [class.active]="selectedCategory === 0" (click)="selectCategory(0)">
                    <span>Toutes les catégories</span>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">{{ products.length }}</span>
                  </div>
                  <div class="cat-list-item" *ngFor="let cat of categories" [class.active]="selectedCategory === cat.id" (click)="selectCategory(cat.id!)">
                    <span>{{ cat.nom }}</span>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">{{ getCategoryCount(cat.id!) }}</span>
                  </div>
                </div>
              </div>

              <hr class="border-light-subtle my-4">

              <!-- Price Slider -->
              <div class="mb-4">
                <div class="filter-section-title d-flex justify-content-between">
                  <span>Prix Maximum</span>
                  <span class="text-primary fw-bold">{{ selectedMaxPrice | number:'1.0-0' }} TND</span>
                </div>
                <div class="px-2 mb-3">
                  <input type="range" class="price-slider" 
                         [min]="minPriceLimit" [max]="maxPriceLimit" 
                         [(ngModel)]="selectedMaxPrice" (ngModelChange)="applyFilters()">
                </div>
                <div class="d-flex justify-content-between text-muted small fw-medium px-1">
                  <span>{{ minPriceLimit }} TND</span>
                  <span>{{ maxPriceLimit }} TND</span>
                </div>
              </div>

              <hr class="border-light-subtle my-4">

              <!-- Stock Availability -->
              <div>
                <div class="filter-section-title">Disponibilité</div>
                <div class="d-flex align-items-center justify-content-between">
                  <span class="fw-medium text-dark">En stock uniquement</span>
                  <label class="stock-toggle">
                    <input type="checkbox" [(ngModel)]="stockOnly" (ngModelChange)="applyFilters()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content Area -->
          <div class="col-lg-9">
            <!-- Toolbar -->
            <div class="bg-white p-3 rounded-4 shadow-sm border border-light-subtle d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="fw-bold text-dark fs-5 me-2">{{ filteredProducts.length }} <span class="text-secondary fw-medium fs-6">produits trouvés</span></span>
                
                <!-- Active Chips -->
                <div class="active-filter-chip" *ngIf="searchTerm">
                  "{{ searchTerm }}" <button (click)="searchTerm = ''; applyFilters()"><i class="bi bi-x-circle-fill"></i></button>
                </div>
                <div class="active-filter-chip" *ngIf="selectedCategory !== 0">
                  {{ getCategoryName(selectedCategory) }} <button (click)="selectCategory(0)"><i class="bi bi-x-circle-fill"></i></button>
                </div>
                <div class="active-filter-chip text-success bg-success bg-opacity-10 border-success" *ngIf="stockOnly" style="border-color: rgba(25,135,84,0.3) !important;">
                  En stock <button (click)="stockOnly = false; applyFilters()"><i class="bi bi-x-circle-fill"></i></button>
                </div>
              </div>
              
              <div class="d-flex align-items-center gap-3 ms-md-auto">
                <label class="text-secondary fw-medium text-nowrap d-none d-sm-block">Trier par :</label>
                <select class="modern-select" [(ngModel)]="sortBy" (ngModelChange)="applySort()">
                  <option value="nom-asc">A → Z</option>
                  <option value="nom-desc">Z → A</option>
                  <option value="prix-asc">Prix croissant</option>
                  <option value="prix-desc">Prix décroissant</option>
                  <option value="date-desc">Plus récents</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="d-flex flex-column align-items-center justify-content-center py-5" style="min-height: 400px;">
              <div class="spinner-grow text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
              <h5 class="text-secondary">Chargement du catalogue...</h5>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && filteredProducts.length === 0" class="bg-white rounded-4 shadow-sm border border-light-subtle text-center py-5 px-3">
              <i class="bi bi-search display-1 text-secondary opacity-25 mb-4"></i>
              <h3 class="fw-bold text-dark">Aucun produit trouvé</h3>
              <p class="text-secondary mb-4">Essayez de modifier vos filtres ou d'élargir votre recherche.</p>
              <button class="btn btn-primary btn-lg rounded-pill px-4 fw-bold shadow-sm" (click)="resetFilters()">
                Réinitialiser les filtres
              </button>
            </div>

            <!-- Product Grid -->
            <div class="row g-4" *ngIf="!loading && pagedProducts.length > 0">
              <div class="col-sm-6 col-xl-4 staggered-item" *ngFor="let prod of pagedProducts; let i = index" [style.animation-delay]="(i % 12) * 0.05 + 's'">
                <a [routerLink]="['/app/store/catalogue', prod.id]" class="product-card-modern">
                  <div class="product-img-container">
                    <div *ngIf="prod.enPromo" class="promo-badge">-{{ prod.remise }}%</div>
                    <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" />
                    <i *ngIf="!prod.imageUrl" class="bi bi-box-seam display-1 text-secondary opacity-25"></i>
                  </div>
                  <div class="p-4 d-flex flex-column flex-grow-1 bg-white">
                    <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill align-self-start mb-2">{{ prod.categorieNom }}</span>
                    <h5 class="fw-bold text-dark mb-2" style="line-height: 1.3;">{{ prod.nom }}</h5>
                    
                    <div *ngIf="prod.joursAvantExpiration && prod.joursAvantExpiration <= 30" 
                         class="d-flex align-items-center gap-2 text-warning mb-3 small fw-bold bg-warning bg-opacity-10 p-2 rounded-3">
                      <i class="bi bi-exclamation-triangle-fill"></i> Expire dans {{ prod.joursAvantExpiration }} jours
                    </div>

                    <div class="mt-auto pt-3 border-top border-light-subtle d-flex align-items-end justify-content-between">
                      <div>
                        <div *ngIf="prod.enPromo" class="text-decoration-line-through text-secondary small fw-medium">{{ prod.prixOriginal | number: '1.2-2' }} TND</div>
                        <div class="fs-4 fw-bolder text-primary" style="line-height: 1;">{{ prod.prix | number: '1.2-2' }} <span class="fs-6">TND</span></div>
                      </div>
                      <span class="badge" [ngClass]="prod.quantite > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                        {{ prod.quantite > 0 ? 'En stock' : 'Rupture' }}
                      </span>
                    </div>
                    
                    <button *ngIf="prod.quantite > 0" class="btn btn-light w-100 mt-3 fw-bold rounded-3 text-primary border border-primary-subtle"
                            (click)="ajouterAuPanier($event, prod)" [disabled]="ajoutEnCours === prod.id"
                            style="transition: all 0.2s;"
                            onmouseover="this.classList.replace('btn-light', 'btn-primary'); this.classList.replace('text-primary', 'text-white')"
                            onmouseout="this.classList.replace('btn-primary', 'btn-light'); this.classList.replace('text-white', 'text-primary')">
                      <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-2"></i>
                      <i *ngIf="ajoutOk === prod.id" class="bi bi-check-circle-fill me-2"></i>
                      {{ ajoutOk === prod.id ? 'Ajouté !' : 'Ajouter' }}
                    </button>
                  </div>
                </a>
              </div>
            </div>

            <!-- Pagination Modernized -->
            <div class="bg-white p-3 rounded-4 shadow-sm border border-light-subtle d-flex flex-column flex-md-row align-items-center justify-content-between mt-5" *ngIf="!loading && totalPages > 1">
              <div class="text-secondary fw-medium mb-3 mb-md-0">
                Affichage de <span class="text-dark fw-bold">{{ startIndex + 1 }}</span> à <span class="text-dark fw-bold">{{ endIndex }}</span> sur {{ filteredProducts.length }}
              </div>
              
              <div class="d-flex gap-1">
                <button class="btn btn-outline-secondary border-0 rounded-circle" style="width: 40px; height: 40px;" (click)="goToPage(1)" [disabled]="page === 1" title="Première"><i class="bi bi-chevron-double-left"></i></button>
                <button class="btn btn-outline-secondary border-0 rounded-circle" style="width: 40px; height: 40px;" (click)="goToPage(page - 1)" [disabled]="page === 1" title="Précédente"><i class="bi bi-chevron-left"></i></button>
                
                <button *ngFor="let p of visiblePages" class="btn rounded-circle fw-bold" style="width: 40px; height: 40px;"
                        [ngClass]="p === page ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-0'"
                        (click)="goToPage(p)">
                  {{ p }}
                </button>
                
                <button class="btn btn-outline-secondary border-0 rounded-circle" style="width: 40px; height: 40px;" (click)="goToPage(page + 1)" [disabled]="page === totalPages" title="Suivante"><i class="bi bi-chevron-right"></i></button>
                <button class="btn btn-outline-secondary border-0 rounded-circle" style="width: 40px; height: 40px;" (click)="goToPage(totalPages)" [disabled]="page === totalPages" title="Dernière"><i class="bi bi-chevron-double-right"></i></button>
              </div>
            </div>

            <!-- Cart Toast -->
            <div *ngIf="ajoutErreur" class="alert alert-danger position-fixed bottom-0 end-0 m-4 shadow-lg rounded-4 d-flex align-items-center z-3" style="max-width: 400px; animation: fadeUp 0.3s forwards;">
              <i class="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
              <div>
                <h6 class="fw-bold mb-1">Erreur d'ajout</h6>
                <div class="small">{{ ajoutErreur }}</div>
              </div>
              <button type="button" class="btn-close ms-auto" aria-label="Close" (click)="ajoutErreur = ''"></button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  pagedProducts: Produit[] = [];
  categories: Categorie[] = [];

  searchTerm = '';
  selectedCategory = 0;
  stockOnly = false;
  
  minPriceLimit = 0;
  maxPriceLimit = 1000;
  selectedMaxPrice = 1000;

  sortBy = 'nom-asc';

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
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private panierService: PanierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      cats: this.categorieService.listerTout().pipe(catchError(() => of([]))),
      prods: this.produitService.listerTout().pipe(catchError(() => of([]))),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(({ cats, prods }) => {
        this.categories = cats;
        this.products = prods;
        
        if (this.products.length > 0) {
          this.maxPriceLimit = Math.ceil(Math.max(...this.products.map(p => p.prix)));
          this.selectedMaxPrice = this.maxPriceLimit;
        }
        
        this.applyFilters();
      });
  }

  selectCategory(id: number): void {
    this.selectedCategory = id;
    this.applyFilters();
  }

  getCategoryCount(id: number): number {
    return this.products.filter(p => p.categorieId === id).length;
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter((p) => {
      const matchSearch =
        !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = this.selectedCategory === 0 || p.categorieId === this.selectedCategory;
      const matchStock = !this.stockOnly || p.quantite > 0;
      const matchPrice = p.prix <= this.selectedMaxPrice;
      
      return matchSearch && matchCategory && matchStock && matchPrice;
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

  hasActiveFilters(): boolean {
    return !!this.searchTerm || this.selectedCategory !== 0 || this.stockOnly || this.selectedMaxPrice < this.maxPriceLimit;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 0;
    this.stockOnly = false;
    this.selectedMaxPrice = this.maxPriceLimit;
    this.sortBy = 'nom-asc';
    this.applyFilters();
  }

  getCategoryName(id: number): string {
    return this.categories.find((c) => c.id === id)?.nom || '';
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

