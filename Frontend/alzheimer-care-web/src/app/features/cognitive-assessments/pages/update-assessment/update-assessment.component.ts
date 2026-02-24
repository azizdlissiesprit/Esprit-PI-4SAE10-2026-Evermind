import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Assessment } from '../../models/assessment.model';
import { AssessmentService } from '../../services/assessment.service';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-update-assessment',
  templateUrl: './update-assessment.component.html',
  styleUrls: ['./update-assessment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconifyIconComponent
  ]
})
export class UpdateAssessmentComponent implements OnInit {
  assessment$!: Observable<Assessment | undefined>;
  isEditMode: boolean = false;
  patientId: string = '';
  assessmentId: string = '';

  assessmentForm = {
    date: '',
    type: 'complete' as 'initial' | 'complete' | 'follow-up',
    evaluator: '',
    mmseScore: 0,
    moocaScore: 0,
    scores: {
      memory: 0,
      orientation: 0,
      language: 0,
      executiveFunctions: 0
    },
    observations: ''
  };

  submitting = false;
  apiError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || 'P-2024-8921';
    this.assessmentId = this.route.snapshot.paramMap.get('assessmentId') || '';

    // If there is no assessmentId in the route, we are in "new" mode
    this.isEditMode = !!this.assessmentId;

    if (!this.isEditMode) {
      this.initializeNewAssessment();
      return;
    }

