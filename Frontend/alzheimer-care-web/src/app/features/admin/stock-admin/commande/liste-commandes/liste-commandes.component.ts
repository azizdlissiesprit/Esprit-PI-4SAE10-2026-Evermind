import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Commande } from '../../../../../core/models/commande.model';
import { CommandeService } from '../../../../../core/services/commande.service';

@Component({
  selector: 'app-liste-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 class="page-title d-flex align-items-center gap-2 text-primary">
            <div class="icon-circle shadow-sm" style="background: rgba(96, 165, 250, 0.15); color: var(--accent-color, #4E80EE); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
               <i class="bi bi-file-earmark-medical"></i>
            </div>
            Registre des Réquisitions
          </h2>
          <p class="page-subtitle text-secondary ms-1 mt-1 mb-0 fw-semibold">{{ commandesFiltrees.length }} {{ commandesFiltrees.length !== 1 ? 'requêtes au total' : 'requête au total' }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert alert-dismissible slide-in shadow-sm border-0" [ngClass]="messageType === 'success' ? 'bg-success-soft text-success border-success' : 'bg-danger-soft text-danger border-danger'" style="border-radius: 8px; border: 1px solid transparent;">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        <span class="fw-bold">{{ message }}</span>
        <button type="button" class="btn-close" (click)="message = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="p-5 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-secondary fw-semibold small">Chargement du registre en cours...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement">
        <!-- Filter Bar -->
        <div class="card clinical-card mb-4 border-0 shadow-sm bg-card-surface">
          <div class="card-body p-3">
            <div class="d-flex flex-wrap gap-3">
              <div class="search-input flex-grow-1" style="min-width: 250px; position: relative;">
                <i class="bi bi-search text-secondary" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%);"></i>
                <input type="text" class="form-control clinical-input border-0 shadow-sm" placeholder="Rechercher par identifiant, email ou patient/client..."
                       [(ngModel)]="recherche" (ngModelChange)="filtrer()" style="padding-left: 44px !important; background: var(--bg-inset);">
              </div>
              <select class="form-select clinical-select border-0 shadow-sm" style="width: auto; min-width: 180px; background: var(--bg-inset);"
                      [(ngModel)]="filtreStatut" (ngModelChange)="filtrer()">
                <option value="">Tous les états</option>
                <option value="EN_ATTENTE">En attente d'approbation</option>
                <option value="CONFIRMEE">Confirmée</option>
                <option value="EN_PREPARATION">En préparation</option>
                <option value="EXPEDIEE">En transit</option>
                <option value="LIVREE">Délivrée</option>
                <option value="ANNULEE">Clôturée/Annulée</option>
              </select>
              <button *ngIf="recherche || filtreStatut !== ''"
                      class="btn btn-outline-secondary bg-card-surface rounded border shadow-sm" style="width: 44px; height: 44px;" (click)="recherche = ''; filtreStatut = ''; filtrer()" title="Effacer les filtres">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Metric Summary Bar -->
        <div class="d-flex gap-3 mb-4 flex-wrap animate-fade-up" *ngIf="commandesFiltrees.length > 0">
           <div class="d-flex align-items-center gap-2 px-3 py-2 bg-card-surface rounded shadow-sm border clinical-card">
              <span class="badge rounded bg-warning-soft text-warning fw-bold border border-warning px-2 py-1">{{ getCountByStatut('EN_ATTENTE') }}</span>
              <span class="small text-secondary fw-semibold text-uppercase">En Attente</span>
           </div>
           <div class="d-flex align-items-center gap-2 px-3 py-2 bg-card-surface rounded shadow-sm border clinical-card">
              <span class="badge rounded bg-primary-soft text-primary fw-bold border border-primary px-2 py-1">{{ getCountByStatut('EN_PREPARATION') }}</span>
              <span class="small text-secondary fw-semibold text-uppercase">Préparation</span>
           </div>
           <div class="d-flex align-items-center gap-2 px-3 py-2 bg-card-surface rounded shadow-sm border clinical-card">
              <span class="badge rounded bg-success-soft text-success fw-bold border border-success px-2 py-1">{{ getCountByStatut('LIVREE') }}</span>
              <span class="small text-secondary fw-semibold text-uppercase">Délivrée</span>
           </div>
        </div>

        <!-- Table -->
        <div class="card clinical-card border-0 shadow-sm animate-fade-up" style="border-radius: 12px; overflow: hidden;">
          <div class="card-body p-0 bg-card-surface">
            <div class="table-responsive">
              <table class="table table-hover mb-0 clinical-table align-middle">
                <thead style="background: var(--bg-inset); border-bottom: 2px solid var(--border-color);">
                  <tr>
                    <th class="border-0 px-4 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">N° Document</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Date d'Enregistrement</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Sujet / Patient</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;">Volume</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Valeur (TND)</th>
                    <th class="border-0 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">État Clinique</th>
                    <th class="border-0 px-4 py-3 text-end text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Dossier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="commandesFiltrees.length === 0">
                    <td colspan="7" class="text-center p-5 bg-card-surface">
                      <!-- Empty State -->
                      <div class="icon-circle mx-auto mb-3" style="background: var(--bg-inset); color: var(--text-secondary); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                         <i class="bi bi-folder-x"></i>
                      </div>
                      <h5 class="fw-bold text-primary">Archivage vide</h5>
                      <p class="text-secondary fw-semibold">Aucune requête ne correspond à vos filtres actuels ou la base est vide.</p>
                    </td>
                  </tr>
                  <!-- List of Orders -->
                  <tr *ngFor="let cmd of commandesPage" class="stagger-row" style="border-bottom: 1px solid var(--border-color);">
                    <td class="px-4 py-3">
                       <span class="badge font-monospace bg-inset border text-primary shadow-sm px-2 py-1" style="font-size: 0.85rem;">{{ cmd.reference }}</span>
                    </td>
                    <td class="py-3 text-secondary fw-semibold small">
                       <div class="fw-bold font-monospace">{{ cmd.dateCommande | date:'dd MMM yyyy' }}</div>
                       <div class="font-monospace text-muted">{{ cmd.dateCommande | date:'HH:mm' }}</div>
                    </td>
                    <td class="py-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="avatar-circle shadow-sm border" style="width: 36px; height: 36px; border-radius: 8px; background: rgba(96, 165, 250, 0.1); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--accent-color, #4E80EE);">
                          {{ cmd.nomClient ? cmd.nomClient.charAt(0).toUpperCase() : '?' }}
                        </div>
                        <div>
                          <div class="fw-bold text-primary">{{ cmd.nomClient }}</div>
                          <div class="small text-secondary fw-semibold text-truncate" style="max-width: 150px;" [title]="cmd.emailClient">{{ cmd.emailClient }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 text-center">
                      <span class="badge rounded bg-inset text-secondary border px-2 py-1 font-monospace">
                        {{ cmd.nombreArticles }} u.
                      </span>
                    </td>
                    <td class="py-3">
                      <div class="fw-bold text-primary font-monospace" style="font-size: 1.1rem;">{{ cmd.montantTotal | number:'1.2-2' }}</div>
                    </td>
                    <td class="py-3">
                      <span class="badge rounded border px-3 py-1 shadow-sm fw-bold" [ngClass]="getBadgeClass(cmd.statut)">
                        {{ getStatutLabel(cmd.statut) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <a [routerLink]="['/admin/stock/commandes', cmd.id]" class="btn btn-clinical-primary btn-sm rounded px-3 py-1 shadow-sm d-inline-flex align-items-center gap-2">
                        Ouvrir <i class="bi bi-file-text"></i>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
          <span class="text-secondary fw-semibold small px-2">Affichage {{ debut + 1 }} à {{ fin }} sur {{ commandesFiltrees.length }}</span>
          <ul class="pagination pagination-sm m-0 gap-1 clinical-pagination">
             <li class="page-item" [class.disabled]="page === 1">
               <button class="page-link shadow-sm bg-card-surface border" (click)="page = page - 1; paginer()"><i class="bi bi-chevron-left"></i></button>
             </li>
             <li class="page-item" *ngFor="let p of pages" [class.active]="p === page">
               <button class="page-link shadow-sm bg-card-surface border" (click)="page = p; paginer()">{{ p }}</button>
             </li>
             <li class="page-item" [class.disabled]="page === totalPages">
               <button class="page-link shadow-sm bg-card-surface border" (click)="page = page + 1; paginer()"><i class="bi bi-chevron-right"></i></button>
             </li>
          </ul>
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
    .btn-clinical-primary:hover {
      background-color: var(--accent-hover, #3b6bcc);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 128, 238, 0.3) !important;
    }
    
    .clinical-input, .clinical-select { border-radius: 8px; height: 44px; transition: all 0.2s; color: var(--text-primary); font-weight: 500; }
    .clinical-input:focus, .clinical-select:focus { background-color: var(--bg-card) !important; box-shadow: 0 0 0 3px rgba(78, 128, 238, 0.2) !important; outline: none; }
    
    .bg-success-soft { background-color: rgba(16, 185, 129, 0.1); color: #10B981; border-color: rgba(16, 185, 129, 0.2) !important; }
    .bg-warning-soft { background-color: rgba(245, 158, 11, 0.1); color: #F59E0B; border-color: rgba(245, 158, 11, 0.2) !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.1); color: #EF4444; border-color: rgba(239, 68, 68, 0.2) !important; }
    .bg-primary-soft { background-color: rgba(78, 128, 238, 0.1); color: var(--accent-color, #4E80EE); border-color: rgba(78, 128, 238, 0.2) !important; }
    .bg-info-soft { background-color: rgba(14, 165, 233, 0.1); color: #0EA5E9; border-color: rgba(14, 165, 233, 0.2) !important;}
    .bg-secondary-soft { background-color: rgba(148, 163, 184, 0.1); color: #64748B; border-color: rgba(148, 163, 184, 0.2) !important; }
    
    .clinical-pagination .page-link { border-radius: 8px !important; color: var(--text-secondary); border: none; margin: 0 2px; height: 36px; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; background: var(--bg-card); transition: all 0.2s; }
    .clinical-pagination .page-item.active .page-link { background-color: var(--accent-color, #4E80EE) !important; color: white !important; border-color: var(--accent-color, #4E80EE) !important; }
    .clinical-pagination .page-link:hover:not(.active) { background-color: rgba(78, 128, 238, 0.1); color: var(--accent-color, #4E80EE); }
    
    .clinical-table tbody tr { transition: background-color 0.2s, transform 0.2s; background: var(--bg-card); cursor: default; }
    .clinical-table tbody tr:hover { background-color: var(--bg-inset) !important; transform: translateY(-1px); }

    .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .stagger-row { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .clinical-table tbody tr:nth-child(n) { animation-delay: calc(0.05s * n); }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    html[data-theme="dark"] .bg-card-surface { background-color: var(--bg-card) !important; }
    html[data-theme="dark"] .bg-inset { background-color: var(--bg-inset) !important; }
    html[data-theme="dark"] .text-primary { color: #f8fafc !important; }
    html[data-theme="dark"] .text-secondary { color: #94a3b8 !important; }
    html[data-theme="dark"] .clinical-input, html[data-theme="dark"] .clinical-select { color: #f8fafc; }
    html[data-theme="dark"] .avatar-circle { border-color: var(--border-color) !important; }
  `]
})
export class ListeCommandesComponent implements OnInit {
  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  commandesPage: Commande[] = [];
  message = '';
  messageType = '';
  chargement = true;
  recherche = '';
  filtreStatut = '';

  page = 1;
  parPage = 12;
  totalPages = 1;
  pages: number[] = [];
  debut = 0;
  fin = 0;

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.chargement = true;
    this.commandeService.listerTout().subscribe({
      next: (data) => {
        this.commandes = data.sort((a,b) => new Date(b.dateCommande || 0).getTime() - new Date(a.dateCommande || 0).getTime());
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.message = 'Erreur lors du chargement des réquisitions.';
        this.messageType = 'error';
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const q = this.recherche.toLowerCase().trim();
    this.commandesFiltrees = this.commandes.filter(c => {
      const matchRecherche = !q
        || c.reference.toLowerCase().includes(q)
        || c.nomClient.toLowerCase().includes(q)
        || (c.emailClient || '').toLowerCase().includes(q);
      const matchStatut = !this.filtreStatut || c.statut === this.filtreStatut;
      return matchRecherche && matchStatut;
    });
    this.page = 1;
    this.paginer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.commandesFiltrees.length / this.parPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.debut = (this.page - 1) * this.parPage;
    this.fin = Math.min(this.debut + this.parPage, this.commandesFiltrees.length);
    this.commandesPage = this.commandesFiltrees.slice(this.debut, this.fin);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getCountByStatut(statut: string): number {
    return this.commandes.filter(c => c.statut === statut).length;
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
    return map[statut] || 'bg-inset text-secondary border-secondary';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIEE': 'Expédiée',
      'LIVREE': 'Livrée / Dossier clos',
      'ANNULEE': 'Annulée'
    };
    return map[statut] || 'Standard';
  }
}
