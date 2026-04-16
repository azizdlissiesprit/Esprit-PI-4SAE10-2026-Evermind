import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, DashboardStats } from '../../../core/services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.refreshStats();
  }

  refreshStats(): void {
    this.loading = true;
    this.error = null;
    this.dashboardService.getGlobalStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.error = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });
  }

  // Calculate percentage width for the simple bar chart relative to the max value
  getBarWidth(count: number): string {
    if (!this.stats || !this.stats.topFormations.length) return '0%';
    const maxCount = Math.max(...this.stats.topFormations.map(f => f.nombreInscriptions));
    if (maxCount === 0) return '0%';
    return `${(count / maxCount) * 100}%`;
  }
}
