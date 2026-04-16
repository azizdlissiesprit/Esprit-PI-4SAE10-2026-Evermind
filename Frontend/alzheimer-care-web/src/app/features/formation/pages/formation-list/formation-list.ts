import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormationService, ProgrammeFormation } from '../../services/formation.service';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './formation-list.html',
  styleUrls: ['./formation-list.scss']
})
export class FormationListComponent implements OnInit {
  formations: ProgrammeFormation[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private formationService: FormationService) {}

  ngOnInit() {
    this.loadFormations();
  }

  loadFormations() {
    this.isLoading = true;
    this.errorMessage = '';

    this.formationService.getProgrammes().subscribe({
      next: (data) => {
        this.formations = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.errorMessage = 'Failed to load formations. Please try again.';
        this.isLoading = false;
        // Mock data for demo
        this.formations = [
          {
            id: 1,
            titre: 'Introduction to Alzheimer Care',
            description: 'Learn the basics of caring for Alzheimer patients',
            theme: 'Healthcare',
            dateCreation: '2024-01-15'
          },
          {
            id: 2,
            titre: 'Dementia Communication Techniques',
            description: 'Effective communication strategies for dementia patients',
            theme: 'Communication',
            dateCreation: '2024-02-10'
          },
          {
            id: 3,
            titre: 'Safety and Emergency Response',
            description: 'How to handle emergencies and keep patients safe',
            theme: 'Safety',
            dateCreation: '2024-03-05'
          }
        ];
      }
    });
  }
}
