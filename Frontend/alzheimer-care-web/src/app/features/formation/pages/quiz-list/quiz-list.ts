import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormationService, Quiz, Module } from '../../services/formation.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.scss']
})
export class QuizListComponent implements OnInit {
  items: Quiz[] = [];
  modules: Module[] = [];
  showForm = false;
  editing: Quiz | null = null;
  model = { moduleId: 0, titre: '', seuilReussite: 70 };
  questionCounts: Record<number, number> = {};
  errorMessage = '';
  loading = false;

  constructor(private svc: FormationService, private router: Router) { }

  ngOnInit() {
    this.load();
    this.svc.getModules().subscribe({
      next: (m) => (this.modules = m ?? []),
      error: () => (this.modules = []),
    });
  }

  load() {
    this.loading = true;
    this.svc.getQuizList().subscribe({
      next: (data) => {
        this.items = data ?? [];
        this.loading = false;
        // Load question counts for each quiz
        for (const q of this.items) {
          if (q.id) {
            this.svc.getQuestions(q.id).subscribe({
              next: (questions) => this.questionCounts[q.id!] = questions?.length ?? 0,
              error: () => this.questionCounts[q.id!] = 0,
            });
          }
        }
      },
      error: () => {
        this.items = [];
        this.loading = false;
      },
    });
  }

  openAdd() {
    this.editing = null;
    this.model = {
      moduleId: this.modules[0]?.id ?? 0,
      titre: '',
      seuilReussite: 70
    };
    this.showForm = true;
  }

  openEdit(q: Quiz) {
    this.editing = q;
    const m = (q as any).module;
    this.model = {
      moduleId: m?.id ?? 0,
      titre: q.titre,
      seuilReussite: q.seuilReussite ?? 70
    };
    this.showForm = true;
  }

  save() {
    this.errorMessage = '';
    if (!this.model.titre?.trim()) return;
    if (this.editing) {
      this.svc.updateQuiz(this.editing.id!, this.model).subscribe({
        next: () => {
          this.load();
          this.showForm = false;
          this.editing = null;
        },
        error: () => {
          this.errorMessage = 'Update failed. Retrying list refresh...';
          this.load();
        },
      });
    } else {
      if (!this.model.moduleId) return;
      this.svc.createQuiz(this.model).subscribe({
        next: (created) => {
          // Instant UI feedback: show the newly created quiz immediately.
          const selectedModule = this.modules.find((m) => m.id === this.model.moduleId);
          this.items = [
            ...this.items,
            {
              ...created,
              moduleId: created?.moduleId ?? selectedModule?.id,
              moduleTitre: created?.moduleTitre ?? selectedModule?.titre ?? 'N/A',
            }
          ];
          if (created?.id) {
            this.questionCounts[created.id] = 0;
          }
          this.load();
          this.showForm = false;
        },
        error: () => {
          // Some backend responses may fail to parse on client although insert succeeded.
          // Force-refresh list so the new quiz appears without manual page refresh.
          this.errorMessage = 'Saved on server. Refreshing list...';
          this.load();
          this.showForm = false;
        },
      });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer ce quiz ?')) {
      this.svc.deleteQuiz(id).subscribe({
        next: () => this.load(),
        error: () => { },
      });
    }
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.errorMessage = '';
  }

  openBuilder(quizId: number) {
    this.router.navigate(['/app/formation/quiz/builder', quizId]);
  }
}
