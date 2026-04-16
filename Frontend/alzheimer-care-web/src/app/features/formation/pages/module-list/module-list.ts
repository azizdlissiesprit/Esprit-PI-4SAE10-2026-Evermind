import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService, Module, ProgrammeFormation } from '../../services/formation.service';

@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-list.html',
  styleUrls: ['./module-list.scss']
})
export class ModuleListComponent implements OnInit {
  items: Module[] = [];
  programmes: ProgrammeFormation[] = [];
  showForm = false;
  editing: Module | null = null;
  model = { programmeId: 0, titre: '', type: 'Video', contenu: '', dureeEstimee: 10, urlVideo: '', introduction: '', conseils: '' };
  errorMessage = '';

  constructor(private svc: FormationService) {}

  ngOnInit() {
    this.load();
    this.svc.getProgrammes().subscribe({
      next: (p) => (this.programmes = p),
      error: () => (this.programmes = []),
    });
  }

  load() {
    this.svc.getModules().subscribe({
      next: (data) => (this.items = data ?? []),
      error: () => (this.items = []),
    });
  }

  openAdd() {
    this.editing = null;
    this.errorMessage = '';
    this.model = {
      programmeId: this.programmes[0]?.id ?? 0,
      titre: '',
      type: 'Video',
      contenu: '',
      dureeEstimee: 10,
      urlVideo: '',
      introduction: '',
      conseils: '',
    };
    this.showForm = true;
  }

  openEdit(m: Module) {
    this.editing = m;
    this.errorMessage = '';
    const contenu = m.contenu ?? '';
    const sep = '|||CONSEILS|||';
    const [intro = '', conseils = ''] = contenu.includes(sep) ? contenu.split(sep) : [contenu, ''];
    this.model = {
      programmeId: (m as any).programmeFormation?.id ?? 0,
      titre: m.titre,
      type: m.type,
      contenu,
      dureeEstimee: m.dureeEstimee ?? 10,
      urlVideo: '',
      introduction: intro.trim(),
      conseils: conseils.trim(),
    };
    this.svc.getRessourcesByModule(m.id!).subscribe({
      next: (r) => {
        const video = (r ?? []).find((x) => this.isVideoUrl(x.url));
        if (video) this.model.urlVideo = video.url;
        this.showForm = true;
      },
      error: () => (this.showForm = true),
    });
  }

  private isVideoUrl(url: string): boolean {
    if (!url) return false;
    const u = url.toLowerCase();
    return u.includes('youtube') || u.includes('vimeo') || u.includes('.mp4') || u.includes('youtu.be');
  }

  save() {
    this.errorMessage = '';
    if (!this.model.titre?.trim()) {
      this.errorMessage = 'Le titre est requis.';
      return;
    }
    const intro = (this.model as any).introduction?.trim() ?? '';
    const conseils = (this.model as any).conseils?.trim() ?? '';
    const contenu = conseils ? intro + '\n\n|||CONSEILS|||\n\n' + conseils : intro;
    if (this.editing) {
      const { urlVideo: _, introduction: __, conseils: ___, ...rest } = this.model as any;
      const moduleData = { ...rest, contenu };
      this.svc.updateModule(this.editing.id!, moduleData).subscribe({
        next: () => {
          this.addRessourceIfUrl(this.editing!.id!);
          this.load();
          this.showForm = false;
          this.editing = null;
        },
        error: (err) => (this.errorMessage = err?.error?.message || 'Erreur lors de la modification.'),
      });
    } else {
      if (!this.model.programmeId) {
        this.errorMessage = 'Sélectionnez un programme.';
        return;
      }
      const { urlVideo: __, introduction: ___, conseils: ____, ...rest } = this.model as any;
      const moduleData = { ...rest, contenu };
      this.svc.createModule(moduleData).subscribe({
        next: (created) => {
          this.addRessourceIfUrl(created.id!);
          this.load();
          this.showForm = false;
        },
        error: (err) => (this.errorMessage = err?.error?.message || 'Erreur lors de la création.'),
      });
    }
  }

  private addRessourceIfUrl(moduleId: number) {
    const url = this.model.urlVideo?.trim();
    if (!url) return;
    this.svc.createRessource({ moduleId, url, typeFichier: 'video' }).subscribe({
      next: () => this.load(),
      error: () => {},
    });
  }

  delete(id: number) {
    if (confirm('Supprimer ce module ?')) {
      this.svc.deleteModule(id).subscribe(() => this.load());
    }
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
  }
}
