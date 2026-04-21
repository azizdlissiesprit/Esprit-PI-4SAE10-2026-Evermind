import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CognitiveService } from '../../../../core/services/cognitive.service';
import { AssessmentType, TrendType } from '../../../../core/models/assessment.models';

@Component({
  selector: 'app-cognitive-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cognitive-add.html',
  styleUrls: ['../../alerts-admin/alert-add/alert-add.scss'] // Reusing your existing CSS
})
export class CognitiveAddComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  id: number | null = null;

  // Dropdowns
  types = Object.values(AssessmentType);
  trends = Object.values(TrendType);

  constructor(
    private fb: FormBuilder,
    private service: CognitiveService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize Form with nested 'scores' group
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required], // Default to today
      type: [AssessmentType.INITIAL, Validators.required],
      evaluator: ['', Validators.required],
      mmseScore: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      moocaScore: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      trend: [TrendType.STABLE, Validators.required],
      observations: [''],
      // Nested Embeddable Scores
      scores: this.fb.group({
        memory: [0, Validators.required],
        orientation: [0, Validators.required],
        language: [0, Validators.required],
        executiveFunctions: [0, Validators.required]
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
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const request$ = this.isEditMode
      ? this.service.update(this.id!, this.form.value)
      : this.service.create(this.form.value);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/cognitive']),
      error: (err) => console.error('Save failed', err)
    });
  }
}
