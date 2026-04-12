import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Appointment {
  id?: string;
  day: string;
  hour: string;
  name: string;
  type: string;
  color: string;
  date?: string;
  duration?: number;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  patientId?: string;
  location?: 'cabinet' | 'video' | 'home';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [
    { id: '1', day: 'MAR', hour: '08h', name: 'Omar E.', type: 'Téléconsult', color: 'bg-pink-100 border-pink-300', status: 'confirmed' },
    { id: '2', day: 'MAR', hour: '09h', name: 'Leila D.', type: '1ère visite', color: 'bg-red-50 border-red-200', status: 'confirmed' },
    { id: '3', day: 'MAR', hour: '11h', name: 'Sami M.', type: 'Suivi cap.', color: 'bg-purple-100 border-purple-300', status: 'confirmed' },
    { id: '4', day: 'MAR', hour: '12h', name: 'Nadia B.', type: 'Suivi auto.', color: 'bg-green-100 border-green-300', status: 'confirmed' },
    { id: '5', day: 'MER', hour: '08h', name: 'Amira M.', type: 'Suivi cap.', color: 'bg-green-100 border-green-300', status: 'confirmed' },
    { id: '6', day: 'MER', hour: '10h', name: 'K. Haddad', type: 'Bilan mé.', color: 'bg-yellow-100 border-yellow-300', status: 'confirmed' },
    { id: '7', day: 'JEU', hour: '09h', name: 'Salma A.', type: 'Consultat.', color: 'bg-blue-100 border-blue-300', status: 'confirmed' },
    { id: '8', day: 'JEU', hour: '12h', name: 'Ali D.', type: 'Téléconsult', color: 'bg-pink-100 border-pink-300', status: 'confirmed' }
  ];

  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.appointments);
  appointments$ = this.appointmentsSubject.asObservable();

  constructor() { }

  // CREATE - Ajouter un nouveau rendez-vous
  addAppointment(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: this.generateId(),
      status: appointment.status || 'pending'
    };
    
    this.appointments.push(newAppointment);
    this.appointmentsSubject.next([...this.appointments]);
    
    return of(newAppointment).pipe(delay(500));
  }

  // READ - Obtenir tous les rendez-vous
  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  // READ - Obtenir un rendez-vous par ID
  getAppointmentById(id: string): Observable<Appointment | undefined> {
    return of(this.appointments.find(a => a.id === id)).pipe(delay(200));
  }

  // READ - Obtenir un rendez-vous par jour et heure
  getAppointmentByDayAndHour(day: string, hour: string): Appointment | undefined {
    return this.appointments.find(a => a.day === day && a.hour === hour);
  }

  // UPDATE - Mettre à jour un rendez-vous
  updateAppointment(id: string, updates: Partial<Appointment>): Observable<Appointment> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Rendez-vous non trouvé');
    }

    this.appointments[index] = { ...this.appointments[index], ...updates };
    this.appointmentsSubject.next([...this.appointments]);
    
    return of(this.appointments[index]).pipe(delay(500));
  }

  // DELETE - Supprimer un rendez-vous
  deleteAppointment(id: string): Observable<boolean> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.appointments.splice(index, 1);
    this.appointmentsSubject.next([...this.appointments]);
    
    return of(true).pipe(delay(500));
  }

  // Méthodes utilitaires
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Obtenir les types de rendez-vous disponibles
  getAppointmentTypes(): string[] {
    return [
      'Téléconsult',
      '1ère visite',
      'Suivi cap.',
      'Suivi auto.',
      'Consultat.',
      'Bilan mé.',
      'Urgence',
      'Contrôle'
    ];
  }

  // Obtenir les couleurs disponibles
  getColorOptions(): Array<{label: string, value: string}> {
    return [
      { label: 'Rose', value: 'bg-pink-100 border-pink-300' },
      { label: 'Rouge', value: 'bg-red-50 border-red-200' },
      { label: 'Violet', value: 'bg-purple-100 border-purple-300' },
      { label: 'Vert', value: 'bg-green-100 border-green-300' },
      { label: 'Jaune', value: 'bg-yellow-100 border-yellow-300' },
      { label: 'Bleu', value: 'bg-blue-100 border-blue-300' }
    ];
  }

  // Obtenir les statistiques
  getStats(): Observable<any> {
    return this.appointments$.pipe(
      map(appointments => {
        const total = appointments.length;
        const confirmed = appointments.filter(a => a.status === 'confirmed').length;
        const pending = appointments.filter(a => a.status === 'pending').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        
        return [
          { label: 'RDV cette semaine', value: total.toString(), trend: '12% vs sem. préc.', trendType: 'up' },
          { label: 'Taux de confirmation', value: total > 0 ? Math.round((confirmed / total) * 100) + '%' : '0%', trend: '5pts', trendType: 'up' },
          { label: 'Annulations', value: cancelled.toString(), trend: '2 vs sem. préc.', trendType: 'down' },
          { label: 'Durée moy. consultation', value: '23 min', trend: 'stable', trendType: 'neutral' }
        ];
      })
    );
  }
}
