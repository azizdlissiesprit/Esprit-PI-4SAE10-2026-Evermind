import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AutonomyService } from '../../../../core/services/autonomy.service';
import { TrendType } from '../../../../core/models/assessment.models';

@Component({
  selector: 'app-autonomy-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './autonomy-add.html',
  styleUrls: ['../../alerts-admin/alert-add/alert-add.scss']
})
export class AutonomyAddComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  id: number | null = null;
  trends = Object.values(TrendType);

  // Helper for Devices (User enters comma-separated list)
  deviceInput = ''; 

  constructor(
    private fb: FormBuilder,
    private service: AutonomyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      evaluator: ['', Validators.required],
      totalScore: [0, Validators.required],
      trend: [TrendType.STABLE, Validators.required],
      assistanceLevel: ['', Validators.required], // e.g., "Partial Assistance"
      observations: [''],
      // Nested Scores
      scores: this.fb.group({
        hygiene: [0, Validators.required],
        feeding: [0, Validators.required],
        dressing: [0, Validators.required],
        mobility: [0, Validators.required],
        communication: [0, Validators.required]
      })
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.id = +id;
      this.service.getById(this.id).subscribe(data => {
        this.form.patchValue(data);
        
        // Parse JSON for the UI input (convert ["Watch", "Sensor"] -> "Watch, Sensor")
        if (data.recommendedDevicesJson) {
          try {
            const devices = JSON.parse(data.recommendedDevicesJson);
            if (Array.isArray(devices)) {
              this.deviceInput = devices.join(', ');
            }
          } catch (e) {
            console.error('JSON Parse Error', e);
          }
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // Convert string input "Watch, Sensor" -> JSON String '["Watch", "Sensor"]'
    const deviceArray = this.deviceInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    formValue.recommendedDevicesJson = JSON.stringify(deviceArray);
    formValue.caregiverRecommendationsJson = "[]"; // Default empty if not used

    const request$ = this.isEditMode
      ? this.service.update(this.id!, formValue)
      : this.service.create(formValue);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/autonomy']),
      error: (err) => console.error('Save failed', err)
    });
  }
}