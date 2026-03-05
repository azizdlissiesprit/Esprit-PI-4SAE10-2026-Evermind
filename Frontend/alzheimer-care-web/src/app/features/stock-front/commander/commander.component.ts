import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PanierService } from '../../../core/services/panier.service';
import { CommandeService } from '../../../core/services/commande.service';

import { Panier } from '../../../core/models/panier.model';
import { CreerCommande } from '../../../core/models/commande.model';

@Component({
  selector: 'app-commander',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/">Accueil</a>
          <span>/</span>
          <a routerLink="/panier">Mon Panier</a>
          <span>/</span>
          <span>Finaliser la commande</span>
        </div>

        <h1 class="fo-page-title"><i class="bi bi-credit-card me-2"></i>Finaliser la commande</h1>
        <p class="fo-page-subtitle">Remplissez vos informations pour valider votre commande.</p>

        <!-- Loading -->
        <div *ngIf="chargement" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <!-- Empty Cart Redirect -->
        <div *ngIf="!chargement && (!panier || panier.lignes.length === 0)" class="fo-empty-state">
          <i class="bi bi-cart-x"></i>
          <p>Votre panier est vide.</p>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le catalogue
          </a>
        </div>

        <!-- Checkout Form -->
        <div *ngIf="!chargement && panier && panier.lignes.length > 0">
          <div class="row g-4">
            <!-- Client Info Form -->
            <div class="col-lg-7">
              <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, #1a73e8, #1557b0); color: white;">
                  <h5 class="mb-0"><i class="bi bi-person-fill me-2"></i>Informations du Client</h5>
                </div>
                <div class="card-body">
                  <form #formulaire="ngForm" (ngSubmit)="passerCommande()">

                    <div class="mb-3">
                      <label for="nomClient" class="form-label">Nom complet <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="nomClient" name="nomClient"
                             [(ngModel)]="commande.nomClient" required minlength="2" maxlength="100"
                             #nom="ngModel" title="Ex: Ahmed Ben Salah"
                             [ngClass]="{'is-invalid': nom.invalid && nom.touched}">
                      <div class="invalid-feedback">Le nom est obligatoire (min. 2 caractères)</div>
                    </div>

                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" name="emailClient"
                               [(ngModel)]="commande.emailClient" email
                               #email="ngModel" title="Ex: ahmed@example.com"
                               [ngClass]="{'is-invalid': email.invalid && email.touched}">
                        <div class="invalid-feedback">Adresse email invalide</div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="telephone" class="form-label">Téléphone <span class="text-danger">*</span></label>
                        <input type="tel" class="form-control" id="telephone" name="telephoneClient"
                               [(ngModel)]="commande.telephoneClient" required maxlength="20"
                               pattern="[0-9 +]+"
                               #tel="ngModel" title="Ex: +216 XX XXX XXX"
                               [ngClass]="{'is-invalid': tel.invalid && tel.touched}">
                        <div *ngIf="tel.errors?.['required'] && tel.touched" class="invalid-feedback">Le téléphone est obligatoire</div>
                        <div *ngIf="tel.errors?.['pattern'] && tel.touched" class="invalid-feedback">Le téléphone ne doit contenir que des chiffres</div>
                      </div>
                    </div>

                    <div class="mb-4">
                      <label for="adresse" class="form-label">Adresse de livraison <span class="text-danger">*</span></label>
                      <textarea class="form-control" id="adresse" name="adresseLivraison"
                                rows="3" [(ngModel)]="commande.adresseLivraison" required
                                #adresse="ngModel" maxlength="1000" title="Adresse complète..."
                                [ngClass]="{'is-invalid': adresse.invalid && adresse.touched}"></textarea>
                      <div class="invalid-feedback">L'adresse de livraison est obligatoire</div>
                    </div>

                    <!-- Error -->
                    <div *ngIf="erreur" class="alert alert-danger mb-3">
                      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
                    </div>

                    <div class="d-flex justify-content-between">
                      <a routerLink="/panier" class="btn btn-secondary">
                        <i class="bi bi-arrow-left me-1"></i>Retour
                      </a>
                      <button type="submit" class="btn btn-primary px-4"
                              [disabled]="formulaire.invalid || enCours">
                        <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>
                        <i *ngIf="!enCours" class="bi bi-check-lg me-1"></i>
                        Confirmer la commande
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-5">
              <div class="card" style="position: sticky; top: 80px;">
                <div class="card-header">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2 text-primary"></i>Récapitulatif de commande</h6>
                </div>
                <div class="card-body p-0">
                  <div *ngFor="let ligne of panier.lignes; let last = last"
                       class="d-flex justify-content-between align-items-center px-4 py-3"
                       [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'">
                    <div>
                      <span class="fw-semibold" style="font-size: 0.88rem;">{{ ligne.produitNom }}</span>
                      <small class="d-block text-muted">x{{ ligne.quantite }}</small>
                    </div>
                    <span class="fw-bold" style="font-size: 0.88rem;">{{ ligne.sousTotal | number:'1.2-2' }} TND</span>
                  </div>
                </div>
                <div class="card-body pt-3" style="border-top: 2px solid var(--primary);">
                  <div class="d-flex justify-content-between">
                    <span class="fw-bold fs-5">Total</span>
                    <span class="fw-bold fs-5" style="color: var(--primary);">{{ panier.montantTotal | number:'1.2-2' }} TND</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CommanderComponent implements OnInit {
  panier: Panier | null = null;
  commande: CreerCommande = {
    nomClient: '',
    emailClient: '',
    telephoneClient: '',
    adresseLivraison: '',
    sessionId: ''
  };
  chargement = true;
  enCours = false;
  erreur = '';

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private router: Router,
    
  ) {}

  ngOnInit(): void {
    this.commande.sessionId = this.panierService.currentSessionId;
    this.panierService.chargerPanier().subscribe({
      next: (data) => {
        this.panier = data;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  passerCommande(): void {
    this.enCours = true;
    this.erreur = '';

    this.commandeService.creerCommande(this.commande).subscribe({
      next: (commande) => {
        this.panierService.resetApresCommande();
        const extras: any = {};
        if (commande.produitsEpuises && commande.produitsEpuises.length > 0) {
          extras.queryParams = { epuises: commande.produitsEpuises.join(',') };
        }
        this.router.navigate(['/commande', commande.reference], extras);
      },
      error: (err) => {
        this.enCours = false;
        this.erreur = err.error?.message || 'Erreur lors de la création de la commande.';
      }
    });
  }
}
