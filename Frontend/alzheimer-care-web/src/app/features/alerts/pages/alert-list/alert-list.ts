import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <--- 1. Import Router
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { Alert } from '../../../../core/models/alert.model';
import { StatutAlerte, Severite, TypeAlerte } from '../../../../core/models/enums';

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

  constructor(
    private alertService: AlertService,
    private cd: ChangeDetectorRef,
    private router: Router, // <--- 2. Inject Router
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
    this.alertService.getAllAlerts().subscribe({
        next: (data) => {
            console.log("✅ ALERTS RECEIVED:", data); // Log full array

            // 👇 Log AI specific check
            const aiCount = data.filter(a => a.aiAnalysis).length;
            console.log(`🤖 AI Analysis Stats: ${aiCount} out of ${data.length} alerts have AI data.`);
            
            // Check the first alert specifically for debugging
            if (data.length > 0) {
                console.log("🔍 First Alert Data:", {
                    id: data[0].alertId,
                    message: data[0].message,
                    aiAnalysis: data[0].aiAnalysis,
                    aiRiskScore: data[0].aiRiskScore
                });
            }

            this.allAlerts = data;
            this.applyFilters();
            this.isLoading = false;
            this.cd.detectChanges();
        },
        error: (err) => { 
            console.error("❌ Failed to load alerts", err);
            this.isLoading = false; 
        }
    });
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
    this.alertService.takeCharge(id).subscribe({
      next: () => {
        // Navigate after successful update
        this.router.navigate(['/app/alerts', id]);
      },
      error: (err) => console.error('Failed to acknowledge', err)
    });
  }

  /**
   * Simple navigation for the "Details" button
   */
  viewDetails(id: number) {
    this.router.navigate(['/app/alerts', id]);
  }

  resolve(id: number) {
    if(confirm('Mark this alert as resolved?')) {
      this.alertService.resolveAlert(id).subscribe(() => this.loadAlerts());
    }
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
}