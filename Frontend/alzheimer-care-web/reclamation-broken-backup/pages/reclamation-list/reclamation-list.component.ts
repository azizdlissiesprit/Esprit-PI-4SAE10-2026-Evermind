import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { 
  Reclamation, 
  ReclamationStatus, 
  ReclamationPriority 
} from '../../../../core/models/reclamation.model';
import { ReclamationModalComponent } from '../../components/reclamation-modal/reclamation-modal.component';

@Component({
  selector: 'app-reclamation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReclamationModalComponent],
  template: `
    <div class="container mt-4">
      <h2>Reclamations</h2>
      <div *ngIf="isLoading">Loading...</div>
      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div *ngIf="!isLoading && reclamations.length === 0">No reclamations found.</div>
      <ul class="list-group">
        <li *ngFor="let rec of filteredReclamations" class="list-group-item">
          {{ rec.subject }} - <span class="badge bg-primary">{{ rec.status }}</span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .status-pending { color: orange; }
    .status-resolved { color: green; }
  `]
})
export class ReclamationListComponent implements OnInit {
  private reclamationService = inject(ReclamationService);
  private authService = inject(AuthService);
  
  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  selectedReclamation: Reclamation | null = null;
  
  isLoading = false;
  errorMessage = '';
  showCreateModal = false;
  showDetailModal = false;
  
  selectedStatus: string = 'ALL';
  statuses = ['ALL', ...Object.values(ReclamationStatus)];
  
  // Pour les stats
  stats = {
    total: 0,
    enAttente: 0,
    enCours: 0,
    resolues: 0,
    rejetees: 0
  };

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.errorMessage = 'Utilisateur non connecté';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.reclamationService.getReclamationsByUserId(userId).subscribe({
      next: (data: Reclamation[]) => {
        this.reclamations = data.sort((a: Reclamation, b: Reclamation) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.filterReclamations();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des réclamations';
        this.isLoading = false;
        console.error('Erreur chargement réclamations:', error);
      }
    });
  }

  filterReclamations(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredReclamations = [...this.reclamations];
    } else {
      this.filteredReclamations = this.reclamations.filter(
        r => r.status === this.selectedStatus
      );
    }
  }

  calculateStats(): void {
    this.stats.total = this.reclamations.length;
    this.stats.enAttente = this.reclamations.filter(r => r.status === ReclamationStatus.EN_ATTENTE).length;
    this.stats.enCours = this.reclamations.filter(r => r.status === ReclamationStatus.EN_COURS).length;
    this.stats.resolues = this.reclamations.filter(r => r.status === ReclamationStatus.RESOLUE).length;
    this.stats.rejetees = this.reclamations.filter(r => r.status === ReclamationStatus.REJETEE).length;
  }

  onStatusChange(): void {
    this.filterReclamations();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onReclamationCreated(): void {
    this.loadReclamations();
  }

  viewDetails(reclamation: Reclamation): void {
    this.selectedReclamation = reclamation;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedReclamation = null;
  }

  getStatusClass(status: ReclamationStatus): string {
    switch(status) {
      case ReclamationStatus.EN_ATTENTE:
        return 'status-pending';
      case ReclamationStatus.EN_COURS:
        return 'status-in-progress';
      case ReclamationStatus.RESOLUE:
        return 'status-resolved';
      case ReclamationStatus.REJETEE:
        return 'status-rejected';
      default:
        return '';
    }
  }

  getPriorityClass(priority: ReclamationPriority): string {
    switch(priority) {
      case ReclamationPriority.BASSE:
        return 'priority-low';
      case ReclamationPriority.MOYENNE:
        return 'priority-medium';
      case ReclamationPriority.HAUTE:
        return 'priority-high';
      case ReclamationPriority.URGENTE:
        return 'priority-urgent';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'ALL': 'Tous',
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'RESOLUE': 'Résolue',
      'REJETEE': 'Rejetée'
    };
    return labels[status] || status;
  }
}
