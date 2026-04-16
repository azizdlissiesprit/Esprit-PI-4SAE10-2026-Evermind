import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService, Ressource, Module } from '../../services/formation.service';

@Component({
  selector: 'app-ressource-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ressource-list.html',
  styleUrls: ['./ressource-list.scss']
})
export class RessourceListComponent implements OnInit {
  items: Ressource[] = [];
  modules: Module[] = [];
  showForm = false;
  editing: Ressource | null = null;
  model = { moduleId: 0, url: '', typeFichier: '', taille: 0 };

  constructor(private svc: FormationService) {}

  ngOnInit() {
    this.load();
    this.svc.getModules().subscribe({
      next: (m) => (this.modules = m ?? []),
      error: () => (this.modules = []),
    });
  }

  load() {
    this.svc.getRessources().subscribe({
      next: (data) => (this.items = data ?? []),
      error: () => (this.items = []),
    });
  }

  openAdd() {
    this.editing = null;
    this.model = {
      moduleId: this.modules[0]?.id ?? 0,
      url: '',
      typeFichier: '',
      taille: 0
    };
    this.showForm = true;
  }

  openEdit(r: Ressource) {
    this.editing = r;
    const m = (r as any).module;
    this.model = {
      moduleId: m?.id ?? 0,
      url: r.url,
      typeFichier: r.typeFichier ?? '',
      taille: r.taille ?? 0
    };
    this.showForm = true;
  }

  save() {
    if (!this.model.url?.trim()) return;
    if (this.editing) {
      this.svc.updateRessource(this.editing.id!, this.model).subscribe({
        next: () => {
          this.load();
          this.showForm = false;
          this.editing = null;
        },
        error: () => {},
      });
    } else {
      if (!this.model.moduleId) return;
      this.svc.createRessource(this.model).subscribe({
        next: () => {
          this.load();
          this.showForm = false;
        },
        error: () => {},
      });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer cette ressource ?')) {
      this.svc.deleteRessource(id).subscribe({
        next: () => this.load(),
        error: () => {},
      });
    }
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
  }
}
