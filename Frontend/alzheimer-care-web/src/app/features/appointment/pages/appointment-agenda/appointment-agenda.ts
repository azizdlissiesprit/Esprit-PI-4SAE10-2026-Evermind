import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { RendezVousDTO, RendezVousService } from '../../../admin/appointments/rendezvous.service';

export type TypeConsultation =
  | 'CONSULTATION' | 'TELECONSULTATION' | 'SUIVI'
  | 'BILAN' | 'EVALUATION' | 'RESULTATS' | 'PREMIERE_VISITE';

export type StatutRDV = 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'LIBRE';

export interface RendezVous {
  id: number;
  patientNom: string;
  patientPrenom: string;
  type: TypeConsultation;
  statut: StatutRDV;
  dateHeure: string;
  dureeMinutes: number;
  notes?: string;
}

export interface DemandeRDV {
  id: number;
  patientNom: string;
  patientPrenom: string;
  statut: 'EN_ATTENTE';
  date: string;
  heure: string;
  motif: string;
}

@Component({
  selector: 'app-appointment-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointment-agenda.html',
  styleUrls: ['./appointment-agenda.scss']
})
export class AppointmentAgendaComponent implements OnInit {
  weekDays: Date[] = [];
  timeSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  rdvList: RendezVous[] = [];
  demandes: DemandeRDV[] = [];
  calendarDays: { date: Date; inMonth: boolean }[] = [];
  currentWeekStart = new Date(2026, 2, 31);
  showModal = false;
  isEditing = false;
  selectedRdv: RendezVous | null = null;
  rdvForm!: FormGroup;
  loading = false;
  submitting = false;
  backendAvailable = true;
  infoMessage = '';
  errorMessage = '';

  readonly DAY_NAMES   = ['LUN','MAR','MER','JEU','VEN'];
  readonly MINI_DAYS   = ['L','M','M','J','V','S','D'];
  readonly MONTHS_SHORT = ['jan','fév','mars','avr','mai','juin',
                            'juil','août','sep','oct','nov','déc'];

  readonly TYPE_LABELS: Record<TypeConsultation, string> = {
    CONSULTATION:    'Consultation',
    TELECONSULTATION:'Téléconsult.',
    SUIVI:           'Suivi',
    BILAN:           'Bilan mé.',
    EVALUATION:      'Éval. cog.',
    RESULTATS:       'Résultats',
    PREMIERE_VISITE: '1ère visite'
  };

  readonly TYPE_OPTIONS: TypeConsultation[] = [
    'CONSULTATION','TELECONSULTATION','SUIVI',
    'BILAN','EVALUATION','RESULTATS','PREMIERE_VISITE'
  ];

