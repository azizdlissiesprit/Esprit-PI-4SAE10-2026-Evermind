import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AutonomyService } from '../../services/autonomy.service';
import { AutonomyAssessment, AutonomyScores } from '../../models/autonomy.model';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-update-autonomy',
  standalone: true,
  imports: [CommonModule, FormsModule, IconifyIconComponent],
  templateUrl: './update-autonomy.component.html',
  styleUrls: ['./update-autonomy.component.scss']
})
export class UpdateAutonomyComponent implements OnInit {
  isEditMode = false;
  patientId = '';
  assessmentId = '';
  form: {
    date: string;
    evaluator: string;
    scores: AutonomyScores;
    assistanceLevel: string;
    observations: string;
    recommendedDevicesStr: string;
    caregiverRecommendationsStr: string;
  } = {
    date: '',
    evaluator: '',
    scores: { hygiene: 0, feeding: 0, dressing: 0, mobility: 0, communication: 0 },
    assistanceLevel: 'Partial / Moderate',
    observations: '',
    recommendedDevicesStr: '',
    caregiverRecommendationsStr: ''
  };

  domainKeys: (keyof AutonomyScores)[] = ['hygiene', 'feeding', 'dressing', 'mobility', 'communication'];

  submitting = false;
  apiError: string | null = null;

  get totalScore(): number {
    const s = this.form.scores;
    return s.hygiene + s.feeding + s.dressing + s.mobility + s.communication;
  }

  getDomainLabel(domain: keyof AutonomyScores): string {
    const labels: Record<keyof AutonomyScores, string> = {
      hygiene: 'Personal Hygiene',
      feeding: 'Feeding',
      dressing: 'Dressing',
      mobility: 'Mobility / Movement',
      communication: 'Communication'
    };
    return labels[domain];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autonomyService: AutonomyService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || 'P-2024-8921';
    this.assessmentId = this.route.snapshot.paramMap.get('assessmentId') || '';
    this.isEditMode = !!this.assessmentId && this.assessmentId !== 'new' && this.assessmentId !== 'edit';

    if (!this.isEditMode) {
      const today = new Date();
      this.form.date = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
      this.form.evaluator = 'Dr. Claire Moreau';
      return;
    }

    this.autonomyService.getAssessment(this.assessmentId).subscribe(a => {
      if (a) {
        this.form.date = a.date;
        this.form.evaluator = a.evaluator;
        this.form.scores = { ...a.scores };
        this.form.assistanceLevel = a.assistanceLevel;
        this.form.observations = a.observations || '';
        this.form.recommendedDevicesStr = (a.recommendedDevices || []).join('\n');
        this.form.caregiverRecommendationsStr = (a.caregiverRecommendations || []).join('\n');
      }
    });
  }

  setScore(domain: keyof AutonomyScores, value: number): void {
    const n = Math.min(5, Math.max(0, Number(value)));
    this.form.scores[domain] = n;
  }

  getScorePct(score: number, max: number): number {
    return (score / max) * 100;
  }

  getScoreColor(score: number, max: number): string {
    const pct = (score / max) * 100;
    if (pct <= 40) return '#ef4444';
    if (pct <= 70) return '#f59e0b';
    return '#22c55e';
  }

  submit(): void {
    this.apiError = null;
    this.submitting = true;
    const devices = this.form.recommendedDevicesStr.split('\n').map(s => s.trim()).filter(Boolean);
    const recommendations = this.form.caregiverRecommendationsStr.split('\n').map(s => s.trim()).filter(Boolean);
    const payload: Omit<AutonomyAssessment, 'id'> = {
      patientId: this.patientId,
      date: this.form.date,
      evaluator: this.form.evaluator,
      scores: { ...this.form.scores },
      totalScore: this.totalScore,
      trend: 'stable',
      trendPoints: 0,
      assistanceLevel: this.form.assistanceLevel,
      observations: this.form.observations || undefined,
      recommendedDevices: devices.length ? devices : undefined,
      caregiverRecommendations: recommendations.length ? recommendations : undefined,
      evolutionByDomain: []
    };

    if (this.isEditMode) {
      this.autonomyService.updateAssessment({ ...payload, id: this.assessmentId }).subscribe({
        next: result => {
          this.submitting = false;
          if (result) {
            this.router.navigate(['/app/patients', this.patientId, 'autonomy']);
          } else {
            this.apiError = 'Erreur lors de la mise à jour. Backend démarré sur le port 8089 ?';
          }
        },
        error: () => {
          this.submitting = false;
          this.apiError = 'Erreur réseau ou backend indisponible (port 8089).';
        }
      });
    } else {
      this.autonomyService.createAssessment(payload).subscribe({
        next: result => {
          this.submitting = false;
          if (result) {
            this.router.navigate(['/app/autonomy-list']);
          } else {
            this.apiError = 'Erreur lors de la création. Backend démarré sur le port 8089 ?';
          }
        },
        error: () => {
          this.submitting = false;
          this.apiError = 'Erreur réseau ou backend indisponible (port 8089).';
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/patients', this.patientId, 'autonomy']);
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
    if (!this.form.date?.trim() || !this.form.evaluator?.trim()) return false;
    if (!this.isValidDate(this.form.date)) return false;
    const s = this.form.scores;
    const validScores = [s.hygiene, s.feeding, s.dressing, s.mobility, s.communication]
      .every(v => Number.isInteger(v) && v >= 0 && v <= 5);
    return validScores;
  }

  getDateError(): string | null {
    if (!this.form.date?.trim()) return 'La date est requise.';
    if (!this.isValidDate(this.form.date)) return 'Format attendu : JJ/MM/AAAA (ex. 24/02/2026).';
    return null;
  }

  getEvaluatorError(): string | null {
    if (!this.form.evaluator?.trim()) return 'L\'évaluateur est requis.';
    if (this.form.evaluator.trim().length < 2) return 'Saisir au moins 2 caractères.';
    return null;
  }
}
