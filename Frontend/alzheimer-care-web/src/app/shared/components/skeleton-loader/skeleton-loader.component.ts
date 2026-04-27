import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Product Grid Skeleton -->
    <div *ngIf="type === 'product-grid'" class="fo-product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
      <div *ngFor="let item of items" class="skeleton-card" style="border-top: 3px solid var(--border-color); border-radius: 16px; background: var(--bg-card); overflow: hidden; height: 100%;">
        <div class="skeleton-img skeleton-pulse" style="height: 240px; background: var(--bg-inset);"></div>
        <div style="padding: 18px;">
          <div class="skeleton-line skeleton-pulse" style="width: 35%; height: 10px; margin-bottom: 8px; border-radius: 20px; background: var(--bg-inset);"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 80%; height: 14px; margin-bottom: 6px; background: var(--bg-inset);"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 60%; height: 14px; margin-bottom: 8px; background: var(--bg-inset);"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 95%; height: 10px; margin-bottom: 12px; background: var(--bg-inset);"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="skeleton-line skeleton-pulse" style="width: 60px; height: 10px; margin-bottom: 4px; background: var(--bg-inset);"></div>
              <div class="skeleton-line skeleton-pulse" style="width: 80px; height: 16px; background: var(--bg-inset);"></div>
            </div>
            <div class="skeleton-line skeleton-pulse" style="width: 70px; height: 24px; border-radius: 20px; background: var(--bg-inset);"></div>
          </div>
          <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 42px; margin-top: 12px; border-radius: 50px; background: var(--bg-inset);"></div>
        </div>
      </div>
    </div>

    <!-- Category Grid Skeleton -->
    <div *ngIf="type === 'category-grid'" class="fo-category-grid" style="display: flex; gap: 15px;">
      <div *ngFor="let item of items" class="skeleton-card" style="text-align: center; padding: 32px 20px; background: var(--bg-card); flex: 1; border-radius: 12px;">
        <div class="skeleton-circle skeleton-pulse" style="margin: 0 auto 16px; width: 60px; height: 60px; border-radius: 50%; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 60%; height: 16px; margin: 0 auto 8px; background: var(--bg-inset);"></div>
      </div>
    </div>

    <!-- Product Detail Skeleton -->
    <div *ngIf="type === 'product-detail'" class="fo-product-detail" style="display: flex; gap: 30px;">
      <div class="skeleton-detail-img skeleton-pulse" style="width: 400px; height: 400px; border-radius: 16px; background: var(--bg-inset);"></div>
      <div style="flex: 1;">
        <div class="skeleton-line skeleton-pulse" style="width: 25%; height: 12px; margin-bottom: 12px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 60%; height: 28px; margin-bottom: 16px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 12px; margin-bottom: 8px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 90%; height: 12px; margin-bottom: 8px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 75%; height: 12px; margin-bottom: 24px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 30%; height: 32px; margin-bottom: 12px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 40%; height: 14px; margin-bottom: 24px; background: var(--bg-inset);"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 50%; height: 44px; border-radius: 10px; background: var(--bg-inset);"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-pulse {
      animation: skeleton-pulse 1.5s infinite ease-in-out;
    }
    @keyframes skeleton-pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
  `]
})
export class SkeletonLoaderComponent implements OnInit {
  @Input() type: 'product-grid' | 'category-grid' | 'product-detail' = 'product-grid';
  @Input() count: number = 6;

  ngOnInit() {
    console.log(`[SkeletonLoaderComponent] Initialized type: ${this.type}, count: ${this.count}`);
  }

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