  readonly STATUT_OPTIONS: StatutRDV[] = ['CONFIRME','EN_ATTENTE','ANNULE'];
  readonly CIRCUMFERENCE = 2 * Math.PI * 36;
  readonly MAX_WEEK_SLOTS = 56;

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService
  ) {}

  ngOnInit(): void {
    this.buildWeekDays();
    this.buildCalendar();
    this.initForm();
    this.loadRdv();
  }

  initForm(rdv?: RendezVous): void {
    this.rdvForm = this.fb.group({
      patientNom:    [rdv?.patientNom    ?? '', Validators.required],
      patientPrenom: [rdv?.patientPrenom ?? '', Validators.required],
      type:          [rdv?.type          ?? 'CONSULTATION', Validators.required],
      statut:        [rdv?.statut        ?? 'CONFIRME',     Validators.required],
      dateHeure:     [rdv?.dateHeure ? rdv.dateHeure.substring(0,16) : '', Validators.required],
      dureeMinutes:  [rdv?.dureeMinutes  ?? 30, [Validators.required, Validators.min(5)]],
      notes:         [rdv?.notes         ?? '']
    });
  }

  buildWeekDays(): void {
    this.weekDays = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(this.currentWeekStart);
      d.setDate(this.currentWeekStart.getDate() + i);
      return d;
    });
  }

  prevWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.buildWeekDays();
    this.buildCalendar();
  }

  nextWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart);
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.buildWeekDays();
    this.buildCalendar();
  }

  goToday(): void {
    const t   = new Date();
    const dow = t.getDay() === 0 ? 6 : t.getDay() - 1;
    this.currentWeekStart = new Date(t);
    this.currentWeekStart.setDate(t.getDate() - dow);
    this.buildWeekDays();
    this.buildCalendar();
  }

  weekRangeLabel(): string {
    if (!this.weekDays.length) return '';
    const s = this.weekDays[0];
    const e = this.weekDays[4];
    return `${s.getDate()} ${this.MONTHS_SHORT[s.getMonth()]}. - ${e.getDate()} ${this.MONTHS_SHORT[e.getMonth()]}. ${e.getFullYear()}`;
  }

  buildCalendar(): void {
    const year = this.currentWeekStart.getFullYear();
    const month = this.currentWeekStart.getMonth();
    const first   = new Date(year, month, 1);
    const last    = new Date(year, month + 1, 0);
    const days: { date: Date; inMonth: boolean }[] = [];
    const startDow = first.getDay() === 0 ? 7 : first.getDay();
    for (let i = 1; i < startDow; i++)
      days.push({ date: new Date(year, month, 1-(startDow-i)), inMonth: false });
    for (let d = 1; d <= last.getDate(); d++)
      days.push({ date: new Date(year, month, d), inMonth: true });
    while (days.length < 35)
      days.push({ date: new Date(year, month+1, days.length - last.getDate()), inMonth: false });
    this.calendarDays = days;
  }

  getRdvForSlot(day: Date, hour: number): RendezVous[] {
    return this.rdvList.filter(r => {
      const d = new Date(r.dateHeure);
      return d.getFullYear() === day.getFullYear()
          && d.getMonth()    === day.getMonth()
          && d.getDate()     === day.getDate()
          && d.getHours()    === hour;
    });
  }

  getTodayRdv(): RendezVous[] {
    const ref = this.getReferenceDay();
    return this.rdvList
      .filter(r => {
        const d = new Date(r.dateHeure);
        return this.isSameDay(d, ref);
      })
      .sort((a,b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
  }

  isCurrentDay(date: Date): boolean {
    return this.isSameDay(date, this.getReferenceDay());
  }

  isMiniToday(date: Date): boolean {
    return this.isSameDay(date, this.getReferenceDay());
  }

  formatHH(dt: string): string {
    return new Date(dt).getHours().toString().padStart(2,'0');
  }

  formatMM(dt: string): string {
    return new Date(dt).getMinutes().toString().padStart(2,'0');
  }

  getTypeLabel(t: TypeConsultation): string { return this.TYPE_LABELS[t] ?? t; }

  getStatutLabel(s: StatutRDV): string {
    const m: Record<StatutRDV, string> = {
      CONFIRME:'Confirmé', EN_ATTENTE:'En attente', ANNULE:'Annulé', LIBRE:'Libre'
    };
    return m[s] ?? s;
  }

  getMiniCalendarTitle(): string {
    return this.currentWeekStart.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  }

  get weekAppointments(): RendezVous[] {
    const start = new Date(this.currentWeekStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 4);
    end.setHours(23, 59, 59, 999);

    return this.rdvList.filter((rdv) => {
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

  fillPercent(): number {
    return Math.min(
      100,
      Math.round((this.weekAppointments.length / this.MAX_WEEK_SLOTS) * 100)
    );
  }

  dashOffset(): number {
    return this.CIRCUMFERENCE * (1 - this.fillPercent() / 100);
  }

  openNew(): void {
    this.isEditing = false;
    this.selectedRdv = null;
    this.errorMessage = '';
    this.initForm();
    this.showModal = true;
  }

  openEdit(rdv: RendezVous, e: Event): void {
    e.stopPropagation();
    this.isEditing   = true;
    this.selectedRdv = rdv;
    this.errorMessage = '';
    this.initForm(rdv);
    this.showModal = true;
  }

  saveRDV(): void {
    if (this.rdvForm.invalid || this.submitting) {
      this.rdvForm.markAllAsTouched();
      return;
    }

    const payload = this.toDto(this.rdvForm.getRawValue());
    this.errorMessage = '';
    this.submitting = true;

    if (this.backendAvailable) {
      const request$ =
        this.isEditing && this.selectedRdv?.id
          ? this.rendezVousService.update(this.selectedRdv.id, payload)
          : this.rendezVousService.create(payload);

      request$
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.infoMessage = this.isEditing
              ? 'Rendez-vous modifie avec succes.'
              : 'Rendez-vous cree avec succes.';
            this.closeModal();
            this.loadRdv();
          },
          error: () => {
            this.errorMessage = this.isEditing
              ? 'La modification a echoue.'
              : 'La creation a echoue.';
          }
        });
      return;
    }

    this.saveLocally(payload);
    this.submitting = false;
    this.infoMessage = this.isEditing
      ? 'Rendez-vous modifie en mode local.'
      : 'Rendez-vous cree en mode local.';
    this.closeModal();
  }

  deleteRDV(rdv: RendezVous, e: Event): void {
    e.stopPropagation();
    if (!confirm(`Supprimer le RDV de ${rdv.patientNom} ${rdv.patientPrenom} ?`)) {
      return;
    }

    this.errorMessage = '';

    if (this.backendAvailable) {
      this.submitting = true;
      this.rendezVousService
        .delete(rdv.id)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.infoMessage = 'Rendez-vous supprime avec succes.';
            this.rdvList = this.rdvList.filter((item) => item.id !== rdv.id);
            this.syncDemandesFromAppointments();
            if (this.selectedRdv?.id === rdv.id) {
              this.closeModal();
            }
          },
          error: () => {
            this.errorMessage = 'La suppression a echoue.';
          }
        });
      return;
    }

    this.rdvList = this.rdvList.filter((item) => item.id !== rdv.id);
    this.syncDemandesFromAppointments();
    if (this.selectedRdv?.id === rdv.id) {
      this.closeModal();
    }
    this.infoMessage = 'Rendez-vous supprime en mode local.';
  }

  accepterDemande(d: DemandeRDV): void {
    const rdv = this.rdvList.find((item) => item.id === d.id);
    if (!rdv) {
      this.demandes = this.demandes.filter((item) => item.id !== d.id);
      return;
    }

    const updated: RendezVous = { ...rdv, statut: 'CONFIRME' };
    this.persistStatusChange(updated, 'Demande acceptee.');
  }

  refuserDemande(d: DemandeRDV): void {
    const rdv = this.rdvList.find((item) => item.id === d.id);
    if (!rdv) {
      this.demandes = this.demandes.filter((item) => item.id !== d.id);
      return;
    }

    const updated: RendezVous = { ...rdv, statut: 'ANNULE' };
    this.persistStatusChange(updated, 'Demande refusee.');
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRdv = null;
    this.isEditing = false;
  }

  loadRdv(): void {
    this.loading = true;
    this.errorMessage = '';

    this.rendezVousService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rdv) => {
          this.backendAvailable = true;
          this.rdvList = rdv
            .map((item) => this.normalizeRdv(item))
            .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
          this.syncDemandesFromAppointments();
          this.infoMessage = '';
        },
        error: () => {
          this.backendAvailable = false;
          this.rdvList = this.getMockRDV();
          this.syncDemandesFromAppointments();
          this.infoMessage = "API indisponible. Le CRUD fonctionne en mode local.";
        }
      });
  }

  private saveLocally(payload: RendezVousDTO): void {
    if (this.isEditing && this.selectedRdv) {
      this.rdvList = this.rdvList.map((rdv) =>
        rdv.id === this.selectedRdv!.id
          ? this.normalizeRdv({ ...payload, id: this.selectedRdv!.id })
          : rdv
      );
    } else {
      const nextId = this.rdvList.length
        ? Math.max(...this.rdvList.map((rdv) => rdv.id)) + 1
        : 1;
      this.rdvList = [...this.rdvList, this.normalizeRdv({ ...payload, id: nextId })];
    }

    this.rdvList.sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
    this.syncDemandesFromAppointments();
  }

  private persistStatusChange(rdv: RendezVous, message: string): void {
    const payload = this.toDto(rdv);

    if (this.backendAvailable) {
      this.rendezVousService.update(rdv.id, payload).subscribe({
        next: () => {
          this.rdvList = this.rdvList.map((item) => (item.id === rdv.id ? rdv : item));
          this.syncDemandesFromAppointments();
          this.infoMessage = message;
        },
        error: () => {
          this.errorMessage = 'La mise a jour du statut a echoue.';
        }
      });
      return;
    }

    this.rdvList = this.rdvList.map((item) => (item.id === rdv.id ? rdv : item));
    this.syncDemandesFromAppointments();
    this.infoMessage = `${message} Mode local actif.`;
  }

  private syncDemandesFromAppointments(): void {
    this.demandes = this.rdvList
      .filter((rdv) => rdv.statut === 'EN_ATTENTE')
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime())
      .slice(0, 2)
      .map((rdv) => ({
        id: rdv.id,
        patientNom: rdv.patientNom,
        patientPrenom: rdv.patientPrenom,
        statut: 'EN_ATTENTE',
        date: this.formatDemandeDate(rdv.dateHeure),
        heure: `${this.formatHH(rdv.dateHeure)}:${this.formatMM(rdv.dateHeure)}`,
        motif: this.getTypeLabel(rdv.type)
      }));
  }

  private normalizeRdv(rdv: RendezVousDTO): RendezVous {
    return {
      id: Number(rdv.id ?? 0),
      patientNom: rdv.patientNom,
      patientPrenom: rdv.patientPrenom,
      type: rdv.type,
      statut: rdv.statut,
      dateHeure: rdv.dateHeure,
      dureeMinutes: rdv.dureeMinutes,
      notes: rdv.notes ?? ''
    };
  }

  private toDto(source: Partial<RendezVous>): RendezVousDTO {
    return {
      patientNom: source.patientNom ?? '',
      patientPrenom: source.patientPrenom ?? '',
      type: (source.type ?? 'CONSULTATION') as TypeConsultation,
      statut: (source.statut ?? 'CONFIRME') as StatutRDV,
      dateHeure: this.normalizeDateHeure(source.dateHeure ?? ''),
      dureeMinutes: Number(source.dureeMinutes ?? 30),
      notes: source.notes ?? ''
    };
  }

  private normalizeDateHeure(value: string): string {
    if (!value) {
      return value;
    }

    return value.length === 16 ? `${value}:00` : value;
  }

  private formatDemandeDate(dateHeure: string): string {
    const date = new Date(dateHeure);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  }

  private getReferenceDay(): Date {
    const today = new Date();
    const todayHasAppointments = this.rdvList.some((rdv) =>
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

  getMockRDV(): RendezVous[] {
    return [
      { id:1,  patientNom:'Omar',    patientPrenom:'F.',      type:'TELECONSULTATION', statut:'CONFIRME',   dateHeure:'2026-04-01T08:00', dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:2,  patientNom:'Leila',   patientPrenom:'B.',      type:'PREMIERE_VISITE',  statut:'CONFIRME',   dateHeure:'2026-04-01T09:00', dureeMinutes:45, notes:'Patient no data modifiable' },
      { id:3,  patientNom:'Sara',    patientPrenom:'M.',      type:'EVALUATION',       statut:'CONFIRME',   dateHeure:'2026-04-01T11:00', dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:4,  patientNom:'Nadia',   patientPrenom:'B.',      type:'SUIVI',            statut:'CONFIRME',   dateHeure:'2026-04-01T12:00', dureeMinutes:20, notes:'Patient no data modifiable' },
      { id:5,  patientNom:'Hedi',    patientPrenom:'T.',      type:'CONSULTATION',     statut:'CONFIRME',   dateHeure:'2026-04-01T14:00', dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:6,  patientNom:'Amira',   patientPrenom:'M.',      type:'CONSULTATION',     statut:'CONFIRME',   dateHeure:'2026-04-02T08:00', dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:7,  patientNom:'K.',      patientPrenom:'Haddad',  type:'BILAN',            statut:'CONFIRME',   dateHeure:'2026-04-02T10:00', dureeMinutes:30, notes:'Bilan mé.' },
      { id:8,  patientNom:'Leila',   patientPrenom:'B.',      type:'CONSULTATION',     statut:'EN_ATTENTE', dateHeure:'2026-04-02T11:00', dureeMinutes:30, notes:'En attente' },
      { id:9,  patientNom:'Ali',     patientPrenom:'R.',      type:'TELECONSULTATION', statut:'CONFIRME',   dateHeure:'2026-04-02T12:00', dureeMinutes:20, notes:'Patient no data modifiable' },
      { id:10, patientNom:'Mohamed', patientPrenom:'.',       type:'TELECONSULTATION', statut:'EN_ATTENTE', dateHeure:'2026-04-02T13:00', dureeMinutes:20, notes:'Champ non mo data' },
      { id:11, patientNom:'Fatma',   patientPrenom:'A.',      type:'CONSULTATION',     statut:'CONFIRME',   dateHeure:'2026-04-03T09:00', dureeMinutes:30, notes:'' },
      { id:12, patientNom:'Kamal',   patientPrenom:'H.',      type:'TELECONSULTATION', statut:'CONFIRME',   dateHeure:'2026-03-31T10:00', dureeMinutes:20, notes:'Patient no data modifiable' },
      { id:13, patientNom:'Riadh',   patientPrenom:'S.',      type:'RESULTATS',        statut:'CONFIRME',   dateHeure:'2026-03-31T13:00', dureeMinutes:25, notes:'Résultats' },
      { id:14, patientNom:'Amira',   patientPrenom:'Mejri',   type:'SUIVI',            statut:'CONFIRME',   dateHeure:'2026-04-03T09:00', dureeMinutes:30, notes:'Suivi cognitif' },
    ];
  }
}
