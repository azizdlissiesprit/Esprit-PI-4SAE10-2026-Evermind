import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from '../models/produit.model';

const STORAGE_KEY = 'pharmacare_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private items$ = new BehaviorSubject<Produit[]>(this.load());

  constructor() {
    console.log('[WishlistService] Initialized with items:', this.items$.value);
  }

  private load(): Produit[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private persist(items: Produit[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.items$.next(items);
  }

  get wishlist$() {
    return this.items$.asObservable();
  }

  get count(): number {
    return this.items$.value.length;
  }

  isInWishlist(id: number): boolean {
    return this.items$.value.some(p => p.id === id);
  }

  toggle(produit: Produit): boolean {
    const current = this.items$.value;
    const idx = current.findIndex(p => p.id === produit.id);
    if (idx >= 0) {
      this.persist(current.filter(p => p.id !== produit.id));
      console.log(`[WishlistService] Removed product ${produit.id} from wishlist.`);
      return false;
    } else {
      this.persist([...current, produit]);
      console.log(`[WishlistService] Added product ${produit.id} to wishlist.`);
      return true;
    }
  }

  remove(id: number): void {
    const next = this.items$.value.filter(p => p.id !== id);
    this.persist(next);
    console.log(`[WishlistService] Removed product ${id} from wishlist.`);
  }

  clear(): void {
    this.persist([]);
    console.log('[WishlistService] Wishlist cleared.');
  }
}
