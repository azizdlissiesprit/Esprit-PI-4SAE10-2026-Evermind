import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientService, Patient, MedicalReport } from '../../../../core/services/patient.service';
import { AlertService } from '../../../../core/services/alert.service';
import { InterventionService } from '../../../../core/services/intervention.service';
import { AssessmentService } from '../../../../core/services/assessment.service';
import { Alert } from '../../../../core/models/alert.model';
import { Intervention } from '../../../../core/models/alert.model';
import { Assessment } from '../../../../core/models/assessment.models';

@Component({
  selector: 'app-caregiver-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './caregiver-dashboard.html',
  styleUrls: ['./caregiver-dashboard.scss']
})
export class CaregiverDashboardComponent implements OnInit {
  // User info
  userName = '';
  userRole = '';
  userId: number | null = null;
  currentDate = new Date();

  // Loading states
  isLoading = true;
  loadError = '';

  // Shared data
  patients: Patient[] = [];
  alerts: Alert[] = [];
  interventions: Intervention[] = [];
  assessments: Assessment[] = [];

  // Computed stats
  totalPatients = 0;
  activeAlerts = 0;
  criticalAlerts = 0;
  pendingInterventions = 0;
  completedInterventions = 0;
  recentAssessments = 0;

  // Alert breakdown by severity
  alertsBySeverity = { CRITIQUE: 0, HAUTE: 0, MOYENNE: 0, BASSE: 0 };
  // Alert breakdown by type
  alertsByType: { type: string; count: number; icon: string; color: string }[] = [];
  // Patient breakdown by disease stage
  patientsByStage: { stage: string; count: number; color: string; label: string }[] = [];
  // Intervention outcomes
  interventionOutcomes: { outcome: string; count: number; color: string }[] = [];
  // Recent activity feed
  activityFeed: { time: string; icon: string; text: string; color: string; type: string }[] = [];

  // MEDECIN specific
  medicalReports: MedicalReport[] = [];
  escalatedInterventions: Intervention[] = [];
  averageMmse = 0;
  averageMoca = 0;
  assessmentTrend: { up: number; down: number; stable: number } = { up: 0, down: 0, stable: 0 };

  // Time-based greeting
  greeting = 'Good morning';

