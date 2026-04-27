import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from '../models/produit.model';

const MAX_COMPARE = 4;
const LS_KEY = 'pharmacare-compare';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private _items = new BehaviorSubject<Produit[]>(this.load());
  readonly items$ = this._items.asObservable();

  constructor() {
    console.log('[CompareService] Initialized with items:', this._items.value);
  }

  get items(): Produit[] { return this._items.value; }
  get count(): number { return this._items.value.length; }

  isInCompare(id: number): boolean {
    return this._items.value.some(p => p.id === id);
  }

  toggle(produit: Produit): 'added' | 'removed' | 'full' {
    const current = this._items.value;
    const idx = current.findIndex(p => p.id === produit.id);
    if (idx >= 0) {
      const next = current.filter(p => p.id !== produit.id);
      this._items.next(next);
      this.save(next);
      console.log(`[CompareService] Removed product ${produit.id} from compare list. Total: ${next.length}`);
      return 'removed';
    }
    if (current.length >= MAX_COMPARE) {
      console.warn(`[CompareService] Cannot add product ${produit.id}, comparison list is full (Max: ${MAX_COMPARE}).`);
      return 'full';
    }
    const next = [...current, produit];
    this._items.next(next);
    this.save(next);
    console.log(`[CompareService] Added product ${produit.id} to compare list. Total: ${next.length}`);
    return 'added';
  }

  remove(id: number): void {
    const next = this._items.value.filter(p => p.id !== id);
    this._items.next(next);
    this.save(next);
    console.log(`[CompareService] Removed product ${id}. Total: ${next.length}`);
  }

  clear(): void {
    this._items.next([]);
    this.save([]);
    console.log('[CompareService] Cleared compare list.');
  }

  private save(items: Produit[]): void {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
  }

  private load(): Produit[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
