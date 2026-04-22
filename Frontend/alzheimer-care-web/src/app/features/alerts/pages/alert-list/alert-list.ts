import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <--- 1. Import Router
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { InterventionService } from '../../../../core/services/intervention.service';
import { Alert, Intervention } from '../../../../core/models/alert.model';
import { StatutAlerte, Severite, TypeAlerte, InterventionStatus } from '../../../../core/models/enums';
import { NotificationService } from '../../../../core/services/notification.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './alert-list.html',
  styleUrls: ['./alert-list.scss']
})
export class AlertListComponent implements OnInit {
  
  // ... (Keep existing properties like allAlerts, activeAlerts, etc.)
  allAlerts: Alert[] = [];
  activeAlerts: Alert[] = [];
  resolvedAlerts: Alert[] = [];
  isLoading = true;
  selectedSeverity: string = 'ALL';
  selectedStatus: string = 'ALL';
  severities = Object.values(Severite);
  statuses = Object.values(StatutAlerte);
  isMedecin = false;

  constructor(
    private alertService: AlertService,
    private interventionService: InterventionService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAlerts();
    } else {
      this.isLoading = false;
    }
  }

  // ... imports

  loadAlerts() {
    this.isLoading = true;
    const userRole = this.authService.getUserRole();
    const userId = this.authService.getUserId();

    console.log('🔍 DEBUG loadAlerts: userRole =', JSON.stringify(userRole), ', userId =', userId);

    // MEDECIN: Only see alerts escalated to them
    if (userRole === 'MEDECIN' && userId) {
      this.isMedecin = true;
      this.interventionService.getEscalatedInterventions(userId).subscribe({
        next: (interventions: Intervention[]) => {
          const alertIds = interventions.map(i => i.alertId);
          if (alertIds.length === 0) {
            this.allAlerts = [];
            this.applyFilters();
            this.isLoading = false;
            this.cd.detectChanges();
            return;
          }
          this.alertService.getAlertsByIds(alertIds).subscribe({
            next: (data: Alert[]) => {
              console.log('🩺 MEDECIN: Loaded escalated alerts:', data);
              this.allAlerts = data;
              this.applyFilters();
              this.isLoading = false;
              this.cd.detectChanges();
            },
            error: (err: any) => {
              console.error('❌ Failed to load escalated alerts', err);
              this.isLoading = false;
            }
          });
        },
        error: (err: any) => {
          console.error('❌ Failed to load escalated interventions', err);
          this.isLoading = false;
        }
      });
    } else {
      // DEFAULT (AIDANT / ADMIN / etc.): See all alerts
      this.alertService.getAllAlerts().subscribe({
        next: (data: Alert[]) => {
            console.log('✅ ALERTS RECEIVED:', data);
            this.allAlerts = data;
            this.applyFilters();
            this.isLoading = false;
            this.cd.detectChanges();
        },
        error: (err: any) => { 
            console.error('❌ Failed to load alerts', err);
            this.isLoading = false; 
        }
      });
    }
  }

  // ... (Keep applyFilters logic)
  applyFilters() {
      // ... same logic as before
      let temp = this.allAlerts;
      if (this.selectedSeverity !== 'ALL') temp = temp.filter(a => a.severite === this.selectedSeverity);
      
      if (this.selectedStatus !== 'ALL') {
          this.activeAlerts = temp.filter(a => a.statut === this.selectedStatus);
          this.resolvedAlerts = []; 
      } else {
          this.activeAlerts = temp.filter(a => a.statut === StatutAlerte.NOUVELLE || a.statut === StatutAlerte.EN_COURS);
          this.resolvedAlerts = temp.filter(a => a.statut === StatutAlerte.RESOLUE || a.statut === StatutAlerte.IGNOREE);
      }
  }

  // --- UPDATED ACTIONS ---

  /**
   * 1. Call backend to update status to "EN_COURS" (Taking charge).
   * 2. Navigate to the Details page.
   */
  acknowledge(id: number) {
    const alertData = this.allAlerts.find(a => a.alertId === id);
    if (!alertData) return;

    const newIntervention = {
      alertId: id,
      patientId: alertData.patientId,
      userId: 1, // Mock
      status: InterventionStatus.EN_ROUTE
    };

    this.interventionService.startIntervention(newIntervention).subscribe({
      next: () => {
        // Navigate after successful update
        this.router.navigate(['/app/alerts', id]);
      },
      error: (err) => console.error('Failed to acknowledge intervention', err)
    });
  }

  /**
   * Simple navigation for the "Details" button
   */
  viewDetails(id: number) {
    this.router.navigate(['/app/alerts', id]);
  }

  resolve(id: number) {
    this.dialogService.confirm('Resolve Alert', 'Mark this alert as resolved?').subscribe(result => {
      if (result.confirmed) {
        this.alertService.resolveAlert(id).subscribe(() => {
          this.loadAlerts();
          this.notificationService.success('Alert marked as resolved.');
        });
      }
    });
  }


  // ... (Keep UI Helpers: getSeverityClass, getBadgeClass, getIcon, getTimeAgo)
    getSeverityClass(severite: string): string {
    switch (severite) {
      case Severite.CRITIQUE: return 'card-critical';
      case Severite.HAUTE: return 'card-high';
      case Severite.MOYENNE: return 'card-moderate';
      case Severite.BASSE: return 'card-low'; 
      default: return 'card-low';
    }
  }

  getBadgeClass(severite: string): string {
    switch (severite) {
      case Severite.CRITIQUE: return 'critical';
      case Severite.HAUTE: return 'high';
      case Severite.MOYENNE: return 'moderate';
      case Severite.BASSE: return 'low';
      default: return 'low';
    }
  }
  getIcon(type: string): string {
    switch (type) {
      case TypeAlerte.FALL_DETECTION: return 'fa-solid fa-person-falling';
      case TypeAlerte.HEART_RATE_ANOMALY: return 'fa-solid fa-heart-pulse';
      case TypeAlerte.GEOFENCE_EXIT: return 'fa-solid fa-door-open';
      case TypeAlerte.SOS_BUTTON: return 'fa-solid fa-bell';
      case TypeAlerte.INACTIVITY: return 'fa-solid fa-user-clock'; 
      case TypeAlerte.MEDICATION_MISSED: return 'fa-solid fa-pills'; 
      default: return 'fa-solid fa-circle-exclamation';
    }
  }

  getTimeAgo(dateInput: string | Date): string {
    if(!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }

  getPatientImage(patientId: number): string {
    const elderlyImages = [
      'https://images.unsplash.com/photo-1544144433-d50aff500b91?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1466112928291-0903b80a9466?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1559839734-2b71f15367ca?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=150&h=150&fit=crop'
    ];
    
    // Deterministic selection based on ID
    const index = Math.abs(Number(patientId || 0)) % elderlyImages.length;
    return elderlyImages[index];
  }
}

