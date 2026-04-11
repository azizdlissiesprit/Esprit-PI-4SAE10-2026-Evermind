export interface Appointment {
  id: number;
  client: string;
  patientId?: number;
  time: string;
  endTime?: string;
  date: string;
  type: string;
  motif: string;
  location: 'Cabinet' | 'Vidéo';
  status: 'Confirmé' | 'En attente' | 'Annulé';
  notes?: string;
  color: string;
}

export interface WeekDay {
  day: string;
  date: number;
  fullDate: Date;
  appointments: Appointment[];
}

export interface AppointmentForm {
  patientId: number | null;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  motif: string;
  location: 'Cabinet' | 'Vidéo';
  status: 'Confirmé' | 'En attente' | 'Annulé';
  notes: string;
}

export interface Patient {
  id: number;
  name: string;
  firstName: string;
  email?: string;
  phone?: string;
}

export interface TodayAppointment {
  time: string;
  client: string;
  type: string;
  location: string;
  status: string;
}

export interface AppointmentRequest {
  id: number;
  client: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'accepted' | 'refused';
}
