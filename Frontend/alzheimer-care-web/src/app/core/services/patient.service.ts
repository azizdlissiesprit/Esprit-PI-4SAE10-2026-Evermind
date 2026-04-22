import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the interface here or in a separate models file
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  roomNumber: string;
  bloodType?: string;
  medicalDiagnosis?: string;
  wearableDeviceId?: string;
  geofenceRadius?: number;
  baseLatitude?: number;
  baseLongitude?: number;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  chronicMedications?: string;
  responsable?: number;
  userIdResponsable?: number;
}

export interface MedicalReport {
  id?: number;
  patientId: number;
  doctorId?: number;
  title?: string;
  content?: string;
  date?: string;
  reportDate?: string;
  doctorName?: string;
  medicationReview?: string;
  treatmentPlan?: string;
  additionalNotes?: string;
  cognitiveAssessment?: string;
  functionalStatus?: string;
  behavioralObservations?: string;
  primaryDiagnosis?: string;
  diseaseStage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  // URL via Gateway (Port 8090) -> Patient Service
  // Based on your gateway config: /api/patients -> Patient Service
  private apiUrl = 'http://localhost:8090/patient'; 
  constructor(private http: HttpClient) {}

  // 1. Get All Patients
  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  // 2. Get Patient By ID
  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  // 3. Create Patient
  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  // 4. Update Patient
  update(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  // 5. Delete Patient
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 6. Get Medical Reports for a Patient
  getMedicalReports(patientId: number): Observable<MedicalReport[]> {
    return this.http.get<MedicalReport[]>(`${this.apiUrl}/${patientId}/medical-reports`);
  }

  // 7. Submit a new medical report
  submitMedicalReport(report: MedicalReport): Observable<MedicalReport> {
    return this.http.post<MedicalReport>(`${this.apiUrl}/medical-reports`, report);
  }

  // 8. Get patients managed by a specific responsable
  getPatientsByResponsable(responsableId: number): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/responsable/${responsableId}`);
  }
}