import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FormationStat {
  titre: string;
  nombreInscriptions: number;
}

export interface DashboardStats {
  topFormations: FormationStat[];
  tauxReussiteGlobal: number;
  utilisateursActifs30Jours: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  // Uses proxy to ApiGateway to hit Formation service
  private apiUrl = '/api/formation/admin/dashboard/stats';

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }
}
