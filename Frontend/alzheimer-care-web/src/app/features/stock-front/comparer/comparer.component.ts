import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CompareService } from '../../../core/services/compare.service';
import { PanierService } from '../../../core/services/panier.service';
import { TraductionService } from '../../../core/services/traduction.service';
import { Produit, isPromoActive } from '../../../core/models/produit.model';

@Component({
  selector: 'app-comparer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(32px)' }),
        animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('colsAnim', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(40px) scale(0.95)' }),
          stagger(80, [
            animate('450ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="fo-section slide-in" [@fadeUp]>
      <div class="fo-section-container">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb mb-4 d-flex align-items-center text-secondary small fw-semibold">
          <a routerLink="/" class="text-decoration-none text-secondary hover-primary"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right mx-2" style="font-size: 0.75rem;"></i>
          <span class="text-primary">Comparateur</span>
        </div>

        <!-- Page Title -->
        <div class="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle shadow-sm" style="background: rgba(78, 128, 238, 0.15); color: var(--accent-color, #4E80EE); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              <i class="bi bi-bar-chart-steps"></i>
            </div>
            <div>
              <h1 class="page-title d-flex align-items-center gap-2 mb-0 text-primary">Comparateur de Produits</h1>
              <p class="page-subtitle text-secondary ms-1 mt-1 mb-0 fw-semibold">Analysez en détail les caractéristiques des équipements sélectionnés.</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3" *ngIf="items.length > 0">
            <span class="badge bg-primary-soft text-primary px-3 py-2 border border-primary fs-6 shadow-sm">
              <i class="bi bi-layers me-1"></i>{{ items.length }}/4 produits
            </span>
            <button class="btn btn-outline-danger shadow-sm rounded-pill py-2 px-4 fw-bold" (click)="clear()">
              <i class="bi bi-trash3 me-1"></i> Tout vider
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="items.length === 0" class="text-center p-5 clinical-card shadow-sm mt-4 animate-fade-up" style="border-radius: 16px; background: var(--bg-card);">
           <div class="icon-circle mx-auto mb-3" style="background: var(--bg-inset); color: var(--text-secondary); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
              <i class="bi bi-bar-chart-steps"></i>
           </div>
           <h5 class="fw-bold text-primary">Aucun produit à comparer</h5>
           <p class="text-secondary fw-semibold mb-4">Sélectionnez jusqu'à 4 produits dans le catalogue pour les comparer.</p>
           <a routerLink="/app/store/catalogue" class="btn btn-clinical-primary rounded-pill px-4 mt-2 shadow-sm fw-bold">
             <i class="bi bi-grid-3x3-gap me-2"></i>Explorer le catalogue
           </a>
        </div>

        <!-- Comparison Table -->
        <div *ngIf="items.length > 0" class="cmp-scroll-wrap" style="overflow-x: auto; padding-bottom: 24px;">
          <div class="card clinical-card border-0 shadow-sm" [@colsAnim]="items.length" [style.--cols]="items.length" style="min-width: 800px; display: grid; grid-template-columns: 200px repeat(var(--cols), 1fr); background: var(--bg-card); overflow: hidden;">
            
            <!-- ROW: Image & Name -->
            <div class="cmp-cell cmp-label-cell" style="background: var(--bg-inset); display:flex; align-items:center; padding:20px; font-weight:bold; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color);">
              <i class="bi bi-box-seam text-primary fs-4 me-2"></i> Produit
            </div>
            <div *ngFor="let p of items" class="cmp-cell cmp-data-cell position-relative" style="padding: 20px; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); text-align:center;">
              <button class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-2 shadow-sm" (click)="remove(p.id!)" title="Retirer" style="width:28px;height:28px;padding:0;">
                <i class="bi bi-x"></i>
              </button>
              <div style="height:120px; background:var(--bg-inset); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
                 <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom" style="max-height:100%; max-width:100%; object-fit:contain;">
                 <i *ngIf="!p.imageUrl" class="bi bi-box-seam text-secondary fs-1"></i>
              </div>
              <p class="text-secondary small fw-bold mb-1">{{ p.categorieNom }}</p>
              <h5 class="fw-bold text-primary fs-6">{{ p.nom }}</h5>
              <a [routerLink]="['/app/store/catalogue', p.id]" class="btn btn-sm btn-outline-secondary mt-2">Détails <i class="bi bi-arrow-right"></i></a>
            </div>

            <!-- ROW: Price -->
            <div class="cmp-cell cmp-label-cell" style="background: var(--bg-inset); display:flex; align-items:center; padding:20px; font-weight:bold; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color);">
              <i class="bi bi-tag-fill text-primary fs-5 me-2"></i> Prix
            </div>
            <div *ngFor="let p of items" class="cmp-cell cmp-data-cell" [class.bg-success-soft]="isBestPrice(p)" style="padding: 20px; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
               <div *ngIf="isPromoActive(p) && p.prixOriginal">
                 <span class="text-muted text-decoration-line-through small d-block">{{ p.prixOriginal | number:'1.2-2' }} TND</span>
                 <span class="fw-bold text-danger font-monospace fs-5 d-block">{{ p.prix | number:'1.2-2' }} TND</span>
               </div>
               <span *ngIf="!isPromoActive(p) || !p.prixOriginal" class="fw-bold text-primary font-monospace fs-5 d-block">{{ p.prix | number:'1.2-2' }} TND</span>
               <span *ngIf="isBestPrice(p)" class="badge bg-success mt-2 shadow-sm"><i class="bi bi-trophy-fill me-1"></i>Meilleur prix</span>
            </div>

            <!-- ROW: Availability -->
            <div class="cmp-cell cmp-label-cell" style="background: var(--bg-inset); display:flex; align-items:center; padding:20px; font-weight:bold; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color);">
              <i class="bi bi-boxes text-primary fs-5 me-2"></i> Disponibilité
            </div>
            <div *ngFor="let p of items" class="cmp-cell cmp-data-cell" style="padding: 20px; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); text-align:center;">
              <span *ngIf="p.quantite > 10" class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> En stock</span>
              <span *ngIf="p.quantite > 0 && p.quantite <= 10" class="text-warning fw-bold"><i class="bi bi-exclamation-triangle-fill"></i> Stock faible ({{ p.quantite }})</span>
              <span *ngIf="p.quantite === 0" class="text-danger fw-bold"><i class="bi bi-x-circle-fill"></i> Rupture</span>
            </div>

            <!-- ROW: Promotion -->
            <div class="cmp-cell cmp-label-cell" style="background: var(--bg-inset); display:flex; align-items:center; padding:20px; font-weight:bold; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color);">
              <i class="bi bi-fire text-primary fs-5 me-2"></i> Promotion
            </div>
            <div *ngFor="let p of items" class="cmp-cell cmp-data-cell" style="padding: 20px; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); text-align:center;">
              <span *ngIf="isPromoActive(p)" class="badge bg-danger fs-6 shadow-sm"><i class="bi bi-check-lg me-1"></i>-{{ p.remise }}%</span>
              <span *ngIf="!isPromoActive(p)" class="text-muted"><i class="bi bi-dash-lg"></i></span>
            </div>

            <!-- ROW: Description -->
            <div class="cmp-cell cmp-label-cell" style="background: var(--bg-inset); display:flex; align-items:center; padding:20px; font-weight:bold; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color);">
              <i class="bi bi-file-text text-primary fs-5 me-2"></i> Description
            </div>
            <div *ngFor="let p of items" class="cmp-cell cmp-data-cell" style="padding: 20px; border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); font-size:0.85rem; color: var(--text-secondary);">
              {{ p.description | slice:0:120 }}{{ (p.description && p.description.length > 120) ? '…' : '' }}
            </div>

            <!-- ROW: Action -->
            <div class="cmp-cell cmp-label-cell" style="background: var(--bg-inset); display:flex; align-items:center; padding:20px; font-weight:bold; border-right:1px solid var(--border-color);">
              <i class="bi bi-cart-plus text-primary fs-5 me-2"></i> Action
            </div>
            <div *ngFor="let p of items" class="cmp-cell cmp-data-cell" style="padding: 20px; border-right:1px solid var(--border-color); display:flex; justify-content:center; align-items:center;">
              <button *ngIf="p.quantite > 0"
                      class="btn btn-clinical-primary w-100 rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                      [class.btn-success]="addedId === p.id"
                      [disabled]="addingId === p.id"
                      (click)="addToCart(p)">
                <span *ngIf="addingId === p.id" class="spinner-border spinner-border-sm"></span>
                <i *ngIf="addingId !== p.id && addedId !== p.id" class="bi bi-cart-plus"></i>
                <i *ngIf="addedId === p.id" class="bi bi-check-lg"></i>
                {{ addedId === p.id ? 'Ajouté !' : 'Ajouter' }}
              </button>
              <button *ngIf="p.quantite === 0" class="btn btn-outline-danger w-100 rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center gap-2" disabled>
                <i class="bi bi-x-circle"></i> Indisponible
              </button>
            </div>

          </div>
        </div>

        <!-- Continue shopping -->
        <div *ngIf="items.length > 0" class="mt-4 text-center">
          <a routerLink="/app/store/catalogue" class="btn btn-outline-primary rounded-pill px-5 shadow-sm fw-bold border-2">
            <i class="bi bi-plus-lg me-2"></i>Ajouter d'autres produits
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .clinical-card { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid var(--border-color); }
    .bg-success-soft { background-color: rgba(16, 185, 129, 0.05) !important; }
    .bg-primary-soft { background-color: rgba(78, 128, 238, 0.1) !important; color: var(--accent-color, #4E80EE) !important; }
    
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
    
    html[data-theme="dark"] .bg-success-soft { background-color: rgba(16, 185, 129, 0.1) !important; }
    html[data-theme="dark"] .clinical-card { border: 1px solid var(--border-color); }
  `]
})
export class ComparerComponent implements OnInit, OnDestroy {
  readonly isPromoActive = isPromoActive;

  items: Produit[] = [];
  addingId: number | null = null;
  addedId: number | null = null;
  private sub!: Subscription;

  constructor(
    public compareService: CompareService,
    private panierService: PanierService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    console.log('[ComparerComponent] Initializing...');
    this.sub = this.compareService.items$.subscribe(items => {
      this.items = items;
      console.log(`[ComparerComponent] Items loaded: ${items.length}`);
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  remove(id: number): void { 
    console.log(`[ComparerComponent] Removing item ${id}`);
    this.compareService.remove(id); 
  }
  
  clear(): void { 
    console.log('[ComparerComponent] Clearing all items');
    this.compareService.clear(); 
  }

  isBestPrice(p: Produit): boolean {
    if (this.items.length < 2) return false;
    const min = Math.min(...this.items.map(i => i.prix));
    return p.prix === min;
  }

  addToCart(prod: Produit): void {
    if (!prod.id) return;
    console.log(`[ComparerComponent] Adding product to cart:`, prod);
    this.addingId = prod.id;
    this.panierService.ajouterProduit(prod.id, 1).subscribe({
      next: () => {
        console.log(`[ComparerComponent] Added successfully.`);
        this.addingId = null;
        this.addedId = prod.id!;
        setTimeout(() => this.addedId = null, 2200);
      },
      error: (err) => { 
        console.error(`[ComparerComponent] Failed to add:`, err);
        this.addingId = null; 
      }
    });
  }
}
