import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconifyIconComponent } from '../../../shared/components/icon/icon.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../admin/assessments/service/assessment.service';
import { Patient, Assessment } from '../../../core/models/assessment.models';
import { SelectedPatientService } from '../../../core/services/selected-patient.service';

@Component({
  selector: 'app-patient-interface',
  standalone: true,
  imports: [CommonModule, IconifyIconComponent],
  templateUrl: './patient-interface.html',
  styleUrls: ['./patient-interface.scss']
})
export class PatientInterfaceComponent {
  patient: Patient | null = null;
  latest: Assessment | null = null;
  mmseScore = 0;
  mocaScore = 0;
  mmseDash = '0, 100';
  mocaDash = '0, 100';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private selectedPatient: SelectedPatientService
  ) {}
  ngOnInit() {
    const fromContext = this.selectedPatient.get();
    const pid = fromContext || this.route.snapshot.queryParamMap.get('patientId') || 'P-2024-8921';
    this.assessmentService.getPatient(pid).subscribe(p => this.patient = p);
    this.assessmentService.getAssessments(pid).subscribe(list => {
      const assessments = list.slice().sort((a, b) => b.date.localeCompare(a.date));
      this.latest = assessments[0] || null;
      this.mmseScore = this.latest ? this.latest.mmseScore : 0;
      this.mocaScore = this.latest ? this.latest.moocaScore : 0;
      const mmsePct = Math.max(0, Math.min(100, Math.round((this.mmseScore / 30) * 100)));
      const mocaPct = Math.max(0, Math.min(100, Math.round((this.mocaScore / 30) * 100)));
      this.mmseDash = `${mmsePct}, 100`;
      this.mocaDash = `${mocaPct}, 100`;
    });
  }
  openGame() {
    this.router.navigate(['/interface/games'], { queryParams: { patientId: this.patient?.id || '' } });
  }
}
