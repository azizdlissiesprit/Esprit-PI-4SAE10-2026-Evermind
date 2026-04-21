import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SensorTrackingService, SensorReading, AbnormalEvent, SimulationStatus } from '../../../core/services/sensor-tracking.service';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Chart.js imports for ng2-charts
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-patient-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './patient-tracking.html',
  styleUrls: ['./patient-tracking.scss']
})
export class PatientTrackingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trackingService = inject(SensorTrackingService);
  private patientService = inject(PatientService);
  private cdr = inject(ChangeDetectorRef);
  private unsubscribe$ = new Subject<void>();
  private pollSubscription?: Subscription;

  patientId!: number;
  patient: Patient | null = null;
  
  // States
  isLoading = true;
  lastUpdated = new Date();
  
  // Data
  readings: SensorReading[] = [];
  events: AbnormalEvent[] = [];
  
  
  // Current exact status
  currentHeartRate: number | null = null;
  currentMotion: boolean = false;
  currentMedBox: boolean = false;
  currentLat: number | null = null;
  currentLon: number | null = null;
  isAnomalousState: boolean = false;

  // Geofence Constants (matching backend application.properties)
  readonly GEOFENCE_LAT = 36.8065;
  readonly GEOFENCE_LON = 10.1815;
  readonly GEOFENCE_RADIUS = 100; // meters
  
  // Marker UI Position (%)
  markerX: number = 50;
  markerY: number = 50;
  
  // --- Chart.js Configurations ---
  
  // 1. Heart Rate Chart
  public hrChartData: ChartData<'line'> = {
    labels: [], // Timestamps
    datasets: [
      {
        data: [],
        label: 'Heart Rate (BPM)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#EF4444',
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointRadius: 3,
        fill: true,
        tension: 0.4 // Smooth curves
      }
    ]
  };
  public hrChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { suggestedMin: 40, suggestedMax: 150 },
      x: { display: false } // Hide X axis labels for cleaner look
    }
  };
  
  // 2. Accelerometer Chart
  public accChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { data: [], label: 'X Axis', borderColor: '#4E80EE', pointRadius: 0, tension: 0.1, borderWidth: 1.5 },
      { data: [], label: 'Y Axis', borderColor: '#F59E0B', pointRadius: 0, tension: 0.1, borderWidth: 1.5 },
      { data: [], label: 'Z Axis (Gravity)', borderColor: '#10B981', pointRadius: 0, tension: 0.1, borderWidth: 1.5 }
    ]
  };
  public accChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } }
    },
    scales: {
      y: { // Normal G range is ~0.5 to 1.5. Spikes go to 3-5
        suggestedMin: -1, suggestedMax: 3 
      },
      x: { display: false }
    }
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.initialLoad();
      this.startPolling();
    } else {
      this.router.navigate(['/app/patients']);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  // Back button
  goBack(): void {
    this.router.navigate(['/app/patients']);
  }

  // Polling every 5 seconds
  startPolling(): void {
    this.pollSubscription = interval(5000)
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.trackingService.getReadingsForPatient(this.patientId).pipe(catchError(() => of([])))),
      )
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.processReadings(data);
          this.fetchEvents(); // Also fetch events
        }
      });
  }

  initialLoad(): void {
    this.isLoading = true;
    
    // 1. Fetch Patient Details for Baseline Coordinates
    this.patientService.getById(this.patientId).subscribe({
      next: (p) => {
        this.patient = p;
        this.cdr.detectChanges();
        
        // 2. ONLY AFTER PATIENT ARRIVES, Fetch Initial Readings
        this.loadReadings();
      },
      error: (err) => {
        console.error('Error loading patient details', err);
        // Fallback: load anyway with defaults
        this.loadReadings();
      }
    });

    this.fetchEvents();
  }

  private loadReadings(): void {
    this.trackingService.getReadingsForPatient(this.patientId).subscribe({
      next: (data) => {
        console.log(`✅ Received ${data.length} readings from backend:`, data);
        this.processReadings(data);
        this.isLoading = false;
        this.cdr.detectChanges(); // FORCE UI UPDATE
      },
      error: (err) => {
        console.error('Error loading readings', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchEvents(): void {
    this.trackingService.getEventsForPatient(this.patientId).subscribe({
      next: (evts) => {
        this.events = evts;
        this.cdr.detectChanges(); // FORCE UI UPDATE
      }
    });
  }

  // Process data for charts and current status
  processReadings(rawReadings: SensorReading[]): void {
    if (!rawReadings || rawReadings.length === 0) return;
    
    // Sort chronological for charts (oldest to newest)
    const sorted = [...rawReadings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Filter out nulls
    const hrReadings = sorted.filter(r => r.heartRate != null);
    const accReadings = sorted.filter(r => r.accelerationX != null);
    const motionReadings = sorted.filter(r => r.motionDetected != null);
    const medReadings = sorted.filter(r => r.medicationBoxOpened != null);
    const gpsReadings = sorted.filter(r => r.latitude != null && r.longitude != null);

    // Update Heart Rate Chart
    this.hrChartData.labels = hrReadings.map(r => this.extractTime(r.timestamp));
    this.hrChartData.datasets[0].data = hrReadings.map(r => r.heartRate!);
    
    // Update Accel Chart
    this.accChartData.labels = accReadings.map(r => this.extractTime(r.timestamp));
    this.accChartData.datasets[0].data = accReadings.map(r => r.accelerationX!);
    this.accChartData.datasets[1].data = accReadings.map(r => r.accelerationY!);
    this.accChartData.datasets[2].data = accReadings.map(r => r.accelerationZ!);
    
    // Update Chart Instances - ng2-charts re-renders if the array reference changes
    this.hrChartData = { ...this.hrChartData };
    this.accChartData = { ...this.accChartData };

    // Update Current Status (Using the newest reading available for each type)
    if (hrReadings.length > 0) this.currentHeartRate = hrReadings[hrReadings.length - 1].heartRate!;
    if (motionReadings.length > 0) this.currentMotion = motionReadings[motionReadings.length - 1].motionDetected!;
    if (medReadings.length > 0) this.currentMedBox = medReadings[medReadings.length - 1].medicationBoxOpened!;
    
    if (gpsReadings.length > 0) {
      this.currentLat = gpsReadings[gpsReadings.length - 1].latitude!;
      this.currentLon = gpsReadings[gpsReadings.length - 1].longitude!;
      this.updateMarkerPosition(this.currentLat, this.currentLon);
    }
    
    // Overall Risk Status: If the absolute newest message was anomalous
    this.isAnomalousState = sorted[sorted.length - 1].isAnomalous;
    
    this.lastUpdated = new Date();
    this.cdr.detectChanges(); // FORCE UI UPDATE
  }

  // Calculate position on the map (window scaled to patient's geofence)
  private updateMarkerPosition(lat: number, lon: number): void {
    // Zoom level: Show the geofence plus a 50% margin
    const radius = this.patient?.geofenceRadius || 100;
    const displayHalfWidth = radius * 1.5; 
    
    // Approx scaling for Tunis area (36.8 N)
    const metersPerLat = 111111;
    const metersPerLon = 89000; 

    // Use patient's unique baseline or fallback to default
    const baseLat = this.patient?.baseLatitude || this.GEOFENCE_LAT;
    const baseLon = this.patient?.baseLongitude || this.GEOFENCE_LON;

    const dLat = (lat - baseLat) * metersPerLat;
    const dLon = (lon - baseLon) * metersPerLon;

    // Convert to percentage (0 to 100) where 50 is center
    this.markerX = 50 + (dLon / (displayHalfWidth * 2)) * 100;
    this.markerY = 50 - (dLat / (displayHalfWidth * 2)) * 100; // Y is inverted in CSS

    // Clamp values to keep dot on screen
    this.markerX = Math.max(2, Math.min(98, this.markerX));
    this.markerY = Math.max(2, Math.min(98, this.markerY));
  }

  getGeofenceSize(): string {
    // If zoom is always 1.5 * radius, the circle diameter is always 66.6% (1/1.5)
    return '66.6%';
  }

  // Helpers
  private extractTime(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  }

  getTimeAgo(dateStr: string): string {
    const ms = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  getSeverityIcon(eventType: string): string {
    switch(eventType) {
      case 'FALL': return 'fa-person-falling';
      case 'CARDIAC_ANOMALY': return 'fa-heart-crack';
      case 'GEOFENCE_BREACH': return 'fa-person-walking-arrow-right';
      case 'MISSED_MEDICATION': return 'fa-pills';
      case 'PROLONGED_INACTIVITY': return 'fa-bed';
      default: return 'fa-triangle-exclamation';
    }
  }
  
  getSeverityColorClass(eventType: string): string {
    switch(eventType) {
      case 'FALL':
      case 'CARDIAC_ANOMALY': 
      case 'SOS_TRIGGERED':
        return 'dot-red';
      case 'GEOFENCE_BREACH': 
        return 'dot-orange';
      default: 
        return 'dot-blue';
    }
  }
}
