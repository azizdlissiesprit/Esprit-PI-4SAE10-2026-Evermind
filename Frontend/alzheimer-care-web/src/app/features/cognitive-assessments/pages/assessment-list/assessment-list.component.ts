import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { Assessment, Patient } from '../../models/assessment.model';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

interface AssessmentListItem {
  assessment: Assessment;
  patient: Patient;
}

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconifyIconComponent],
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.scss']
})
export class AssessmentListComponent implements OnInit {
  items: AssessmentListItem[] = [];
  filteredItems: AssessmentListItem[] = [];
  paginatedItems: AssessmentListItem[] = [];

  searchName: string = '';
  searchDate: string = '';
  scoreFilter: 'all' | 'low' | 'medium' | 'high' = 'all';

  isLoading = true;
  apiError: string | null = null;

  // Pagination
  pageSize = 10;
  currentPage = 1;
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  constructor(
    private assessmentService: AssessmentService,
    private pdfExportService: PdfExportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFromApi();
  }

  loadFromApi(): void {
    this.isLoading = true;
    this.apiError = null;
    this.assessmentService.getAllAssessments().subscribe({
      next: assessments => {
        this.items = assessments.map(a => ({
          assessment: a,
          patient: { id: a.patientId, name: `Patient #${a.patientId}` } as Patient
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.apiError = 'Impossible de joindre l\'API (backend sur le port 8086 ?).';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const nameTerm = this.searchName.toLowerCase().trim();
    const dateTerm = this.searchDate.toLowerCase().trim();

    this.filteredItems = this.items.filter(item => {
      const { assessment, patient } = item;

      const matchesName =
        !nameTerm ||
        patient.name.toLowerCase().includes(nameTerm) ||
        patient.id.toLowerCase().includes(nameTerm);

      const matchesDate =
        !dateTerm ||
        assessment.date.toLowerCase().includes(dateTerm);

      const score = assessment.mmseScore;
      let matchesScore = true;
      if (this.scoreFilter === 'low') {
        matchesScore = score < 20;
      } else if (this.scoreFilter === 'medium') {
        matchesScore = score >= 20 && score <= 24;
      } else if (this.scoreFilter === 'high') {
        matchesScore = score > 24;
      }

      return matchesName && matchesDate && matchesScore;
    });
    this.currentPage = 1;
    this.updatePaginatedItems();
  }

  updatePaginatedItems(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedItems = this.filteredItems.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.updatePaginatedItems();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  readonly Math = Math;

  onSearchChange(): void {
    this.applyFilters();
  }

  onScoreFilterChange(value: 'all' | 'low' | 'medium' | 'high'): void {
    this.scoreFilter = value;
    this.applyFilters();
  }

  openAssessment(item: AssessmentListItem): void {
    const { assessment } = item;
    this.router.navigate([
      '/app/patients',
      assessment.patientId,
      'cognitive-assessments'
    ]);
  }

  goToNewAssessment(): void {
    this.router.navigate(['/app/patients', 'P-2024-8921', 'cognitive-assessments', 'new']);
  }

  goToEditAssessment(item: AssessmentListItem): void {
    this.router.navigate([
      '/app/patients',
      item.assessment.patientId,
      'cognitive-assessments',
      item.assessment.id,
      'edit'
    ]);
  }

  deleteAssessment(item: AssessmentListItem): void {
    if (!confirm('Supprimer cette évaluation cognitive ?')) return;
    this.assessmentService.deleteAssessment(item.assessment.id).subscribe(success => {
      if (success) this.loadFromApi();
    });
  }

  exportAssessmentPDF(item: AssessmentListItem): void {
    const { assessment, patient } = item;
    this.pdfExportService.exportAssessmentToPDF(patient, [assessment]);
  }
}

