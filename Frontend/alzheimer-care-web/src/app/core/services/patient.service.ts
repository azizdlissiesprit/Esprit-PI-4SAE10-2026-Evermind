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
}