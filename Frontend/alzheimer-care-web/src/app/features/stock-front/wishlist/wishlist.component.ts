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
      <div class="fo-section-container">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb mb-4 d-flex align-items-center text-secondary small fw-semibold">
          <a routerLink="/" class="text-decoration-none text-secondary hover-primary"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right mx-2" style="font-size: 0.75rem;"></i>
          <span class="text-primary">Liste de souhaits</span>
        </div>

        <!-- Page title -->
        <div class="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle shadow-sm" style="background: rgba(220, 53, 69, 0.15); color: #dc3545; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              <i class="bi bi-heart-fill"></i>
            </div>
            <div>
              <h1 class="page-title d-flex align-items-center gap-2 mb-0 text-primary">Ma Liste de Souhaits</h1>
              <p class="page-subtitle text-secondary ms-1 mt-1 mb-0 fw-semibold">
                {{ items.length > 0
                  ? items.length + ' produit(s) sauvegardé(s)'
                  : 'Sauvegardez vos équipements favoris pour les retrouver facilement.' }}
              </p>
            </div>
          </div>
          <button *ngIf="items.length > 0" class="btn btn-outline-danger shadow-sm rounded-pill py-2 px-4 fw-bold" (click)="clearAll()">
            <i class="bi bi-trash3 me-1"></i> Tout vider
          </button>
        </div>

        <!-- Empty state -->
        <div *ngIf="items.length === 0" class="text-center p-5 clinical-card shadow-sm mt-4 animate-fade-up" style="border-radius: 16px; background: var(--bg-card);">
           <div class="icon-circle mx-auto mb-3" style="background: rgba(220, 53, 69, 0.05); color: rgba(220, 53, 69, 0.4); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
              <i class="bi bi-heart"></i>
           </div>
           <h5 class="fw-bold text-primary">Votre liste de souhaits est vide</h5>
           <p class="text-secondary fw-semibold">Explorez notre catalogue et ajoutez des articles à votre liste.</p>
           <a routerLink="/app/store/catalogue" class="btn btn-clinical-primary rounded-pill px-4 mt-2 shadow-sm fw-bold">
             <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le catalogue
           </a>
        </div>

        <!-- Product grid -->
        <div *ngIf="items.length > 0" class="row g-4 stagger-fade-in">
          <div *ngFor="let prod of items" class="col-xl-3 col-lg-4 col-md-6">
            <div class="card clinical-card h-100 border-0 shadow-sm text-decoration-none d-flex flex-column position-relative" style="border-radius: 16px; overflow: hidden; background: var(--bg-card);">
              
              <!-- Image & Badges -->
              <a [routerLink]="['/app/store/catalogue', prod.id]" class="position-relative text-decoration-none" style="height: 180px; background: var(--bg-inset); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <span *ngIf="isPromoActive(prod) && prod.remise" class="position-absolute top-0 start-0 m-3 badge bg-danger shadow-sm fs-6">-{{ prod.remise }}%</span>
                <span *ngIf="!isPromoActive(prod) && isNouveauProduit(prod)" class="position-absolute top-0 start-0 m-3 badge bg-primary shadow-sm fs-6">Nouveau</span>
                
                <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width: 100%; height: 100%; object-fit: cover;">
                <i *ngIf="!prod.imageUrl" class="bi bi-box-seam text-secondary" style="font-size: 3.5rem; opacity: 0.5;"></i>
              </a>

              <!-- Floating Actions -->
              <button class="btn btn-light rounded-circle shadow-sm position-absolute" style="top: 10px; right: 10px; width: 36px; height: 36px; z-index: 10; color: #dc3545;"
                      (click)="removeItem($event, prod.id!)"
                      title="Retirer de la liste">
                <i class="bi bi-heart-fill"></i>
              </button>
              <button class="btn btn-light rounded-circle shadow-sm position-absolute" style="top: 54px; right: 10px; width: 36px; height: 36px; z-index: 10;"
                      [ngClass]="compareService.isInCompare(prod.id!) ? 'text-primary' : 'text-secondary'"
                      (click)="toggleCompare($event, prod)"
                      [title]="compareService.isInCompare(prod.id!) ? 'Retirer de la comparaison' : 'Comparer'">
                <i class="bi" [class.bi-bar-chart-steps]="!compareService.isInCompare(prod.id!)" [class.bi-bar-chart-fill]="compareService.isInCompare(prod.id!)"></i>
              </button>

              <!-- Body -->
              <div class="card-body d-flex flex-column p-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                   <span class="badge rounded bg-card-surface text-primary shadow-sm border border-primary-subtle" style="font-size:0.75rem;">
                     {{ prod.categorieNom }}
                   </span>
                </div>
                <h5 class="fw-bold text-primary mb-2" style="font-size: 1.1rem; letter-spacing: -0.2px;">{{ prod.nom }}</h5>
                <p class="text-secondary small fw-semibold mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ prod.description || 'Description non disponible pour ce produit.' }}</p>

                <!-- Price Row -->
                <div class="d-flex align-items-center justify-content-between mb-2 pt-2 border-top">
                  <div *ngIf="isPromoActive(prod) && prod.prixOriginal" class="d-flex flex-column">
                    <span class="text-muted text-decoration-line-through small">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fw-bold text-danger font-monospace fs-5">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <div *ngIf="!isPromoActive(prod) || !prod.prixOriginal" class="fw-bold text-primary font-monospace fs-5">
                    {{ prod.prix | number:'1.2-2' }} TND
                  </div>
                  <span class="badge rounded" [ngClass]="prod.quantite > 0 ? 'bg-success-soft text-success border border-success' : 'bg-danger-soft text-danger border border-danger'" style="padding: 5px 10px; font-size: 0.75rem;">
                    {{ prod.quantite > 0 ? 'En stock' : 'Rupture' }}
                  </span>
                </div>

                <div class="mb-3" style="min-height: 24px;">
                  <app-promo-countdown *ngIf="isPromoActive(prod) && prod.dateFinPromo"
                    [dateFinPromo]="prod.dateFinPromo" size="card">
                  </app-promo-countdown>
                </div>

                <button *ngIf="prod.quantite > 0" class="btn btn-clinical-primary w-100 rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        [class.btn-success]="ajoutOk === prod.id"
                        (click)="ajouterAuPanier($event, prod)"
                        [disabled]="ajoutEnCours === prod.id" style="font-weight: 600;">
                  <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus"></i>
                  <i *ngIf="ajoutOk === prod.id" class="bi bi-check2-circle"></i>
                  {{ ajoutOk === prod.id ? 'Ajouté !' : 'Ajouter au panier' }}
                </button>
                <button *ngIf="prod.quantite === 0" class="btn btn-outline-danger w-100 rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center gap-2" disabled style="font-weight: 600; opacity:0.8;">
                  <i class="bi bi-x-circle"></i> Rupture de stock
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .clinical-card { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid var(--border-color); }
    .clinical-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -6px rgba(0,0,0,0.15) !important; border-color: var(--accent-light, #EEF2FF); }
    .bg-card-surface { background-color: var(--bg-card) !important; }
    .bg-inset { background-color: var(--bg-inset) !important; }
    
    .btn-clinical-primary {
      background-color: var(--accent-color, #4E80EE);
      color: white;
      border: 1px solid var(--accent-color, #4E80EE);
      transition: all 0.2s;
    }
    .btn-clinical-primary:hover:not(:disabled) {
      background-color: var(--accent-hover, #3b6bcc);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 128, 238, 0.3) !important;
    }

    .bg-success-soft { background-color: rgba(16, 185, 129, 0.1) !important; color: #10B981 !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.1) !important; color: #EF4444 !important; }
    
    .stagger-fade-in > * { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .stagger-fade-in > *:nth-child(1) { animation-delay: 0.05s; }
    .stagger-fade-in > *:nth-child(2) { animation-delay: 0.1s; }
    .stagger-fade-in > *:nth-child(3) { animation-delay: 0.15s; }
    .stagger-fade-in > *:nth-child(4) { animation-delay: 0.2s; }
    .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    html[data-theme="dark"] .clinical-card { border: 1px solid var(--border-color); }
  `]
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
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    console.log('[WishlistComponent] Initializing...');
    this.sub = this.wishlistService.wishlist$.subscribe(items => {
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
        setTimeout(() => { if (this.ajoutOk === produit.id) this.ajoutOk = null; }, 2000);
      },
      error: (err) => { 
        console.error(`[WishlistComponent] Failed to add to cart:`, err);
        this.ajoutEnCours = null; 
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
