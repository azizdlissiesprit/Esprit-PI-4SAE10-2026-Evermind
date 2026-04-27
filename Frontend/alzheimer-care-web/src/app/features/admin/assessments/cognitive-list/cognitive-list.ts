import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CognitiveService } from '../../../../core/services/cognitive.service';
import { CognitiveAssessment, TrendType, AssessmentType } from '../../../../core/models/assessment.models';

@Component({
  selector: 'app-cognitive-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cognitive-list.html',
  styleUrls: ['../../alerts-admin/alerts-admin.scss'] // Reusing your existing CSS
})
export class CognitiveAdminListComponent implements OnInit {
  
  allAssessments: CognitiveAssessment[] = [];
  displayedAssessments: CognitiveAssessment[] = [];
  loading = true;

  // Filters
  searchTerm = ''; // Search by Patient ID
  selectedTrend = 'ALL';
  selectedType = 'ALL';
  
  trends = Object.values(TrendType);
  types = Object.values(AssessmentType);

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private cognitiveService: CognitiveService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    } else {
      this.loading = false;
    }
  }

  loadData() {
    this.loading = true;
    this.cognitiveService.getAll().subscribe({
      next: (data) => {
        this.allAssessments = data;
        this.applyFilters();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let temp = this.allAssessments;

    // 1. Search (Patient ID)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(a => a.patientId.toLowerCase().includes(term));
    }

    // 2. Filter by Trend
    if (this.selectedTrend !== 'ALL') {
      temp = temp.filter(a => a.trend === this.selectedTrend);
    }

    // 3. Filter by Type
    if (this.selectedType !== 'ALL') {
      temp = temp.filter(a => a.type === this.selectedType);
    }

    // Pagination
    this.totalElements = temp.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedAssessments = temp.slice(startIndex, startIndex + this.pageSize);
  }

  onDelete(id: number) {
    if (confirm('Delete this assessment? This cannot be undone.')) {
      this.cognitiveService.delete(id).subscribe(() => this.loadData());
    }
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  // Helper for Badge Colors
  getTrendClass(trend: string) {
    if (trend === TrendType.DOWN) return 'badge-red';
    if (trend === TrendType.STABLE) return 'badge-blue';
    return 'badge-green'; // UP
  }
}
