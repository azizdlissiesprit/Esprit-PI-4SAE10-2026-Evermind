import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces matching backend entities ---
export interface SensorReading {
  id: number;
  sensorId: number;
  patientId: number;
  timestamp: string;
  heartRate?: number;
  accelerationX?: number;
  accelerationY?: number;
  accelerationZ?: number;
  latitude?: number;
  longitude?: number;
  motionDetected?: boolean;
  medicationBoxOpened?: boolean;
  isAnomalous: boolean;
}

export interface AbnormalEvent {
  id: number;
  patientId: number;
  sensorId: number;
  eventType: string; // 'FALL', 'CARDIAC_ANOMALY', etc.
  detectedAt: string;
  description: string;
  alertSent: boolean;
}

export interface SimulationStatus {
  running: boolean;
  cycleCount: number;
  totalReadings: number;
  totalEvents: number;
  accidentProbability: number;
}

@Injectable({
  providedIn: 'root'
})
export class SensorTrackingService {
  private readonly API_URL = `${environment.apiUrl}/simulation`;

  constructor(private http: HttpClient) {}

  // --- Status & Config ---
  getStatus(): Observable<SimulationStatus> {
    return this.http.get<SimulationStatus>(`${this.API_URL}/status`);
  }

  // --- Readings ---
  getReadingsForPatient(patientId: number): Observable<SensorReading[]> {
    return this.http.get<SensorReading[]>(`${this.API_URL}/readings/patient/${patientId}`);
  }

  getLatestReadings(patientId: number): Observable<SensorReading[]> {
    return this.http.get<SensorReading[]>(`${this.API_URL}/readings/patient/${patientId}/latest`);
  }
  
  // --- Events ---
  getEventsForPatient(patientId: number): Observable<AbnormalEvent[]> {
    return this.http.get<AbnormalEvent[]>(`${this.API_URL}/events/patient/${patientId}`);
  }

  // --- Triggers ---
  triggerRandomAccident(patientId: number): Observable<AbnormalEvent> {
    return this.http.post<AbnormalEvent>(`${this.API_URL}/trigger-accident/${patientId}`, {});
  }

  triggerSpecificAccident(patientId: number, eventType: string): Observable<AbnormalEvent> {
    return this.http.post<AbnormalEvent>(`${this.API_URL}/trigger-accident/${patientId}/${eventType}`, {});
  }
}
