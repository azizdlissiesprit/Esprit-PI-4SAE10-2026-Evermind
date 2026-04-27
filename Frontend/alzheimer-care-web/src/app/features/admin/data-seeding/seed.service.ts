import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SeedStatus {
  seeded: boolean;
  lastSeededAt: string | null;
  [key: string]: any;
}

export interface SeedResult {
  status: string;
  message?: string;
  [key: string]: any;
}

export interface ServiceConfig {
  key: string;
  name: string;
  icon: string;
  color: string;
  prefix: string;
  description: string;
  metrics: string[];
}

@Injectable({ providedIn: 'root' })
export class SeedService {
  private api = environment.apiUrl;

  /** All seedable services configuration */
  readonly services: ServiceConfig[] = [
    {
      key: 'patient',
      name: 'Patient Service',
      icon: 'fa-solid fa-hospital-user',
      color: '#6366f1',
      prefix: '/patient/seed',
      description: 'Patients with medical histories, diagnoses, medications, and clinical reports',
      metrics: ['seededPatientCount', 'seededReportCount']
    },
    {
      key: 'sensor',
      name: 'Sensor Simulator',
      icon: 'fa-solid fa-microchip',
      color: '#06b6d4',
      prefix: '/simulation/seed',
      description: '6 months of IoT sensor readings: heart rate, GPS, accelerometer, motion, medication',
      metrics: ['seededSensorCount', 'seededReadingCount', 'seededEventCount']
    },
    {
      key: 'alert',
      name: 'Alert Service',
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#f59e0b',
      prefix: '/alert/seed',
      description: 'Clinical alerts with AI analysis, risk scoring, and severity classification',
      metrics: ['seededAlertCount']
    },
    {
      key: 'intervention',
      name: 'Intervention Service',
      icon: 'fa-solid fa-hand-holding-medical',
      color: '#10b981',
      prefix: '/intervention/seed',
      description: 'Caregiver interventions with full audit trail and outcome tracking',
      metrics: ['seededInterventionCount', 'seededLogCount']
    }
  ];

  constructor(private http: HttpClient) {}

  getStatus(prefix: string): Observable<SeedStatus> {
    return this.http.get<SeedStatus>(`${this.api}${prefix}/status`);
  }

  executeSeed(prefix: string): Observable<SeedResult> {
    return this.http.post<SeedResult>(`${this.api}${prefix}/execute`, {});
  }

  clearSeed(prefix: string): Observable<SeedResult> {
    return this.http.delete<SeedResult>(`${this.api}${prefix}/clear`);
  }

  getAllStatuses(): Observable<SeedStatus[]> {
    return forkJoin(this.services.map(s => this.getStatus(s.prefix)));
  }
}
