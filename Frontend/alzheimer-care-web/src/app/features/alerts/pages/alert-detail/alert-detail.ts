import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../../core/services/alert.service'; // Import Service
import { Alert } from '../../../../core/models/alert.model'; // Import Model

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './alert-detail.html',
  styleUrls: ['./alert-detail.scss']
})
export class AlertDetailComponent implements OnInit {
  alertId: string | null = null;
  alert: Alert | null = null; // To store the fetched data
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // 1. Get ID from URL
    this.alertId = this.route.snapshot.paramMap.get('id');

    // 2. Fetch Data if in Browser
    if (isPlatformBrowser(this.platformId) && this.alertId) {
      this.fetchAlertDetails(Number(this.alertId));
    }
  }

  fetchAlertDetails(id: number) {
    this.alertService.getAlertById(id).subscribe({
      next: (data) => {
        console.log("Alert Details Loaded:", data);
        this.alert = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching alert:", err);
        this.isLoading = false;
      }
    });
  }
}