import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService, Question, QuestionType, Quiz } from '../../services/formation.service';

interface QuestionForm {
    questionText: string;
    type: QuestionType;
    optionsList: string[];
    correctIndices: number[];
    orderIndex: number;
}

@Component({
    selector: 'app-quiz-builder',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './quiz-builder.html',
    styleUrls: ['./quiz-builder.scss']
})
export class QuizBuilderComponent implements OnInit {
    quizId!: number;
    quiz: Quiz | null = null;
    questions: Question[] = [];
    loading = true;

    showForm = false;
    editingId: number | null = null;
    form: QuestionForm = this.emptyForm();

    // AI Generation modal state
    showAiModal = false;
    aiTopic = '';
    aiCount = 5;
    aiTypes: string[] = ['QCU'];
    aiGenerating = false;
    aiError = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private svc: FormationService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.quizId = Number(params.get('quizId')) || 0;
            this.showForm = false;
            this.editingId = null;
            this.form = this.emptyForm();
            this.showAiModal = false;
            this.loadQuizAndQuestions();
        });
    }

    private loadQuizAndQuestions() {
        this.svc.getQuiz(this.quizId).subscribe({
            next: (q) => this.quiz = q,
            error: () => { }
        });
        this.loadQuestions();
    }

    loadQuestions() {
        this.loading = true;
        this.svc.getQuestions(this.quizId).subscribe({
            next: (data) => {
                this.questions = data ?? [];
                this.loading = false;
            },
            error: () => {
                this.questions = [];
                this.loading = false;
            }
        });
    }

    emptyForm(): QuestionForm {
        return {
            questionText: '',
            type: 'QCU',
            optionsList: ['', ''],
            correctIndices: [],
            orderIndex: this.questions ? this.questions.length : 0
        };
    }

    openAdd() {
        this.editingId = null;
        this.form = this.emptyForm();
        this.form.orderIndex = this.questions.length;
        this.showForm = true;
    }

    openEdit(q: Question) {
        this.editingId = q.id!;
        let opts: string[] = [];
        let correct: number[] = [];
        try { opts = JSON.parse(q.options); } catch { opts = []; }
        try { correct = JSON.parse(q.correctAnswers ?? '[]'); } catch { correct = []; }
        this.form = {
            questionText: q.questionText,
            type: q.type,
            optionsList: opts,
            correctIndices: correct,
            orderIndex: q.orderIndex ?? 0
        };
        this.showForm = true;
    }

    addOption() {
        this.form.optionsList.push('');
    }

    removeOption(i: number) {
        this.form.optionsList.splice(i, 1);
        this.form.correctIndices = this.form.correctIndices.filter(idx => idx !== i).map(idx => idx > i ? idx - 1 : idx);
    }

    onTypeChange() {
        this.form.correctIndices = [];
        if (this.form.type === 'TRUE_FALSE') {
            this.form.optionsList = ['Vrai', 'Faux'];
        }
    }

    toggleCorrect(i: number) {
        if (this.form.type === 'QCU' || this.form.type === 'TRUE_FALSE') {
            this.form.correctIndices = [i];
        } else {
            const idx = this.form.correctIndices.indexOf(i);
            if (idx >= 0) {
                this.form.correctIndices.splice(idx, 1);
            } else {
                this.form.correctIndices.push(i);
            }
        }
    }

    isCorrect(i: number): boolean {
        return this.form.correctIndices.includes(i);
    }

    save() {
        if (!this.form.questionText.trim()) return;
        if (this.form.optionsList.some(o => !o.trim())) return;
        if (this.form.correctIndices.length === 0) return;

        const data = {
            questionText: this.form.questionText,
            type: this.form.type,
            options: JSON.stringify(this.form.optionsList),
            correctAnswers: JSON.stringify(this.form.correctIndices),
            orderIndex: this.form.orderIndex
        };

        if (this.editingId) {
            this.svc.updateQuestion(this.editingId, data).subscribe({
                next: () => {
                    this.loadQuestions();
                    this.showForm = false;
                },
                error: () => { }
            });
        } else {
            this.svc.addQuestion(this.quizId, data).subscribe({
                next: () => {
                    this.loadQuestions();
                    this.showForm = false;
                },
                error: () => { }
            });
        }
    }

    deleteQuestion(id: number) {
        if (confirm('Supprimer cette question ?')) {
            this.svc.deleteQuestion(id).subscribe({
                next: () => this.loadQuestions(),
                error: () => { }
            });
        }
    }

    cancel() {
        this.showForm = false;
        this.editingId = null;
    }

    goBack() {
        this.router.navigate(['/app/formation/quiz']);
    }

    parseOptions(q: Question): string[] {
        try { return JSON.parse(q.options); } catch { return []; }
    }

    parseCorrect(q: Question): number[] {
        try { return JSON.parse(q.correctAnswers ?? '[]'); } catch { return []; }
    }

    getTypeBadge(type: QuestionType): string {
        switch (type) {
            case 'QCU': return 'Choix unique';
            case 'QCM': return 'Choix multiples';
            case 'TRUE_FALSE': return 'Vrai / Faux';
        }
    }

    trackByIndex(index: number): number {
        return index;
    }

    // --- AI Generation ---

    openAiModal() {
        this.aiTopic = '';
        this.aiCount = 5;
        this.aiTypes = ['QCU'];
        this.aiError = '';
        this.aiGenerating = false;
        this.showAiModal = true;
    }

    closeAiModal() {
        this.showAiModal = false;
        this.aiGenerating = false;
    }

    toggleAiType(type: string) {
        const idx = this.aiTypes.indexOf(type);
        if (idx >= 0) {
            this.aiTypes.splice(idx, 1);
        } else {
            this.aiTypes.push(type);
        }
    }

    isAiTypeSelected(type: string): boolean {
        return this.aiTypes.includes(type);
    }

    generateWithAi() {
        if (!this.aiTopic.trim() || this.aiTypes.length === 0) {
            this.aiError = 'Veuillez remplir le sujet et sélectionner au moins un type de question.';
            return;
        }
        this.aiGenerating = true;
        this.aiError = '';

        this.svc.generateQuestions(this.quizId, {
            topic: this.aiTopic,
            numberOfQuestions: this.aiCount,
            questionTypes: this.aiTypes
        }).subscribe({
            next: () => {
                this.loadQuestions();
                this.showAiModal = false;
                this.aiGenerating = false;
            },
            error: (err) => {
                this.aiError = 'Erreur lors de la génération. Veuillez réessayer.';
                this.aiGenerating = false;
                console.error('AI generation error:', err);
            }
        });
    }
}

