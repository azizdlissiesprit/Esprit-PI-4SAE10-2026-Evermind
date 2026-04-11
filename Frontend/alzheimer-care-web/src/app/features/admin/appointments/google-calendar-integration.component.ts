import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RendezVousService, RendezVousDTO } from '../../../services/rendezvous.service';
import { GoogleCalendarService } from '../../../services/google-calendar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-google-calendar-integration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="google-calendar-integration">
      <div class="integration-header">
        <h3>Google Calendar Integration</h3>
        <div class="sync-status" [ngSwitch]="googleSyncStatus">
          <span *ngSwitchCase="'syncing'" class="sync syncing">
            <i class="fa fa-spinner fa-spin"></i>
            Synchronisation Google Calendar...
          </span>
          <span *ngSwitchCase="'success'" class="sync success">
            <i class="fa fa-check-circle"></i>
            Synchronisé avec Google Calendar
          </span>
          <span *ngSwitchCase="'error'" class="sync error">
            <i class="fa fa-exclamation-triangle"></i>
            Synchronisation échouée
          </span>
        </div>
      </div>

      <div class="integration-content">
        <!-- Formulaire de création de RDV -->
        <div class="appointment-form">
          <h4>Créer un nouveau rendez-vous</h4>
          <form [formGroup]="rdvForm" (ngSubmit)="saveRDV()">
            <div class="form-row">
              <div class="form-group">
                <label for="patientNom">Nom du patient</label>
                <input id="patientNom" formControlName="patientNom" type="text" class="form-control">
              </div>
              <div class="form-group">
                <label for="patientPrenom">Prénom du patient</label>
                <input id="patientPrenom" formControlName="patientPrenom" type="text" class="form-control">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="type">Type de consultation</label>
                <select id="type" formControlName="type" class="form-control">
                  <option value="CONSULTATION">Consultation</option>
                  <option value="TELECONSULTATION">Téléconsultation</option>
                  <option value="SUIVI">Suivi</option>
                  <option value="BILAN">Bilan</option>
                  <option value="EVALUATION">Évaluation</option>
                  <option value="RESULTATS">Résultats</option>
                  <option value="PREMIERE_VISITE">1ère visite</option>
                </select>
              </div>
              <div class="form-group">
                <label for="statut">Statut</label>
                <select id="statut" formControlName="statut" class="form-control">
                  <option value="CONFIRME">Confirmé</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="ANNULE">Annulé</option>
                  <option value="LIBRE">Libre</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="dateHeure">Date et heure</label>
                <input id="dateHeure" formControlName="dateHeure" type="datetime-local" class="form-control">
              </div>
              <div class="form-group">
                <label for="dureeMinutes">Durée (minutes)</label>
                <input id="dureeMinutes" formControlName="dureeMinutes" type="number" class="form-control" min="15" max="120">
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea id="notes" formControlName="notes" class="form-control" rows="3"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="rdvForm.invalid || googleSyncStatus === 'syncing'">
                <i class="fa fa-save"></i>
                {{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetForm()">
                <i class="fa fa-times"></i>
                Annuler
              </button>
            </div>
          </form>
        </div>

        <!-- Liste des rendez-vous -->
        <div class="appointments-list">
          <h4>Rendez-vous du jour</h4>
          <div class="appointments-grid">
            <div *ngFor="let rdv of rendezVous" class="appointment-card">
              <div class="appointment-header">
                <h5>{{ rdv.patientNom }} {{ rdv.patientPrenom }}</h5>
                <span class="appointment-type" [class]="'type-' + rdv.type.toLowerCase()">
                  {{ getTypeLabel(rdv.type) }}
                </span>
              </div>
              <div class="appointment-details">
                <p><i class="fa fa-clock"></i> {{ formatDate(rdv.dateHeure) }}</p>
                <p><i class="fa fa-hourglass-half"></i> {{ rdv.dureeMinutes }} min</p>
                <p><i class="fa fa-info-circle"></i> {{ getStatutLabel(rdv.statut) }}</p>
                <p *ngIf="rdv.notes"><i class="fa fa-sticky-note"></i> {{ rdv.notes }}</p>
              </div>
              <div class="appointment-actions">
                <button class="btn btn-sm btn-primary" (click)="editRDV(rdv)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" (click)="deleteRDV(rdv.id!)">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .google-calendar-integration {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .integration-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .integration-header h3 {
      margin: 0;
      color: #333;
    }

    .sync-status {
      margin-left: 8px;
    }

    .sync {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sync.syncing {
      background: #e8f0fe;
      color: #1a73e8;
    }

    .sync.success {
      background: #e6f4ea;
      color: #1e8e3e;
    }

    .sync.error {
      background: #fce8e6;
      color: #d93025;
    }

    .integration-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .appointment-form, .appointments-list {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .appointment-form h4, .appointments-list h4 {
      margin: 0 0 20px 0;
      color: #495057;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #495057;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #80bdff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .appointments-grid {
      display: grid;
      gap: 15px;
      max-height: 400px;
      overflow-y: auto;
    }

    .appointment-card {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .appointment-header h5 {
      margin: 0;
      color: #333;
    }

    .appointment-type {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .type-consultation { background: #e3f2fd; color: #1976d2; }
    .type-teleconsultation { background: #ffebee; color: #d32f2f; }
    .type-suivi { background: #e8f5e8; color: #388e3c; }
    .type-bilan { background: #fff3e0; color: #f57c00; }
    .type-evaluation { background: #f3e5f5; color: #7b1fa2; }
    .type-resultats { background: #e0f2f1; color: #00796b; }
    .type-premiere_visite { background: #e8eaf6; color: #3f51b5; }

    .appointment-details p {
      margin: 5px 0;
      font-size: 13px;
      color: #666;
    }

    .appointment-details i {
      width: 16px;
      margin-right: 5px;
    }

    .appointment-actions {
      display: flex;
      gap: 5px;
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      .integration-content {
        grid-template-columns: 1fr;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GoogleCalendarIntegrationComponent {
  rdvForm: FormGroup;
  rendezVous: RendezVousDTO[] = [];
  googleSyncStatus: 'idle' | 'syncing' | 'success' | 'error' = 'idle';
  isEditing = false;
  editingId: number | null = null;

  constructor(
    private rdvService: RendezVousService,
    private googleCalendarService: GoogleCalendarService,
    private fb: FormBuilder
  ) {
    this.rdvForm = this.fb.group({
      patientNom: ['', Validators.required],
      patientPrenom: ['', Validators.required],
      type: ['CONSULTATION', Validators.required],
      statut: ['CONFIRME', Validators.required],
      dateHeure: ['', Validators.required],
      dureeMinutes: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadRDV();
  }

  loadRDV() {
    const today = new Date().toISOString().split('T')[0];
    this.rdvService.getByJour(today).subscribe({
      next: (data) => {
        this.rendezVous = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous:', err);
      }
    });
  }

  saveRDV() {
    if (this.rdvForm.invalid) return;
    
    this.googleSyncStatus = 'syncing';
    const payload = { ...this.rdvForm.value };

    const obs = this.isEditing && this.editingId !== null
      ? this.rdvService.update(this.editingId, payload)
      : this.rdvService.create(payload);

    obs.subscribe({
      next: () => {
        this.googleSyncStatus = 'success';
        setTimeout(() => (this.googleSyncStatus = 'idle'), 3000);
        this.resetForm();
        this.loadRDV();
      },
      error: () => {
        this.googleSyncStatus = 'error';
        setTimeout(() => (this.googleSyncStatus = 'idle'), 3000);
      }
    });
  }

  editRDV(rdv: RendezVousDTO) {
    this.isEditing = true;
    this.editingId = rdv.id!;
    this.rdvForm.patchValue(rdv);
  }

  deleteRDV(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.rdvService.delete(id).subscribe({
        next: () => {
          this.loadRDV();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  resetForm() {
    this.rdvForm.reset({
      patientNom: '',
      patientPrenom: '',
      type: 'CONSULTATION',
      statut: 'CONFIRME',
      dateHeure: '',
      dureeMinutes: 30,
      notes: ''
    });
    this.isEditing = false;
    this.editingId = null;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CONSULTATION': 'Consultation',
      'TELECONSULTATION': 'Téléconsultation',
      'SUIVI': 'Suivi',
      'BILAN': 'Bilan',
      'EVALUATION': 'Évaluation',
      'RESULTATS': 'Résultats',
      'PREMIERE_VISITE': '1ère visite'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'CONFIRME': 'Confirmé',
      'EN_ATTENTE': 'En attente',
      'ANNULE': 'Annulé',
      'LIBRE': 'Libre'
    };
    return labels[statut] || statut;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
