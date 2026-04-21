import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { Alert, Intervention } from '../../../../core/models/alert.model';
import { InterventionService } from '../../../../core/services/intervention.service';
import { InterventionStatus, InterventionOutcome, StatutAlerte } from '../../../../core/models/enums';
import { NotificationService } from '../../../../core/services/notification.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './alert-detail.html',
  styleUrls: ['./alert-detail.scss']
})
export class AlertDetailComponent implements OnInit {
  alertId: string | null = null;
  alert: Alert | null = null;
  intervention: Intervention | null = null;
  isLoading = true;

  // Doctor escalation state
  showDoctorPicker = false;
  availableDoctors: any[] = [];
  selectedDoctorId: number | null = null;
  isLoadingDoctors = false;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private interventionService: InterventionService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,

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
      next: (data: Alert) => {
        console.log("Alert Details Loaded:", data);
        this.alert = data;
        this.isLoading = false;
        
        // Fetch existing intervention if in progress
        if (this.alert && this.alert.statut !== StatutAlerte.NOUVELLE) {
          this.fetchIntervention(id);
        }

        // <--- 3. FORCE UPDATE: Use detectChanges()
        this.cd.detectChanges(); 
      },
      error: (err: any) => {
        console.error("Error fetching alert:", err);
        this.isLoading = false;
        this.cd.detectChanges(); // Update UI even on error
      }
    });
  }

  fetchIntervention(alertId: number) {
    this.interventionService.getByAlert(alertId).subscribe({
      next: (inv) => {
        this.intervention = inv;
        this.cd.detectChanges();
      },
      error: (err) => console.warn("No intervention found for alert", alertId)
    });
  }

  takeCharge() {
    if (this.alert) {
      // 1. Create Intervention in Backend
      const newIntervention: Partial<Intervention> = {
        alertId: this.alert.alertId,
        patientId: this.alert.patientId,
        userId: 1, // Mock current user ID
        status: InterventionStatus.EN_ROUTE
      };

      this.interventionService.startIntervention(newIntervention).subscribe({
        next: (inv) => {
          this.intervention = inv;
          if (this.alert) {
            // Decouple from current check to avoid NG0100
            setTimeout(() => {
              if (this.alert) this.alert.statut = StatutAlerte.EN_COURS;
              this.cd.detectChanges();
            });
          }
          this.notificationService.success('Intervention started. You are now "En Route".');
        },



        error: (err) => console.error("Failed to start intervention:", err)
      });
    }
  }

  offerHelp() {
    if (this.intervention) {
      this.interventionService.updateStatus(this.intervention.id, InterventionStatus.OFFERING_HELP).subscribe({
        next: (updated) => {
          this.intervention = updated;
          this.cd.detectChanges();
          this.notificationService.info('Messaging patient: "I see you may need help. A nurse is notified."');
        }
      });
    }
  }

  assistInPerson() {
    if (this.intervention) {
      this.interventionService.updateStatus(this.intervention.id, InterventionStatus.IN_PERSON_ASSISTANCE).subscribe({
        next: (updated) => {
          this.intervention = updated;
          this.cd.detectChanges();
        }
      });
    }
  }

  resolveAlert() {
    if (this.alert && this.intervention) {
      this.dialogService.resolve().subscribe(result => {
        if (result.confirmed && result.outcome && result.notes) {
          console.log("🚀 Calling finishIntervention with:", { id: this.intervention!.id, outcome: result.outcome, notes: result.notes });
          this.interventionService.finishIntervention(this.intervention!.id, result.outcome, result.notes).subscribe({
            next: (updatedInv) => {
              this.notificationService.success('Incident Resolved.');
              
              // Ensure clean transition out of the current check cycle
              setTimeout(() => {
                if (this.alert) {
                  this.alert.statut = StatutAlerte.RESOLUE;
                }
                this.intervention = updatedInv;
                this.cd.detectChanges();
              }, 0);
            },




            error: (err) => {


              console.error(err);
              this.notificationService.error('Failed to resolve alert.');
            }
          });
        }
      });
    }
  }

  ignoreAlert() {
    if (this.alert) {
      this.dialogService.confirm(
        'Ignore Alert',
        'Are you sure you want to ignore this alert? This will mark it as a false alarm.',
        'Ignore',
        'Cancel'
      ).subscribe(result => {
        if (result.confirmed) {
          this.alertService.ignoreAlert(this.alert!.alertId).subscribe({
            next: (updated) => {
              this.alert = updated;
              this.notificationService.info('Alert ignored.');
              this.cd.detectChanges();
            },
            error: (err) => {
              console.error(err);
              this.notificationService.error('Failed to ignore alert.');
            }
          });
        }
      });
    }
  }

  escalateAlert() {
    if (!this.intervention) return;

    // Toggle doctor picker visibility
    if (this.showDoctorPicker) {
      this.showDoctorPicker = false;
      return;
    }

    this.isLoadingDoctors = true;
    this.showDoctorPicker = true;
    this.selectedDoctorId = null;

    this.authService.getDoctors().subscribe({
      next: (doctors) => {
        this.availableDoctors = doctors;
        this.isLoadingDoctors = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load doctors:', err);
        this.notificationService.error('Failed to load available doctors.');
        this.isLoadingDoctors = false;
        this.showDoctorPicker = false;
        this.cd.detectChanges();
      }
    });
  }

  confirmEscalation() {
    if (!this.intervention || !this.selectedDoctorId) {
      this.notificationService.error('Please select a doctor first.');
      return;
    }

    const selectedDoc = this.availableDoctors.find(d => d.userId === this.selectedDoctorId);
    const doctorName = selectedDoc ? `${selectedDoc.firstName} ${selectedDoc.lastName}` : `Doctor #${this.selectedDoctorId}`;

    this.interventionService.escalateIntervention(
      this.intervention.id,
      this.selectedDoctorId,
      `Escalated to ${doctorName}`
    ).subscribe({
      next: (updated) => {
        this.intervention = updated;
        this.showDoctorPicker = false;
        this.notificationService.success(`Alert escalated to ${doctorName} successfully.`);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to escalate alert.');
      }
    });
  }

  cancelEscalation() {
    this.showDoctorPicker = false;
    this.selectedDoctorId = null;
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

  getPatientImage(patientId: number | undefined): string {
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

  // --- METRICS CALCULATION ---
  getDurationInMinutes(start: string | undefined, end: string | undefined): string {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    
    if (diffMs < 0) return '0 secs';
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs} secs`;
    
    const diffMins = Math.floor(diffSecs / 60);
    const remainingSecs = diffSecs % 60;
    
    if (diffMins < 60) {
      return remainingSecs > 0 ? `${diffMins} min ${remainingSecs} sec` : `${diffMins} min`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `${diffHours} hr ${remainingMins} min`;
  }
}

