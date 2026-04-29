import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../models/alert.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminAlertService {
  // Point to Gateway
  private baseUrl = `${environment.apiUrl}/alert`; 

  constructor(private http: HttpClient) {}

  getAllAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/retrieve-all-alerts`);
  }

  getAlertById(id: number): Observable<Alert> {
    return this.http.get<Alert>(`${this.baseUrl}/retrieve-alert/${id}`);
  }

  addAlert(alert: any): Observable<Alert> {
    return this.http.post<Alert>(`${this.baseUrl}/add-alert`, alert);
  }

  updateAlert(id: number, alert: any): Observable<Alert> {
    return this.http.put<Alert>(`${this.baseUrl}/update-alert/${id}`, alert);
  }

  deleteAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/remove-alert/${id}`);
  }
}
