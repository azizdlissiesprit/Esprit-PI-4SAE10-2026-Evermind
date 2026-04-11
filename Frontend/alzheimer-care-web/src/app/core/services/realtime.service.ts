import { Injectable } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { switchMap, takeWhile, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Assessment } from '../models/assessment.models';

export interface RealtimeUpdate {
  type: 'assessment_created' | 'assessment_updated' | 'assessment_deleted';
  data: Assessment;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private updates$ = new Subject<RealtimeUpdate>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private http: HttpClient) {}

  // Simulate WebSocket with polling (can be replaced with actual WebSocket)
  connectToPatientUpdates(patientId: string): Observable<RealtimeUpdate> {
    return interval(3000) // Poll every 3 seconds for real-time feel
      .pipe(
        startWith(0),
        switchMap(() => this.checkForUpdates(patientId)),
        takeWhile(() => this.reconnectAttempts < this.maxReconnectAttempts)
      );
  }

  private checkForUpdates(patientId: string): Observable<RealtimeUpdate> {
    return this.http.get<Assessment[]>(`http://localhost:8090/api/cognitive-assessments/patient/${patientId}`)
      .pipe(
        switchMap(assessments => {
          const latest = assessments.sort((a, b) => b.date.localeCompare(a.date))[0];
          if (latest) {
            const update: RealtimeUpdate = {
              type: 'assessment_updated',
              data: latest,
              timestamp: new Date()
            };
            return new Observable<RealtimeUpdate>(observer => {
              observer.next(update);
              observer.complete();
            });
          }
          return new Observable<RealtimeUpdate>(observer => {
            observer.complete();
          });
        })
      );
  }

  // Manual update trigger
  triggerUpdate(update: RealtimeUpdate) {
    this.updates$.next(update);
  }

  // Get updates stream
  getUpdates(): Observable<RealtimeUpdate> {
    return this.updates$.asObservable();
  }

  // Simulate real-time score change
  simulateScoreChange(patientId: string, mmseScore: number, mocaScore: number): void {
    const update: RealtimeUpdate = {
      type: 'assessment_updated',
      data: {
        id: 'simulated',
        patientId,
        date: new Date().toISOString().split('T')[0],
        type: 'follow-up',
        evaluator: 'System Simulation',
        mmseScore,
        moocaScore: mocaScore,
        trend: 'stable',
        scores: {
          memory: Math.floor(mmseScore / 3),
          orientation: Math.floor(mmseScore / 3),
          language: Math.floor(mmseScore / 3),
          executiveFunctions: Math.floor(mocaScore / 3)
        },
        observations: 'Simulated real-time update'
      } as Assessment,
      timestamp: new Date()
    };
    this.triggerUpdate(update);
  }

  // Cleanup
  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts;
  }
}
