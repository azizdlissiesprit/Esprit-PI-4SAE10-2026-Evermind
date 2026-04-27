import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeedService, ServiceConfig, SeedStatus } from './seed.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-data-seeding',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './data-seeding.html',
  styleUrls: ['./data-seeding.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DataSeedingComponent implements OnInit {
  services: ServiceConfig[] = [];
  statuses: Map<string, SeedStatus> = new Map();
  loading: Map<string, boolean> = new Map();
  
  isGlobalLoading = false;
  overallProgress = 0;

  logs: { time: Date, service: string, action: string, detail: string }[] = [];

  constructor(private seedService: SeedService) {
    this.services = this.seedService.services;
  }

  ngOnInit(): void {
    this.refreshAllStatuses();
  }

  refreshAllStatuses() {
    this.services.forEach(s => this.refreshStatus(s));
  }

  refreshStatus(service: ServiceConfig) {
    this.loading.set(service.key, true);
    this.seedService.getStatus(service.prefix).subscribe({
      next: (status) => {
        this.statuses.set(service.key, status);
        this.loading.set(service.key, false);
      },
      error: (err) => {
        const errorMsg = this.extractErrorMessage(err);
        console.error(`Status error for ${service.name}:`, errorMsg);
        this.logAction(service.name, 'STATUS_ERROR', errorMsg);
        this.loading.set(service.key, false);
      }
    });
  }

  async promptSeedService(service: ServiceConfig) {
    const result = await Swal.fire({
      title: `Seed ${service.name}?`,
      text: "This will generate 6 months of realistic clinical data.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, generate data!'
    });

    if (result.isConfirmed) {
      this.doSeed(service);
    }
  }

  private doSeed(service: ServiceConfig): Promise<void> {
    return new Promise((resolve) => {
      this.loading.set(service.key, true);
      this.seedService.executeSeed(service.prefix).subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS' || res.status === 'ALREADY_SEEDED') {
            // Build a detailed log message including skip/warning info
            let detail = res.message || 'Data generated';
            if (res['skipped'] && res['skipped'] > 0) {
              detail += ` (${res['skipped']} items skipped)`;
            }
            this.logAction(service.name, 'SEED', detail);

            if (res.status === 'SUCCESS') {
              // Show warning toast if there were skips, otherwise success
              if (res['skipped'] && res['skipped'] > 0) {
                this.toast('warning', `${service.name} seeded with ${res['skipped']} skipped items`);
              } else {
                this.toast('success', `${service.name} successfully seeded`);
              }
            } else {
               this.toast('info', `${service.name} already seeded`);
            }

            // Log any warnings from the backend
            if (res['warnings'] && Array.isArray(res['warnings'])) {
              (res['warnings'] as string[]).forEach(w => {
                this.logAction(service.name, 'WARNING', w);
              });
            }
          } else if (res.status === 'SEED_FAILED') {
            // Structured error response from our error handler
            const errorDetail = res['error'] || res.message || 'Unknown failure';
            this.logAction(service.name, 'ERROR', errorDetail);
            this.toast('error', `Failed to seed ${service.name}: ${res.message}`);
          } else {
             this.logAction(service.name, 'ERROR', res.message || 'Unknown status: ' + res.status);
             this.toast('error', `Failed to seed ${service.name}`);
          }
          this.refreshStatus(service);
          resolve();
        },
        error: (err) => {
          const errorMsg = this.extractErrorMessage(err);
          console.error(`Seed error for ${service.name}:`, err);
          this.logAction(service.name, 'ERROR', errorMsg);
          this.toast('error', `Error seeding ${service.name}: ${errorMsg}`);
          this.loading.set(service.key, false);
          resolve();
        }
      });
    });
  }

  async clearService(service: ServiceConfig) {
    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: `This will delete seeded data from ${service.name}. User-created data will be untouched.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear it!'
    });

    if (result.isConfirmed) {
      this.doClear(service);
    }
  }

  private doClear(service: ServiceConfig): Promise<void> {
    return new Promise((resolve) => {
      this.loading.set(service.key, true);
      this.seedService.clearSeed(service.prefix).subscribe({
        next: (res) => {
          let detail = `Cleared ${res['alertsDeleted'] || res['patientsDeleted'] || res['sensorsDeleted'] || res['interventionsDeleted'] || 'records'}`;
          if (res['errors'] && res['errors'] > 0) {
            detail += ` (${res['errors']} errors encountered)`;
            this.logAction(service.name, 'CLEAR', detail);
            this.toast('warning', `${service.name} data cleared with ${res['errors']} errors`);
          } else {
            this.logAction(service.name, 'CLEAR', detail);
            this.toast('success', `${service.name} data cleared`);
          }
          this.refreshStatus(service);
          resolve();
        },
        error: (err) => {
          const errorMsg = this.extractErrorMessage(err);
          console.error(`Clear error for ${service.name}:`, err);
          this.logAction(service.name, 'ERROR', `Clear failed: ${errorMsg}`);
          this.toast('error', `Error clearing ${service.name}: ${errorMsg}`);
          this.loading.set(service.key, false);
          resolve();
        }
      });
    });
  }

  async seedAll() {
    const result = await Swal.fire({
      title: 'Initialize Entire Platform?',
      text: "This sequences seeding across all microservices (Patients -> Sensors -> Alerts -> Interventions). It may take a minute.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, initialize platform!'
    });

    if (result.isConfirmed) {
      this.isGlobalLoading = true;
      this.overallProgress = 0;
      
      const step = 100 / this.services.length;
      let hasErrors = false;
      
      for (const service of this.services) {
        await this.doSeed(service);
        this.overallProgress += step;
        // Check if any error was logged
        const lastLog = this.logs[0];
        if (lastLog && lastLog.action === 'ERROR') {
          hasErrors = true;
        }
      }
      
      this.overallProgress = 100;
      setTimeout(() => {
        this.isGlobalLoading = false;
        this.overallProgress = 0;
        if (hasErrors) {
          Swal.fire('Completed with warnings', 'Platform initialization finished but some services had errors. Check the activity log for details.', 'warning');
        } else {
          Swal.fire('Complete', 'Platform initialization finished successfully.', 'success');
        }
      }, 500);
    }
  }

  async clearAll() {
    const result = await Swal.fire({
      title: 'Clear Entire Platform?',
      html: "This will wipe all SEEDED data across all microservices.<br><br><b>WARNING:</b> Always clear in reverse dependency order. Master script will handle this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, wipe seed data!'
    });

    if (result.isConfirmed) {
      this.isGlobalLoading = true;
      this.overallProgress = 0;
      
      const reverseServices = [...this.services].reverse();
      const step = 100 / reverseServices.length;
      let hasErrors = false;
      
      for (const service of reverseServices) {
        await this.doClear(service);
        this.overallProgress += step;
        const lastLog = this.logs[0];
        if (lastLog && lastLog.action === 'ERROR') {
          hasErrors = true;
        }
      }
      
      this.overallProgress = 100;
      setTimeout(() => {
        this.isGlobalLoading = false;
        this.overallProgress = 0;
        if (hasErrors) {
          Swal.fire('Completed with warnings', 'Seed data wipe finished but some services had errors. Check the activity log.', 'warning');
        } else {
          Swal.fire('Complete', 'All seed data has been wiped.', 'success');
        }
      }, 500);
    }
  }

  logAction(service: string, action: string, detail: string) {
    this.logs.unshift({ time: new Date(), service, action, detail });
    if(this.logs.length > 50) this.logs.pop(); // keep last 50
  }

  formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  toast(icon: 'success' | 'error' | 'warning' | 'info', title: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });
    Toast.fire({ icon, title });
  }

  /**
   * Extracts a human-readable error message from an HTTP error response.
   * Handles both structured error responses from our controllers and raw HTTP errors.
   */
  private extractErrorMessage(err: any): string {
    // If the backend returned our structured error response
    if (err?.error?.message) {
      let msg = err.error.message;
      if (err.error.rootCause) {
        msg += ` (Root cause: ${err.error.rootCause})`;
      }
      return msg;
    }
    // If it's a structured error with just the error field
    if (err?.error?.error) {
      return err.error.error;
    }
    // Standard HTTP error
    if (err?.status && err?.statusText) {
      return `HTTP ${err.status}: ${err.statusText}`;
    }
    // Fallback
    if (err?.message) {
      return err.message;
    }
    return 'Unknown server error';
  }
}
