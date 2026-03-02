import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Patient, AutonomyAssessment, AutonomyChartPoint } from '../../../../core/models/assessment.models';
import { AutonomyService } from '../service/autonomy.service';
import { AutonomyPdfExportService } from '../../../../core/services/autonomy-pdf-export.service';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

const CHART_WIDTH = 720;
const CHART_HEIGHT = 160;
const Y_MAX = 25;

@Component({
  selector: 'app-autonomy-dashboard',
  standalone: true,
  imports: [CommonModule, IconifyIconComponent],
  templateUrl: './autonomy-dashboard.html',
  styleUrls: ['./autonomy-dashboard.scss']
})
export class AutonomyDashboardComponent implements OnInit {
  patient$!: Observable<Patient>;
  assessments$!: Observable<AutonomyAssessment[]>;
  chartData$!: Observable<AutonomyChartPoint[]>;
  latestAssessment$!: Observable<AutonomyAssessment | undefined>;
  patientId = '';
  showDeclineAlert = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autonomyService: AutonomyService,
    private pdfExport: AutonomyPdfExportService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || 'P-2024-8921';
    this.patient$ = this.autonomyService.getPatient(this.patientId);
    this.assessments$ = this.autonomyService.getAssessments(this.patientId);
    this.chartData$ = this.autonomyService.getChartData(this.patientId);
    this.latestAssessment$ = this.assessments$.pipe(
      switchMap(list => {
        if (!list || list.length === 0) {
          this.showDeclineAlert = false;
          return of(undefined);
        }
        const latest = list[0];
        this.showDeclineAlert = latest.trend === 'down' && (latest.trendPoints ?? 0) <= -1;
        return of(latest);
      })
    );
  }

  exportPDF(): void {
    this.patient$.subscribe(p => {
      this.assessments$.subscribe(list => this.pdfExport.exportToPDF(p, list));
    });
  }

  printAssessment(): void {
    window.print();
  }

  onEditRecord(): void {
    this.latestAssessment$.pipe(take(1)).subscribe(a => {
      if (a) this.router.navigate(['/app/patients', this.patientId, 'autonomy', a.id, 'edit']);
      else this.router.navigate(['/app/patients', this.patientId, 'autonomy', 'new']);
    });
  }

  onNewAssessment(): void {
    this.router.navigate(['/app/patients', this.patientId, 'autonomy', 'new']);
  }

  onViewAssessment(id: string): void {
    this.router.navigate(['/app/patients', this.patientId, 'autonomy']);
  }

  onEditAssessment(id: string): void {
    this.router.navigate(['/app/patients', this.patientId, 'autonomy', id, 'edit']);
  }

  onExportAssessmentPDF(assessmentId: string): void {
    this.patient$.subscribe(p => {
      this.assessments$.subscribe(list => {
        const one = list.find(a => a.id === assessmentId);
        if (one) this.pdfExport.exportToPDF(p, [one]);
      });
    });
  }

  onUpdateCarePlan(): void {
    this.latestAssessment$.pipe(take(1)).subscribe(a => {
      if (a) this.router.navigate(['/app/patients', this.patientId, 'autonomy', a.id, 'edit']);
      else this.router.navigate(['/app/patients', this.patientId, 'autonomy', 'new']);
    });
  }

  getTrendIcon(trend: string): string {
    return trend === 'up' ? 'lucide:trending-up' : trend === 'down' ? 'lucide:trending-down' : 'lucide:minus';
  }

  getTrendClass(trend: string): string {
    return trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-stable';
  }

  /** Radar: 5 axes (pentagon), each score 0-5 -> radius factor 0-1. Center 80,80, max r 48. */
  getRadarPoints(scores: { hygiene: number; feeding: number; dressing: number; mobility: number; communication: number }): string {
    const cx = 80, cy = 80, r = 48;
    const axes = [
      { angle: -90 },           // top: hygiene
      { angle: -18 },          // top-right: feeding
      { angle: 54 },           // bottom-right: dressing
      { angle: 126 },          // bottom-left: mobility
      { angle: 198 }           // top-left: communication
    ];
    const values = [scores.hygiene / 5, scores.feeding / 5, scores.dressing / 5, scores.mobility / 5, scores.communication / 5];
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const points = axes.map((ax, i) => {
      const rr = r * values[i];
      const x = cx + rr * Math.cos(rad(ax.angle));
      const y = cy + rr * Math.sin(rad(ax.angle));
      return `${x},${y}`;
    });
    return points.join(' ');
  }

  getChartPolyline(data: AutonomyChartPoint[]): string {
    if (!data || data.length === 0) return '';
    const ordered = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));
    const n = ordered.length;
    const xStep = n > 1 ? (CHART_WIDTH - 120) / (n - 1) : 300;
    const x0 = 100;
    return ordered.map((p, i) => {
      const x = x0 + i * xStep;
      const y = 20 + ((Y_MAX - p.totalScore) / Y_MAX) * (CHART_HEIGHT - 40);
      return `${x},${y}`;
    }).join(' ');
  }

  getChartDates(data: AutonomyChartPoint[]): string[] {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => (a.date > b.date ? 1 : -1)).map(p => p.date);
  }

  getScoreColor(score: number, max: number): string {
    const pct = (score / max) * 100;
    if (pct <= 40) return 'var(--danger)';
    if (pct <= 70) return 'var(--warning)';
    return 'var(--success)';
  }
}
