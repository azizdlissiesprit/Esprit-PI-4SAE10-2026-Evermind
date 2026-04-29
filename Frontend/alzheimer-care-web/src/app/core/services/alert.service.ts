import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../models/alert.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // Your Spring Boot Port is 8081
  private baseUrl = `${environment.apiUrl}/alert`; 

  constructor(private http: HttpClient) { }

  // 1. Get All Alerts
  getAllAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/retrieve-all-alerts`);
  }
  // Add this method
predictStability(patientId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/predict/patient/${patientId}`);
}

  // 2. Take Charge (Change status to EN_COURS)
  takeCharge(id: number): Observable<Alert> {
    return this.http.patch<Alert>(`${this.baseUrl}/take-charge/${id}`, {});
  }

  // 3. Resolve Alert
  resolveAlert(id: number): Observable<Alert> {
    return this.http.patch<Alert>(`${this.baseUrl}/resolve/${id}`, {});
  }

  // 4. Ignore Alert
  ignoreAlert(id: number): Observable<Alert> {
    return this.http.patch<Alert>(`${this.baseUrl}/ignore/${id}`, {});
  }
  getAlertById(id: number): Observable<Alert> {
    return this.http.get<Alert>(`${this.baseUrl}/retrieve-alert/${id}`);
  }

  getAlertsByIds(ids: number[]): Observable<Alert[]> {
    return this.http.post<Alert[]>(`${this.baseUrl}/retrieve-alerts-by-ids`, ids);
  }
}
