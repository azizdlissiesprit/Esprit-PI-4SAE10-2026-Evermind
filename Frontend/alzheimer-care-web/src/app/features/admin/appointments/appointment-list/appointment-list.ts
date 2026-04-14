import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RendezVousService, RendezVousDTO } from '../rendezvous.service';

@Component({
  selector: 'app-appointment-list-v2',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="appointments-list-container">
      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>

      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Liste complète des rendez-vous</h1>
          <div class="header-actions">
            <button class="btn btn-primary" routerLink="/admin/appointments/new">
              <iconify-icon inline icon="solar:add-circle-bold" width="16"></iconify-icon>
              <span>Nouveau RDV</span>
            </button>
            <button class="btn btn-ghost" (click)="goBack()">
              <iconify-icon inline icon="solar:calendar-bold" width="16"></iconify-icon>
              <span>Retour au calendrier</span>
            </button>
          </div>
        </div>
      </div>

      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-number">{{ allRendezVous.length }}</div>
          <div class="stat-label">Total des RDV</div>
        </div>
        <div class="stat-card confirmed">
          <div class="stat-number">{{ allRendezVous.filter(r => r.statut === 'CONFIRME').length }}</div>
          <div class="stat-label">Confirmés</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-number">{{ allRendezVous.filter(r => r.statut === 'EN_ATTENTE').length }}</div>
          <div class="stat-label">En attente</div>
        </div>
        <div class="stat-card cancelled">
          <div class="stat-number">{{ allRendezVous.filter(r => r.statut === 'ANNULE').length }}</div>
          <div class="stat-label">Annulés</div>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des rendez-vous...</p>
      </div>

      <div class="appointments-grid" *ngIf="!loading">
        <div class="appointment-card" 
             *ngFor="let rdv of allRendezVous" 
             [ngClass]="'status-' + rdv.statut.toLowerCase()">
          
          <div class="card-header">
            <div class="patient-info">
              <h3 class="patient-name">{{ rdv.patientNom }} {{ rdv.patientPrenom }}</h3>
              <span class="appointment-type" [ngClass]="'type-' + rdv.type.toLowerCase()">
                {{ getTypeLabel(rdv.type) }}
              </span>
            </div>
            <div class="status-badge" [ngClass]="'badge-' + rdv.statut.toLowerCase()">
              {{ getStatutLabel(rdv.statut) }}
            </div>
          </div>

          <div class="card-body">
            <div class="appointment-details">
              <div class="detail-row">
                <iconify-icon inline icon="solar:calendar-bold" width="16"></iconify-icon>
                <span>{{ formatDate(rdv.dateHeure) }}</span>
              </div>
              <div class="detail-row">
                <iconify-icon inline icon="solar:clock-circle-bold" width="16"></iconify-icon>
                <span>{{ formatTime(rdv.dateHeure) }}</span>
              </div>
              <div class="detail-row">
                <iconify-icon inline icon="solar:hourglass-bold" width="16"></iconify-icon>
                <span>{{ rdv.dureeMinutes }} minutes</span>
              </div>
              <div class="detail-row" *ngIf="rdv.notes">
                <iconify-icon inline icon="solar:document-text-bold" width="16"></iconify-icon>
                <span>{{ rdv.notes }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-sm btn-outline-primary" 
                    routerLink="/admin/appointments/edit/{{ rdv.id }}">
              <iconify-icon inline icon="solar:pen-linear" width="14"></iconify-icon>
              <span>Modifier</span>
            </button>
            <button class="btn btn-sm btn-success" 
                    (click)="startVideoCall(rdv)">
              <iconify-icon inline icon="solar:video-camera-bold" width="14"></iconify-icon>
              <span>Google Meet</span>
            </button>
            <button class="btn btn-sm btn-outline-info" 
                    (click)="copyMeetLink(rdv)">
              <iconify-icon inline icon="solar:copy-bold" width="14"></iconify-icon>
              <span>Copier lien</span>
            </button>
            <button class="btn btn-sm btn-outline-danger" 
                    (click)="deleteRDV(rdv.id!)">
              <iconify-icon inline icon="solar:trash-bin-minimalistic-2-linear" width="14"></iconify-icon>
              <span>Supprimer</span>
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="allRendezVous.length === 0">
          <iconify-icon inline icon="solar:calendar-cross-bold" width="64"></iconify-icon>
          <h3>Aucun rendez-vous trouvé</h3>
          <p>Il n'y a aucun rendez-vous programmé pour le moment.</p>
          <button class="btn btn-primary" routerLink="/admin/appointments/new">
            <iconify-icon inline icon="solar:add-circle-bold" width="16"></iconify-icon>
            <span>Créer un rendez-vous</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./appointment-list.scss']
})
export class AppointmentList implements OnInit {
  allRendezVous: RendezVousDTO[] = [];
  loading = false;
  backendAvailable = true;

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit() {
    this.loadData();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  loadData(): void {
    this.loading = true;
    this.rendezVousService.getAll().subscribe({
      next: (data) => {
        this.backendAvailable = true;
        this.allRendezVous = [...data].sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
        this.loading = false;
      },
      error: () => {
        this.backendAvailable = false;
        this.allRendezVous = this.getMockRdv();
        this.loading = false;
      }
    });
  }

  getTypeLabel(type: RendezVousDTO['type']): string {
    const labels: Record<RendezVousDTO['type'], string> = {
      CONSULTATION: 'Consultation',
      TELECONSULTATION: 'Téléconsult.',
      SUIVI: 'Suivi',
      BILAN: 'Bilan mé.',
      EVALUATION: 'Éval. cog.',
      RESULTATS: 'Résultats',
      PREMIERE_VISITE: '1ère visite'
    };
    return labels[type];
  }

  getStatutLabel(statut: RendezVousDTO['statut']): string {
    switch (statut) {
      case 'CONFIRME': return 'Confirmé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      case 'LIBRE': return 'Libre';
      default: return statut;
    }
  }

  deleteRDV(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.rendezVousService.delete(id).subscribe({
        next: () => {
          this.allRendezVous = this.allRendezVous.filter(rdv => rdv.id !== id);
        },
        error: () => {
          if (!this.backendAvailable) {
            this.allRendezVous = this.allRendezVous.filter(rdv => rdv.id !== id);
          }
        }
      });
    }
  }

  goBack(): void {
    window.location.href = '/admin/appointments';
  }

  startVideoCall(rdv: RendezVousDTO): void {
    // Créer une nouvelle réunion Google Meet
    const meetUrl = `https://meet.google.com/new?rdv=${rdv.id}&patient=${rdv.patientNom}_${rdv.patientPrenom}`;
    
    // Ouvrir Google Meet dans un nouvel onglet
    window.open(meetUrl, '_blank');
    
    // Afficher une confirmation avec option de partage
    const shareMessage = `Réunion Google Meet créée pour ${rdv.patientNom} ${rdv.patientPrenom}\n\nVoulez-vous copier le lien pour le partager ?`;
    
    if (confirm(shareMessage)) {
      this.copyMeetLink(rdv);
    }
  }

  copyMeetLink(rdv: RendezVousDTO): void {
    const meetUrl = `https://meet.google.com/new?rdv=${rdv.id}&patient=${rdv.patientNom}_${rdv.patientPrenom}`;
    
    const tempInput = document.createElement('input');
    tempInput.value = meetUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert(`Lien Google Meet copié pour ${rdv.patientNom} ${rdv.patientPrenom}!\n\n${meetUrl}`);
  }

  private getMockRdv(): RendezVousDTO[] {
    return [
      { id: 1, patientNom: 'Omar', patientPrenom: 'F.', type: 'TELECONSULTATION', statut: 'CONFIRME', dateHeure: '2026-04-01T08:00:00', dureeMinutes: 30, notes: 'Patient no info modifiable' },
      { id: 2, patientNom: 'Leila', patientPrenom: 'B.', type: 'PREMIERE_VISITE', statut: 'CONFIRME', dateHeure: '2026-04-01T09:00:00', dureeMinutes: 45, notes: 'Patient no info modifiable' },
      { id: 3, patientNom: 'Sara', patientPrenom: 'M.', type: 'EVALUATION', statut: 'CONFIRME', dateHeure: '2026-04-01T11:00:00', dureeMinutes: 30, notes: 'Patient no info modifiable' },
      { id: 4, patientNom: 'Nadia', patientPrenom: 'B.', type: 'SUIVI', statut: 'CONFIRME', dateHeure: '2026-04-01T12:00:00', dureeMinutes: 20, notes: 'Patient no info modifiable' },
      { id: 5, patientNom: 'Amira', patientPrenom: 'M.', type: 'CONSULTATION', statut: 'CONFIRME', dateHeure: '2026-04-02T08:00:00', dureeMinutes: 30, notes: 'Patient no info modifiable' },
      { id: 6, patientNom: 'K. ', patientPrenom: 'Haddad', type: 'BILAN', statut: 'CONFIRME', dateHeure: '2026-04-02T10:00:00', dureeMinutes: 30, notes: 'Bilan mé.' },
      { id: 7, patientNom: 'Leila', patientPrenom: 'B.', type: 'CONSULTATION', statut: 'EN_ATTENTE', dateHeure: '2026-04-02T11:00:00', dureeMinutes: 30, notes: 'Champ no info modif.' },
      { id: 8, patientNom: 'Ali', patientPrenom: 'D.', type: 'TELECONSULTATION', statut: 'CONFIRME', dateHeure: '2026-04-03T12:00:00', dureeMinutes: 20, notes: 'Patient no info modifiable' },
      { id: 9, patientNom: 'Kamel', patientPrenom: 'H.', type: 'TELECONSULTATION', statut: 'CONFIRME', dateHeure: '2026-03-31T10:00:00', dureeMinutes: 20, notes: 'Patient no info modifiable' },
      { id: 10, patientNom: 'Riadh', patientPrenom: 'S.', type: 'CONSULTATION', statut: 'CONFIRME', dateHeure: '2026-03-31T13:00:00', dureeMinutes: 25, notes: 'Patient no info modifiable' },
      { id: 11, patientNom: 'Inès', patientPrenom: 'Ben Ali', type: 'PREMIERE_VISITE', statut: 'EN_ATTENTE', dateHeure: '2026-04-04T10:30:00', dureeMinutes: 30, notes: 'Première consultation' },
      { id: 12, patientNom: 'Youssef', patientPrenom: 'Trabelsi', type: 'SUIVI', statut: 'EN_ATTENTE', dateHeure: '2026-04-04T14:00:00', dureeMinutes: 30, notes: 'Suivi mémoire' }
    ];
  }
}
