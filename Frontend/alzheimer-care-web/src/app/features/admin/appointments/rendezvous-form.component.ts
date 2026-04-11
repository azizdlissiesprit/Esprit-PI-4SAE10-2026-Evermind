import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RendezVousService, RendezVousDTO } from './rendezvous.service';

@Component({
  selector: 'app-rendezvous-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rendezvous-form.html',
  styleUrls: ['../alerts-admin/alerts-admin.scss']
})
export class RendezVousFormComponent implements OnInit {
  
  rdvForm: FormGroup;
  isEditing = false;
  loading = false;
  submitting = false;
  rdvId: number | null = null;
  
  types = [
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'TELECONSULTATION', label: 'Téléconsultation' },
    { value: 'SUIVI', label: 'Suivi' },
    { value: 'BILAN', label: 'Bilan' },
    { value: 'EVALUATION', label: 'Évaluation' },
    { value: 'RESULTATS', label: 'Résultats' },
    { value: 'PREMIERE_VISITE', label: '1ère visite' }
  ];
  
  statuts = [
    { value: 'CONFIRME', label: 'Confirmé' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ANNULE', label: 'Annulé' },
    { value: 'LIBRE', label: 'Libre' }
  ];

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.rdvForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.rdvId = +id;
      this.loadRendezVous(this.rdvId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patientNom: ['', [Validators.required, Validators.minLength(2)]],
      patientPrenom: ['', [Validators.required, Validators.minLength(2)]],
      type: ['CONSULTATION', Validators.required],
      statut: ['CONFIRME', Validators.required],
      dateHeure: ['', Validators.required],
      dureeMinutes: [30, [Validators.required, Validators.min(15), Validators.max(180)]],
      notes: ['']
    });
  }

  private loadRendezVous(id: number): void {
    this.loading = true;
    this.rendezVousService.getById(id).subscribe({
      next: (rdv) => {
        this.rdvForm.patchValue({
          patientNom: rdv.patientNom,
          patientPrenom: rdv.patientPrenom,
          type: rdv.type,
          statut: rdv.statut,
          dateHeure: rdv.dateHeure,
          dureeMinutes: rdv.dureeMinutes,
          notes: rdv.notes || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du rendez-vous:', err);
        this.loading = false;
        alert('Erreur lors du chargement du rendez-vous');
      }
    });
  }

  onSubmit(): void {
    if (this.rdvForm.invalid) {
      this.markFormGroupTouched(this.rdvForm);
      return;
    }

    this.submitting = true;
    const rdvData: RendezVousDTO = this.rdvForm.value;

    if (this.isEditing && this.rdvId) {
      // Update existing rendez-vous
      this.rendezVousService.update(this.rdvId, rdvData).subscribe({
        next: (result) => {
          console.log('Rendez-vous mis à jour avec succès:', result);
          this.submitting = false;
          alert('Rendez-vous mis à jour avec succès et synchronisé avec Google Calendar !');
          this.router.navigate(['/admin/appointments']);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.submitting = false;
          alert('Erreur lors de la mise à jour du rendez-vous');
        }
      });
    } else {
      // Create new rendez-vous
      this.rendezVousService.create(rdvData).subscribe({
        next: (result) => {
          console.log('Rendez-vous créé avec succès:', result);
          this.submitting = false;
          alert('Rendez-vous créé avec succès et synchronisé avec Google Calendar !');
          this.router.navigate(['/admin/appointments']);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.submitting = false;
          alert('Erreur lors de la création du rendez-vous');
        }
      });
    }
  }

  onCancel(): void {
    this.location.back();
  }

  // Helper methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rdvForm.get(fieldName);
    return field ? field.invalid && (field.touched || field.dirty) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.rdvForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['min']) return `Valeur minimale: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valeur maximale: ${field.errors['max'].max}`;
    }
    return '';
  }

  getTypeLabel(type: string): string {
    const typeObj = this.types.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getStatutLabel(statut: string): string {
    const statutObj = this.statuts.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }
}
