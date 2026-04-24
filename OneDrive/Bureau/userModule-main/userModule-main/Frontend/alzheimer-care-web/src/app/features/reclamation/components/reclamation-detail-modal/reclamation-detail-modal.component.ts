import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reclamation, ReclamationStatus, ReclamationPriority } from '../../../../core/models/reclamation.model';

@Component({
  selector: 'app-reclamation-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reclamation-detail-modal.component.html',
  styleUrls: ['./reclamation-detail-modal.component.scss']
})
export class ReclamationDetailModalComponent {
  @Input() reclamation!: Reclamation;
  @Output() closeModal = new EventEmitter<void>();

  ReclamationStatus = ReclamationStatus;
  ReclamationPriority = ReclamationPriority;

  close(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
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

  getStatusLabel(status: ReclamationStatus): string {
    const labels: {[key: string]: string} = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'RESOLUE': 'Résolue',
      'REJETEE': 'Rejetée'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: ReclamationPriority): string {
    const labels: {[key: string]: string} = {
      'BASSE': 'Basse',
      'MOYENNE': 'Moyenne',
      'HAUTE': 'Haute',
      'URGENTE': 'Urgente'
    };
    return labels[priority] || priority;
  }

  getCategoryLabel(category: string): string {
    const labels: {[key: string]: string} = {
      'TECHNIQUE': 'Technique',
      'SERVICE': 'Service',
      'FACTURATION': 'Facturation',
      'SECURITE': 'Sécurité',
      'FONCTIONNALITE': 'Fonctionnalité',
      'AUTRE': 'Autre'
    };
    return labels[category] || category;
  }
}
