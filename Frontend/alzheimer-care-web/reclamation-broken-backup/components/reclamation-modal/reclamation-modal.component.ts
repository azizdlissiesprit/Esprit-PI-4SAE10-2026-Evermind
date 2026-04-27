import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { TokenLocalStorageService } from '../../../../core/services/token-local-storage.service';
import { 
  CreateReclamationRequest, 
  ReclamationPriority, 
  ReclamationCategory 
} from '../../../../core/models/reclamation.model';

@Component({
  selector: 'app-reclamation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamation-modal.component.html',
  styleUrls: ['./reclamation-modal.component.scss']
})
export class ReclamationModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() reclamationCreated = new EventEmitter<void>();

  private reclamationService = inject(ReclamationService);
  private tokenStorage = inject(TokenLocalStorageService);

  reclamation: CreateReclamationRequest = {
    userId: 0,
    subject: '',
    description: '',
    priority: ReclamationPriority.MOYENNE,
    category: ReclamationCategory.AUTRE
  };

  priorities = Object.values(ReclamationPriority);
  categories = Object.values(ReclamationCategory);

  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    const userId = this.tokenStorage.getUserId();
    if (userId) {
      this.reclamation.userId = userId;
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.reclamationService.createReclamation(this.reclamation).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.reclamationCreated.emit();
        this.close();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la création de la réclamation';
        console.error('Erreur création réclamation:', error);
      }
    });
  }

  validateForm(): boolean {
    if (!this.reclamation.subject || this.reclamation.subject.trim().length === 0) {
      this.errorMessage = 'Le sujet est requis';
      return false;
    }
    if (!this.reclamation.description || this.reclamation.description.trim().length === 0) {
      this.errorMessage = 'La description est requise';
      return false;
    }
    return true;
  }

  close(): void {
    this.closeModal.emit();
  }

  // Fermer le modal quand on clique en dehors
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
