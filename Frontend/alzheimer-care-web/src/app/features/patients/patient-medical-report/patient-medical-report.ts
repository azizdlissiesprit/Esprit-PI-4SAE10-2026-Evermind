import { Component, OnInit, inject, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService, Patient, MedicalReport } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-patient-medical-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-medical-report.html',
  styleUrls: ['./patient-medical-report.scss']
})
export class PatientMedicalReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  @Inject(PLATFORM_ID) platformId!: Object;

  patientId: number | null = null;
  patient: Patient | null = null;
  isLoading = true;
  isSubmitting = false;

  // Form model
  report: Partial<MedicalReport> = {
    primaryDiagnosis: '',
    diseaseStage: '',
    cognitiveAssessment: '',
    functionalStatus: '',
    behavioralObservations: '',
    medicationReview: '',
    treatmentPlan: '',
    additionalNotes: ''
  };

  diseaseStages = ['Preclinical', 'Mild Cognitive Impairment (MCI)', 'Mild Dementia', 'Moderate Dementia', 'Severe Dementia', 'Terminal'];

  constructor(@Inject(PLATFORM_ID) private _platformId: Object) {
    this.platformId = _platformId;
  }

  ngOnInit() {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId) && this.patientId) {
      this.loadPatient(this.patientId);
    } else {
      this.isLoading = false;
    }
  }

  loadPatient(id: number) {
    this.patientService.getById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReport() {
    if (!this.patientId || this.isSubmitting) return;

    const userId = this.authService.getUserId();
    const firstName = typeof localStorage !== 'undefined' ? localStorage.getItem('first_name') || '' : '';
    const lastName = typeof localStorage !== 'undefined' ? localStorage.getItem('last_name') || '' : '';

    const fullReport: MedicalReport = {
      patientId: this.patientId,
      doctorId: userId || 0,
      doctorName: `Dr. ${firstName} ${lastName}`.trim(),
      primaryDiagnosis: this.report.primaryDiagnosis || '',
      diseaseStage: this.report.diseaseStage || '',
      cognitiveAssessment: this.report.cognitiveAssessment || '',
      functionalStatus: this.report.functionalStatus || '',
      behavioralObservations: this.report.behavioralObservations || '',
      medicationReview: this.report.medicationReview || '',
      treatmentPlan: this.report.treatmentPlan || '',
      additionalNotes: this.report.additionalNotes || ''
    };

    this.isSubmitting = true;
    this.patientService.submitMedicalReport(fullReport).subscribe({
      next: () => {
        this.notificationService.success('Medical report submitted successfully.');
        this.isSubmitting = false;
        this.router.navigate(['/app/patients']);
      },
      error: (err) => {
        console.error('Failed to submit report:', err);
        this.notificationService.error('Failed to submit medical report.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/patients']);
  }

  getAge(dob: string | undefined): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  getPatientImage(patientId: number | undefined): string {
    const images = [
      'https://images.unsplash.com/photo-1544144433-d50aff500b91?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1466112928291-0903b80a9466?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop'
    ];
    return images[Math.abs(Number(patientId || 0)) % images.length];
  }
}
