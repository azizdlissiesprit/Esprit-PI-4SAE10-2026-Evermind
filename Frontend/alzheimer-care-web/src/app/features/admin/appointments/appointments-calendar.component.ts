import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RendezVousService, RendezVousDTO } from './rendezvous.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointments-calendar.component.html',
  styleUrls: ['./appointments-calendar.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppointmentsCalendarComponent implements OnInit {
  allRendezVous: RendezVousDTO[] = [];
  loading = false;
  backendAvailable = true;
  weekDays: Date[] = [];
  timeSlots = [8, 9, 10, 11, 12, 13, 14, 15];
  miniCalendarDays: { date: Date; inMonth: boolean }[] = [];
  currentWeekStart = new Date(2026, 2, 31);

  readonly DAY_NAMES = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];
  readonly MINI_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  readonly MONTHS_SHORT = ['janv.', 'fevr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.'];
  readonly MAX_WEEK_SLOTS = 56;

  constructor(
    private rendezVousService: RendezVousService,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildWeekDays();
    this.buildMiniCalendar();
    this.loadData();
  }

  private setWeekFromDate(date: Date): void {
    const base = new Date(date);
    const dayOfWeek = base.getDay() === 0 ? 6 : base.getDay() - 1;
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() - dayOfWeek);
    this.currentWeekStart = base;
    this.buildWeekDays();
    this.buildMiniCalendar();
  }

  buildWeekDays(): void {
    this.weekDays = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(this.currentWeekStart);
      day.setDate(this.currentWeekStart.getDate() + i);
      this.weekDays.push(day);
    }
  }

  buildMiniCalendar(): void {
    const ref = new Date(this.currentWeekStart);
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const totalDays = lastOfMonth.getDate();

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(year, month, -firstWeekday + i + 1);
      days.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      const cur = new Date(year, month, d);
      days.push({ date: cur, inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      days.push({ date: next, inMonth: false });
    }
    this.miniCalendarDays = days.slice(0, 42);
  }

  loadData(): void {
    this.loading = true;
    this.rendezVousService.getAll().subscribe({
      next: (data) => {
        this.backendAvailable = true;
        this.allRendezVous = [...data].sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
        this.focusWeekWithData();
        this.loading = false;
      },
      error: () => {
        this.backendAvailable = false;
        this.allRendezVous = this.getMockRdv();
        this.setWeekFromDate(new Date(2026, 2, 31));
        this.loading = false;
      }
    });
  }

  private focusWeekWithData(): void {
    if (this.weekAppointments.length > 0 || this.allRendezVous.length === 0) {
      return;
    }

    const first = new Date(this.allRendezVous[0].dateHeure);
    this.setWeekFromDate(first);
  }

  get weekAppointments(): RendezVousDTO[] {
    const start = new Date(this.currentWeekStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 4);
    end.setHours(23, 59, 59, 999);

    return this.allRendezVous.filter((rdv) => {
      const rdvDate = new Date(rdv.dateHeure);
      return rdvDate >= start && rdvDate <= end;
    });
  }

  get confirmedCount(): number {
    return this.weekAppointments.filter((rdv) => rdv.statut === 'CONFIRME').length;
  }

  get pendingCount(): number {
    return this.weekAppointments.filter((rdv) => rdv.statut === 'EN_ATTENTE').length;
  }

  get cancelledCount(): number {
    return this.weekAppointments.filter((rdv) => rdv.statut === 'ANNULE').length;
  }

  get freeCount(): number {
    return Math.max(this.MAX_WEEK_SLOTS - this.weekAppointments.length, 0);
  }

  get confirmationRate(): number {
    if (!this.weekAppointments.length) {
      return 0;
    }
    return Math.round((this.confirmedCount / this.weekAppointments.length) * 100);
  }

  get averageDuration(): number {
    if (!this.weekAppointments.length) {
      return 0;
    }
    const total = this.weekAppointments.reduce((sum, rdv) => sum + rdv.dureeMinutes, 0);
    return Math.round(total / this.weekAppointments.length);
  }

  get pendingRequests(): RendezVousDTO[] {
    return this.allRendezVous.filter((rdv) => rdv.statut === 'EN_ATTENTE').slice(0, 2);
  }

  get todayEvents(): RendezVousDTO[] {
    const referenceDay = this.getReferenceDay();
    return this.allRendezVous
      .filter((rdv) => this.isSameDay(new Date(rdv.dateHeure), referenceDay))
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
  }

  previousWeek() {
    const previous = new Date(this.currentWeekStart);
    previous.setDate(previous.getDate() - 7);
    this.setWeekFromDate(previous);
  }

  nextWeek() {
    const next = new Date(this.currentWeekStart);
    next.setDate(next.getDate() + 7);
    this.setWeekFromDate(next);
  }

  goToToday() {
    this.setWeekFromDate(new Date());
  }

  editEvent(eventId: number) {
    this.router.navigate(['/admin/appointments/edit', eventId]);
  }

  deleteEvent(eventId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
      this.rendezVousService.delete(eventId).subscribe({
        next: () => {
          this.allRendezVous = this.allRendezVous.filter((item) => item.id !== eventId);
        },
        error: () => {
          if (!this.backendAvailable) {
            this.allRendezVous = this.allRendezVous.filter((item) => item.id !== eventId);
          }
        }
      });
    }
  }

  createNewRdv() {
    this.router.navigate(['/admin/appointments/new']);
  }

  showAppointmentsList() {
    this.router.navigate(['/admin/appointments/list']);
  }

  
  weekRangeLabel(): string {
    if (!this.weekDays.length) {
      return '';
    }

    const start = this.weekDays[0];
    const end = this.weekDays[this.weekDays.length - 1];
    return `${start.getDate()} ${this.MONTHS_SHORT[start.getMonth()]} - ${end.getDate()} ${this.MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }

  getMiniCalendarTitle(): string {
    return this.currentWeekStart.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  }

  getRdvForSlot(day: Date, hour: number): RendezVousDTO[] {
    return this.weekAppointments
      .filter((rdv) => {
        const date = new Date(rdv.dateHeure);
        return this.isSameDay(date, day) && date.getHours() === hour;
      })
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
  }

  getTypeLabel(type: RendezVousDTO['type']): string {
    const labels: Record<RendezVousDTO['type'], string> = {
      CONSULTATION: 'Consultation',
      TELECONSULTATION: 'Téléconsult.',
      SUIVI: 'Suivi',
      BILAN: 'Bilan mé.',
      EVALUATION: 'Éval. cog.',
      RESULTATS: 'Résultats',
      PREMIERE_VISITE: '1ère visite'
    };
    return labels[type];
  }

  acceptRequest(rdvId: number) {
    this.rendezVousService.getById(rdvId).subscribe({
      next: (rdv) => {
        const updatedRdv = { ...rdv, statut: 'CONFIRME' as const };
        this.rendezVousService.update(rdvId, updatedRdv).subscribe({
          next: () => {
            this.allRendezVous = this.allRendezVous.map((item) =>
              item.id === rdvId ? { ...item, statut: 'CONFIRME' } : item
            );
          },
          error: () => {
            this.allRendezVous = this.allRendezVous.map((item) =>
              item.id === rdvId ? { ...item, statut: 'CONFIRME' } : item
            );
          }
        });
      },
      error: () => {
        this.allRendezVous = this.allRendezVous.map((item) =>
          item.id === rdvId ? { ...item, statut: 'CONFIRME' } : item
        );
      }
    });
  }

  declineRequest(rdvId: number) {
    this.rendezVousService.delete(rdvId).subscribe({
      next: () => {
        this.allRendezVous = this.allRendezVous.filter((item) => item.id !== rdvId);
      },
      error: () => {
        this.allRendezVous = this.allRendezVous.filter((item) => item.id !== rdvId);
      }
    });
  }

  getStatutLabel(statut: RendezVousDTO['statut']): string {
    switch (statut) {
      case 'CONFIRME': return 'Confirmé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      case 'LIBRE': return 'Libre';
      default: return statut;
    }
  }

  isCurrentDay(date: Date): boolean {
    return this.isSameDay(date, this.getReferenceDay());
  }

  isMiniToday(date: Date): boolean {
    return this.isSameDay(date, this.getReferenceDay());
  }

  fillPercent(): number {
    return Math.min(100, Math.round((this.weekAppointments.length / this.MAX_WEEK_SLOTS) * 100));
  }

  private getReferenceDay(): Date {
    const today = new Date();
    const todayHasAppointments = this.allRendezVous.some((rdv) =>
      this.isSameDay(new Date(rdv.dateHeure), today)
    );

    if (todayHasAppointments) {
      return today;
    }

    const firstWeekAppointment = this.weekAppointments[0];
    if (firstWeekAppointment) {
      return new Date(firstWeekAppointment.dateHeure);
    }

    return this.weekDays[0] ?? today;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate()
      && date1.getMonth() === date2.getMonth()
      && date1.getFullYear() === date2.getFullYear();
  }

  private getMockRdv(): RendezVousDTO[] {
    return [
      { id: 1, patientNom: 'Omar', patientPrenom: 'F.', type: 'TELECONSULTATION', statut: 'CONFIRME', dateHeure: '2026-04-01T08:00:00', dureeMinutes: 30, notes: 'Patient no info modifiable' },
      { id: 2, patientNom: 'Leila', patientPrenom: 'B.', type: 'PREMIERE_VISITE', statut: 'CONFIRME', dateHeure: '2026-04-01T09:00:00', dureeMinutes: 45, notes: 'Patient no info modifiable' },
      { id: 3, patientNom: 'Sara', patientPrenom: 'M.', type: 'EVALUATION', statut: 'CONFIRME', dateHeure: '2026-04-01T11:00:00', dureeMinutes: 30, notes: 'Patient no info modifiable' },
      { id: 4, patientNom: 'Nadia', patientPrenom: 'B.', type: 'SUIVI', statut: 'CONFIRME', dateHeure: '2026-04-01T12:00:00', dureeMinutes: 20, notes: 'Patient no info modifiable' },
      { id: 5, patientNom: 'Amira', patientPrenom: 'M.', type: 'CONSULTATION', statut: 'CONFIRME', dateHeure: '2026-04-02T08:00:00', dureeMinutes: 30, notes: 'Patient no info modifiable' },
      { id: 6, patientNom: 'K. ', patientPrenom: 'Haddad', type: 'BILAN', statut: 'CONFIRME', dateHeure: '2026-04-02T10:00:00', dureeMinutes: 30, notes: 'Bilan mé.' },
      { id: 7, patientNom: 'Leila', patientPrenom: 'B.', type: 'CONSULTATION', statut: 'EN_ATTENTE', dateHeure: '2026-04-02T11:00:00', dureeMinutes: 30, notes: 'Champ no info modif.' },
      { id: 8, patientNom: 'Ali', patientPrenom: 'D.', type: 'TELECONSULTATION', statut: 'CONFIRME', dateHeure: '2026-04-03T12:00:00', dureeMinutes: 20, notes: 'Patient no info modifiable' },
      { id: 9, patientNom: 'Kamel', patientPrenom: 'H.', type: 'TELECONSULTATION', statut: 'CONFIRME', dateHeure: '2026-03-31T10:00:00', dureeMinutes: 20, notes: 'Patient no info modifiable' },
      { id: 10, patientNom: 'Riadh', patientPrenom: 'S.', type: 'CONSULTATION', statut: 'CONFIRME', dateHeure: '2026-03-31T13:00:00', dureeMinutes: 25, notes: 'Patient no info modifiable' },
      { id: 11, patientNom: 'Inès', patientPrenom: 'Ben Ali', type: 'PREMIERE_VISITE', statut: 'EN_ATTENTE', dateHeure: '2026-04-04T10:30:00', dureeMinutes: 30, notes: 'Première consultation' },
      { id: 12, patientNom: 'Youssef', patientPrenom: 'Trabelsi', type: 'SUIVI', statut: 'EN_ATTENTE', dateHeure: '2026-04-04T14:00:00', dureeMinutes: 30, notes: 'Suivi mémoire' }
    ];
  }
}
