import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core'; // <--- 1. Import Inject & PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <--- 2. Import isPlatformBrowser
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminAlertService } from '../../../core/services/admin-alert.service';
import { Alert } from '../../../core/models/alert.model'; 
import { StatutAlerte, Severite, TypeAlerte } from '../../../core/models/enums';

@Component({
  selector: 'app-alert-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './alerts-admin.html',
  styleUrls: ['./alerts-admin.scss']
})
export class AlertAdminListComponent implements OnInit {
  
  allAlerts: Alert[] = []; 
  displayedAlerts: Alert[] = []; 
  loading = true;

  // Filters
  searchTerm = '';
  selectedSeverity = 'ALL';
  selectedStatus = 'ALL';
  severities = Object.values(Severite);
  statuses = Object.values(StatutAlerte);

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private alertService: AdminAlertService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // <--- 3. Inject Platform ID
  ) {}

  ngOnInit() {
    // --- 4. CRITICAL FIX: Only run this code in the Browser ---
    if (isPlatformBrowser(this.platformId)) {
      this.loadAlerts();
    } else {
      // If running on Server (SSR), do nothing or set loading to false
      this.loading = false;
    }
  }

  loadAlerts() {
    this.loading = true;
    this.alertService.getAllAlerts().subscribe({
      next: (data) => {
        this.allAlerts = data; 
        this.applyFilters();   
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // --- Logic to Filter AND Paginate in memory ---
  applyFilters() {
    let temp = this.allAlerts;

    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(a => 
        (a.message && a.message.toLowerCase().includes(term)) || 
        a.patientId.toString().includes(term)
      );
    }

    // Filters
    if (this.selectedSeverity !== 'ALL') {
      temp = temp.filter(a => a.severite === this.selectedSeverity);
    }
    if (this.selectedStatus !== 'ALL') {
      temp = temp.filter(a => a.statut === this.selectedStatus);
    }

    // Pagination Calculation
    this.totalElements = temp.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);

    // Slice Data
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedAlerts = temp.slice(startIndex, startIndex + this.pageSize);
  }

  // --- ACTIONS ---
  onDelete(id: number) {
    // Confirm is a browser-only API, strictly speaking, but inside a click handler it's usually safe.
    if (confirm('Delete this alert?')) {
      this.alertService.deleteAlert(id).subscribe(() => this.loadAlerts());
    }
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  // --- UI Helpers ---
  getSeverityClass(sev: string) {
    if (sev === 'CRITIQUE') return 'badge-red';
    if (sev === 'HAUTE') return 'badge-orange';
    if (sev === 'MOYENNE') return 'badge-blue';
    return 'badge-green';
  }
}
