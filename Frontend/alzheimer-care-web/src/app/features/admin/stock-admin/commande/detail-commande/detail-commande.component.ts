import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Commande } from '../../../../../core/models/commande.model';
import { CommandeService } from '../../../../../core/services/commande.service';


@Component({
  selector: 'app-detail-commande',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h2 class="page-title">
          <i class="bi bi-receipt-cutoff me-2 text-gradient"></i>Détail de la Commande
        </h2>
        <p *ngIf="commande" class="page-subtitle">Réf. {{ commande.reference }}</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert" [ngClass]="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
        {{ message }}
        <button type="button" class="btn-close float-end" (click)="message = ''"></button>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && commande">
        <div class="row g-4">
          <!-- Order Info -->
          <div class="col-lg-8">
            <!-- Status Card -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-info-circle me-2 text-primary"></i>Informations de la commande</h6>
                <span class="badge" [ngClass]="getStatutClass(commande.statut)" style="font-size: 0.85rem; padding: 6px 16px;">
                  {{ getStatutLabel(commande.statut) }}
                </span>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <small class="text-muted d-block fw-semibold">Client</small>
                    <span>{{ commande.nomClient }}</span>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted d-block fw-semibold">Date de commande</small>
                    <span>{{ commande.dateCommande | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div *ngIf="commande.emailClient" class="col-md-6">
                    <small class="text-muted d-block fw-semibold">Email</small>
                    <span>{{ commande.emailClient }}</span>
                  </div>
                  <div *ngIf="commande.telephoneClient" class="col-md-6">
                    <small class="text-muted d-block fw-semibold">Téléphone</small>
                    <span>{{ commande.telephoneClient }}</span>
                  </div>
                  <div *ngIf="commande.adresseLivraison" class="col-12">
                    <small class="text-muted d-block fw-semibold">Adresse de livraison</small>
                    <span>{{ commande.adresseLivraison }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Lines -->
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0 fw-bold"><i class="bi bi-bag-fill me-2 text-primary"></i>Articles commandés ({{ commande.nombreArticles }})</h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th>Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ligne of commande.lignes">
                        <td class="fw-semibold">{{ ligne.nomProduit }}</td>
                        <td>{{ ligne.prixUnitaire | number:'1.2-2' }} TND</td>
                        <td><span class="badge badge-category">{{ ligne.quantite }}</span></td>
                        <td class="fw-bold">{{ ligne.sousTotal | number:'1.2-2' }} TND</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end fw-bold fs-5">Total</td>
                        <td class="fw-bold fs-5" style="color: var(--primary);">{{ commande.montantTotal | number:'1.2-2' }} TND</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Management -->
          <div class="col-lg-4">
            <div class="card" style="position: sticky; top: 80px;">
              <div class="card-header" style="background: linear-gradient(135deg, #1a73e8, #1557b0); color: white;">
                <h6 class="mb-0"><i class="bi bi-arrow-repeat me-2"></i>Changer le statut</h6>
              </div>
              <div class="card-body">
                <select class="form-select mb-3" [(ngModel)]="nouveauStatut">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="CONFIRMEE">Confirmée</option>
                  <option value="EN_PREPARATION">En préparation</option>
                  <option value="EXPEDIEE">Expédiée</option>
                  <option value="LIVREE">Livrée</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
                <button class="btn btn-primary w-100"
                        (click)="changerStatut()"
                        [disabled]="enCours || nouveauStatut === commande.statut">
                  <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!enCours" class="bi bi-check-lg me-1"></i>
                  Appliquer
                </button>
              </div>
            </div>

            <!-- Back Button -->
            <a routerLink="/admin/stock/commandes" class="btn btn-secondary w-100 mt-3">
              <i class="bi bi-arrow-left me-1"></i>Retour à la liste
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DetailCommandeComponent implements OnInit {
  commande: Commande | null = null;
  nouveauStatut = '';
  chargement = true;
  enCours = false;
  message = '';
  messageType = '';

  constructor(
    private route: ActivatedRoute,
    private commandeService: CommandeService,
    
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.commandeService.obtenirParId(+id).subscribe({
        next: (data) => {
          this.commande = data;
          this.nouveauStatut = data.statut;
          this.chargement = false;
        },
        error: () => {
          this.chargement = false;
          this.message = 'Impossible de charger la commande.';
          this.messageType = 'error';
        }
      });
    }
  }

  changerStatut(): void {
    if (!this.commande?.id) return;
    this.enCours = true;
    this.message = '';
    this.commandeService.modifierStatut(this.commande.id, this.nouveauStatut).subscribe({
      next: (data) => {
        this.commande = data;
        this.nouveauStatut = data.statut;
        this.enCours = false;
        this.message = 'Statut modifié avec succès.';
        this.messageType = 'success';
      },
      error: (err) => {
        this.enCours = false;
        this.message = err.error?.message || 'Erreur lors de la modification du statut.';
        this.messageType = 'error';
      }
    });
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bg-warning text-dark',
      'CONFIRMEE': 'bg-info text-white',
      'EN_PREPARATION': 'bg-primary',
      'EXPEDIEE': 'bg-primary',
      'LIVREE': 'bg-success',
      'ANNULEE': 'bg-danger'
    };
    return map[statut] || 'bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIEE': 'Expédiée',
      'LIVREE': 'Livrée',
      'ANNULEE': 'Annulée'
    };
    return map[statut] || 'En attente';
  }
}
