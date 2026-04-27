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
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <a routerLink="/admin/stock/commandes" class="btn btn-link text-decoration-none p-0 mb-2 d-inline-flex align-items-center gap-2 fw-semibold" style="color: var(--accent-color, #4E80EE);">
            <i class="bi bi-arrow-left"></i> Retour au Registre
          </a>
          <h2 class="page-title d-flex align-items-center gap-2 mb-0 text-primary">
            Détails de la Réquisition
          </h2>
        </div>
        <div *ngIf="commande" class="d-flex align-items-center gap-3">
          <span class="badge font-monospace bg-inset text-primary border shadow-sm px-3 py-2" style="font-size: 1rem;">Réf. {{ commande.reference }}</span>
          <span class="badge rounded border shadow-sm px-3 py-2 fw-bold" [ngClass]="getBadgeClass(commande.statut)" style="font-size: 0.9rem;">
            {{ getStatutLabel(commande.statut) }}
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="p-5 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-secondary fw-semibold small">Chargement du dossier...</p>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert alert-dismissible slide-in shadow-sm border-0" [ngClass]="messageType === 'success' ? 'bg-success-soft text-success border-success' : 'bg-danger-soft text-danger border-danger'" style="border-radius: 8px; border: 1px solid transparent;">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <span class="fw-bold">{{ message }}</span>
        <button type="button" class="btn-close" (click)="message = ''"></button>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && commande" class="animate-fade-up">
        <div class="row g-4">
          <!-- Main Content (Info & Articles) -->
          <div class="col-lg-8">
            
            <!-- Customer Info Card -->
            <div class="card clinical-card border-0 shadow-sm mb-4" style="border-radius: 12px; overflow: hidden;">
              <div class="card-header bg-card-surface border-bottom-0 pt-4 pb-2 px-4">
                <h6 class="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                   <div class="icon-circle" style="background: rgba(96, 165, 250, 0.15); color: var(--accent-color, #4E80EE); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-person-lines-fill"></i></div>
                   Sujet / Destinataire
                </h6>
              </div>
              <div class="card-body px-4 pb-4 pt-3 bg-card-surface">
                <div class="row g-4">
                  <div class="col-md-6 d-flex align-items-start gap-3">
                     <div class="info-icon mt-1 shadow-sm"><i class="bi bi-person"></i></div>
                     <div>
                       <small class="text-secondary fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Nom Prénom</small>
                       <div class="fw-bold text-primary" style="font-size: 1.1rem;">{{ commande.nomClient }}</div>
                     </div>
                  </div>
                  <div class="col-md-6 d-flex align-items-start gap-3">
                     <div class="info-icon mt-1 shadow-sm"><i class="bi bi-calendar3"></i></div>
                     <div>
                       <small class="text-secondary fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Enregistrement</small>
                       <div class="fw-bold fw-semibold text-primary font-monospace">{{ commande.dateCommande | date:'dd MMM yyyy à HH:mm' }}</div>
                     </div>
                  </div>
                  <div class="col-md-6 d-flex align-items-start gap-3" *ngIf="commande.emailClient">
                     <div class="info-icon mt-1 shadow-sm"><i class="bi bi-envelope"></i></div>
                     <div>
                       <small class="text-secondary fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Contact Courriel</small>
                       <div class="fw-semibold text-primary font-monospace">{{ commande.emailClient }}</div>
                     </div>
                  </div>
                  <div class="col-md-6 d-flex align-items-start gap-3" *ngIf="commande.telephoneClient">
                     <div class="info-icon mt-1 shadow-sm"><i class="bi bi-telephone"></i></div>
                     <div>
                       <small class="text-secondary fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Contact Téléphonique</small>
                       <div class="fw-semibold text-primary font-monospace">{{ commande.telephoneClient }}</div>
                     </div>
                  </div>
                  <div class="col-12 d-flex align-items-start gap-3 mt-4 pt-3 border-top" *ngIf="commande.adresseLivraison">
                     <div class="info-icon mt-1 shadow-sm border border-primary" style="color: var(--accent-color, #4E80EE); background: rgba(96, 165, 250, 0.1);"><i class="bi bi-geo-alt-fill"></i></div>
                     <div>
                       <small class="text-secondary fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Localisation / Livraison</small>
                       <div class="fw-bold text-primary mt-1">{{ commande.adresseLivraison }}</div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Lines -->
            <div class="card clinical-card border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
              <div class="card-header bg-card-surface border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                   <div class="icon-circle" style="background: rgba(16, 185, 129, 0.15); color: #10B981; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-clipboard2-data"></i></div>
                   Prescription d'Équipements
                </h6>
                <span class="badge bg-inset text-secondary border px-3 py-1 font-monospace" style="font-size:0.85rem;">{{ commande.nombreArticles }} unités</span>
              </div>
              <div class="card-body p-0 bg-card-surface">
                <div class="table-responsive">
                  <table class="table mb-0 clinical-table align-middle">
                    <thead style="background: var(--bg-inset); border-bottom: 2px solid var(--border-color);">
                      <tr>
                        <th class="border-0 px-4 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Appareillage</th>
                        <th class="border-0 py-3 text-secondary fw-bold text-end text-uppercase" style="font-size:0.75rem;">Val. Unitaire</th>
                        <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;">Dose/Qté</th>
                        <th class="border-0 px-4 py-3 text-secondary fw-bold text-end text-uppercase" style="font-size:0.75rem;">Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ligne of commande.lignes" style="border-bottom: 1px solid var(--border-color);">
                        <td class="px-4 py-3">
                           <div class="d-flex align-items-center gap-3">
                             <div class="product-thumb shadow-sm border" style="width: 44px; height: 44px; border-radius: 8px; background: var(--bg-inset); position: relative; display: flex; align-items: center; justify-content: center;">
                               <i class="bi bi-heart-pulse text-secondary fs-5 position-absolute top-50 start-50 translate-middle"></i>
                             </div>
                             <div class="fw-bold text-primary">{{ ligne.nomProduit }}</div>
                           </div>
                        </td>
                        <td class="py-3 text-end text-secondary fw-semibold font-monospace">{{ ligne.prixUnitaire | number:'1.2-2' }} TND</td>
                        <td class="py-3 text-center">
                           <span class="badge rounded bg-primary-soft text-primary border border-primary px-2 py-1 font-monospace" style="font-size: 0.9rem;">x{{ ligne.quantite }}</span>
                        </td>
                        <td class="px-4 py-3 text-end fw-bold text-primary font-monospace">{{ ligne.sousTotal | number:'1.2-2' }} TND</td>
                      </tr>
                    </tbody>
                    <tfoot style="background: var(--bg-inset);">
                      <tr>
                        <td colspan="3" class="px-4 py-4 text-end text-uppercase fw-bold text-secondary" style="letter-spacing: 1px; font-size:0.85rem;">Valeur Totale Approuvée</td>
                        <td class="px-4 py-4 text-end fw-bold font-monospace" style="font-size: 1.4rem; color: var(--accent-color, #4E80EE);">{{ commande.montantTotal | number:'1.2-2' }} TND</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Actions -->
          <div class="col-lg-4">
            <div class="card clinical-card border-0 shadow-sm" style="border-radius: 12px; position: sticky; top: 100px;">
              <div class="card-header bg-card-surface border-bottom-0 pt-4 pb-2 px-4">
                <h6 class="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                   <div class="icon-circle" style="background: var(--bg-inset); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-check2-square"></i></div>
                   Validation Clinique
                </h6>
              </div>
              <div class="card-body px-4 pb-4 bg-card-surface">
                <p class="text-secondary fw-semibold small mb-3">Mettre à jour l'évolution de la requête. Des notifications de suivi seront émises.</p>
                
                <div class="mb-4">
                  <label class="form-label fw-bold text-primary small">Phase Actuelle</label>
                  <select class="form-select clinical-select bg-inset border shadow-sm fw-bold" [(ngModel)]="nouveauStatut" [ngClass]="getSelectColorClass(nouveauStatut)">
                    <option value="EN_ATTENTE" class="fw-bold">En attente d'approbation</option>
                    <option value="CONFIRMEE" class="fw-bold">Requête Confirmée</option>
                    <option value="EN_PREPARATION" class="fw-bold">Préparation médicale</option>
                    <option value="EXPEDIEE" class="fw-bold">En transit vers patient</option>
                    <option value="LIVREE" class="fw-bold">Délivrée (Clos)</option>
                    <option value="ANNULEE" class="fw-bold">Rejetée / Annulée</option>
                  </select>
                </div>
                
                <button class="btn btn-clinical-primary w-100 rounded py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                        (click)="changerStatut()"
                        [disabled]="enCours || nouveauStatut === commande.statut">
                  <span *ngIf="enCours" class="spinner-border spinner-border-sm"></span>
                  <i *ngIf="!enCours" class="bi bi-shield-check"></i>
                  Valider la Phase
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clinical-card { background: var(--bg-card); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--border-color); }
    .bg-card-surface { background-color: var(--bg-card) !important; }
    .bg-inset { background-color: var(--bg-inset) !important; }
    
    .btn-clinical-primary {
      background-color: var(--accent-color, #4E80EE);
      color: white;
      border: 1px solid var(--accent-color, #4E80EE);
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-clinical-primary:hover:not(:disabled) {
      background-color: var(--accent-hover, #3b6bcc);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 128, 238, 0.3) !important;
    }
    .btn-clinical-primary:disabled { background-color: rgba(78, 128, 238, 0.5); cursor: not-allowed; border-color: transparent;}
    
    .info-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(96, 165, 250, 0.1); color: var(--accent-color, #4E80EE);
      font-size: 1.1rem;
    }
    
    .clinical-select { border-radius: 8px; height: 48px; transition: all 0.2s; cursor: pointer; color: var(--text-primary); }
    .clinical-select:focus { box-shadow: 0 0 0 3px rgba(78, 128, 238, 0.2); outline: none; background-color: var(--bg-card) !important; }
    
    .bg-success-soft { background-color: rgba(16, 185, 129, 0.1) !important; color: #10B981 !important; border-color: rgba(16, 185, 129, 0.2) !important; }
    .bg-warning-soft { background-color: rgba(245, 158, 11, 0.1) !important; color: #F59E0B !important; border-color: rgba(245, 158, 11, 0.2) !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.1) !important; color: #EF4444 !important; border-color: rgba(239, 68, 68, 0.2) !important; }
    .bg-primary-soft { background-color: rgba(78, 128, 238, 0.1) !important; color: var(--accent-color, #4E80EE) !important; border-color: rgba(78, 128, 238, 0.2) !important; }
    .bg-info-soft { background-color: rgba(14, 165, 233, 0.1) !important; color: #0EA5E9 !important; border-color: rgba(14, 165, 233, 0.2) !important;}
    .bg-secondary-soft { background-color: rgba(148, 163, 184, 0.1) !important; color: #64748B !important; border-color: rgba(148, 163, 184, 0.2) !important; }
    
    select.text-warning { color: #F59E0B !important; }
    select.text-info { color: #0EA5E9 !important; }
    select.text-primary { color: var(--accent-color, #4E80EE) !important; }
    select.text-success { color: #10B981 !important; }
    select.text-danger { color: #EF4444 !important; }
    select.text-secondary { color: #64748B !important; }

    .clinical-table tbody tr { transition: background-color 0.2s; background: var(--bg-card); cursor: default; }
    .clinical-table tbody tr:hover { background-color: var(--bg-inset) !important; }

    /* Animations */
    .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    html[data-theme="dark"] .bg-card-surface { background-color: var(--bg-card) !important; }
    html[data-theme="dark"] .bg-inset { background-color: var(--bg-inset) !important; }
    html[data-theme="dark"] .clinical-select { background-color: var(--bg-inset) !important; }
    html[data-theme="dark"] .text-primary { color: #f8fafc !important; }
    html[data-theme="dark"] .text-secondary { color: #94a3b8 !important; }
    html[data-theme="dark"] select option { background: var(--bg-card); color: #fff; }
  `]
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
    private commandeService: CommandeService
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
          this.message = 'Impossible de charger le dossier médical de cette requête.';
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
        this.message = 'La phase de la requête a été mise à jour.';
        this.messageType = 'success';
        setTimeout(() => this.message = '', 4000);
      },
      error: (err) => {
        this.enCours = false;
        this.message = err.error?.message || 'Erreur clinique lors de la modification de phase.';
        this.messageType = 'error';
      }
    });
  }

  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bg-warning-soft text-warning border-warning',
      'CONFIRMEE': 'bg-info-soft text-info border-info',
      'EN_PREPARATION': 'bg-primary-soft text-primary border-primary',
      'EXPEDIEE': 'bg-secondary-soft text-secondary border-secondary',
      'LIVREE': 'bg-success-soft text-success border-success',
      'ANNULEE': 'bg-danger-soft text-danger border-danger'
    };
    return map[statut] || 'bg-inset text-secondary';
  }

  getSelectColorClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'text-warning',
      'CONFIRMEE': 'text-info',
      'EN_PREPARATION': 'text-primary',
      'EXPEDIEE': 'text-secondary',
      'LIVREE': 'text-success',
      'ANNULEE': 'text-danger'
    };
    return map[statut] || '';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIEE': 'En transit',
      'LIVREE': 'Délivrée',
      'ANNULEE': 'Rejetée/Annulée'
    };
    return map[statut] || 'Inconnu';
  }
}
