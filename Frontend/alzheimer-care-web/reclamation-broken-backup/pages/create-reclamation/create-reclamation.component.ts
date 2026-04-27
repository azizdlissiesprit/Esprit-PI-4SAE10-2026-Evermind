import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationStaticService } from '../../../../core/services/reclamation-static.service';
import { TokenLocalStorageService } from '../../../../core/services/token-local-storage.service';
import { 
  CreateReclamationRequest, 
  ReclamationPriority, 
  ReclamationCategory 
} from '../../../../core/models/reclamation.model';

@Component({
  selector: 'app-create-reclamation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-reclamation.component.html',
  styleUrls: ['./create-reclamation.component.scss']
})
export class CreateReclamationComponent implements OnInit {
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

  constructor(
    private ReclamationStaticService: ReclamationStaticService,
    private router: Router,
    private tokenStorage: TokenLocalStorageService
  ) {}

  ngOnInit(): void {
    const userId = this.tokenStorage.getUserId();
    if (userId) {
      this.reclamation.userId = userId;
    } else {
      // Si pas d'utilisateur, rediriger vers login
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.ReclamationStaticService.createReclamation(this.reclamation).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(['/reclamations']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la création de la réclamation';
        console.error('Error creating reclamation:', error);
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

  cancel(): void {
    this.router.navigate(['/reclamations']);
  }
}
