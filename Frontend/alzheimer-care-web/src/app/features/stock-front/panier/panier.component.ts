import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService } from '../../../core/services/panier.service';
import { finalize } from 'rxjs/operators';

import { Panier, LignePanier } from '../../../core/models/panier.model';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in fo-view-shell">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/app/store">Accueil</a>
          <span>/</span>
          <span>Mon Panier</span>
        </div>

        <div class="fo-view-intro fo-view-intro-compact mb-4">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="fo-cart-title-icon">
                <i class="bi bi-cart3"></i>
              </div>
              <div>
                <h1 class="fo-page-title mb-1">Mon Panier</h1>
                <p class="fo-page-subtitle mb-0">
                  Gerez les articles de votre panier avant de passer commande.
                </p>
              </div>
            </div>
            <div class="fo-view-meta" *ngIf="panier">
              <span class="fo-view-meta-item"
                ><i class="bi bi-box-seam"></i>{{ panier.nombreArticles }} article{{
                  panier.nombreArticles > 1 ? 's' : ''
                }}</span
              >
              <span class="fo-view-meta-item"
                ><i class="bi bi-cash-stack"></i
                >{{ panier.montantTotal | number: '1.2-2' }} TND</span
              >
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="chargement" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="!chargement && panier && panier.lignes.length === 0" class="fo-empty-state">
          <i class="bi bi-cart-x"></i>
          <p>Votre panier est vide.</p>
          <a routerLink="/app/store/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le catalogue
          </a>
        </div>

        <!-- Cart Content -->
        <div *ngIf="!chargement && panier && panier.lignes.length > 0">
          <!-- Reservation Info Banner -->
          <div class="fo-cart-alert d-flex align-items-center mb-4">
            <div class="fo-cart-alert-icon">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="flex-grow-1">
              <div class="fo-cart-alert-title">Votre panier est réservé pour une durée limitée</div>
              <div class="fo-cart-alert-subtitle">
                Finalisez votre commande pour ne pas perdre vos articles.
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Cart Items -->
            <div class="col-lg-8">
              <div class="card fo-cart-items-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold">
                    <i class="bi bi-bag-fill me-2 text-primary"></i>
                    {{ panier.nombreArticles }}
                    {{ panier.nombreArticles !== 1 ? 'produits' : 'produit' }}
                  </h6>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    (click)="viderPanier()"
                    [disabled]="enCours"
                  >
                    <i class="bi bi-trash me-1"></i>Vider le panier
                  </button>
                </div>
                <div class="card-body p-0">
                  <div
                    *ngFor="let ligne of panier.lignes; let last = last"
                    class="fo-cart-item d-flex align-items-center p-4"
                    [class.fo-cart-item-border]="!last"
                  >
                    <!-- Product Image -->
                    <div class="fo-cart-thumb me-3">
                      <img
                        *ngIf="ligne.produitImageUrl"
                        [src]="ligne.produitImageUrl"
                        [alt]="ligne.produitNom"
                      />
                      <i *ngIf="!ligne.produitImageUrl" class="bi bi-box-seam"></i>
                    </div>
                    <!-- Product Info -->
                    <div class="flex-grow-1">
                      <div class="fw-bold">{{ ligne.produitNom }}</div>
                      <small class="text-muted">{{ ligne.categorieNom }}</small>
                      <div class="mt-1">
                        <span class="fw-semibold text-primary"
                          >{{ ligne.produitPrix | number: '1.2-2' }} TND</span
                        >
                      </div>
                    </div>
                    <!-- Quantity Controls -->
                    <div class="fo-cart-qty d-flex align-items-center gap-2 me-4">
                      <button
                        class="fo-qty-btn"
                        (click)="modifierQuantite(ligne, ligne.quantite - 1)"
                        [disabled]="enCours || ligne.quantite <= 1"
                      >
                        <i class="bi bi-dash"></i>
                      </button>
                      <span class="fw-bold fo-qty-value">{{ ligne.quantite }}</span>
                      <button
                        class="fo-qty-btn"
                        (click)="modifierQuantite(ligne, ligne.quantite + 1)"
                        [disabled]="enCours || ligne.quantite >= 10"
                      >
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <!-- Subtotal -->
                    <div class="fo-line-total text-end me-3">
                      <div class="fw-bold">{{ ligne.sousTotal | number: '1.2-2' }} TND</div>
                    </div>
                    <!-- Remove -->
                    <button
                      class="fo-remove-btn"
                      (click)="supprimerProduit(ligne.produitId)"
                      [disabled]="enCours"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-4">
              <div class="card fo-summary-card">
                <div class="card-header">
                  <h6 class="mb-0 fw-bold">
                    <i class="bi bi-receipt me-2 text-primary"></i>Récapitulatif
                  </h6>
                </div>
                <div class="card-body">
                  <div class="fo-summary-row d-flex justify-content-between mb-2">
                    <span class="text-muted">Articles</span>
                    <span>{{ panier.nombreArticles }}</span>
                  </div>
                  <div class="fo-summary-row d-flex justify-content-between mb-3">
                    <span class="text-muted">Sous-total</span>
                    <span>{{ panier.montantTotal | number: '1.2-2' }} TND</span>
                  </div>
                  <hr />
                  <div class="fo-summary-total d-flex justify-content-between mb-4">
                    <span class="fw-bold fs-5">Total</span>
                    <span class="fw-bold fs-5 text-primary"
                      >{{ panier.montantTotal | number: '1.2-2' }} TND</span
                    >
                  </div>
                  <a routerLink="/app/store/commander" class="btn btn-primary w-100 py-2 fo-checkout-btn">
                    <i class="bi bi-credit-card me-2"></i>Passer la commande
                  </a>
                  <a
                    routerLink="/app/store/catalogue"
                    class="btn btn-secondary w-100 mt-2 py-2 fo-continue-btn"
                  >
                    <i class="bi bi-arrow-left me-2"></i>Continuer les achats
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="erreur" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .fo-cart-title-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        color: var(--accent-color);
        background: var(--primary-light);
        border: 1px solid var(--border);
      }

      .fo-cart-alert {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px 18px;
        gap: 14px;
        box-shadow: var(--shadow);
      }

      .fo-cart-alert-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 1.3rem;
        background: var(--primary-light);
        color: var(--accent-color);
      }

      .fo-cart-alert-title {
        font-weight: 700;
        font-size: 0.94rem;
        color: var(--text-primary);
      }

      .fo-cart-alert-subtitle {
        font-size: 0.82rem;
        color: var(--text-secondary);
        margin-top: 3px;
      }

      .fo-cart-items-card,
      .fo-summary-card {
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
      }

      .fo-cart-item-border {
        border-bottom: 1px solid var(--border);
      }

      .fo-cart-thumb {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: var(--primary-light);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .fo-cart-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .fo-cart-thumb i {
        font-size: 1.35rem;
        color: var(--accent-color);
      }

      .fo-cart-qty {
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 4px;
      }

      .fo-qty-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid var(--border);
        background: var(--bg-card);
        color: var(--text-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
      }

      .fo-qty-btn:hover:not(:disabled) {
        border-color: var(--accent-color);
        color: var(--accent-color);
        transform: translateY(-1px);
      }

      .fo-qty-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .fo-qty-value {
        min-width: 30px;
        text-align: center;
        font-size: 0.92rem;
      }

      .fo-line-total {
        min-width: 100px;
      }

      .fo-remove-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1px solid rgba(220, 38, 38, 0.32);
        color: #dc2626;
        background: rgba(220, 38, 38, 0.08);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
      }

      .fo-remove-btn:hover:not(:disabled) {
        background: rgba(220, 38, 38, 0.14);
        transform: translateY(-1px);
      }

      .fo-remove-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .fo-summary-card {
        position: sticky;
        top: 84px;
      }

      .fo-summary-row {
        font-size: 0.92rem;
      }

      .fo-summary-total {
        padding-top: 6px;
      }

      .fo-checkout-btn {
        font-weight: 700;
        letter-spacing: 0.01em;
      }

      .fo-continue-btn {
        border: 1px solid var(--border);
      }

      @media (max-width: 991px) {
        .fo-summary-card {
          position: static;
        }

        .fo-cart-item {
          flex-wrap: wrap;
          gap: 12px;
        }

        .fo-cart-qty {
          margin-right: 0 !important;
        }
      }
    `,
  ],
})
export class PanierComponent implements OnInit {
  panier: Panier | null = null;
  chargement = true;
  enCours = false;
  erreur = '';

  constructor(
    private panierService: PanierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerPanier();
  }

  chargerPanier(): void {
    this.chargement = true;
    this.panierService
      .chargerPanier()
      .pipe(
        finalize(() => {
          this.chargement = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          this.panier = data;
        },
        error: () => {
          this.erreur = 'Impossible de charger le panier.';
        },
      });
  }

  modifierQuantite(ligne: LignePanier, nouvelleQuantite: number): void {
    if (nouvelleQuantite < 1) return;
    this.enCours = true;
    this.erreur = '';
    this.panierService.modifierQuantite(ligne.produitId, nouvelleQuantite).subscribe({
      next: (data) => {
        this.panier = data;
        this.enCours = false;
      },
      error: (err) => {
        this.erreur = err.error?.message || 'Erreur lors de la modification de la quantité.';
        this.enCours = false;
      },
    });
  }

  supprimerProduit(produitId: number): void {
    this.enCours = true;
    this.erreur = '';
    this.panierService.supprimerProduit(produitId).subscribe({
      next: (data) => {
        this.panier = data;
        this.enCours = false;
      },
      error: () => {
        this.erreur = 'Erreur lors de la suppression du produit.';
        this.enCours = false;
      },
    });
  }

  viderPanier(): void {
    this.enCours = true;
    this.erreur = '';
    this.panierService.viderPanier().subscribe({
      next: () => {
        this.panier = { sessionId: '', lignes: [], nombreArticles: 0, montantTotal: 0 };
        this.enCours = false;
      },
      error: () => {
        this.erreur = 'Erreur lors du vidage du panier.';
        this.enCours = false;
      },
    });
  }
}
