import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutonomyService } from '../../services/autonomy.service';
import { AutonomyPdfExportService } from '../../services/autonomy-pdf-export.service';
import { AutonomyAssessment, Patient } from '../../models/autonomy.model';
import { IconifyIconComponent } from '../../../../shared/components/icon/icon.component';

interface AutonomyListItem {
  assessment: AutonomyAssessment;
  patient: Patient;
}

@Component({
  selector: 'app-autonomy-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconifyIconComponent],
  templateUrl: './autonomy-list.component.html',
  styleUrls: ['./autonomy-list.component.scss']
})
export class AutonomyListComponent implements OnInit {
  items: AutonomyListItem[] = [];
  filteredItems: AutonomyListItem[] = [];
  paginatedItems: AutonomyListItem[] = [];
  searchName = '';
  searchDate = '';
  scoreFilter: 'all' | 'low' | 'medium' | 'high' = 'all';
  isLoading = true;
  apiError: string | null = null;

  // Pagination
  pageSize = 3;
  currentPage = 1;
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  constructor(
    private autonomyService: AutonomyService,
    private pdfExport: AutonomyPdfExportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFromApi();
  }

  loadFromApi(): void {
    this.isLoading = true;
    this.apiError = null;
    this.autonomyService.getAllAssessments().subscribe({
      next: assessments => {
        this.items = assessments.map(a => ({
          assessment: a,
          patient: { id: a.patientId, name: `Patient #${a.patientId}` } as Patient
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.apiError = 'Impossible de joindre l\'API Autonomy (backend sur le port 8097 ?).';
        this.isLoading = false;
      }
    });
  }

  goToNewAssessment(): void {
    this.router.navigate(['/app/patients', 'P-2024-8921', 'autonomy', 'new']);
  }

  goToEditAssessment(item: AutonomyListItem): void {
    this.router.navigate(['/app/patients', item.assessment.patientId, 'autonomy', item.assessment.id, 'edit']);
  }

  deleteAssessment(item: AutonomyListItem): void {
    if (!confirm('Supprimer cette évaluation d\'autonomie ?')) return;
    this.autonomyService.deleteAssessment(item.assessment.id).subscribe(success => {
      if (success) this.loadFromApi();
    });
  }

  applyFilters(): void {
    const nameTerm = this.searchName.toLowerCase().trim();
    const dateTerm = this.searchDate.toLowerCase().trim();
    this.filteredItems = this.items.filter(item => {
      const matchName = !nameTerm || item.patient.name.toLowerCase().includes(nameTerm) || item.patient.id.toLowerCase().includes(nameTerm);
      const matchDate = !dateTerm || item.assessment.date.toLowerCase().includes(dateTerm);
      const total = item.assessment.totalScore;
      let matchScore = true;
      if (this.scoreFilter === 'low') matchScore = total < 15;
      else if (this.scoreFilter === 'medium') matchScore = total >= 15 && total <= 20;
      else if (this.scoreFilter === 'high') matchScore = total > 20;
      return matchName && matchDate && matchScore;
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

  onSearchChange(): void {
    this.applyFilters();
  }

  onScoreFilterChange(value: 'all' | 'low' | 'medium' | 'high'): void {
    this.scoreFilter = value;
    this.applyFilters();
  }

  openDashboard(item: AutonomyListItem): void {
    this.router.navigate(['/app/patients', item.assessment.patientId, 'autonomy']);
  }

  exportPDF(item: AutonomyListItem): void {
    this.pdfExport.exportToPDF(item.patient, [item.assessment]);
  }

  getTrendIcon(trend: string): string {
    return trend === 'up' ? 'lucide:trending-up' : trend === 'down' ? 'lucide:trending-down' : 'lucide:minus';
  }

  getTrendClass(trend: string): string {
    return trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-stable';
  }

  readonly Math = Math;
}
