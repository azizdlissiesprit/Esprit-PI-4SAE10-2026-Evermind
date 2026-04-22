import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../core/services/wishlist.service';
import { PanierService } from '../../../core/services/panier.service';
import { CompareService } from '../../../core/services/compare.service';
import { TraductionService } from '../../../core/services/traduction.service';
import { Produit, isPromoActive } from '../../../core/models/produit.model';
import { PromoCountdownComponent } from '../../../shared/components/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, PromoCountdownComponent],
  template: `
    <div class="fo-section slide-in">
      <div class="fo-section-container fo-view-shell">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb mb-4 d-flex align-items-center text-secondary small fw-semibold">
          <a routerLink="/app/store" class="text-decoration-none text-secondary hover-primary"
            ><i class="bi bi-house-door"></i
          ></a>
          <i class="bi bi-chevron-right mx-2" style="font-size: 0.75rem;"></i>
          <span class="text-primary">Liste de souhaits</span>
        </div>

        <!-- Page title -->
        <div class="fo-view-intro mb-4">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="fo-fav-title-icon">
                <i class="bi bi-heart-fill"></i>
              </div>
              <div>
                <span class="fo-view-kicker mb-2"><i class="bi bi-stars"></i>Favoris</span>
                <h1 class="fo-page-title d-flex align-items-center gap-2 mb-0">
                  Ma Liste de Souhaits
                </h1>
                <p class="fo-page-subtitle ms-1 mt-1 mb-0">
                  {{
                    items.length > 0
                      ? items.length + ' produit(s) sauvegarde(s)'
                      : 'Sauvegardez vos equipements favoris pour les retrouver facilement.'
                  }}
                </p>
              </div>
            </div>
            <div>
              <div class="fo-view-meta">
                <span class="fo-view-meta-item">
                  <i class="bi bi-heart-fill"></i>{{ items.length }} article{{
                    items.length > 1 ? 's' : ''
                  }}
                </span>
                <button
                  *ngIf="items.length > 0"
                  class="fo-btn fo-btn-outline fo-fav-clear-btn"
                  (click)="clearAll()"
                >
                  <i class="bi bi-trash3 me-1"></i>Tout vider
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="items.length === 0" class="fo-empty-state fo-fav-empty animate-fade-up">
          <i class="bi bi-heart"></i>
          <h5 class="fw-bold text-primary">Votre liste de souhaits est vide</h5>
          <p>Explorez notre catalogue et ajoutez des articles a votre liste.</p>
          <a routerLink="/app/store/catalogue" class="fo-btn fo-btn-primary mt-2">
            <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le catalogue
          </a>
        </div>

        <!-- Product grid -->
        <div *ngIf="items.length > 0" class="fo-product-grid fo-fav-grid stagger-fade-in">
          <article *ngFor="let prod of items" class="fo-product-card fo-fav-card">
            <!-- Image & Badges -->
            <a
              [routerLink]="['/app/store/catalogue', prod.id]"
              class="fo-product-card-img fo-fav-image-link"
            >
              <span *ngIf="isPromoActive(prod) && prod.remise" class="fo-badge-promo"
                >-{{ prod.remise }}%</span
              >
              <span *ngIf="!isPromoActive(prod) && isNouveauProduit(prod)" class="fo-fav-badge-new"
                >Nouveau</span
              >

              <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" />
              <i *ngIf="!prod.imageUrl" class="bi bi-box-seam fo-fav-no-image"></i>
            </a>

            <!-- Floating Actions -->
            <div class="fo-fav-actions">
              <button
                class="fo-fav-action fo-fav-action-remove"
                (click)="removeItem($event, prod.id!)"
                title="Retirer de la liste"
              >
                <i class="bi bi-heart-fill"></i>
              </button>
              <button
                class="fo-fav-action"
                [class.active]="compareService.isInCompare(prod.id!)"
                (click)="toggleCompare($event, prod)"
                [title]="
                  compareService.isInCompare(prod.id!) ? 'Retirer de la comparaison' : 'Comparer'
                "
              >
                <i
                  class="bi"
                  [class.bi-bar-chart-steps]="!compareService.isInCompare(prod.id!)"
                  [class.bi-bar-chart-fill]="compareService.isInCompare(prod.id!)"
                ></i>
              </button>
            </div>

            <!-- Body -->
            <div class="fo-product-card-body">
              <span class="fo-product-card-category">{{ prod.categorieNom }}</span>
              <h4 class="fw-bold">{{ prod.nom }}</h4>
              <p>{{ prod.description || 'Description non disponible pour ce produit.' }}</p>

              <div class="fo-fav-price-row">
                <div *ngIf="isPromoActive(prod) && prod.prixOriginal" class="d-flex flex-column">
                  <span class="text-muted text-decoration-line-through small"
                    >{{ prod.prixOriginal | number: '1.2-2' }} TND</span
                  >
                  <span class="fw-bold text-danger">{{ prod.prix | number: '1.2-2' }} TND</span>
                </div>
                <div *ngIf="!isPromoActive(prod) || !prod.prixOriginal" class="fo-product-price">
                  {{ prod.prix | number: '1.2-2' }} TND
                </div>
                <span
                  class="fo-product-stock"
                  [class.in-stock]="prod.quantite > 0"
                  [class.out-of-stock]="prod.quantite === 0"
                >
                  {{ prod.quantite > 0 ? 'En stock' : 'Rupture' }}
                </span>
              </div>

              <div class="fo-fav-countdown">
                <app-promo-countdown
                  *ngIf="isPromoActive(prod) && prod.dateFinPromo"
                  [dateFinPromo]="prod.dateFinPromo"
                  size="card"
                >
                </app-promo-countdown>
              </div>

              <button
                *ngIf="prod.quantite > 0"
                class="fo-add-cart-btn fo-fav-cart-btn btn-active-scale"
                [class.fo-fav-cart-success]="ajoutOk === prod.id"
                (click)="ajouterAuPanier($event, prod)"
                [disabled]="ajoutEnCours === prod.id"
              >
                <span
                  *ngIf="ajoutEnCours === prod.id"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <i
                  *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id"
                  class="bi bi-cart-plus"
                ></i>
                <i *ngIf="ajoutOk === prod.id" class="bi bi-check2-circle"></i>
                {{ ajoutOk === prod.id ? 'Ajoute !' : 'Ajouter au panier' }}
              </button>

              <button *ngIf="prod.quantite === 0" class="fo-add-cart-btn fo-fav-out-btn" disabled>
                <i class="bi bi-x-circle"></i> Rupture de stock
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .fo-fav-title-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        color: #dc3545;
        background: rgba(220, 53, 69, 0.12);
        border: 1px solid rgba(220, 53, 69, 0.22);
      }

      .fo-fav-clear-btn {
        border-color: rgba(220, 53, 69, 0.42);
        color: #dc3545;
      }

      .fo-fav-clear-btn:hover {
        background: #dc3545;
        border-color: #dc3545;
        color: #fff;
      }

      .fo-fav-empty {
        margin-top: 10px;
      }

      .fo-fav-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }

      .fo-fav-card {
        position: relative;
      }

      .fo-fav-image-link {
        text-decoration: none;
        position: relative;
      }

      .fo-fav-badge-new {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 10;
        border-radius: 999px;
        font-size: 0.72rem;
        letter-spacing: 0.03em;
        font-weight: 700;
        padding: 4px 10px;
        background: var(--accent-color);
        color: #fff;
        box-shadow: 0 4px 14px rgba(78, 128, 238, 0.32);
      }

      .fo-fav-no-image {
        font-size: 3.1rem;
        color: var(--text-secondary);
        opacity: 0.45;
      }

      .fo-fav-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 11;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .fo-fav-action {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid var(--border);
        background: var(--bg-card);
        color: var(--text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
        box-shadow: 0 6px 18px rgba(2, 8, 23, 0.14);
      }

      .fo-fav-action:hover {
        color: var(--accent-color);
        border-color: var(--accent-color);
        transform: translateY(-1px);
      }

      .fo-fav-action.active {
        color: var(--accent-color);
        border-color: rgba(78, 128, 238, 0.5);
        background: var(--primary-light);
      }

      .fo-fav-action-remove {
        color: #dc3545;
        border-color: rgba(220, 53, 69, 0.4);
      }

      .fo-fav-action-remove:hover {
        color: #fff;
        background: #dc3545;
        border-color: #dc3545;
      }

      .fo-fav-price-row {
        margin-top: 8px;
        padding-top: 10px;
        border-top: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .fo-fav-countdown {
        min-height: 24px;
        margin: 10px 0 12px;
      }

      .fo-fav-cart-btn {
        margin-top: auto;
      }

      .fo-fav-cart-success {
        background: #16a34a;
        border-color: #16a34a;
        color: #fff;
      }

      .fo-fav-out-btn {
        margin-top: auto;
        border-color: rgba(220, 38, 38, 0.36);
        color: #dc2626;
        background: rgba(220, 38, 38, 0.08);
        cursor: not-allowed;
      }

      .fo-fav-out-btn i {
        margin-right: 6px;
      }

      .stagger-fade-in > * {
        animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
      }
      .stagger-fade-in > *:nth-child(1) {
        animation-delay: 0.05s;
      }
      .stagger-fade-in > *:nth-child(2) {
        animation-delay: 0.1s;
      }
      .stagger-fade-in > *:nth-child(3) {
        animation-delay: 0.15s;
      }
      .stagger-fade-in > *:nth-child(4) {
        animation-delay: 0.2s;
      }
      .animate-fade-up {
        animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .fo-fav-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class WishlistComponent implements OnInit, OnDestroy {
  readonly isPromoActive = isPromoActive;

  items: Produit[] = [];
  ajoutEnCours: number | null = null;
  ajoutOk: number | null = null;
  private sub!: Subscription;

  constructor(
    public wishlistService: WishlistService,
    private panierService: PanierService,
    public compareService: CompareService,
    public t: TraductionService,
  ) {}

  ngOnInit(): void {
    console.log('[WishlistComponent] Initializing...');
    this.sub = this.wishlistService.wishlist$.subscribe((items) => {
      this.items = items;
      console.log(`[WishlistComponent] Items loaded: ${items.length}`);
    });
  }

  removeItem(event: Event, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    console.log(`[WishlistComponent] Removing item: ${id}`);
    this.wishlistService.remove(id);
  }

  toggleCompare(event: Event, prod: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    console.log(`[WishlistComponent] Toggling compare for item:`, prod);
    this.compareService.toggle(prod);
  }

  clearAll(): void {
    console.log('[WishlistComponent] Clearing all wishlist items.');
    this.wishlistService.clear();
  }

  isNouveauProduit(prod: Produit): boolean {
    if (!prod.dateCreation) return false;
    return Date.now() - new Date(prod.dateCreation).getTime() <= 30 * 24 * 60 * 60 * 1000;
  }

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours === produit.id) return;

    console.log(`[WishlistComponent] Adding to cart:`, produit);
    this.ajoutEnCours = produit.id;
    this.ajoutOk = null;
    this.panierService.ajouterProduit(produit.id, 1).subscribe({
      next: () => {
        console.log(`[WishlistComponent] Added to cart successfully.`);
        this.ajoutEnCours = null;
        this.ajoutOk = produit.id!;
        setTimeout(() => {
          if (this.ajoutOk === produit.id) this.ajoutOk = null;
        }, 2000);
      },
      error: (err) => {
        console.error(`[WishlistComponent] Failed to add to cart:`, err);
        this.ajoutEnCours = null;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
