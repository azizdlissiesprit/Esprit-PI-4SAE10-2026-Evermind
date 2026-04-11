export interface Appointment {
  id: string;
  title: string;
  subtitle: string;
  startTime: string;
  endTime: string;
  date: string;
  color: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: string;
}

export interface DayAppointment {
  day: number;
  dayName: string;
  appointments: Appointment[];
}

export interface StatCard {
  title: string;
  value: string;
  trend: string;
  trendType: 'success' | 'danger' | 'neutral';
}

export interface AppointmentRequest {
  id: string;
  patientName: string;
  patientFullName: string;
  requestedDate: string;
  requestedTime: string;
  type: string;
  status: 'pending' | 'accepted' | 'refused';
}

export interface FillRateData {
  percentage: number;
  used: number;
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  free: number;
}

export interface TodayAppointment {
  time: string;
  name: string;
  type: string;
  status: 'confirmed' | 'pending';
}

export interface MiniCalendarDay {
  day: number;
  muted: boolean;
  active?: boolean;
}
