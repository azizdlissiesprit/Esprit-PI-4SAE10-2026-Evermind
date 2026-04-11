import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RendezVousService, RendezVousDTO } from './rendezvous.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rendezvous-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rendezvous-list.html',
  styleUrls: ['../alerts-admin/alerts-admin.scss']
})
export class RendezVousListComponent implements OnInit {
  
  allRendezVous: RendezVousDTO[] = [];
  displayedRendezVous: RendezVousDTO[] = [];
  loading = true;
  searchTerm = '';
  selectedType = 'ALL';
  selectedStatut = 'ALL';
  
  types = ['CONSULTATION', 'TELECONSULTATION', 'SUIVI', 'BILAN', 'EVALUATION', 'RESULTATS', 'PREMIERE_VISITE'];
  statuts = ['CONFIRME', 'EN_ATTENTE', 'ANNULE', 'LIBRE'];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private rendezVousService: RendezVousService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
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
    this.rendezVousService.getAll().subscribe({
      next: (data) => {
        this.allRendezVous = data;
        this.applyFilters();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let temp = this.allRendezVous;

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(r => 
        r.patientNom.toLowerCase().includes(term) ||
        r.patientPrenom.toLowerCase().includes(term) ||
        r.type.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (this.selectedType !== 'ALL') {
      temp = temp.filter(r => r.type === this.selectedType);
    }

    // Statut filter
    if (this.selectedStatut !== 'ALL') {
      temp = temp.filter(r => r.statut === this.selectedStatut);
    }

    // Pagination
    this.totalElements = temp.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedRendezVous = temp.slice(startIndex, startIndex + this.pageSize);
  }

  onCreate() {
    this.router.navigate(['/admin/appointments/new']);
  }

  onEdit(id: number) {
    this.router.navigate(['/admin/appointments/edit', id]);
  }

  onDelete(id: number) {
    if (confirm('Supprimer ce rendez-vous ? Cette action ne peut être annulée.')) {
      this.rendezVousService.delete(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression du rendez-vous');
        }
      });
    }
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  // Helper methods
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CONSULTATION': 'Consultation',
      'TELECONSULTATION': 'Téléconsultation',
      'SUIVI': 'Suivi',
      'BILAN': 'Bilan',
      'EVALUATION': 'Évaluation',
      'RESULTATS': 'Résultats',
      'PREMIERE_VISITE': '1ère visite'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'CONFIRME': 'Confirmé',
      'EN_ATTENTE': 'En attente',
      'ANNULE': 'Annulé',
      'LIBRE': 'Libre'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    if (statut === 'CONFIRME') return 'badge-green';
    if (statut === 'EN_ATTENTE') return 'badge-yellow';
    if (statut === 'ANNULE') return 'badge-red';
    return 'badge-gray'; // LIBRE
  }

  getTypeClass(type: string): string {
    if (type === 'CONSULTATION') return 'badge-blue';
    if (type === 'TELECONSULTATION') return 'badge-cyan';
    if (type === 'SUIVI') return 'badge-green';
    if (type === 'BILAN') return 'badge-orange';
    if (type === 'EVALUATION') return 'badge-purple';
    if (type === 'RESULTATS') return 'badge-pink';
    return 'badge-indigo'; // PREMIERE_VISITE
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
