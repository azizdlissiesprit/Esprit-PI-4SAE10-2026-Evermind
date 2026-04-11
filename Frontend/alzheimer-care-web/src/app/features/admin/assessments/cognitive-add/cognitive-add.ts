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
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: [AssessmentType.INITIAL, Validators.required],
      evaluator: ['', Validators.required],
      mmseScore: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      moocaScore: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      trend: [TrendType.STABLE, Validators.required],
      observations: ['', [Validators.required, Validators.minLength(12)]],
      // Nested Embeddable Scores
      scores: this.fb.group({
        memory: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
        orientation: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
        language: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
        executiveFunctions: [0, [Validators.required, Validators.min(0), Validators.max(10)]]
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
    } else {
      const patientId = this.route.snapshot.queryParamMap.get('patientId');
      if (patientId) {
        this.form.patchValue({ patientId });
      }
    }

    const scoresGroup = this.form.get('scores');
    scoresGroup?.valueChanges.subscribe(() => {
      const total = this.computeTotalFromDomains();
      this.form.patchValue(
        { mmseScore: total, moocaScore: total },
        { emitEvent: false }
      );
    });
    const initialTotal = this.computeTotalFromDomains();
    this.form.patchValue({ mmseScore: initialTotal, moocaScore: initialTotal }, { emitEvent: false });
  }

  // Helper methods for template
  getDomainScoreError(domain: string): string {
    const scores = this.form.get('scores')?.value;
    if (!scores || !scores[domain]) {
      return 'Score requis pour ce domaine';
    }
    const score = scores[domain];
    if (score < 0 || score > 30) {
      return 'Score invalide (0-30)';
    }
    return '';
  }

  computeTotalFromDomains(): number {
    const scores = this.form.get('scores')?.value || {};
    let total = 0;
    Object.values(scores).forEach((score) => {
      total += (score as number) || 0;
    });
    return total;
  }

  hasTotalScoreError(): boolean {
    const mmseScore = this.form.get('mmseScore')?.value;
    const moocaScore = this.form.get('moocaScore')?.value;
    return mmseScore < 0 || mmseScore > 30 || moocaScore < 0 || moocaScore > 30;
  }

  getTotalScoreError(): string {
    const mmseScore = this.form.get('mmseScore')?.value;
    const moocaScore = this.form.get('moocaScore')?.value;
    if (mmseScore < 0 || mmseScore > 30 || moocaScore < 0 || moocaScore > 30) {
      return 'Les scores doivent être entre 0 et 30';
    }
    return '';
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