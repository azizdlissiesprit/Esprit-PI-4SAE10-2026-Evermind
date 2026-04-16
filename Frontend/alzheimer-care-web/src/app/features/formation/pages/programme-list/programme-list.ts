import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService, ProgrammeFormation } from '../../services/formation.service';
import { retry } from 'rxjs';

@Component({
  selector: 'app-programme-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programme-list.html',
  styleUrls: ['./programme-list.scss']
})
export class ProgrammeListComponent implements OnInit, OnDestroy {
  items: ProgrammeFormation[] = [];
  showForm = false;
  editing: ProgrammeFormation | null = null;
  model: ProgrammeFormation = { titre: '', description: '', theme: '' };
  errorMessage = '';
  loading = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: FormationService) { }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  load() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    this.loading = true;
    this.svc.getProgrammes().pipe(
      retry({ count: 2, delay: 800 })
    ).subscribe({
      next: (data) => {
        this.items = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
        // Backend can start a little later; retry automatically.
        this.retryTimer = setTimeout(() => this.load(), 1500);
      },
    });
  }

  openAdd() {
    this.editing = null;
    this.errorMessage = '';
    this.model = { titre: '', description: '', theme: '' };
    this.showForm = true;
  }

  openEdit(p: ProgrammeFormation) {
    this.editing = p;
    this.errorMessage = '';
    this.model = { ...p };
    this.showForm = true;
  }

  save() {
    this.errorMessage = '';
    if (!this.model.titre?.trim()) {
      this.errorMessage = 'Le titre est requis.';
      return;
    }
    if (!this.model.theme?.trim()) {
      this.errorMessage = 'Le thème est requis.';
      return;
    }
    const obs = this.editing
      ? this.svc.updateProgramme(this.editing.id!, this.model)
      : this.svc.createProgramme(this.model);
    obs.subscribe({
      next: () => {
        this.load();
        this.showForm = false;
        this.editing = null;
      },
      error: (err) => {
        const msg = String(err?.error?.message || err?.message || '');
        if (msg.includes('<!DOCTYPE') || msg.includes('Unexpected token') || msg.includes('JSON')) {
          this.errorMessage = 'Le backend ne répond pas correctement. Vérifiez que le serveur Formation est démarré (port 9086).';
        } else {
          this.errorMessage = msg || 'Erreur lors de l\'enregistrement. Vérifiez que le backend est démarré.';
        }
      },
    });
  }

  delete(id: number) {
    if (confirm('Supprimer ce programme ?')) {
      this.svc.deleteProgramme(id).subscribe({
        next: () => this.load(),
        error: () => { },
      });
    }
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
  }
}