  constructor(
    private authService: AuthService,
    private router: Router,
    private patientService: PatientService,
    private alertService: AlertService,
    private interventionService: InterventionService,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const firstName = localStorage.getItem('first_name') || '';
      const lastName = localStorage.getItem('last_name') || '';
      this.userName = `${firstName} ${lastName}`.trim() || 'User';
      this.userRole = localStorage.getItem('user_role') || '';
      const userIdStr = localStorage.getItem('user_id');
      if (userIdStr) {
        this.userId = Number(userIdStr);
      }

      // Set greeting based on time
      const hour = this.currentDate.getHours();
      if (hour < 12) this.greeting = 'Good morning';
      else if (hour < 18) this.greeting = 'Good afternoon';
      else this.greeting = 'Good evening';

      this.loadDashboardData();
    }
  }

  get isMedecin(): boolean {
    return this.userRole === 'MEDECIN';
  }

  get isAidant(): boolean {
    return this.userRole === 'AIDANT';
  }

  get roleLabel(): string {
    if (this.isMedecin) return 'Physician';
    if (this.isAidant) return 'Caregiver';
    return this.userRole || 'User';
  }

  loadDashboardData() {
    this.isLoading = true;

    const patients$ = this.userId
      ? this.patientService.getPatientsByResponsable(this.userId).pipe(catchError(() => of([])))
      : this.patientService.getAll().pipe(catchError(() => of([])));

    forkJoin({
      patients: patients$,
      allPatients: this.patientService.getAll().pipe(catchError(() => of([]))),
      alerts: this.alertService.getAllAlerts().pipe(catchError(() => of([]))),
      interventions: this.interventionService.getAllInterventions().pipe(catchError(() => of([]))),
      assessments: this.assessmentService.getAllAssessments().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.patients = this.isMedecin ? data.allPatients : data.patients;
        this.alerts = data.alerts || [];
        this.interventions = data.interventions || [];
        this.assessments = data.assessments || [];

        this.computeStats();
        this.buildActivityFeed();

        if (this.isMedecin) {
          this.loadMedecinSpecificData();
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.loadError = 'Some data could not be loaded. Showing available information.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMedecinSpecificData() {
    if (!this.userId) return;

    // Load escalated interventions for this doctor
    this.interventionService.getEscalatedInterventions(this.userId).pipe(
      catchError(() => of([]))
    ).subscribe(escalated => {
      this.escalatedInterventions = escalated;
      this.cdr.detectChanges();
    });
  }

  computeStats() {
    // Patient stats
    this.totalPatients = this.patients.length;

    // Alert stats
    this.activeAlerts = this.alerts.filter(a => a.statut === 'NOUVELLE' || a.statut === 'EN_COURS').length;
    this.criticalAlerts = this.alerts.filter(a => a.severite === 'CRITIQUE' || a.severite === 'HAUTE').length;

    // Alert by severity
    this.alertsBySeverity = { CRITIQUE: 0, HAUTE: 0, MOYENNE: 0, BASSE: 0 };
    this.alerts.forEach(a => {
      if (a.severite in this.alertsBySeverity) {
        this.alertsBySeverity[a.severite as keyof typeof this.alertsBySeverity]++;
      }
    });

    // Alert by type
    const typeMap = new Map<string, number>();
    this.alerts.forEach(a => {
      const t = a.typeAlerte || 'UNKNOWN';
      typeMap.set(t, (typeMap.get(t) || 0) + 1);
    });
    const typeConfig: Record<string, { icon: string; color: string }> = {
      'FALL_DETECTION': { icon: 'fa-person-falling', color: '#ef4444' },
      'HEART_RATE_ANOMALY': { icon: 'fa-heart-pulse', color: '#f97316' },
      'GEOFENCE_EXIT': { icon: 'fa-location-crosshairs', color: '#8b5cf6' },
      'MEDICATION_MISSED': { icon: 'fa-pills', color: '#3b82f6' },
      'INACTIVITY': { icon: 'fa-bed', color: '#64748b' },
      'SOS_BUTTON': { icon: 'fa-circle-exclamation', color: '#dc2626' }
    };
    this.alertsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type: this.formatAlertType(type),
      count,
      icon: typeConfig[type]?.icon || 'fa-triangle-exclamation',
      color: typeConfig[type]?.color || '#94a3b8'
    })).sort((a, b) => b.count - a.count);

    // Intervention stats
    this.pendingInterventions = this.interventions.filter(
      i => i.status !== 'COMPLETED' && i.status !== 'CANCELLED'
    ).length;
    this.completedInterventions = this.interventions.filter(i => i.status === 'COMPLETED').length;

    // Intervention outcomes
    const outcomeMap = new Map<string, number>();
    this.interventions.filter(i => i.outcome).forEach(i => {
      outcomeMap.set(i.outcome!, (outcomeMap.get(i.outcome!) || 0) + 1);
    });
    const outcomeColors: Record<string, string> = {
      'FALSE_ALARM': '#94a3b8',
      'ASSISTANCE_GIVEN': '#3b82f6',
      'EMERGENCY_SERVICES': '#ef4444',
      'MEDICATION_GIVEN': '#10b981',
      'CONSULTATION_SCHEDULED': '#8b5cf6'
    };
    this.interventionOutcomes = Array.from(outcomeMap.entries()).map(([outcome, count]) => ({
      outcome: this.formatOutcome(outcome),
      count,
      color: outcomeColors[outcome] || '#64748b'
    }));

    // Patient by stage
    const stageMap = new Map<string, number>();
    this.patients.forEach(p => {
      const diagnosis = (p.medicalDiagnosis || 'Unknown').trim();
      stageMap.set(diagnosis, (stageMap.get(diagnosis) || 0) + 1);
    });
    const stageColors: Record<string, string> = {
      'Early Stage': '#22c55e', 'DEBUT': '#22c55e',
      'Moderate Stage': '#f59e0b', 'MODERE': '#f59e0b',
      'Severe Stage': '#ef4444', 'SEVERE': '#ef4444',
      'Unknown': '#94a3b8'
    };
    this.patientsByStage = Array.from(stageMap.entries()).map(([stage, count]) => ({
      stage,
      count,
      color: stageColors[stage] || '#64748b',
      label: stage
    }));

    // Assessment stats
    this.recentAssessments = this.assessments.length;
    if (this.assessments.length > 0) {
      const totalMmse = this.assessments.reduce((sum, a) => sum + (a.mmseScore || 0), 0);
      const totalMoca = this.assessments.reduce((sum, a) => sum + (a.moocaScore || 0), 0);
      this.averageMmse = Math.round((totalMmse / this.assessments.length) * 10) / 10;
      this.averageMoca = Math.round((totalMoca / this.assessments.length) * 10) / 10;

      this.assessmentTrend = { up: 0, down: 0, stable: 0 };
      this.assessments.forEach(a => {
        if (a.trend === 'up') this.assessmentTrend.up++;
        else if (a.trend === 'down') this.assessmentTrend.down++;
        else this.assessmentTrend.stable++;
      });
    }
  }

  buildActivityFeed() {
    this.activityFeed = [];

    // Add recent alerts to feed
    const recentAlerts = [...this.alerts]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 3);

    recentAlerts.forEach(alert => {
      const severityColor: Record<string, string> = {
        'CRITIQUE': '#dc2626', 'HAUTE': '#ef4444', 'MOYENNE': '#f59e0b', 'BASSE': '#3b82f6'
      };
      this.activityFeed.push({
        time: this.formatRelativeTime(alert.dateCreation),
        icon: 'fa-triangle-exclamation',
        text: `${this.formatAlertType(alert.typeAlerte)} alert — ${alert.message || 'Patient #' + alert.patientId}`,
        color: severityColor[alert.severite] || '#64748b',
        type: 'alert'
      });
    });

    // Add recent interventions to feed
    const recentInterventions = [...this.interventions]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 3);

    recentInterventions.forEach(intr => {
      const statusColor: Record<string, string> = {
        'COMPLETED': '#10b981', 'EN_ROUTE': '#3b82f6',
        'OFFERING_HELP': '#f59e0b', 'IN_PERSON_ASSISTANCE': '#8b5cf6', 'CANCELLED': '#94a3b8'
      };
      this.activityFeed.push({
        time: this.formatRelativeTime(intr.startedAt),
        icon: intr.status === 'COMPLETED' ? 'fa-circle-check' : 'fa-person-running',
        text: `Intervention ${this.formatStatus(intr.status)}${intr.notes ? ' — ' + intr.notes.substring(0, 50) : ''}`,
        color: statusColor[intr.status] || '#64748b',
        type: 'intervention'
      });
    });

    // Sort by "time" string (we'll use a secondary sort approach)
    // For now just interleave alerts and interventions
    this.activityFeed = this.activityFeed.slice(0, 6);
  }

  // ---- Helpers ----
  formatAlertType(type: string): string {
    const map: Record<string, string> = {
      'FALL_DETECTION': 'Fall Detection',
      'HEART_RATE_ANOMALY': 'Heart Rate Anomaly',
      'GEOFENCE_EXIT': 'Geofence Exit',
      'MEDICATION_MISSED': 'Medication Missed',
      'INACTIVITY': 'Inactivity',
      'SOS_BUTTON': 'SOS Button'
    };
    return map[type] || type;
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'EN_ROUTE': 'En Route',
      'OFFERING_HELP': 'Offering Help',
      'IN_PERSON_ASSISTANCE': 'In-Person Assistance',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return map[status] || status;
  }

  formatOutcome(outcome: string): string {
    const map: Record<string, string> = {
      'FALSE_ALARM': 'False Alarm',
      'ASSISTANCE_GIVEN': 'Assistance Given',
      'EMERGENCY_SERVICES': 'Emergency Services',
      'MEDICATION_GIVEN': 'Medication Given',
      'CONSULTATION_SCHEDULED': 'Consultation Scheduled'
    };
    return map[outcome] || outcome;
  }

  formatRelativeTime(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      'CRITIQUE': 'severity-critical',
      'HAUTE': 'severity-high',
      'MOYENNE': 'severity-medium',
      'BASSE': 'severity-low'
    };
    return map[severity] || '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'NOUVELLE': 'status-new',
      'EN_COURS': 'status-in-progress',
      'RESOLUE': 'status-resolved',
      'IGNOREE': 'status-ignored'
    };
    return map[status] || '';
  }

  getAlertSeverityPercent(severity: string): number {
    const total = this.alerts.length;
    if (total === 0) return 0;
    return Math.round((this.alertsBySeverity[severity as keyof typeof this.alertsBySeverity] / total) * 100);
  }

  getTrendIcon(trend: string): string {
    if (trend === 'up') return 'fa-arrow-trend-up';
    if (trend === 'down') return 'fa-arrow-trend-down';
    return 'fa-minus';
  }

  getTrendColor(trend: string): string {
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return '#f59e0b';
  }

  // Navigation
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
