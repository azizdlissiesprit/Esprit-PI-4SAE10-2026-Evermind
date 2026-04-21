import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {
  AnalyticsService,
  DashboardAnalytics,
  DemandPrevision,
  ExpirationProduit,
  ExpirationResume,
  ReapproAlert,
  SalesAnomaly
} from '../../../core/services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss']
})
export class AnalyticsComponent implements OnInit {
  // Dashboard
  dashboardData: DashboardAnalytics | null = null;
  alertesReappro: ReapproAlert[] = [];
  anomalies: SalesAnomaly[] = [];

  // Demand
  demandForecasts: DemandPrevision[] = [];

  // Expiration
  expirationResume: ExpirationResume | null = null;
  expirationProduits: ExpirationProduit[] = [];

  // Loading / error states
  loading = true;
  seeding = false;
  error = '';

  // ── Demand Bar Chart ─────────────────────────────────────
  public demandChartType: ChartType = 'bar';
  public demandChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public demandChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
    plugins: {
      legend: { display: true, position: 'top' },
    }
  };

  // ── Expiration Doughnut Chart ────────────────────────────
  public expChartType: ChartType = 'doughnut';
  public expChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public expChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    console.log('[AnalyticsComponent] Initializing analytics dashboard...');
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    // Load all three endpoints in parallel
    this.loadDashboard();
    this.loadDemandForecast();
    this.loadExpirationRisks();
  }

  loadDashboard(): void {
    console.log('[AnalyticsComponent] Loading dashboard KPIs...');
    this.analyticsService.getDashboard().subscribe({
      next: (data) => {
        console.log('[AnalyticsComponent] Dashboard data received:', data);
        this.dashboardData = data;
        this.alertesReappro = data.alertesReapprovisionnement || [];
        this.anomalies = data.anomaliesVentes || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('[AnalyticsComponent] Dashboard load failed:', err);
        this.error = 'Erreur lors du chargement du tableau de bord.';
        this.loading = false;
      }
    });
  }

  loadDemandForecast(): void {
    console.log('[AnalyticsComponent] Loading demand forecast...');
    this.analyticsService.getDemandForecast().subscribe({
      next: (data) => {
        console.log('[AnalyticsComponent] Demand forecast received:', data);
        this.demandForecasts = data.previsions || [];

        // Build chart — top 10 products by recommended order quantity
        const top10 = this.demandForecasts.slice(0, 10);
        const labels = top10.map(p => p.nom.length > 18 ? p.nom.substring(0, 18) + '…' : p.nom);
        const currentStock = top10.map(p => p.stockActuel);
        const toOrder = top10.map(p => p.quantiteRecommandee);

        this.demandChartData = {
          labels,
          datasets: [
            { data: currentStock, label: 'Stock Actuel', backgroundColor: '#34d399', borderRadius: 6 },
            { data: toOrder, label: 'À Commander (30j)', backgroundColor: '#3b82f6', borderRadius: 6 }
          ]
        };
      },
      error: (err) => {
        console.error('[AnalyticsComponent] Demand forecast failed:', err);
      }
    });
  }

  loadExpirationRisks(): void {
    console.log('[AnalyticsComponent] Loading expiration risks...');
    this.analyticsService.getExpirationRisk().subscribe({
      next: (data) => {
        console.log('[AnalyticsComponent] Expiration data received:', data);
        this.expirationResume = data.resume;
        this.expirationProduits = data.produits || [];

        // Build doughnut chart from resume counts
        if (this.expirationResume) {
          const r = this.expirationResume;
          this.expChartData = {
            labels: ['OK', 'Attention', 'Risque Élevé', 'Expiré', 'Rupture'],
            datasets: [{
              data: [r.ok, r.attention, r.risqueEleve, r.expires, r.rupture],
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#991b1b', '#6b7280'],
              hoverBackgroundColor: ['#059669', '#d97706', '#dc2626', '#7f1d1d', '#4b5563'],
              borderWidth: 0
            }]
          };
        }
      },
      error: (err) => {
        console.error('[AnalyticsComponent] Expiration risk failed:', err);
      }
    });
  }

  seedData(): void {
    this.seeding = true;
    console.log('[AnalyticsComponent] Seeding demo data...');
    this.analyticsService.seedData().subscribe({
      next: (result) => {
        console.log('[AnalyticsComponent] Seed result:', result);
        this.seeding = false;
        // Reload everything
        this.loadAll();
      },
      error: (err) => {
        console.error('[AnalyticsComponent] Seed failed:', err);
        this.seeding = false;
      }
    });
  }

  // Helpers for template
  getUrgenceClass(urgence: string): string {
    return urgence === 'critique' ? 'badge-danger' : 'badge-warning';
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'OK': return 'status-ok';
      case 'ATTENTION': return 'status-warn';
      case 'RISQUE_ELEVÉ': return 'status-danger';
      case 'EXPIRE': return 'status-expired';
      case 'RUPTURE': return 'status-rupture';
      default: return '';
    }
  }
}
