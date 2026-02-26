import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutonomyService } from '../../../../core/services/autonomy.service';
import { AutonomyAssessment, TrendType } from '../../../../core/models/assessment.models';

@Component({
  selector: 'app-autonomy-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './autonomy-list.html',
  styleUrls: ['../../alerts-admin/alerts-admin.scss'] // Reusing CSS
})
export class AutonomyAdminListComponent implements OnInit {
  
  allAssessments: AutonomyAssessment[] = [];
  displayedAssessments: AutonomyAssessment[] = [];
  loading = true;

  searchTerm = '';
  selectedTrend = 'ALL';
  trends = Object.values(TrendType);

  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private autonomyService: AutonomyService,
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
    this.autonomyService.getAll().subscribe({
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
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(a => a.patientId.toLowerCase().includes(term));
    }
    if (this.selectedTrend !== 'ALL') {
      temp = temp.filter(a => a.trend === this.selectedTrend);
    }

    this.totalElements = temp.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedAssessments = temp.slice(startIndex, startIndex + this.pageSize);
  }

  onDelete(id: number) {
    if (confirm('Delete this autonomy assessment?')) {
      this.autonomyService.delete(id).subscribe(() => this.loadData());
    }
  }
  
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  getTrendClass(trend: string) {
    if (trend === TrendType.DOWN) return 'badge-red';
    if (trend === TrendType.STABLE) return 'badge-blue';
    return 'badge-green';
  }
}