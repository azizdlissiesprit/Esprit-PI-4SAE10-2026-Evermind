import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Patient, Assessment, ChartDataPoint, DomainScore } from '../../../../core/models/assessment.models';

const CHART_WIDTH = 500;
const CHART_HEIGHT = 160;
const Y_MAX = 30;
const Y_MIN = 0;
import { AssessmentService } from '../service/assessment.service';
import { PdfExportService } from '../../../../core/services/pdf-export.service';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-cognitive-assessments',
  templateUrl: './cognitive-dashboard.html',
  styleUrls: ['./cognitive-dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IconifyIconComponent
  ]
})
export class CognitiveAssessmentsComponent implements OnInit {
  patient$!: Observable<Patient>;
  assessments$!: Observable<Assessment[]>;
  chartData$!: Observable<ChartDataPoint[]>;
  domainScores$: Observable<DomainScore[]> = of([]);
  latestAssessment$!: Observable<Assessment | undefined>;
  
  patientId: string = '';
  showDeclineAlert: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || 'P-2024-8921';
    
    this.patient$ = this.assessmentService.getPatient(this.patientId);
    this.assessments$ = this.assessmentService.getAssessments(this.patientId);
    this.chartData$ = this.assessmentService.getChartData(this.patientId);
    
    this.latestAssessment$ = this.assessments$.pipe(
      switchMap(assessments => {
        if (!assessments || assessments.length === 0) {
          this.showDeclineAlert = false;
          return of(undefined);
        }

        const latest = assessments[0];

        if (latest.trend === 'down' && latest.trendPoints && latest.trendPoints <= -3) {
          this.showDeclineAlert = true;
        } else {
          this.showDeclineAlert = false;
        }

        return this.assessmentService.getAssessment(latest.id);
      })
    );

    this.latestAssessment$.subscribe(assessment => {
      if (assessment) {
        this.domainScores$ = this.assessmentService.getDomainScores(assessment.id);
      }
    });
  }

  onViewDetails(assessmentId: string): void {
    this.router.navigate(['/app/patients', this.patientId, 'cognitive-assessments', assessmentId]);
  }

  onUpdateAssessment(assessmentId: string): void {
    this.router.navigate(['/app/patients', this.patientId, 'cognitive-assessments', assessmentId, 'edit']);
  }

  onDeleteAssessment(assessmentId: string): void {
    if (confirm('Are you sure you want to delete this assessment?')) {
      this.assessmentService.deleteAssessment(assessmentId).subscribe(success => {
        if (success) {
          this.assessments$ = this.assessmentService.getAssessments(this.patientId);
        }
      });
    }
  }

  onNewAssessment(): void {
    this.router.navigate(['/app/patients', this.patientId, 'cognitive-assessments', 'new']);
  }

  onExportAssessmentPDF(assessmentId: string): void {
    this.patient$.subscribe(patient => {
      this.assessments$.subscribe(assessments => {
        const selected = assessments.find(a => a.id === assessmentId);
        if (selected) {
          this.pdfExportService.exportAssessmentToPDF(patient, [selected]);
        }
      });
    });
  }

  exportPDF(): void {
    this.patient$.subscribe(patient => {
      this.assessments$.subscribe(assessments => {
        this.pdfExportService.exportAssessmentToPDF(patient, assessments);
      });
    });
  }

  printAssessment(): void {
    window.print();
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'minus';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-stable';
    }
  }

  /** Chart data ordered oldest-first for drawing (left to right). */
  getChartDataOrdered(data: ChartDataPoint[]): ChartDataPoint[] {
    if (!data || data.length === 0) return [];
    return data.slice().reverse();
  }

  /** SVG polyline points for MMSE (x,y pairs, Y inverted: 30=top, 0=bottom). */
  getMMSEPolylinePoints(data: ChartDataPoint[]): string {
    const ordered = this.getChartDataOrdered(data);
    if (ordered.length === 0) return '';
    const n = ordered.length;
    const xStep = n > 1 ? CHART_WIDTH / (n - 1) : CHART_WIDTH / 2;
    return ordered.map((p, i) => {
      const x = n > 1 ? i * xStep : CHART_WIDTH / 2;
      const y = Math.max(0, Math.min(CHART_HEIGHT, ((Y_MAX - p.mmse) / (Y_MAX - Y_MIN)) * CHART_HEIGHT));
      return `${x},${y}`;
    }).join(' ');
  }

  /** SVG polyline points for MoCA. */
  getMoCAPolylinePoints(data: ChartDataPoint[]): string {
    const ordered = this.getChartDataOrdered(data);
    if (ordered.length === 0) return '';
    const n = ordered.length;
    const xStep = n > 1 ? CHART_WIDTH / (n - 1) : CHART_WIDTH / 2;
    return ordered.map((p, i) => {
      const x = n > 1 ? i * xStep : CHART_WIDTH / 2;
      const y = Math.max(0, Math.min(CHART_HEIGHT, ((Y_MAX - p.mooca) / (Y_MAX - Y_MIN)) * CHART_HEIGHT));
      return `${x},${y}`;
    }).join(' ');
  }

  /** X-axis labels from chart data (oldest to newest). */
  getChartDates(data: ChartDataPoint[]): string[] {
    return this.getChartDataOrdered(data).map(p => p.date);
  }
}
