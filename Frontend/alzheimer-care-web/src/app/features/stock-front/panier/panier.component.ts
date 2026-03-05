import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService } from '../../../core/services/panier.service';

import { Panier, LignePanier } from '../../../core/models/panier.model';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/">Accueil</a>
          <span>/</span>
          <span>Mon Panier</span>
        </div>

        <h1 class="fo-page-title"><i class="bi bi-cart3 me-2"></i>Mon Panier</h1>
        <p class="fo-page-subtitle">Gérez les articles de votre panier avant de passer commande.</p>

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
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le catalogue
          </a>
        </div>

        <!-- Cart Content -->
        <div *ngIf="!chargement && panier && panier.lignes.length > 0">

          <!-- Reservation Info Banner -->
          <div class="d-flex align-items-center mb-4"
               style="background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 14px; padding: 16px 20px; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #eeeeee;">
              <i class="bi bi-clock-history" style="font-size: 1.4rem; color: #616161;"></i>
            </div>
            <div class="flex-grow-1">
              <div style="font-weight: 600; font-size: 0.95rem; color: #424242;">
                Votre panier est réservé pour une durée limitée
              </div>
              <div style="font-size: 0.82rem; color: #78909c; margin-top: 3px;">
                Finalisez votre commande pour ne pas perdre vos articles.
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Cart Items -->
            <div class="col-lg-8">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold">
                    <i class="bi bi-bag-fill me-2 text-primary"></i>
                    {{ panier.nombreArticles }} {{ panier.nombreArticles !== 1 ? 'produits' : 'produit' }}
                  </h6>
                  <button class="btn btn-sm btn-outline-danger" (click)="viderPanier()" [disabled]="enCours">
                    <i class="bi bi-trash me-1"></i>Vider le panier
                  </button>
                </div>
                <div class="card-body p-0">
                  <div *ngFor="let ligne of panier.lignes; let last = last"
                       class="d-flex align-items-center p-4"
                       [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'">
                    <!-- Product Image -->
                    <div class="me-3" style="width: 60px; height: 60px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                      <img *ngIf="ligne.produitImageUrl" [src]="ligne.produitImageUrl" [alt]="ligne.produitNom" style="width: 100%; height: 100%; object-fit: cover;">
                      <i *ngIf="!ligne.produitImageUrl" class="bi bi-box-seam" style="font-size: 1.4rem; color: var(--primary);"></i>
                    </div>
                    <!-- Product Info -->
                    <div class="flex-grow-1">
                      <div class="fw-bold">{{ ligne.produitNom }}</div>
                      <small class="text-muted">{{ ligne.categorieNom }}</small>
                      <div class="mt-1">
                        <span class="fw-semibold" style="color: var(--primary);">{{ ligne.produitPrix | number:'1.2-2' }} TND</span>
                      </div>
                    </div>
                    <!-- Quantity Controls -->
                    <div class="d-flex align-items-center gap-2 me-4">
                      <button class="btn btn-sm btn-outline-secondary"
                              (click)="modifierQuantite(ligne, ligne.quantite - 1)"
                              [disabled]="enCours || ligne.quantite <= 1"
                              style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="bi bi-dash"></i>
                      </button>
                      <span class="fw-bold" style="min-width: 30px; text-align: center;">{{ ligne.quantite }}</span>
                      <button class="btn btn-sm btn-outline-secondary"
                              (click)="modifierQuantite(ligne, ligne.quantite + 1)"
                              [disabled]="enCours || ligne.quantite >= 10"
                              style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <!-- Subtotal -->
                    <div class="text-end me-3" style="min-width: 100px;">
                      <div class="fw-bold">{{ ligne.sousTotal | number:'1.2-2' }} TND</div>
                    </div>
                    <!-- Remove -->
                    <button class="btn btn-sm btn-outline-danger"
                            (click)="supprimerProduit(ligne.produitId)"
                            [disabled]="enCours"
                            style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-4">
              <div class="card" style="position: sticky; top: 80px;">
                <div class="card-header">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2 text-primary"></i>Récapitulatif</h6>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Articles</span>
                    <span>{{ panier.nombreArticles }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <span class="text-muted">Sous-total</span>
                    <span>{{ panier.montantTotal | number:'1.2-2' }} TND</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between mb-4">
                    <span class="fw-bold fs-5">Total</span>
                    <span class="fw-bold fs-5" style="color: var(--primary);">{{ panier.montantTotal | number:'1.2-2' }} TND</span>
                  </div>
                  <a routerLink="/commander" class="btn btn-primary w-100 py-2">
                    <i class="bi bi-credit-card me-2"></i>Passer la commande
                  </a>
                  <a routerLink="/catalogue" class="btn btn-secondary w-100 mt-2 py-2">
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
  `
})
export class PanierComponent implements OnInit {
  panier: Panier | null = null;
  chargement = true;
  enCours = false;
  erreur = '';

  constructor(
    private panierService: PanierService,
    
  ) {}

  ngOnInit(): void {
    this.chargerPanier();
  }

  chargerPanier(): void {
    this.chargement = true;
    this.panierService.chargerPanier().subscribe({
      next: (data) => {
        this.panier = data;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
        this.erreur = 'Impossible de charger le panier.';
      }
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
      }
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
      }
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
      }
    });
  }
}
