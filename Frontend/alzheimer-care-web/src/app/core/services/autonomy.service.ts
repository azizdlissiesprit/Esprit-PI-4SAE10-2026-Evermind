import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutonomyAssessment } from '../models/assessment.models';

@Injectable({
  providedIn: 'root'
})
export class AutonomyService {
  // Direct call to Microservice based on your properties
  private apiUrl = 'http://localhost:8090/api/autonomy-assessments';
  
  // OR if using Gateway:
  // private apiUrl = 'http://localhost:8080/autonomy/api/autonomy-assessments';

  constructor(private http: HttpClient) {}

  create(assessment: AutonomyAssessment): Observable<AutonomyAssessment> {
    return this.http.post<AutonomyAssessment>(this.apiUrl, assessment);
  }

  update(id: number, assessment: AutonomyAssessment): Observable<AutonomyAssessment> {
    return this.http.put<AutonomyAssessment>(`${this.apiUrl}/${id}`, assessment);
  }

  getById(id: number): Observable<AutonomyAssessment> {
    return this.http.get<AutonomyAssessment>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<AutonomyAssessment[]> {
    return this.http.get<AutonomyAssessment[]>(this.apiUrl);
  }

  getByPatientId(patientId: string): Observable<AutonomyAssessment[]> {
    return this.http.get<AutonomyAssessment[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
