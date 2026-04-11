import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
// 👇 Import catchError and of
import { forkJoin, of } from 'rxjs'; 
import { catchError } from 'rxjs/operators';

import { CognitiveService } from '../../core/services/cognitive.service';
import { AutonomyService } from '../../core/services/autonomy.service';
import { CognitiveAssessment, AutonomyAssessment } from '../../core/models/assessment.models';

@Component({
  selector: 'app-patient-assessments',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './patient-assessments.html',
  styleUrls: ['./patient-assessments.scss']
})
export class PatientAssessmentsComponent implements OnInit {
  activeTab: 'COGNITIVE' | 'AUTONOMY' = 'COGNITIVE';
  isLoading = true;

  // State
  availablePatients: string[] = [];
  selectedPatientId: string = '';

  // Data
  cognitiveHistory: CognitiveAssessment[] = [];
  latestAutonomy: AutonomyAssessment | null = null;
  recommendedDevices: string[] = [];

  // Chart Config (Standard)
  public lineChartType: 'line' = 'line';
  public radarChartType: 'radar' = 'radar';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [], label: 'MMSE Score', fill: true, tension: 0.4,
      borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)',
      pointBackgroundColor: '#fff', pointBorderColor: '#4f46e5'
    }]
  };
  
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { min: 0, max: 30 }, x: { display: false } },
    plugins: { legend: { display: false } }
  };

  public radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Hygiene', 'Feeding', 'Dressing', 'Mobility', 'Comm.'],
    datasets: [{
      data: [0, 0, 0, 0, 0], label: 'Independence', fill: true,
      backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981',
      pointBackgroundColor: '#10b981', pointBorderColor: '#fff',
    }]
  };
  
  public radarChartOptions: ChartOptions<'radar'> = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { suggestedMin: 0, suggestedMax: 10, pointLabels: { font: { size: 11 } } } }
  };

  constructor(
    private cogService: CognitiveService,
    private autoService: AutonomyService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePatientList();
    } else {
      this.isLoading = false;
    }
  }

  initializePatientList() {
    this.isLoading = true;
    
    // 1. Fetch List. If one service fails completely, we still want to try the other.
    forkJoin({
      cogs: this.cogService.getAll().pipe(catchError(() => of([]))), // Return [] on error
      autos: this.autoService.getAll().pipe(catchError(() => of([]))) // Return [] on error
    }).subscribe({
      next: (res) => {
        const cogs = res.cogs || [];
        const autos = res.autos || [];

        const uniqueIds = new Set([
          ...cogs.map(c => String(c.patientId)),
          ...autos.map(a => String(a.patientId))
        ]);
        
        this.availablePatients = Array.from(uniqueIds);

        if (this.availablePatients.length > 0) {
          this.selectedPatientId = this.availablePatients[0];
          this.loadPatientData(this.selectedPatientId);
        } else {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      }
    });
  }

  onPatientChange() {
    if (this.selectedPatientId) {
      this.loadPatientData(this.selectedPatientId);
    }
  }

  refreshPatientData() {
    if (this.selectedPatientId) {
      this.loadPatientData(this.selectedPatientId);
    }
  }

  loadPatientData(id: string) {
    this.isLoading = true;
    console.log(`Loading data for Patient ${id}...`);

    // 2. Fetch Details. CRITICAL FIX: Handle 404s gracefully
    forkJoin({
      // If Cognitive fetch fails, return empty array []
      cognitive: this.cogService.getByPatientId(id).pipe(
        catchError(err => {
          console.warn(`Cognitive fetch failed for ${id}`, err);
          return of([]); 
        })
      ),
      // If Autonomy fetch fails, return empty array []
      autonomy: this.autoService.getByPatientId(id).pipe(
        catchError(err => {
          console.warn(`Autonomy fetch failed for ${id}`, err);
          return of([]); 
        })
      )
    }).subscribe({
      next: (results) => {
        console.log(`Data received for ${id}`, results);

        // --- Process Cognitive ---
        // Cast as Array to be safe
        const cogs = (results.cognitive as CognitiveAssessment[]) || [];
        
        if (cogs.length > 0) {
            // Sort by date descending to get the latest assessment first
            this.cognitiveHistory = cogs.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            this.lineChartData.labels = this.cognitiveHistory.map(a => a.date);
            this.lineChartData.datasets[0].data = this.cognitiveHistory.map(a => a.mmseScore);
            this.lineChartData = { ...this.lineChartData };
        } else {
            this.cognitiveHistory = [];
            this.lineChartData.datasets[0].data = [];
            this.lineChartData.labels = [];
        }

        // --- Process Autonomy ---
        const autos = (results.autonomy as AutonomyAssessment[]) || [];
        
        if (autos.length > 0) {
          this.latestAutonomy = autos.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          
          const s = this.latestAutonomy.scores;
          this.radarChartData.datasets[0].data = [s.hygiene, s.feeding, s.dressing, s.mobility, s.communication];
          this.radarChartData = { ...this.radarChartData };
          
          if (this.latestAutonomy.recommendedDevicesJson) {
            try { this.recommendedDevices = JSON.parse(this.latestAutonomy.recommendedDevicesJson); } 
            catch { this.recommendedDevices = []; }
          }
        } else {
          this.latestAutonomy = null;
          this.radarChartData.datasets[0].data = [0,0,0,0,0];
          this.recommendedDevices = [];
        }

        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        // This block runs only if there is a catastrophic error not caught by pipe()
        console.error("Critical Error:", err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // Helpers
  getCognitiveStatus(score: number): { label: string, color: string } {
    if (score >= 24) return { label: 'Normal Cognition', color: 'text-green' };
    if (score >= 19) return { label: 'Mild Impairment', color: 'text-orange' };
    return { label: 'Severe Impairment', color: 'text-red' };
  }

  getDetailedCognitiveState(score: number): string {
    if (score >= 27) return 'Fonctionnement normal';
    if (score >= 24) return 'Légère altération cognitive';
    if (score >= 20) return 'Déclin cognitif modéré';
    if (score >= 17) return 'Déclin cognitif sévère';
    if (score >= 10) return 'Démence modérée';
    return 'Démence sévère';
  }

  getCognitiveRecommendation(score: number): string {
    if (score >= 24) return 'Surveillance annuelle recommandée';
    if (score >= 19) return 'Réévaluation tous les 6 mois';
    if (score >= 10) return 'Suivi mensuel et soutien intensif';
    return 'Soins palliatifs et assistance complète';
  }

  getMoCAStatus(score: number): { label: string, color: string } {
    if (score >= 26) return { label: 'Normal', color: 'text-green' };
    if (score >= 22) return { label: 'Mild', color: 'text-orange' };
    if (score >= 17) return { label: 'Moderate', color: 'text-red' };
    return { label: 'Severe', color: 'text-red' };
  }

  getExecutiveFunctionLevel(score: number): string {
    if (score >= 26) return 'Excellentes';
    if (score >= 22) return 'Légèrement altérées';
    if (score >= 17) return 'Modérément altérées';
    if (score >= 10) return 'Sévèrement altérées';
    return 'Très sévèrement altérées';
  }

  getAutonomyRisk(mobilityScore: number): boolean {
    return mobilityScore < 5;
  }
}