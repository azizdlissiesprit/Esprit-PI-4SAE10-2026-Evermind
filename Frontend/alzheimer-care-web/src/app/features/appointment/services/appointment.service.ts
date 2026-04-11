import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';

export interface AppointmentStats {
  totalJour: number;
  totalSemaine: number;
  confirmes: number;
  enAttente: number;
  annules: number;
}

export interface CreateAppointmentRequest {
  patientNom: string;
  patientPrenom: string;
  dateHeure: string;
  dureeMinutes: number;
  type: string;
  notes?: string;
  statut: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly apiUrl = 'http://localhost:8080/api/rendezvous';

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(appointments => appointments.map(this.transformAppointment)),
      catchError(this.handleError)
    );
  }

  // Get appointments by week
  getAppointmentsByWeek(date: string): Observable<Appointment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/semaine/${date}`).pipe(
      map(appointments => appointments.map(this.transformAppointment)),
      catchError(this.handleError)
    );
  }

  // Get appointments by day
  getAppointmentsByDay(date: string): Observable<Appointment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/jour/${date}`).pipe(
      map(appointments => appointments.map(this.transformAppointment)),
      catchError(this.handleError)
    );
  }

  // Get appointment by ID
  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(this.transformAppointment),
      catchError(this.handleError)
    );
  }

  // Create new appointment
  createAppointment(appointment: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<any>(this.apiUrl, appointment).pipe(
      map(this.transformAppointment),
      tap(() => console.log('Appointment created successfully')),
      catchError(this.handleError)
    );
  }

  // Update appointment
  updateAppointment(id: number, appointment: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, appointment).pipe(
      map(this.transformAppointment),
      tap(() => console.log('Appointment updated successfully')),
      catchError(this.handleError)
    );
  }

  // Delete appointment
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Appointment deleted successfully')),
      catchError(this.handleError)
    );
  }

  // Get statistics
  getStatistics(): Observable<AppointmentStats> {
    return this.http.get<AppointmentStats>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  // Search appointments
  searchAppointments(term: string): Observable<Appointment[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(appointments => appointments.map(this.transformAppointment)),
      catchError(this.handleError)
    );
  }

  // Transform backend appointment to frontend model
  private transformAppointment(backendAppointment: any): Appointment {
    const date = new Date(backendAppointment.dateHeure);
    const startTime = date.toTimeString().slice(0, 5);
    const endTime = new Date(date.getTime() + backendAppointment.dureeMinutes * 60000).toTimeString().slice(0, 5);
    
    return {
      id: backendAppointment.id.toString(),
      title: `${backendAppointment.patientPrenom.charAt(0)}. ${backendAppointment.patientNom}`,
      subtitle: backendAppointment.type,
      startTime,
      endTime,
      date: date.toISOString().split('T')[0],
      color: this.getColorByType(backendAppointment.type),
      status: this.getStatusFromBackend(backendAppointment.statut),
      type: backendAppointment.type
    };
  }

  // Get color based on appointment type
  private getColorByType(type: string): string {
    const colorMap: { [key: string]: string } = {
      'Téléconsultation': 'bg-pink',
      'Téléconsult.': 'bg-pink',
      'Consultation': 'bg-blue',
      'Consultat.': 'bg-blue',
      'Bilan': 'bg-yellow',
      'Bilan mé.': 'bg-yellow',
      'Suivi': 'bg-green',
      'Suivi cog.': 'bg-green',
      'Suivi auto.': 'bg-green',
      'Évaluation': 'bg-purple',
      'Éval. cog.': 'bg-purple',
      '1ère visite': 'bg-red-light',
      'En attente': 'bg-gray'
    };
    return colorMap[type] || 'bg-blue';
  }

  // Convert backend status to frontend status
  private getStatusFromBackend(status: string): 'confirmed' | 'pending' | 'cancelled' {
    const statusMap: { [key: string]: 'confirmed' | 'pending' | 'cancelled' } = {
      'CONFIRME': 'confirmed',
      'EN_ATTENTE': 'pending',
      'ANNULE': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('AppointmentService Error:', error);
    return throwError(() => new Error(error.message || 'Server error occurred'));
  }

  // Mock data for development (when backend is not available)
  getMockAppointments(): Observable<Appointment[]> {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        title: 'Kamal H.',
        subtitle: 'Téléconsult.',
        startTime: '10:00',
        endTime: '10:45',
        date: '2026-03-31',
        color: 'bg-pink',
        status: 'confirmed',
        type: 'Téléconsult.'
      },
      {
        id: '2',
        title: 'Riadh S.',
        subtitle: 'Résultats',
        startTime: '13:00',
        endTime: '13:45',
        date: '2026-03-31',
        color: 'bg-blue',
        status: 'confirmed',
        type: 'Résultats'
      }
    ];
    return of(mockAppointments);
  }
}
