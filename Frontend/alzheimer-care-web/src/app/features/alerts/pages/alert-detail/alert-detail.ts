import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core'; // <--- 1. Import ChangeDetectorRef
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert.service';
import { Alert } from '../../../../core/models/alert.model';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './alert-detail.html',
  styleUrls: ['./alert-detail.scss']
})
export class AlertDetailComponent implements OnInit {
  alertId: string | null = null;
  alert: Alert | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private cd: ChangeDetectorRef, // <--- 2. Inject it here
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.alertId = this.route.snapshot.paramMap.get('id');

    if (isPlatformBrowser(this.platformId) && this.alertId) {
      // Ensure we pass a number if the service expects a number
      this.fetchAlertDetails(Number(this.alertId));
    } else {
        // If no ID or not browser, stop loading to avoid infinite spinner (optional)
        this.isLoading = false; 
    }
  }

  fetchAlertDetails(id: number) {
    this.alertService.getAlertById(id).subscribe({
      next: (data) => {
        console.log("Alert Details Loaded:", data);
        this.alert = data;
        this.isLoading = false;
        
        // <--- 3. FORCE UPDATE: Use detectChanges()
        this.cd.detectChanges(); 
      },
      error: (err) => {
        console.error("Error fetching alert:", err);
        this.isLoading = false;
        this.cd.detectChanges(); // Update UI even on error
      }
    });
  }

  takeCharge() {
    if (this.alert) {
      this.alertService.takeCharge(this.alert.alertId).subscribe({
        next: (updated) => {
          this.alert = updated;
          this.cd.detectChanges(); // Update UI after action
          alert('Alert acknowledged successfully.');
        },
        error: (err) => console.error(err)
      });
    }
  }

  resolveAlert() {
    if (this.alert && confirm('Are you sure you want to mark this alert as resolved?')) {
      this.alertService.resolveAlert(this.alert.alertId).subscribe({
        next: (updated) => {
          this.alert = updated;
          this.cd.detectChanges(); // Update UI after action
        },
        error: (err) => console.error(err)
      });
    }
  }

  ignoreAlert() {
    if (this.alert && confirm('Are you sure you want to ignore this alert?')) {
      this.alertService.ignoreAlert(this.alert.alertId).subscribe({
        next: (updated) => {
          this.alert = updated;
          this.cd.detectChanges(); // Update UI after action
        },
        error: (err) => console.error(err)
      });
    }
  }

  getSeverityBadgeClass(sev: string): string {
    if (!sev) return 'low';
    switch (sev.toUpperCase()) {
      case 'CRITIQUE': return 'critical';
      case 'HAUTE': return 'high';
      case 'MOYENNE': return 'moderate';
      case 'BASSE': return 'low';
      default: return 'low';
    }
  }

  goBack() {
    window.history.back();
  }
}