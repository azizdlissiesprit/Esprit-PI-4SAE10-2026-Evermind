import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core'; // <--- Import ChangeDetectorRef
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { AlertService } from '../../../../core/services/alert.service';
import { PatientService } from '../../../../core/services/patient.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-alert-prediction',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './alert-prediction.html',
  styleUrls: ['./alert-prediction.scss']
})
export class AlertPredictionComponent implements OnInit {
  
  atRiskPatients: any[] = [];
  isLoading = true;

  // Chart Properties
  public scatterChartType: ChartType = 'scatter';
  
  public scatterChartData: ChartConfiguration<'scatter'>['data'] = {
    datasets: []
  };
  
  public scatterChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Sequence (Time)' } },
      y: { title: { display: true, text: 'Stability Index' }, min: 0 }
    }
  };

  constructor(
    private alertService: AlertService,
    private patientService: PatientService,
    private cd: ChangeDetectorRef, // <--- INJECT THIS
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPredictions();
    } else {
        this.isLoading = false;
    }
  }

  loadPredictions() {
    this.isLoading = true;

    this.patientService.getAll().subscribe({
        next: (patients) => {
            if (patients.length === 0) {
                this.isLoading = false;
                this.cd.detectChanges(); // Update View
                return;
            }

            const targetIds = patients.slice(0, 10).map(p => p.id); // Analyze first 10

            const requests = targetIds.map(id => 
                this.alertService.predictStability(id).pipe(
                    catchError(err => of(null))
                )
            );

            forkJoin(requests).subscribe({
                next: (results: any[]) => {
                    const validResults = results.filter(r => r !== null);

                    this.atRiskPatients = validResults.map(res => ({
                        ...res,
                        statusColor: res.stabilitySlope < -5 ? 'critical' : (res.stabilitySlope < 0 ? 'warning' : 'stable')
                    }));

                    this.updateChart(this.atRiskPatients);
                    
                    this.isLoading = false;
                    this.cd.detectChanges(); // <--- CRITICAL FIX: Force UI Update
                },
                error: (err) => {
                    console.error("Critical Error", err);
                    this.isLoading = false;
                    this.cd.detectChanges();
                }
            });
        },
        error: () => {
            this.isLoading = false;
            this.cd.detectChanges();
        }
    });
  }

  updateChart(predictions: any[]) {
    this.scatterChartData = {
        datasets: predictions.map((p, index) => ({
            label: `Patient #${p.patientId}`,
            data: [
                { x: 1, y: 100 }, 
                { x: 2, y: 100 + (p.stabilitySlope * 5) }, 
                { x: 3, y: 100 + (p.stabilitySlope * 10) }
            ],
            pointRadius: 6,
            borderColor: p.stabilitySlope < 0 ? '#ef4444' : '#10b981', 
            backgroundColor: p.stabilitySlope < 0 ? '#ef4444' : '#10b981',
            showLine: true
        }))
    };
  }
}
