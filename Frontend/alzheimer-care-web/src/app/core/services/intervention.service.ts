import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Intervention } from '../models/alert.model';
import { InterventionStatus, InterventionOutcome } from '../models/enums';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InterventionService {
  private baseUrl = `${environment.apiUrl}/intervention`;

  constructor(private http: HttpClient) {}

  // 1. Get All Interventions
  getAllInterventions(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.baseUrl}/retrieve-all-interventions`);
  }

  // 2. Start Intervention
  startIntervention(intervention: Partial<Intervention>): Observable<Intervention> {
    return this.http.post<Intervention>(`${this.baseUrl}/start-intervention`, intervention);
  }

  // 3. Update Status (Dynamic State)
  updateStatus(id: number, status: InterventionStatus): Observable<Intervention> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Intervention>(`${this.baseUrl}/update-status/${id}`, {}, { params });
  }


  // 4. Finish Intervention (With Notes & Outcome)
  finishIntervention(id: number, outcome: InterventionOutcome, notes: string): Observable<Intervention> {
    const params = new HttpParams()
      .set('outcome', outcome)
      .set('notes', notes);
    return this.http.put<Intervention>(`${this.baseUrl}/finish-intervention/${id}`, {}, { params });
  }

  // 4.5 Escalate Intervention
  escalateIntervention(id: number, toUserId: number, notes: string): Observable<Intervention> {
    const params = new HttpParams()
      .set('toUserId', toUserId.toString())
      .set('notes', notes);
    return this.http.post<Intervention>(`${this.baseUrl}/escalate-intervention/${id}`, {}, { params });
  }


  // 5. Get History
  getByAlert(alertId: number): Observable<Intervention> {
    return this.http.get<Intervention>(`${this.baseUrl}/by-alert/${alertId}`);
  }

  getHistoryByPatient(patientId: number): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.baseUrl}/history/patient/${patientId}`);
  }

  getEscalatedInterventions(userId: number): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.baseUrl}/escalated/${userId}`);
  }
}
