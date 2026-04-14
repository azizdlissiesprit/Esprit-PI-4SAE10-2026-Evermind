import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { RendezVousService, RendezVousDTO } from '../../../../services/rendezvous.service';
import { VideoService, VideoRoomResponse } from '../../../../services/video.service';
import { VideoCallModalComponent } from '../../../../shared/components/video-call-modal/video-call-modal.component';

export type TypeConsultation =
  | 'CONSULTATION' | 'TELECONSULTATION' | 'VIDEOCONSULTATION' | 'SUIVI'
  | 'BILAN' | 'EVALUATION' | 'RESULTATS' | 'PREMIERE_VISITE';

export type StatutRDV = 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'LIBRE';

export interface RendezVous {
  id: number;
  patientNom: string;
  patientPrenom: string;
  type: TypeConsultation;
  statut: StatutRDV;
  dateHeure: Date;
  dureeMinutes: number;
  notes?: string;
  googleEventId?: string;
  roomUrl?: string;
  roomName?: string;
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VideoCallModalComponent],
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

  // Video consultation properties
  showVideoModal = false;
  currentRoomUrl = '';
  currentToken = '';
  currentPatientName = '';

  // Video appointments list properties
  showVideoAppointments = false;

  readonly DAY_NAMES   = ['LUN','MAR','MER','JEU','VEN'];
  readonly MINI_DAYS   = ['L','M','M','J','V','S','D'];
  readonly MONTHS_SHORT = ['jan','fév','mars','avr','mai','juin',
                            'juil','août','sep','oct','nov','déc'];

  readonly TYPE_LABELS: Record<TypeConsultation, string> = {
    CONSULTATION:    'Consultation',
    TELECONSULTATION:'Téléconsult.',
    VIDEOCONSULTATION:'Vidéoconsult.',
    SUIVI:           'Suivi',
    BILAN:           'Bilan mé.',
    EVALUATION:      'Éval. cog.',
    RESULTATS:       'Résultats',
    PREMIERE_VISITE: '1ère visite'
  };

  readonly TYPE_OPTIONS: TypeConsultation[] = [
    'CONSULTATION','TELECONSULTATION','VIDEOCONSULTATION','SUIVI',
    'BILAN','EVALUATION','RESULTATS','PREMIERE_VISITE'
  ];

  readonly STATUT_OPTIONS: StatutRDV[] = ['CONFIRME','EN_ATTENTE','ANNULE'];
  readonly CIRCUMFERENCE = 2 * Math.PI * 36;
  readonly MAX_WEEK_SLOTS = 56;

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService,
    private videoService: VideoService
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
      dateHeure:     [rdv?.dateHeure ? this.formatDateTimeLocal(rdv.dateHeure) : '', Validators.required],
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

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  openNewForDate(date: Date, hour: number): void {
    this.isEditing = false;
    this.selectedRdv = null;
    this.errorMessage = '';
    
    // Create a new form with the selected date and time pre-filled
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, 0, 0, 0);
    
    this.rdvForm = this.fb.group({
      patientNom:    ['', Validators.required],
      patientPrenom: ['', Validators.required],
      type:          ['CONSULTATION', Validators.required],
      statut:        ['CONFIRME', Validators.required],
      dateHeure:     [this.formatDateTimeLocal(selectedDateTime), Validators.required],
      dureeMinutes:  [30, [Validators.required, Validators.min(5)]],
      notes:         ['']
    });
    
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
              ? 'Rendez-vous modifié avec succès.'
              : 'Rendez-vous créé avec succès.';
            this.closeModal();
            this.loadRdv();
          },
          error: (err) => {
            console.error('API Error:', err);
            // Fallback to local mode if API fails
            this.backendAvailable = false;
            this.saveLocally(payload);
            this.submitting = false;
            this.infoMessage = this.isEditing
              ? 'Rendez-vous modifié en mode local (API indisponible).'
              : 'Rendez-vous créé en mode local (API indisponible).';
            this.closeModal();
          }
        });
      return;
    }

    this.saveLocally(payload);
    this.submitting = false;
    this.infoMessage = this.isEditing
      ? 'Rendez-vous modifié en mode local.'
      : 'Rendez-vous créé en mode local.';
    this.closeModal();
  }

  deleteRDV(rdv: RendezVous, e: Event): void {
    e.stopPropagation();
    if (!confirm(`Supprimer le RDV de ${rdv.patientNom} ${rdv.patientPrenom} ?`)) {
      return;
    }

    console.log('Deleting RDV:', rdv);
    this.errorMessage = '';

    try {
      if (this.backendAvailable) {
        this.submitting = true;
        this.rendezVousService
          .delete(rdv.id)
          .pipe(finalize(() => (this.submitting = false)))
          .subscribe({
            next: () => {
              console.log('RDV deleted successfully via API');
              this.infoMessage = 'Rendez-vous supprimé avec succès.';
              this.rdvList = this.rdvList.filter((item) => item.id !== rdv.id);
              this.syncDemandesFromAppointments();
              if (this.selectedRdv?.id === rdv.id) {
                this.closeModal();
              }
            },
            error: (err) => {
              console.error('API delete failed:', err);
              // Fallback to local delete
              this.deleteLocally(rdv);
            }
          });
        return;
      }

      this.deleteLocally(rdv);
    } catch (error) {
      console.error('Error during delete operation:', error);
      this.errorMessage = 'Erreur lors de la suppression du rendez-vous.';
    }
  }

  private deleteLocally(rdv: RendezVous): void {
    this.rdvList = this.rdvList.filter((item) => item.id !== rdv.id);
    this.syncDemandesFromAppointments();
    if (this.selectedRdv?.id === rdv.id) {
      this.closeModal();
    }
    this.infoMessage = 'Rendez-vous supprimé en mode local.';
    console.log('RDV deleted locally');
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
        error: (err) => {
          console.error('Backend API unavailable:', err);
          this.backendAvailable = false;
          this.rdvList = this.getMockRDV();
          this.syncDemandesFromAppointments();
          this.infoMessage = "API indisponible. Le CRUD fonctionne en mode local.";
        }
      });
  }

  private saveLocally(payload: RendezVousDTO): void {
    try {
      console.log('Saving locally:', payload);
      
      if (this.isEditing && this.selectedRdv) {
        console.log('Updating existing RDV with ID:', this.selectedRdv.id);
        this.rdvList = this.rdvList.map((rdv) =>
          rdv.id === this.selectedRdv!.id
            ? this.normalizeRdv({ ...payload, id: this.selectedRdv!.id })
            : rdv
        );
        this.infoMessage = 'Rendez-vous modifié en mode local.';
      } else {
        const nextId = this.rdvList.length
          ? Math.max(...this.rdvList.map((rdv) => rdv.id)) + 1
          : 1;
        console.log('Creating new RDV with ID:', nextId);
        this.rdvList = [...this.rdvList, this.normalizeRdv({ ...payload, id: nextId })];
        this.infoMessage = 'Rendez-vous créé en mode local.';
      }

      this.rdvList.sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
      this.syncDemandesFromAppointments();
      console.log('Local save successful, updated list:', this.rdvList);
    } catch (error) {
      console.error('Error during local save:', error);
      this.errorMessage = 'Erreur lors de la sauvegarde locale.';
    }
  }

  private persistStatusChange(rdv: RendezVous, message: string): void {
    try {
      console.log('Updating status for RDV:', rdv);
      const payload = this.toDto(rdv);

      if (this.backendAvailable) {
        this.rendezVousService.update(rdv.id, payload).subscribe({
          next: () => {
            console.log('Status updated successfully via API');
            this.rdvList = this.rdvList.map((item) => (item.id === rdv.id ? rdv : item));
            this.syncDemandesFromAppointments();
            this.infoMessage = message;
          },
          error: (err) => {
            console.error('API status update failed:', err);
            // Fallback to local update
            this.updateStatusLocally(rdv, message);
          }
        });
        return;
      }

      this.updateStatusLocally(rdv, message);
    } catch (error) {
      console.error('Error during status change:', error);
      this.errorMessage = 'Erreur lors de la mise à jour du statut.';
    }
  }

  private updateStatusLocally(rdv: RendezVous, message: string): void {
    this.rdvList = this.rdvList.map((item) => (item.id === rdv.id ? rdv : item));
    this.syncDemandesFromAppointments();
    this.infoMessage = `${message} Mode local actif.`;
    console.log('Status updated locally:', rdv);
  }

  // Video consultation methods
  lancerTeleconsultation(rendezVous: RendezVous): void {
    console.log('Starting video consultation for:', rendezVous);
    
    if (rendezVous.roomUrl) {
      // Room déjà créée -> rejoindre directement
      this.ouvrirModal(rendezVous.roomUrl, rendezVous.roomName || '', rendezVous.patientPrenom + ' ' + rendezVous.patientNom);
    } else {
      // Créer la room
      this.videoService.createRoom(rendezVous.id, rendezVous.patientPrenom + ' ' + rendezVous.patientNom)
        .subscribe({
          next: (response) => {
            console.log('Video room created:', response);
            // Update local rendez-vous with video info
            const updatedRdv = { ...rendezVous, roomUrl: response.roomUrl, roomName: response.roomName };
            this.rdvList = this.rdvList.map(item => item.id === rendezVous.id ? updatedRdv : item);
            this.ouvrirModal(response.roomUrl, response.roomName, rendezVous.patientPrenom + ' ' + rendezVous.patientNom);
          },
          error: (err) => {
            console.error('Error creating video room:', err);
            this.errorMessage = 'Erreur lors de la création de la salle vidéo';
          }
        });
    }
  }

  ouvrirModal(roomUrl: string, roomName: string, patientName: string): void {
    this.videoService.getToken(roomName, 'Médecin')
      .subscribe({
        next: ({ token }) => {
          this.currentRoomUrl = roomUrl;
          this.currentToken = token;
          this.currentPatientName = patientName;
          this.showVideoModal = true;
        },
        error: (err) => {
          console.error('Error getting video token:', err);
          this.errorMessage = 'Erreur lors de l\'accès à la consultation vidéo';
        }
      });
  }

  fermerModal(): void {
    this.showVideoModal = false;
    this.currentRoomUrl = '';
    this.currentToken = '';
    this.currentPatientName = '';
  }

  // Video appointments list methods
  showAllAppointmentsForVideo(): void {
    this.showVideoAppointments = true;
  }

  hideVideoAppointments(): void {
    this.showVideoAppointments = false;
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
        heure: `${rdv.dateHeure.getHours().toString().padStart(2, '0')}:${rdv.dateHeure.getMinutes().toString().padStart(2, '0')}`,
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
      dateHeure: new Date(rdv.dateHeure),
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
      dateHeure: this.normalizeDateHeure(source.dateHeure),
      dureeMinutes: Number(source.dureeMinutes ?? 30),
      notes: source.notes ?? ''
    };
  }

  private normalizeDateHeure(value: Date | string | undefined): string {
    if (!value) {
      return '';
    }
    
    if (value instanceof Date) {
      return this.formatDateTimeLocal(value);
    }
    
    return value.length === 16 ? `${value}:00` : value;
  }

  private formatDemandeDate(dateHeure: Date | string): string {
    const date = dateHeure instanceof Date ? dateHeure : new Date(dateHeure);
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
    const today = new Date();
    
    return [
      { id:1,  patientNom:'Omar',    patientPrenom:'F.',      type:'TELECONSULTATION', statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0), dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:2,  patientNom:'Leila',   patientPrenom:'B.',      type:'PREMIERE_VISITE',  statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0), dureeMinutes:45, notes:'Patient no data modifiable' },
      { id:3,  patientNom:'Sara',    patientPrenom:'M.',      type:'EVALUATION',       statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0), dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:4,  patientNom:'Nadia',   patientPrenom:'B.',      type:'SUIVI',            statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0), dureeMinutes:20, notes:'Patient no data modifiable' },
      { id:5,  patientNom:'Hedi',    patientPrenom:'T.',      type:'CONSULTATION',     statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0), dureeMinutes:30, notes:'Patient no data modifiable' },
      { id:6,  patientNom:'Amira',   patientPrenom:'M.',      type:'VIDEOCONSULTATION', statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0), dureeMinutes:30, notes:'Téléconsultation vidéo' },
      { id:7,  patientNom:'K.',      patientPrenom:'Haddad',  type:'BILAN',            statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0), dureeMinutes:30, notes:'Bilan mé.' },
      { id:8,  patientNom:'Leila',   patientPrenom:'B.',      type:'CONSULTATION',     statut:'EN_ATTENTE', dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0), dureeMinutes:30, notes:'En attente' },
      { id:9,  patientNom:'Ali',     patientPrenom:'R.',      type:'TELECONSULTATION', statut:'CONFIRME',   dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0, 0), dureeMinutes:20, notes:'Patient no data modifiable' },
      { id:10, patientNom:'Mohamed', patientPrenom:'.',       type:'TELECONSULTATION', statut:'EN_ATTENTE', dateHeure:new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0), dureeMinutes:20, notes:'Champ non mo data' },
    ];
  }
}
