import { Component, OnInit, inject, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PatientService, Patient, MedicalReport } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-profile.html',
  styleUrls: ['./patient-profile.scss']
})
export class PatientProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private cdr = inject(ChangeDetectorRef);
  
  public platformId = inject(PLATFORM_ID);

  patientId: number | null = null;
  patient: Patient | null = null;
  isLoading = true;
  error: string | null = null;
  medicalReports: MedicalReport[] = [];
  expandedReportId: number | null = null;

  ngOnInit() {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));

    if (isPlatformBrowser(this.platformId)) {
      if (this.patientId) {
        this.loadPatientDetails(this.patientId);
      } else {
        this.error = "Invalid patient ID.";
        this.isLoading = false;
      }
    } else {
        this.isLoading = false;
    }
  }

  loadPatientDetails(id: number) {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.isLoading = false;
        this.loadMedicalReports(id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching patient details:', err);
        this.error = 'Failed to load patient profile.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/patients']);
  }

  loadMedicalReports(patientId: number) {
    this.patientService.getMedicalReports(patientId).subscribe({
      next: (reports) => {
        this.medicalReports = reports;
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('No medical reports found', err)
    });
  }

  toggleReport(reportId: number | undefined) {
    if (!reportId) return;
    this.expandedReportId = this.expandedReportId === reportId ? null : reportId;
  }

  getPatientImage(patientId: number | undefined): string {
    const elderlyImages = [
      'https://images.unsplash.com/photo-1544144433-d50aff500b91?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1466112928291-0903b80a9466?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1559839734-2b71f15367ca?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=150&h=150&fit=crop'
    ];
    const index = Math.abs(Number(patientId || 0)) % elderlyImages.length;
    return elderlyImages[index];
  }

  getAge(dob: string | undefined): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
