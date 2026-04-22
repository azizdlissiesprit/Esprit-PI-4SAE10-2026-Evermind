import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService, Patient } from '../../../../core/services/patient.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-assign-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-patients.html',
  styleUrls: ['./assign-patients.scss']
})
export class AssignPatientsComponent implements OnInit {
  private patientService = inject(PatientService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  patients: Patient[] = [];
  caregivers: any[] = [];
  isLoading = true;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log('[DEBUG] Starting loadData()');
    this.isLoading = true;
    
    let patientsLoaded = false;
    let caregiversLoaded = false;

    const checkComplete = () => {
      console.log(`[DEBUG] checkComplete -> patientsLoaded: ${patientsLoaded}, caregiversLoaded: ${caregiversLoaded}`);
      if (patientsLoaded && caregiversLoaded) {
        console.log('[DEBUG] Both loads finished, turning off isLoading');
        this.isLoading = false;
        this.cdr.detectChanges(); // Force Angular to update the UI
      }
    };

    console.log('[DEBUG] Calling PatientService.getAll()...');
    this.patientService.getAll().subscribe({
      next: (data: Patient[]) => {
        console.log('[DEBUG] Received Patients data:', data);
        this.patients = data;
      },
      error: (err: any) => {
        console.error('[DEBUG] Error fetching Patients:', err);
        this.errorMessage = 'Failed to load patients.';
      },
      complete: () => {
        console.log('[DEBUG] Patient fetch completed.');
        patientsLoaded = true;
        checkComplete();
      }
    });

    console.log('[DEBUG] Calling HTTP GET for Caregivers (http://localhost:8082/user/type/AIDANT)...');
    this.http.get<any[]>('http://localhost:8082/user/type/AIDANT').subscribe({
      next: (data: any[]) => {
        console.log('[DEBUG] Received Caregivers data:', data);
        this.caregivers = data;
      },
      error: (err: any) => {
        console.error('[DEBUG] Error fetching Caregivers:', err);
        this.errorMessage = 'Failed to load caregivers.';
      },
      complete: () => {
        console.log('[DEBUG] Caregiver fetch completed.');
        caregiversLoaded = true;
        checkComplete();
      }
    });
  }

  onAssign(patientId: number, aidantId: string) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedPatient = { ...patient, responsable: Number(aidantId) };
    this.patientService.update(patientId, updatedPatient).subscribe({
      next: () => {
        this.successMessage = `Patient assigned successfully!`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to assign patient.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
