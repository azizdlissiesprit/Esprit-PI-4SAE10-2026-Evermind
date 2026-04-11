import { Injectable } from '@angular/core';
import { Appointment, Patient } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [];
  private patients: Patient[] = [
    { id: 1, name: 'Martin', firstName: 'Sophie', email: 'sophie.martin@email.com', phone: '0123456789' },
    { id: 2, name: 'Dupont', firstName: 'Jean', email: 'jean.dupont@email.com', phone: '0234567890' },
    { id: 3, name: 'Laurent', firstName: 'Marie', email: 'marie.laurent@email.com', phone: '0345678901' },
    { id: 4, name: 'Bernard', firstName: 'Pierre', email: 'pierre.bernard@email.com', phone: '0456789012' },
    { id: 5, name: 'Petit', firstName: 'Isabelle', email: 'isabelle.petit@email.com', phone: '0567890123' },
    { id: 6, name: 'Robert', firstName: 'Dubois', email: 'robert.dubois@email.com', phone: '0678901234' },
    { id: 7, name: 'Françoise', firstName: 'Moreau', email: 'francoise.moreau@email.com', phone: '0789012345' },
    { id: 8, name: 'Nicolas', firstName: 'Rousseau', email: 'nicolas.rousseau@email.com', phone: '0890123456' },
    { id: 9, name: 'Catherine', firstName: 'Lefevre', email: 'catherine.lefevre@email.com', phone: '0901234567' },
    { id: 10, name: 'Michel', firstName: 'Garcia', email: 'michel.garcia@email.com', phone: '0123456789' }
  ];

  constructor() {
    this.initializeAppointments();
  }

  private initializeAppointments(): void {
    const today = new Date();
    this.appointments = [
      {
        id: 1,
        client: 'Sophie Martin',
        patientId: 1,
        time: '09:00',
        endTime: '10:00',
        date: this.formatDate(today),
        type: 'Consultation initiale',
        motif: 'CONSULTATION',
        location: 'Cabinet',
        status: 'Confirmé',
        color: '#4F46E5'
      },
      {
        id: 2,
        client: 'Jean Dupont',
        patientId: 2,
        time: '11:00',
        endTime: '12:00',
        date: this.formatDate(today),
        type: 'Suivi mensuel',
        motif: 'SUIVI',
        location: 'Cabinet',
        status: 'Confirmé',
        color: '#10B981'
      }
    ];
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // CRUD Operations
  getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  getAppointmentById(id: number): Appointment | undefined {
    return this.appointments.find(apt => apt.id === id);
  }

  createAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
    const newAppointment: Appointment = {
      ...appointment,
      id: this.generateId()
    };
    this.appointments.push(newAppointment);
    console.log('Appointment created:', newAppointment);
    return newAppointment;
  }

  updateAppointment(id: number, updates: Partial<Appointment>): Appointment | null {
    const index = this.appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      this.appointments[index] = { ...this.appointments[index], ...updates };
      console.log('Appointment updated:', this.appointments[index]);
      return this.appointments[index];
    }
    return null;
  }

  deleteAppointment(id: number): boolean {
    const index = this.appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      const deleted = this.appointments.splice(index, 1)[0];
      console.log('Appointment deleted:', deleted);
      return true;
    }
    return false;
  }

  getAppointmentsByDate(date: string): Appointment[] {
    return this.appointments.filter(apt => apt.date === date);
  }

  // Patient Operations
  getPatients(): Patient[] {
    return [...this.patients];
  }

  searchPatients(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patients.filter(patient => 
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.email?.toLowerCase().includes(lowerQuery) ||
      patient.phone?.includes(query)
    );
  }

  getPatientById(id: number): Patient | undefined {
    return this.patients.find(patient => patient.id === id);
  }

  // Statistics
  getAppointmentStats() {
    const today = this.formatDate(new Date());
    const todayAppointments = this.getAppointmentsByDate(today);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);
    
    const weekAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= weekStart && aptDate <= weekEnd;
    });

    return {
      totalWeek: weekAppointments.length,
      confirmedWeek: weekAppointments.filter(apt => apt.status === 'Confirmé').length,
      cancelledWeek: weekAppointments.filter(apt => apt.status === 'Annulé').length,
      todayCount: todayAppointments.length,
      confirmationRate: weekAppointments.length > 0 
        ? Math.round((weekAppointments.filter(apt => apt.status === 'Confirmé').length / weekAppointments.length) * 100)
        : 0
    };
  }

  private generateId(): number {
    return Math.max(...this.appointments.map(apt => apt.id), 0) + 1;
  }
}
