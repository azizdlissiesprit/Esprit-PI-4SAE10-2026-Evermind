import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../service/assessment.service';
import { PdfExportService } from '../../../../core/services/pdf-export.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-cognitive-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cognitive-pdf.html'
})
export class CognitivePdfComponent implements OnInit {
  status = 'Préparation du PDF...';
  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private pdf: PdfExportService
  ) {}
  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('patientId') || '';
    const assessmentId = this.route.snapshot.queryParamMap.get('a') || '';
    this.assessmentService.getPatient(patientId).pipe(take(1)).subscribe(p => {
      this.assessmentService.getAssessments(patientId).pipe(take(1)).subscribe(list => {
        const items = assessmentId ? list.filter(a => a.id === assessmentId) : list;
        this.pdf.exportAssessmentToPDF(p, items).then(() => {
          this.status = 'Le téléchargement du PDF a commencé. Vous pouvez fermer cette page.';
        }).catch(() => {
          this.status = 'Impossible de générer le PDF.';
        });
      });
    });
  }
}
