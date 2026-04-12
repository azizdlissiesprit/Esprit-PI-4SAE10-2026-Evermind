import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RendezVousDTO, RendezVousService } from '../../../services/rendezvous.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  
  // Données
  appointments: RendezVousDTO[] = [];
  stats: any[] = [];
  isLoading = false;
  error: string | null = null;

  // Formulaire
  showAppointmentModal = false;
  isEditing = false;
  currentAppointment: RendezVousDTO | null = null;
  appointmentForm!: FormGroup;
  submitting = false;

  // Types de rendez-vous disponibles
  readonly TYPE_OPTIONS = [
    'CONSULTATION', 'TELECONSULTATION', 'SUIVI', 
    'BILAN', 'EVALUATION', 'RESULTATS', 'PREMIERE_VISITE'
  ];

  readonly STATUT_OPTIONS = ['CONFIRME', 'EN_ATTENTE', 'ANNULE'];

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadAppointments();
    this.loadStats();
  }

  private initForm(): void {
    this.appointmentForm = this.fb.group({
      patientNom: ['', Validators.required],
      patientPrenom: ['', Validators.required],
      type: ['CONSULTATION', Validators.required],
      statut: ['CONFIRME', Validators.required],
      dateHeure: ['', Validators.required],
      dureeMinutes: [30, [Validators.required, Validators.min(5)]],
      notes: ['']
    });
  }

  // Charger les rendez-vous
  loadAppointments(): void {
    this.isLoading = true;
    this.rendezVousService.getAll().subscribe({
      next: (appointments: RendezVousDTO[]) => {
        this.appointments = appointments;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des rendez-vous';
        this.isLoading = false;
        console.error('Error loading appointments:', err);
      }
    });
  }

  // Charger les statistiques
  loadStats(): void {
    // Créer des statistiques basées sur les données locales
    const total = this.appointments.length;
    const confirmed = this.appointments.filter(a => a.statut === 'CONFIRME').length;
    const pending = this.appointments.filter(a => a.statut === 'EN_ATTENTE').length;
    const cancelled = this.appointments.filter(a => a.statut === 'ANNULE').length;
    
    this.stats = [
      { label: 'RDV cette semaine', value: total.toString(), trend: '12% vs sem. préc.', trendType: 'up' },
      { label: 'Taux de confirmation', value: total > 0 ? Math.round((confirmed / total) * 100) + '%' : '0%', trend: '5pts', trendType: 'up' },
      { label: 'Annulations', value: cancelled.toString(), trend: '2 vs sem. préc.', trendType: 'down' },
      { label: 'Durée moy. consultation', value: '23 min', trend: 'stable', trendType: 'neutral' }
    ];
  }

  // Ouvrir le modal pour créer
  openAddAppointmentModal(): void {
    this.isEditing = false;
    this.currentAppointment = null;
    this.resetForm();
    this.showAppointmentModal = true;
  }

  // Ouvrir le modal pour modifier
  openEditAppointmentModal(appointment: RendezVousDTO): void {
    this.isEditing = true;
    this.currentAppointment = appointment;
    this.appointmentForm.patchValue({
      patientNom: appointment.patientNom,
      patientPrenom: appointment.patientPrenom,
      type: appointment.type,
      statut: appointment.statut,
      dateHeure: appointment.dateHeure,
      dureeMinutes: appointment.dureeMinutes,
      notes: appointment.notes
    });
    this.showAppointmentModal = true;
  }

  // Supprimer un rendez-vous
  deleteAppointment(appointment: RendezVousDTO): void {
    if (!appointment.id) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous de ${appointment.patientPrenom} ${appointment.patientNom} ?`)) {
      this.submitting = true;
      this.rendezVousService.delete(appointment.id).subscribe({
        next: () => {
          this.loadAppointments();
          this.loadStats();
          this.submitting = false;
        },
        error: (err: any) => {
          this.error = 'Erreur lors de la suppression du rendez-vous';
          this.submitting = false;
          console.error('Error deleting appointment:', err);
        }
      });
    }
  }

  // Sauvegarder (CREATE ou UPDATE)
  saveAppointment(): void {
    if (this.appointmentForm.invalid || this.submitting) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    if (this.isEditing && this.currentAppointment?.id) {
      // UPDATE
      this.rendezVousService.update(this.currentAppointment.id, this.appointmentForm.value).subscribe({
        next: () => {
          this.closeModal();
          this.loadAppointments();
          this.loadStats();
          this.submitting = false;
        },
        error: (err: any) => {
          this.error = 'Erreur lors de la mise à jour du rendez-vous';
          this.submitting = false;
          console.error('Error updating appointment:', err);
        }
      });
    } else {
      // CREATE
      this.rendezVousService.create(this.appointmentForm.value).subscribe({
        next: () => {
          this.closeModal();
          this.loadAppointments();
          this.loadStats();
          this.submitting = false;
        },
        error: (err: any) => {
          this.error = 'Erreur lors de la création du rendez-vous';
          this.submitting = false;
          console.error('Error creating appointment:', err);
        }
      });
    }
  }

  // Fermer le modal
  closeModal(): void {
    this.showAppointmentModal = false;
    this.resetForm();
    this.error = null;
  }

  // Réinitialiser le formulaire
  private resetForm(): void {
    this.appointmentForm.reset({
      patientNom: '',
      patientPrenom: '',
      type: 'CONSULTATION',
      statut: 'CONFIRME',
      dateHeure: '',
      dureeMinutes: 30,
      notes: ''
    });
    this.error = null;
  }

  // Obtenir les labels pour l'affichage
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
      'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }

  // Formater la date pour l'affichage
  formatDateTime(dateHeure: string): string {
    if (!dateHeure) return '';
    const date = new Date(dateHeure);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