    this.assessment$ = this.assessmentService.getAssessment(this.assessmentId);
    this.assessment$.subscribe(assessment => {
      if (assessment) {
        this.assessmentForm = {
          date: assessment.date,
          type: assessment.type,
          evaluator: assessment.evaluator,
          mmseScore: assessment.mmseScore,
          moocaScore: assessment.moocaScore,
          scores: assessment.scores,
          observations: assessment.observations
        };
        this.updateScoresFromDomains();
      }
    });
  }

  initializeNewAssessment(): void {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
    
    this.assessmentForm = {
      date: formattedDate,
      type: 'complete',
      evaluator: 'Dr. Claire Moreau',
      mmseScore: 0,
      moocaScore: 0,
      scores: {
        memory: 0,
        orientation: 0,
        language: 0,
        executiveFunctions: 0
      },
      observations: ''
    };
    this.updateScoresFromDomains();
  }

  onSubmit(): void {
    this.apiError = null;
    this.submitting = true;
    const assessmentData: Assessment = {
      id: this.assessmentId,
      ...this.assessmentForm,
      patientId: this.patientId,
      trend: this.calculateTrend(),
      trendPoints: this.calculateTrendPoints()
    };

    if (this.isEditMode) {
      this.assessmentService.updateAssessment(assessmentData).subscribe({
        next: result => {
          this.submitting = false;
          if (result) {
            this.router.navigate(['/app/patients', this.patientId, 'cognitive-assessments']);
          } else {
            this.apiError = 'Erreur lors de la mise à jour. Vérifiez que le backend est démarré (port 8086).';
          }
        },
        error: () => {
          this.submitting = false;
          this.apiError = 'Erreur réseau ou backend indisponible (port 8086).';
        }
      });
    } else {
      const { id, ...newAssessmentData } = assessmentData;
      this.assessmentService.createAssessment(newAssessmentData).subscribe({
        next: result => {
          this.submitting = false;
          if (result) {
            // Redirection vers la liste : la nouvelle évaluation est en base et s'affichera au chargement
            this.router.navigate(['/app/cognitive-assessments-list']);
          } else {
            this.apiError = 'Erreur lors de la création. Vérifiez que le backend est démarré (port 8086).';
          }
        },
        error: () => {
          this.submitting = false;
          this.apiError = 'Erreur réseau ou backend indisponible (port 8086).';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/app/patients', this.patientId, 'cognitive-assessments']);
  }

  calculateTrend(): 'up' | 'down' | 'stable' {
    // This would normally compare with previous assessment
    // For now, we'll use a simple logic based on scores
    if (this.assessmentForm.mmseScore > 20) return 'stable';
    if (this.assessmentForm.mmseScore < 15) return 'down';
    return 'stable';
  }

  calculateTrendPoints(): number {
    // This would normally calculate the difference from previous assessment
    // For now, we'll return 0
    return 0;
  }

  /** Compute MMSE (0-30) from domain scores (each 0-10). Formula: sum/40*30. */
  private computeMMSE(): number {
    const s = this.assessmentForm.scores;
    const sum = s.memory + s.orientation + s.language + s.executiveFunctions;
    return Math.round((sum / 40) * 30);
  }

  /** Compute MoCA (0-30) from domain scores with slight weight variation vs MMSE. */
  private computeMoCA(): number {
    const s = this.assessmentForm.scores;
    const weighted = s.memory * 0.95 + s.orientation * 0.95 + s.language * 1.05 + s.executiveFunctions * 1.05;
    return Math.min(30, Math.round((weighted / 40) * 30));
  }

  /** Update MMSE and MoCA from domain scores (auto-generated). */
  private updateScoresFromDomains(): void {
    this.assessmentForm.mmseScore = this.computeMMSE();
    this.assessmentForm.moocaScore = this.computeMoCA();
  }

  onScoreChange(field: string, value: number): void {
    const num = typeof value === 'string' ? parseInt(String(value), 10) : value;
    if (isNaN(num)) return;
    if (field === 'memory' || field === 'orientation' || field === 'language' || field === 'executiveFunctions') {
      (this.assessmentForm.scores as any)[field] = Math.min(10, Math.max(0, num));
      this.updateScoresFromDomains();
    } else if (field === 'mmseScore' || field === 'moocaScore') {
      (this.assessmentForm as any)[field] = Math.min(30, Math.max(0, num));
    }
  }

  getScoreColor(score: number, maxScore: number = 10): string {
    const percentage = (score / maxScore) * 100;
    if (percentage <= 30) return '#ef4444';
    if (percentage <= 60) return '#f59e0b';
    return '#22c55e';
  }

  getScorePercentage(score: number, maxScore: number = 10): number {
    return (score / maxScore) * 100;
  }

  // Helper methods to avoid type issues in template
  getDomainScore(domain: string): number {
    switch (domain) {
      case 'memory': return this.assessmentForm.scores.memory;
      case 'orientation': return this.assessmentForm.scores.orientation;
      case 'language': return this.assessmentForm.scores.language;
      case 'executiveFunctions': return this.assessmentForm.scores.executiveFunctions;
      default: return 0;
    }
  }

  setDomainScore(domain: string, value: number): void {
    const num = typeof value === 'string' ? parseInt(String(value), 10) : value;
    if (isNaN(num)) return;
    const clamped = Math.min(10, Math.max(0, num));
    switch (domain) {
      case 'memory': this.assessmentForm.scores.memory = clamped; break;
      case 'orientation': this.assessmentForm.scores.orientation = clamped; break;
      case 'language': this.assessmentForm.scores.language = clamped; break;
      case 'executiveFunctions': this.assessmentForm.scores.executiveFunctions = clamped; break;
    }
    this.updateScoresFromDomains();
  }

  /** Validation: date format DD/MM/YYYY */
  isValidDate(dateStr: string): boolean {
    if (!dateStr?.trim()) return false;
    const ddmmyyyy = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!ddmmyyyy.test(dateStr.trim())) return false;
    const [d, m, y] = dateStr.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  isFormValid(): boolean {
    if (!this.assessmentForm.date?.trim() || !this.assessmentForm.evaluator?.trim()) return false;
    if (!this.isValidDate(this.assessmentForm.date)) return false;
    if (this.getDateError() || this.getEvaluatorError()) return false;
    
    const s = this.assessmentForm.scores;
    const validScores = [s.memory, s.orientation, s.language, s.executiveFunctions]
      .every(v => Number.isInteger(v) && v >= 0 && v <= 10);
    
    return validScores;
  }

  getDateError(): string | null {
    if (!this.assessmentForm.date?.trim()) return 'La date est requise.';
    if (!this.isValidDate(this.assessmentForm.date)) return 'Format attendu : JJ/MM/AAAA (ex. 24/02/2026).';
    return null;
  }

  getEvaluatorError(): string | null {
    if (!this.assessmentForm.evaluator?.trim()) return 'L\'évaluateur est requis.';
    if (this.assessmentForm.evaluator.trim().length < 2) return 'Saisir au moins 2 caractères.';
    if (this.assessmentForm.evaluator.trim().length > 100) return 'Maximum 100 caractères.';
    if (!/^[a-zA-Z\s\.\-]+$/.test(this.assessmentForm.evaluator.trim())) return 'Caractères invalides (lettres, espaces, points, tirets uniquement).';
    return null;
  }

  getScoreError(domain: string): string | null {
    const score = this.getDomainScore(domain);
    if (!Number.isInteger(score)) return 'Score doit être un entier.';
    if (score < 0 || score > 10) return 'Score doit être entre 0 et 10.';
    return null;
  }
}
