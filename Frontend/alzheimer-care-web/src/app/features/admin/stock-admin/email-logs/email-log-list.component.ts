import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailLogService } from '../../../../core/services/email-log.service';
import { EmailLog } from '../../../../core/models/email-log.model';

@Component({
  selector: 'app-email-log-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in email-logs-container">
      <div class="dashboard-header cosmetic-brand p-4 mb-4" style="border-radius: var(--radius); background: linear-gradient(135deg, #2d3b45 0%, #1e2831 100%);">
        <h1 class="text-white mb-2"><i class="bi bi-envelope-paper me-2" style="color: var(--stock-accent, #C4956A);"></i>Logs de Messagerie</h1>
        <p class="text-white-50 mb-0">Centre de contrôle des notifications transactionnelles du magasin.</p>
      </div>

      <!-- Action Bar -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="d-flex flex-wrap gap-2 filter-bar">
           <div class="search-input" style="min-width: 250px;">
             <i class="bi bi-search"></i>
             <input type="text" class="form-control" placeholder="Rechercher destinataire, sujet..." [(ngModel)]="recherche" (ngModelChange)="filtrer()">
           </div>
           <select class="form-select cosmetic-select" style="width: auto;" [(ngModel)]="filtreType" (ngModelChange)="filtrer()">
             <option value="">Tous les types</option>
             <option value="CONFIRMATION_COMMANDE">Confirmations de commande</option>
             <option value="ALERTE_STOCK">Alertes de stock</option>
             <option value="NOTIFICATION_SYSTEME">Système</option>
           </select>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" (click)="chargerEmails()">
            <i class="bi bi-arrow-clockwise"></i> Actualiser
          </button>
          <button *ngIf="unreadCount > 0" class="btn btn-stock-accent btn-sm d-flex align-items-center gap-2" (click)="marquerToutLu()">
            <i class="bi bi-check2-all"></i> Tout marquer lu
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert alert-dismissible slide-in" [ngClass]="messageType === 'success' ? 'alert-success' : 'alert-danger'">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
        {{ message }}
        <button type="button" class="btn-close" (click)="message = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container p-5 text-center">
        <div class="spinner-border" style="color: var(--stock-accent, #C4956A);" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="!chargement && erreur" class="alert alert-warning text-center mt-4">
        <i class="bi bi-wifi-off d-block mb-2" style="font-size: 2rem;"></i>
        Le service de messagerie est actuellement indisponible.
      </div>

      <!-- Email List Box -->
      <div *ngIf="!chargement && !erreur" class="card cosmetic-card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover email-table mb-0">
              <thead class="bg-light">
                <tr>
                  <th style="width: 50px;" class="text-center">Statut</th>
                  <th>Destinataire</th>
                  <th>Type</th>
                  <th>Sujet</th>
                  <th>Date</th>
                  <th class="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="emailsFiltres.length === 0">
                  <td colspan="6" class="text-center p-5 empty-box">
                    <i class="bi bi-inbox text-muted mt-2" style="font-size: 3rem;"></i>
                    <p class="mt-3 text-muted">Aucun message trouvé.</p>
                  </td>
                </tr>
                <tr *ngFor="let email of emailsFiltresPage" 
                    [ngClass]="{'fw-bold bg-stock-unread': !email.lu}"
                    class="email-row">
                  <td class="text-center align-middle">
                    <span class="status-dot" [class.unread]="!email.lu"></span>
                  </td>
                  <td class="align-middle">
                    <div class="d-flex align-items-center gap-2">
                       <div class="avatar-circle">{{ email.destinataire.charAt(0).toUpperCase() }}</div>
                       <span class="text-truncate" style="max-width: 150px;">{{ email.destinataire }}</span>
                    </div>
                  </td>
                  <td class="align-middle">
                    <span class="badge" [ngClass]="getBadgeClass(email.type)">
                       {{ getTypeLabel(email.type) }}
                    </span>
                  </td>
                  <td class="align-middle">
                    <span class="text-truncate d-inline-block" style="max-width: 280px;" [title]="email.sujet">{{ email.sujet }}</span>
                    <small *ngIf="email.referenceCommande" class="ms-2 badge bg-light text-dark border">#{{ email.referenceCommande }}</small>
                  </td>
                  <td class="align-middle text-muted small">
                    {{ email.dateEnvoi | date:'dd MMM yyyy, HH:mm' }}
                  </td>
                  <td class="align-middle text-end pe-3">
                    <div class="btn-group gap-1">
                      <button class="btn btn-sm btn-icon btn-outline-primary" title="Aperçu" (click)="ouvrirPreview(email)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button *ngIf="!email.lu" class="btn btn-sm btn-icon btn-outline-success" title="Marquer comme lu" (click)="marquerLu(email, $event)">
                        <i class="bi bi-check2"></i>
                      </button>
                      <button class="btn btn-sm btn-icon btn-outline-danger" title="Supprimer" (click)="confirmerSuppression(email, $event)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="card-footer bg-white border-top flex-row d-flex justify-content-between align-items-center p-3">
          <span class="text-muted small">Affichage {{ debut + 1 }}-{{ fin }} sur {{ emailsFiltres.length }} messages</span>
          <ul class="pagination pagination-sm m-0 gap-1 cosmetic-pagination">
             <li class="page-item" [class.disabled]="page === 1">
               <button class="page-link shadow-sm" (click)="page = page - 1; paginer()"><i class="bi bi-chevron-left"></i></button>
             </li>
             <li class="page-item" *ngFor="let p of pages" [class.active]="p === page">
               <button class="page-link shadow-sm" (click)="page = p; paginer()">{{ p }}</button>
             </li>
             <li class="page-item" [class.disabled]="page === totalPages">
               <button class="page-link shadow-sm" (click)="page = page + 1; paginer()"><i class="bi bi-chevron-right"></i></button>
             </li>
          </ul>
        </div>
      </div>
      
      <!-- Preview Modal -->
      <div *ngIf="emailEnApercu" class="modal fade show d-block cosmetic-modal">
        <div class="modal-backdrop fade show" (click)="fermerPreview()"></div>
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" style="z-index: 1055;">
          <div class="modal-content shadow-lg border-0" style="border-radius: 16px;">
            <div class="modal-header border-bottom px-4" style="background: rgba(196, 149, 106, 0.05);">
              <h5 class="modal-title fw-bold text-dark w-100">
                <span class="d-block">{{ emailEnApercu.sujet }}</span>
                <div class="d-flex justify-content-between align-items-center mt-2 w-100">
                  <span class="badge" [ngClass]="getBadgeClass(emailEnApercu.type)" style="font-size: 0.75rem;">{{ getTypeLabel(emailEnApercu.type) }}</span>
                  <small class="text-muted fw-normal">{{ emailEnApercu.dateEnvoi | date:'dd MMM yyyy, HH:mm' }}</small>
                </div>
              </h5>
              <button type="button" class="btn-close ms-2" (click)="fermerPreview()"></button>
            </div>
            <div class="modal-body p-4 bg-light">
              <div class="bg-white p-3 border rounded shadow-sm">
                <div class="mb-3 pb-3 border-bottom text-muted small d-flex flex-column gap-1">
                   <div><strong>De :</strong> store&#64;evermind.com</div>
                   <div><strong>À :</strong> {{ emailEnApercu.destinataire }}</div>
                   <div *ngIf="emailEnApercu.referenceCommande"><strong>Ref. Commande :</strong> #{{ emailEnApercu.referenceCommande }}</div>
                </div>
                <div class="email-body-content" [innerHTML]="emailEnApercu.contenuHtml"></div>
              </div>
            </div>
            <div class="modal-footer px-4 border-top bg-white">
              <button class="btn btn-outline-secondary rounded-pill px-4" (click)="fermerPreview()">Fermer</button>
              <button class="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2" (click)="fermerEtSupprimer()">
                <i class="bi bi-trash"></i> Supprimer ce log
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete Confirm Modal -->
      <div *ngIf="emailASupprimer && !emailEnApercu" class="modal fade show d-block cosmetic-modal">
        <div class="modal-backdrop fade show" (click)="emailASupprimer = null"></div>
        <div class="modal-dialog modal-dialog-centered modal-sm" style="z-index: 1055;">
          <div class="modal-content shadow border-0" style="border-radius: 12px; overflow: hidden;">
            <div class="modal-body p-4 text-center">
              <i class="bi bi-exclamation-circle text-danger mb-3 d-block" style="font-size: 3rem;"></i>
              <h5 class="fw-bold">Supprimer ce message ?</h5>
              <p class="text-muted small mb-0">Cette action est irréversible.</p>
            </div>
            <div class="d-flex border-top">
              <button class="btn btn-light w-50 rounded-0 py-3 text-muted fw-bold" (click)="emailASupprimer = null">Annuler</button>
              <button class="btn btn-danger w-50 rounded-0 py-3 fw-bold border-start-0" (click)="supprimer()">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .cosmetic-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    }
    
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: transparent;
    }
    .status-dot.unread {
      background-color: var(--stock-accent, #C4956A);
      box-shadow: 0 0 0 3px rgba(196, 149, 106, 0.2);
    }
    
    .bg-stock-unread {
      background-color: rgba(196, 149, 106, 0.03) !important;
    }
    
    .email-row {
      cursor: pointer;
      transition: all 0.2s;
    }
    .email-row:hover {
      background-color: rgba(196, 149, 106, 0.05) !important;
      transform: translateY(-1px);
    }
    
    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(106, 173, 168, 0.2), rgba(106, 173, 168, 0.5));
      color: #3b5a58;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }
    
    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    
    .btn-stock-accent {
      background-color: var(--stock-accent, #C4956A);
      color: white;
      border: none;
    }
    .btn-stock-accent:hover {
      background-color: #a87954;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(196, 149, 106, 0.3);
    }
    
    .cosmetic-select {
      border-radius: 10px;
      border-color: var(--border-color);
      height: 42px;
    }
    .cosmetic-select:focus {
      border-color: var(--stock-accent, #C4956A);
      box-shadow: 0 0 0 3px rgba(196, 149, 106, 0.2);
    }
    
    .cosmetic-pagination .page-link {
       border-radius: 8px !important;
       color: var(--text-secondary);
       border: 1px solid var(--border-color);
       margin: 0 2px;
       width: 32px;
       height: 32px;
       display: flex;
       align-items: center;
       justify-content: center;
       transition: all 0.2s;
    }
    .cosmetic-pagination .page-item.active .page-link {
       background-color: var(--stock-accent, #C4956A);
       border-color: var(--stock-accent, #C4956A);
       color: white;
    }
    
    .email-body-content {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    html[data-theme="dark"] .email-body-content {
      color: #e5e7eb;
    }
    html[data-theme="dark"] .bg-light {
      background-color: var(--bg-main) !important;
    }
    html[data-theme="dark"] .bg-white {
      background-color: var(--bg-card) !important;
    }
  `]
})
export class EmailLogListComponent implements OnInit {
  emails: EmailLog[] = [];
  emailsFiltres: EmailLog[] = [];
  emailsFiltresPage: EmailLog[] = [];
  
  chargement = true;
  erreur = false;
  message = '';
  messageType = '';
  
  // Modals
  emailEnApercu: EmailLog | null = null;
  emailASupprimer: EmailLog | null = null;
  
  // Filters
  recherche = '';
  filtreType = '';
  unreadCount = 0;
  
  // Pagination
  page = 1;
  parPage = 10;
  totalPages = 1;
  pages: number[] = [];
  debut = 0;
  fin = 0;

  constructor(private emailService: EmailLogService) {}

  ngOnInit() {
    this.chargerEmails();
  }

  chargerEmails() {
    this.chargement = true;
    this.erreur = false;
    this.emailService.listerTout().subscribe({
      next: (data) => {
        this.emails = data.sort((a, b) => {
          return new Date(b.dateEnvoi || '').getTime() - new Date(a.dateEnvoi || '').getTime();
        });
        this.filtrer();
        this.compterNonLus();
        this.chargement = false;
      },
      error: (err) => {
        console.error(err);
        this.erreur = true;
        this.chargement = false;
      }
    });
  }
  
  compterNonLus() {
    this.unreadCount = this.emails.filter(e => !e.lu).length;
  }

  filtrer() {
    const q = this.recherche.toLowerCase().trim();
    this.emailsFiltres = this.emails.filter(e => {
      const matchRech = !q || e.destinataire.toLowerCase().includes(q) || e.sujet.toLowerCase().includes(q);
      const matchType = !this.filtreType || e.type === this.filtreType;
      return matchRech && matchType;
    });
    this.page = 1;
    this.paginer();
  }

  paginer() {
    this.totalPages = Math.max(1, Math.ceil(this.emailsFiltres.length / this.parPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.debut = (this.page - 1) * this.parPage;
    this.fin = Math.min(this.debut + this.parPage, this.emailsFiltres.length);
    this.emailsFiltresPage = this.emailsFiltres.slice(this.debut, this.fin);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  marquerLu(email: EmailLog, event?: Event) {
    if (event) event.stopPropagation();
    if (email.lu || !email.id) return;
    
    this.emailService.marquerCommeLu(email.id).subscribe({
      next: () => {
        email.lu = true;
        this.compterNonLus();
      }
    });
  }

  marquerToutLu() {
    this.emailService.marquerToutCommeLu().subscribe({
      next: () => {
        this.emails.forEach(e => e.lu = true);
        this.compterNonLus();
        this.message = 'Tous les messages ont été marqués comme lus.';
        this.messageType = 'success';
      }
    });
  }

  ouvrirPreview(email: EmailLog) {
    this.emailEnApercu = email;
    this.marquerLu(email);
  }
  
  fermerPreview() {
    this.emailEnApercu = null;
  }
  
  confirmerSuppression(email: EmailLog, event: Event) {
    event.stopPropagation();
    this.emailASupprimer = email;
  }
  
  fermerEtSupprimer() {
    if(this.emailEnApercu) {
       this.emailASupprimer = this.emailEnApercu;
       this.fermerPreview();
       // let the UI settle before opening delete modal, or just delete directly
       this.supprimer();
    }
  }

  supprimer() {
    if (this.emailASupprimer?.id) {
      this.emailService.supprimer(this.emailASupprimer.id).subscribe({
        next: () => {
          this.emails = this.emails.filter(e => e.id !== this.emailASupprimer!.id);
          this.filtrer();
          this.compterNonLus();
          this.emailASupprimer = null;
          this.message = 'Log supprimé avec succès.';
          this.messageType = 'success';
          setTimeout(() => this.message = '', 3000);
        },
        error: () => {
          this.message = 'Erreur lors de la suppression.';
          this.messageType = 'error';
          this.emailASupprimer = null;
        }
      });
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'CONFIRMATION_COMMANDE': return 'Commande';
      case 'ALERTE_STOCK': return 'Alerte Stock';
      case 'NOTIFICATION_SYSTEME': return 'Système';
      default: return type;
    }
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'CONFIRMATION_COMMANDE': return 'bg-primary text-white';
      case 'ALERTE_STOCK': return 'bg-warning text-dark';
      case 'NOTIFICATION_SYSTEME': return 'bg-info text-dark';
      default: return 'bg-secondary text-white';
    }
  }
}
