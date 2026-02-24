import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import {
  Assessment,
  ChartDataPoint,
  AssessmentStats,
  DomainScore
} from '../../models/assessment.model';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

const CHART_WIDTH = 560;
const CHART_HEIGHT = 200;
const Y_MAX = 30;
const Y_MIN = 0;

function computeStats(assessments: Assessment[]): AssessmentStats {
  const n = assessments.length;
  if (n === 0) {
    return {
      totalCount: 0,
      averageMmse: 0,
      averageMoca: 0,
      byType: { initial: 0, complete: 0, 'follow-up': 0 },
      trendDistribution: { up: 0, down: 0, stable: 0 }
    };
  }
  const sumMmse = assessments.reduce((s, a) => s + a.mmseScore, 0);
  const sumMoca = assessments.reduce((s, a) => s + a.moocaScore, 0);
  const byType = { initial: 0, complete: 0, 'follow-up': 0 };
  const trendDistribution = { up: 0, down: 0, stable: 0 };
  assessments.forEach(a => {
    byType[a.type]++;
    trendDistribution[a.trend]++;
  });
  return {
    totalCount: n,
    averageMmse: Math.round((sumMmse / n) * 10) / 10,
    averageMoca: Math.round((sumMoca / n) * 10) / 10,
    byType,
    trendDistribution
  };
}

function assessmentsToChartData(assessments: Assessment[]): ChartDataPoint[] {
  return assessments
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(a => ({ date: a.date, mmse: a.mmseScore, mooca: a.moocaScore }));
}

function domainScoresFromAssessment(a: Assessment): DomainScore[] {
  const s = a.scores;
  const color = (v: number) => (v <= 3 ? '#ef4444' : v <= 6 ? '#f59e0b' : '#22c55e');
  return [
    { name: 'Memory', score: s.memory, maxScore: 10, percentage: (s.memory / 10) * 100, color: color(s.memory) },
    { name: 'Orientation', score: s.orientation, maxScore: 10, percentage: (s.orientation / 10) * 100, color: color(s.orientation) },
    { name: 'Language', score: s.language, maxScore: 10, percentage: (s.language / 10) * 100, color: color(s.language) },
    { name: 'Executive', score: s.executiveFunctions, maxScore: 10, percentage: (s.executiveFunctions / 10) * 100, color: color(s.executiveFunctions) }
  ];
}

@Component({
  selector: 'app-assessment-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconifyIconComponent],
  templateUrl: './assessment-analytics.component.html',
  styleUrls: ['./assessment-analytics.component.scss']
})
export class AssessmentAnalyticsComponent implements OnInit {
  assessments: Assessment[] = [];
  stats: AssessmentStats | null = null;
  chartData: ChartDataPoint[] = [];
  compareLeft: Assessment | null = null;
  compareRight: Assessment | null = null;
  compareLeftId: string = '';
  compareRightId: string = '';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private assessmentService: AssessmentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.assessmentService.getAllAssessments().subscribe({
      next: list => {
        this.assessments = list;
        this.stats = computeStats(list);
        this.chartData = assessmentsToChartData(list);
        this.syncCompareSelection();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load data from API. Is the backend running on port 8086?';
        this.isLoading = false;
      }
    });
  }

  private syncCompareSelection(): void {
    if (this.compareLeftId && !this.assessments.find(a => a.id === this.compareLeftId)) this.compareLeftId = '';
    if (this.compareRightId && !this.assessments.find(a => a.id === this.compareRightId)) this.compareRightId = '';
    this.compareLeft = this.compareLeftId ? this.assessments.find(a => a.id === this.compareLeftId) ?? null : null;
    this.compareRight = this.compareRightId ? this.assessments.find(a => a.id === this.compareRightId) ?? null : null;
  }

  onCompareLeftChange(id: string): void {
    this.compareLeftId = id;
    this.compareLeft = id ? this.assessments.find(a => a.id === id) ?? null : null;
  }

  onCompareRightChange(id: string): void {
    this.compareRightId = id;
    this.compareRight = id ? this.assessments.find(a => a.id === id) ?? null : null;
  }

  getOrderedChartData(): ChartDataPoint[] {
    return this.chartData.slice();
  }

  getMMSEPolylinePoints(data: ChartDataPoint[]): string {
    if (!data.length) return '';
    const n = data.length;
    const xStep = n > 1 ? CHART_WIDTH / (n - 1) : CHART_WIDTH / 2;
    return data.map((p, i) => {
      const x = n > 1 ? i * xStep : CHART_WIDTH / 2;
      const y = Math.max(0, Math.min(CHART_HEIGHT, ((Y_MAX - p.mmse) / (Y_MAX - Y_MIN)) * CHART_HEIGHT));
      return `${x},${y}`;
    }).join(' ');
  }

  getMoCAPolylinePoints(data: ChartDataPoint[]): string {
    if (!data.length) return '';
    const n = data.length;
    const xStep = n > 1 ? CHART_WIDTH / (n - 1) : CHART_WIDTH / 2;
    return data.map((p, i) => {
      const x = n > 1 ? i * xStep : CHART_WIDTH / 2;
      const y = Math.max(0, Math.min(CHART_HEIGHT, ((Y_MAX - p.mooca) / (Y_MAX - Y_MIN)) * CHART_HEIGHT));
      return `${x},${y}`;
    }).join(' ');
  }

  getChartDates(data: ChartDataPoint[]): string[] {
    return data.map(p => p.date);
  }

  getDomains(a: Assessment): DomainScore[] {
    return domainScoresFromAssessment(a);
  }

  typeLabel(type: string): string {
    return type === 'initial' ? 'Initial' : type === 'complete' ? 'Complete' : 'Follow-up';
  }
}
