import { ChangeDetectorRef, Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProduitService } from '../../../core/services/produit.service';
import { PanierService } from '../../../core/services/panier.service';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-detail-produit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    .medical-gradient-bg {
      background: linear-gradient(135deg, #f8fbfd 0%, #edf4f8 100%);
    }
    html[data-theme='dark'] .medical-gradient-bg {
      background: var(--bg-main);
    }
    .img-wrapper {
      position: relative;
      background: #ffffff;
      border-radius: 2rem;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.03);
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 450px;
    }
    html[data-theme='dark'] .img-wrapper {
      background: var(--bg-card);
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .img-wrapper:hover {
      transform: translateY(-5px);
    }
    .img-wrapper::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 2rem;
      background: radial-gradient(circle at center, rgba(26,115,232,0.03) 0%, transparent 70%);
      z-index: 0;
    }
    .product-img {
      position: relative;
      z-index: 1;
      object-fit: contain;
      max-height: 450px;
      transition: transform 0.5s ease;
    }
    .img-wrapper:hover .product-img {
      transform: scale(1.05);
    }
    .promo-pulse {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      z-index: 10;
      animation: pulse-promo 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
      box-shadow: 0 0 15px rgba(220, 53, 69, 0.4);
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: white;
      font-weight: 800;
      padding: 0.5rem 1.2rem;
      border-radius: 2rem;
      font-size: 1.1rem;
      letter-spacing: 0.5px;
    }
    @keyframes pulse-promo {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.03); }
    }
    .info-card {
      border: 1px solid rgba(0,0,0,0.04);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }
    html[data-theme='dark'] .info-card {
      background: var(--bg-card);
      border-color: var(--border);
    }
    .info-card:hover {
      box-shadow: 0 15px 35px rgba(0,0,0,0.06);
      border-color: rgba(26,115,232,0.15);
    }
    html[data-theme='dark'] .info-card:hover {
      border-color: var(--accent-color);
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    }
    .staggered-item {
      opacity: 0;
      animation: fadeUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .trust-badge-modern {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border-radius: 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      transition: transform 0.2s ease;
    }
    .trust-badge-modern:hover {
      transform: translateY(-2px);
    }
    .price-tag {
      font-size: 2.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #0f172a, #334155);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
      line-height: 1;
    }
    html[data-theme='dark'] .price-tag {
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .price-tag.promo {
      background: linear-gradient(135deg, #1a73e8, #1557b0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    html[data-theme='dark'] .price-tag.promo {
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .old-price {
      text-decoration: line-through;
      color: #94a3b8;
      font-size: 1.4rem;
      font-weight: 500;
    }
    .btn-cart-modern {
      background: linear-gradient(135deg, #1a73e8, #0d47a1);
      border: none;
      border-radius: 1.2rem;
      color: white;
      font-weight: 700;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(26,115,232,0.25);
    }
    .btn-cart-modern:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 25px rgba(26,115,232,0.35);
      color: white;
    }
    .qty-btn {
      width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      transition: all 0.2s;
      cursor: pointer;
    }
    html[data-theme='dark'] .qty-btn {
      background: var(--bg-main);
      border-color: var(--border);
      color: var(--text-primary);
    }
    .qty-btn:hover:not(:disabled) {
      background: #e2e8f0;
      color: #0f172a;
    }
    html[data-theme='dark'] .qty-btn:hover:not(:disabled) {
      background: var(--primary-light);
      color: var(--accent-color);
    }
    .qty-btn:disabled {
      opacity: 0.5; cursor: not-allowed;
    }
    .qty-input {
      width: 60px;
      text-align: center;
      font-weight: 800;
      font-size: 1.2rem;
      border: none;
      background: transparent;
      color: #0f172a;
    }
    html[data-theme='dark'] .qty-input {
      color: var(--text-primary);
    }
    .qty-input:focus { outline: none; }
    
    .desc-text {
      font-size: 1.05rem;
      line-height: 1.8;
      color: #475569;
    }
    html[data-theme='dark'] .desc-text {
      color: var(--text-secondary);
    }
    .spec-icon {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 12px;
      background: #f0fdf4;
      color: #16a34a;
      font-size: 1.2rem;
    }
    html[data-theme='dark'] .spec-icon {
      background: rgba(22, 163, 74, 0.2);
    }
    .spec-icon.warning {
      background: #fffbeb;
      color: #d97706;
    }
    html[data-theme='dark'] .spec-icon.warning {
      background: rgba(217, 119, 6, 0.2);
    }
    .spec-icon.info {
      background: #eff6ff;
      color: #2563eb;
    }
    html[data-theme='dark'] .spec-icon.info {
      background: rgba(37, 99, 235, 0.2);
    }
  `],
  template: `
    <div class="fo-section py-5 medical-gradient-bg" *ngIf="!loading && produit">
      <div class="container-fluid px-4 px-lg-5" style="max-width: 1400px;">
        <!-- Breadcrumb -->
        <nav class="mb-5 staggered-item" style="animation-delay: 0.05s">
          <ol class="breadcrumb bg-transparent p-0 m-0 fs-6">
            <li class="breadcrumb-item"><a routerLink="/app/store/catalogue" class="text-decoration-none text-primary fw-medium">Catalogue</a></li>
            <li class="breadcrumb-item active text-secondary fw-semibold" aria-current="page">{{ produit.nom }}</li>
          </ol>
        </nav>

        <div class="row g-5 align-items-start">
          <!-- Left Column: Product Image & Medical Info -->
          <div class="col-lg-6 staggered-item" style="animation-delay: 0.1s">
            <div class="img-wrapper mb-4">
              <div *ngIf="produit.enPromo" class="promo-pulse">
                -{{ produit.remise }}% PROMO
              </div>
              <img
                *ngIf="produit.imageUrl"
                [src]="produit.imageUrl"
                [alt]="produit.nom"
                class="product-img img-fluid w-100"
              />
              <div
                *ngIf="!produit.imageUrl"
                class="d-flex align-items-center justify-content-center"
                style="height: 400px; width: 100%;"
              >
                <i class="bi bi-heart-pulse display-1 text-primary opacity-25"></i>
              </div>
            </div>

            <!-- Information Médicale Section -->
            <div class="info-card p-4 staggered-item" style="animation-delay: 0.2s">
              <h5 class="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
                <i class="bi bi-shield-plus text-primary fs-4"></i> Spécifications Médicales
              </h5>
              <div class="row g-4">
                <div class="col-sm-6">
                  <div class="d-flex gap-3 align-items-start">
                    <div class="spec-icon info">
                      <i class="bi bi-upc-scan"></i>
                    </div>
                    <div>
                      <small class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">Numéro de Lot</small>
                      <div class="fw-semibold text-dark mt-1">{{ produit.numeroLot || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="d-flex gap-3 align-items-start">
                    <div class="spec-icon" [class.warning]="produit.joursAvantExpiration && produit.joursAvantExpiration <= 30">
                      <i class="bi bi-calendar-event"></i>
                    </div>
                    <div>
                      <small class="text-muted text-uppercase fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">Expiration</small>
                      <div class="fw-semibold text-dark mt-1">{{ produit.dateExpiration | date: 'mediumDate' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12" *ngIf="produit.joursAvantExpiration">
                  <div class="d-flex align-items-center p-3 rounded-4" 
                       [ngClass]="produit.joursAvantExpiration <= 30 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success-emphasis'">
                    <i class="bi fs-4 me-3" 
                       [class.bi-check-circle-fill]="produit.joursAvantExpiration > 30"
                       [class.bi-exclamation-triangle-fill]="produit.joursAvantExpiration <= 30"></i>
                    <div>
                      <div class="fw-bold mb-1">Durée de conservation optimale</div>
                      <div class="small opacity-75">Valable encore {{ produit.joursAvantExpiration }} jours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Product Info & Actions -->
          <div class="col-lg-6 staggered-item" style="animation-delay: 0.15s">
            <div class="pe-lg-4">
              <span class="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase" style="letter-spacing: 1px;">
                {{ produit.categorieNom }}
              </span>
              <h1 class="display-4 fw-bolder text-dark mb-4" style="line-height: 1.1;">{{ produit.nom }}</h1>

              <div class="d-flex align-items-end gap-3 mb-4 pb-3 border-bottom border-light-subtle">
                <div class="d-flex flex-column">
                  <span *ngIf="produit.enPromo" class="old-price mb-1">{{ produit.prixOriginal | number: '1.2-2' }} TND</span>
                  <span class="price-tag" [class.promo]="produit.enPromo">{{ produit.prix | number: '1.2-2' }} TND</span>
                </div>
                <div class="mb-2 ms-auto">
                  <span class="badge px-4 py-2 rounded-pill fs-6"
                        [ngClass]="produit.quantite > 0 ? 'bg-success text-white' : 'bg-danger text-white'">
                    <i class="bi" [class.bi-check2-circle]="produit.quantite > 0" [class.bi-x-circle]="produit.quantite === 0"></i>
                    {{ produit.quantite > 0 ? 'En Stock' : 'Rupture de stock' }}
                  </span>
                </div>
              </div>

              <div class="mb-5">
                <h5 class="fw-bold mb-3 text-dark">Description détaillée</h5>
                <p class="desc-text">{{ produit.description }}</p>
              </div>

              <!-- Trust Badges -->
              <div class="d-flex flex-wrap gap-3 mb-5">
                <div class="trust-badge-modern bg-success bg-opacity-10 text-success">
                  <i class="bi bi-patch-check-fill fs-5"></i> Qualité Paramédicale
                </div>
                <div class="trust-badge-modern bg-info bg-opacity-10 text-info-emphasis">
                  <i class="bi bi-box-seam-fill fs-5"></i> Emballage Sécurisé
                </div>
                <div class="trust-badge-modern bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-truck fs-5"></i> Livraison Rapide
                </div>
              </div>

              <!-- Add to Cart Area -->
              <div *ngIf="produit.quantite > 0" class="info-card p-4">
                <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-4">
                  <div class="d-flex align-items-center gap-3">
                    <span class="fw-bold text-secondary">Quantité</span>
                    <div class="d-flex align-items-center bg-white rounded-4 shadow-sm p-1 border" [ngClass]="{'border-dark-subtle': true}">
                      <button class="qty-btn border-0" (click)="quantite = quantite - 1" [disabled]="quantite <= 1">
                        <i class="bi bi-dash"></i>
                      </button>
                      <input type="number" [(ngModel)]="quantite" min="1" max="10" class="qty-input" readonly />
                      <button class="qty-btn border-0" (click)="quantite = quantite + 1" [disabled]="quantite >= 10">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  <button class="btn btn-cart-modern btn-lg flex-grow-1 py-3 d-flex align-items-center justify-content-center gap-2"
                          (click)="ajouterAuPanier()" [disabled]="ajoutEnCours">
                    <span *ngIf="ajoutEnCours" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="!ajoutEnCours && !ajoutOk" class="bi bi-cart-plus fs-4"></i>
                    <i *ngIf="ajoutOk" class="bi bi-check-circle-fill fs-4"></i>
                    {{ ajoutOk ? 'Ajouté avec succès !' : 'Ajouter au Panier' }}
                  </button>
                </div>

                <div *ngIf="ajoutErreur" class="alert alert-danger mt-4 mb-0 border-0 rounded-4 d-flex align-items-center">
                  <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                  <div>{{ ajoutErreur }}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div *ngIf="relatedProducts.length > 0" class="mt-5 pt-5 staggered-item" style="animation-delay: 0.3s">
          <div class="d-flex align-items-end justify-content-between mb-4 pb-3 border-bottom">
            <div>
              <h2 class="display-6 fw-bold m-0 text-dark">Vous aimerez aussi</h2>
              <p class="text-secondary mt-2 mb-0">Complétez votre équipement avec ces articles recommandés</p>
            </div>
            <a routerLink="/app/store/catalogue" class="btn btn-outline-primary rounded-pill px-4 fw-bold">
              Voir tout le catalogue <i class="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
          
          <div class="fo-product-grid">
            <a *ngFor="let p of relatedProducts" [routerLink]="['/app/store/catalogue', p.id]" class="fo-product-card text-decoration-none">
              <div class="fo-product-card-img" style="position: relative;">
                <div *ngIf="p.enPromo" class="fo-badge-promo large">-{{ p.remise }}%</div>
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom" style="width: 100%; height: 100%; object-fit: contain; padding: 1rem;" />
                <div *ngIf="!p.imageUrl" class="d-flex align-items-center justify-content-center h-100 bg-light">
                  <i class="bi bi-box-seam display-4 text-muted opacity-25"></i>
                </div>
              </div>
              <div class="fo-product-card-body p-4">
                <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-2">{{ p.categorieNom }}</span>
                <h5 class="fw-bold text-dark mb-3">{{ p.nom }}</h5>
                <div class="d-flex align-items-center justify-content-between mt-auto">
                  <span class="fs-5 fw-bold text-primary">{{ p.prix | number: '1.2-2' }} TND</span>
                  <span class="badge" [ngClass]="p.quantite > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ p.quantite > 0 ? 'En stock' : 'Rupture' }}
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="fo-section d-flex align-items-center justify-content-center" style="min-height: 60vh;" *ngIf="!loading && !produit">
      <div class="text-center">
        <div class="display-1 text-secondary opacity-25 mb-4"><i class="bi bi-search"></i></div>
        <h3 class="fw-bold text-dark mb-3">Produit introuvable</h3>
        <p class="text-secondary mb-4">{{ erreurChargement || 'Ce produit est introuvable ou momentanément indisponible.' }}</p>
        <a routerLink="/app/store/catalogue" class="btn btn-primary rounded-pill px-4 py-2 fw-bold">
          <i class="bi bi-arrow-left me-2"></i>Retour au catalogue
        </a>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="d-flex align-items-center justify-content-center" style="min-height: 60vh;">
      <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  `
})
export class DetailProduitComponent implements OnInit {
  produit: Produit | null = null;
  relatedProducts: Produit[] = [];
  loading = true;
  quantite = 1;
  ajoutEnCours = false;
  ajoutOk = false;
  ajoutErreur = '';
  erreurChargement = '';
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private panierService: PanierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      this.debug('route param received', { id });
      this.loading = true;
      this.quantite = 1;
      this.ajoutOk = false;
      this.erreurChargement = '';
      this.debug('loading true');

      if (!Number.isFinite(id) || id <= 0) {
        this.produit = null;
        this.loading = false;
        this.erreurChargement = 'Identifiant produit invalide.';
        this.debug('invalid id, loading false');
        return;
      }

      this.produitService
        .obtenirParId(id)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.debug('loading false (product settle)');
            this.cdr.detectChanges();
          }),
        )
        .subscribe({
          next: (produit) => {
            this.produit = produit;
            this.debug('product loaded', { id: produit.id, name: produit.nom });
            this.loadRelated(produit.categorieId, produit.id!);
          },
          error: () => {
            this.produit = null;
            this.erreurChargement = 'Impossible de charger ce produit pour le moment.';
            this.debug('product load error');
          },
        });
    });
  }

  ajouterAuPanier(): void {
    if (!this.produit?.id || this.ajoutEnCours) return;
    this.ajoutEnCours = true;
    this.ajoutOk = false;
    this.ajoutErreur = '';
    this.panierService.ajouterProduit(this.produit.id, this.quantite).subscribe({
      next: () => {
        this.ajoutEnCours = false;
        this.ajoutOk = true;
        setTimeout(() => (this.ajoutOk = false), 2500);
      },
      error: (err) => {
        this.ajoutEnCours = false;
        this.ajoutErreur = err.error?.message || "Erreur lors de l'ajout au panier.";
        setTimeout(() => (this.ajoutErreur = ''), 5000);
      },
    });
  }

  private loadRelated(categorieId: number, currentId: number): void {
    this.produitService.listerParCategorie(categorieId).subscribe({
      next: (prods) => {
        this.relatedProducts = prods.filter((p) => p.id !== currentId).slice(0, 4);
        this.debug('related loaded', { count: this.relatedProducts.length });
      },
      error: () => this.debug('related load error'),
    });
  }

  private debug(message: string, data?: unknown): void {
    if (!isDevMode()) return;
    if (data !== undefined) {
      console.log(`[Store/DetailProduit] ${message}`, data);
      return;
    }
    console.log(`[Store/DetailProduit] ${message}`);
  }
}
