import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CompareService } from '../../../core/services/compare.service';
import { TraductionService } from '../../../core/services/traduction.service';
import { Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('barSlide', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '380ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ transform: 'translateY(0)', opacity: 1 }),
        ),
      ]),
      transition(':leave', [
        animate(
          '280ms cubic-bezier(0.4, 0, 1, 1)',
          style({ transform: 'translateY(100%)', opacity: 0 }),
        ),
      ]),
    ]),
    trigger('itemPop', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate(
          '320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ transform: 'scale(1)', opacity: 1 }),
        ),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.5)', opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div *ngIf="items.length > 0" class="cmp-bar" [@barSlide]>
      <div class="cmp-bar-inner">
        <!-- Thumbnails -->
        <div class="cmp-bar-items">
          <div *ngFor="let p of items" class="cmp-bar-item" [@itemPop]>
            <div class="cmp-bar-item-img">
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom" />
              <i *ngIf="!p.imageUrl" class="bi bi-box-seam"></i>
            </div>
            <div class="cmp-bar-item-info">
              <span class="cmp-bar-item-name"
                >{{ p.nom | slice: 0 : 22 }}{{ p.nom.length > 22 ? '…' : '' }}</span
              >
              <span class="cmp-bar-item-price">{{ p.prix | number: '1.2-2' }} TND</span>
            </div>
            <button class="cmp-bar-item-remove" (click)="remove(p.id!)" title="Retirer">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Empty slots -->
          <div *ngFor="let s of emptySlots" class="cmp-bar-slot">
            <i class="bi bi-plus-lg"></i>
            <span>Ajouter</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="cmp-bar-actions">
          <div class="cmp-bar-count">
            <span class="cmp-bar-count-num">{{ items.length }}</span>
            <span class="cmp-bar-count-label">/4 produits</span>
          </div>
          <a
            routerLink="/app/store/comparer"
            class="cmp-bar-btn btn btn-primary"
            [class.disabled]="items.length < 2"
          >
            <i class="bi bi-bar-chart-steps me-2"></i>
            Comparer
          </a>
          <button class="cmp-bar-btn btn btn-outline-danger ms-2" (click)="clear()">
            <i class="bi bi-trash me-1"></i>
            Vider
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cmp-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-card, #ffffff);
        border-top: 1px solid var(--border-color, #e2e8f0);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        z-index: 1040;
        padding: 12px 24px;
      }
      .cmp-bar-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cmp-bar-items {
        display: flex;
        gap: 16px;
        flex: 1;
      }
      .cmp-bar-item {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--bg-inset, #f8fafc);
        padding: 8px;
        border-radius: 8px;
        border: 1px solid var(--border-color, #e2e8f0);
        position: relative;
        min-width: 200px;
      }
      .cmp-bar-item-img {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cmp-bar-item-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cmp-bar-item-info {
        display: flex;
        flex-direction: column;
      }
      .cmp-bar-item-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .cmp-bar-item-price {
        font-size: 0.8rem;
        color: var(--accent-color, #4e80ee);
        font-weight: bold;
      }
      .cmp-bar-item-remove {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6rem;
        cursor: pointer;
      }
      .cmp-bar-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 2px dashed var(--border-color, #e2e8f0);
        border-radius: 8px;
        padding: 8px 16px;
        min-width: 200px;
        color: var(--text-secondary);
        opacity: 0.5;
      }
      .cmp-bar-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .cmp-bar-count {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .cmp-bar-count-num {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--text-primary);
        line-height: 1;
      }
      .cmp-bar-count-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
      .cmp-bar-btn {
        display: flex;
        align-items: center;
        padding: 8px 24px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
      }
      .cmp-bar-btn.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    `,
  ],
})
export class CompareBarComponent implements OnInit, OnDestroy {
  items: Produit[] = [];
  private sub!: Subscription;

  constructor(
    public compareService: CompareService,
    public t: TraductionService,
  ) {}

  ngOnInit(): void {
    console.log('[CompareBarComponent] Initializing...');
    this.sub = this.compareService.items$.subscribe((items) => {
      this.items = items;
      console.log(`[CompareBarComponent] Items updated: ${items.length}`);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get emptySlots(): null[] {
    return new Array(Math.max(0, 4 - this.items.length)).fill(null);
  }

  remove(id: number): void {
    console.log(`[CompareBarComponent] Removing product ${id}`);
    this.compareService.remove(id);
  }

  clear(): void {
    console.log(`[CompareBarComponent] Clearing all products`);
    this.compareService.clear();
  }
}
