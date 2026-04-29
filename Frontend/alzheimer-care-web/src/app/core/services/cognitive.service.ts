import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CognitiveAssessment } from '../models/assessment.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitiveService {
  // Assuming Port 8098 (Check your console when you run the Spring Boot app)
  private apiUrl = `${environment.apiUrl}/api/cognitive-assessments`;

  constructor(private http: HttpClient) {}

  create(assessment: CognitiveAssessment): Observable<CognitiveAssessment> {
    return this.http.post<CognitiveAssessment>(this.apiUrl, assessment);
  }

  update(id: number, assessment: CognitiveAssessment): Observable<CognitiveAssessment> {
    return this.http.put<CognitiveAssessment>(`${this.apiUrl}/${id}`, assessment);
  }

  getById(id: number): Observable<CognitiveAssessment> {
    return this.http.get<CognitiveAssessment>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<CognitiveAssessment[]> {
    return this.http.get<CognitiveAssessment[]>(this.apiUrl);
  }

  getByPatientId(patientId: string): Observable<CognitiveAssessment[]> {
    return this.http.get<CognitiveAssessment[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
