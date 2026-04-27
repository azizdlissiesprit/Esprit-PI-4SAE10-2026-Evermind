import { ChangeDetectorRef, Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CategorieService } from '../../../core/services/categorie.service';
import { ProduitService } from '../../../core/services/produit.service';
import { Categorie } from '../../../core/models/categorie.model';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="fo-hero">
      <div class="fo-hero-content">
        <span class="fo-view-kicker"><i class="bi bi-shield-check"></i>Boutique medicale</span>
        <h1>Gestion de Stock</h1>
        <p>Explorez notre gamme de produits et services adaptés au maintien de l'autonomie</p>
        <div class="fo-view-meta justify-content-center mb-4">
          <span class="fo-view-meta-item"
            ><i class="bi bi-clipboard2-pulse"></i>Produits traces</span
          >
          <span class="fo-view-meta-item"><i class="bi bi-truck"></i>Livraison rapide</span>
          <span class="fo-view-meta-item"><i class="bi bi-patch-check"></i>Qualite certifiee</span>
        </div>
        <a routerLink="/app/store/catalogue" class="fo-hero-btn">
          <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le Catalogue
        </a>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="fo-section" *ngIf="categories.length > 0">
      <div class="fo-section-container fo-view-shell">
        <h2 class="fo-section-title">Catégories</h2>
        <div class="fo-category-grid">
          <a
            *ngFor="let cat of categories"
            [routerLink]="['/app/store/categories', cat.id]"
            class="fo-category-card"
          >
            <div class="fo-category-icon">
              <i class="bi bi-tag-fill"></i>
            </div>
            <h3>{{ cat.nom }}</h3>
            <p>
              {{ cat.description | slice: 0 : 80
              }}{{ cat.description && cat.description.length > 80 ? '...' : '' }}
            </p>
            <span class="fo-category-count">Voir les produits</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Recent Products Section -->
    <section class="fo-section" *ngIf="recentProducts.length > 0">
      <div class="fo-section-container fo-view-shell">
        <div class="fo-section-header">
          <h2 class="fo-section-title">Derniers Produits</h2>
          <a routerLink="/app/store/catalogue" class="fo-section-link text-primary fw-bold"
            >Tout voir <i class="bi bi-arrow-right ms-1"></i
          ></a>
        </div>
        <div class="fo-product-grid">
          <a
            *ngFor="let prod of recentProducts; let i = index"
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
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div *ngIf="loading" class="fo-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  `,
})
export class AccueilComponent implements OnInit {
  categories: Categorie[] = [];
  recentProducts: Produit[] = [];
  loading = true;

  constructor(
    private categorieService: CategorieService,
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.debug('init');

    // Use forkJoin to load both categories and products in parallel.
    // We use catchError on each inner observable to ensure one failing doesn't block the other.
    // finalize ensures loading is set to false and change detection is triggered regardless of outcome.
    forkJoin({
      cats: this.categorieService.listerTout().pipe(
        catchError((err) => {
          this.debug('categories error', { message: err?.message, status: err?.status });
          return of([]);
        }),
      ),
      prods: this.produitService.listerTout().pipe(
        catchError((err) => {
          this.debug('products error', { message: err?.message, status: err?.status });
          return of([]);
        }),
      ),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.debug('loading false (all requests settled)');
          // Manually trigger change detection to fix the "infinite loading on first click" issue.
          this.cdr.detectChanges();
        }),
      )
      .subscribe(({ cats, prods }) => {
        this.categories = cats;
        this.debug('categories loaded', { count: cats.length });

        this.recentProducts = prods
          .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''))
          .slice(0, 6);
        this.debug('products loaded', { count: prods.length });
      });
  }

  private debug(message: string, data?: unknown): void {
    if (!isDevMode()) return;
    if (data !== undefined) {
      console.log(`[Store/Accueil] ${message}`, data);
      return;
    }
    console.log(`[Store/Accueil] ${message}`);
  }
}
