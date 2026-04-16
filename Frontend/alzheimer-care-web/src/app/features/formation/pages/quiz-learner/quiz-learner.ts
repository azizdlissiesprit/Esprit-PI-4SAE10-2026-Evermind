import { Component, OnInit, AfterViewInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormationService, Quiz, Question, QuestionType, QuizTentativeResult } from '../../services/formation.service';
import { catchError, finalize, of, switchMap, timeout } from 'rxjs';
import { FormationStepperComponent } from '../../components/formation-stepper/formation-stepper';
import gsap from 'gsap';

@Component({
  selector: 'app-quiz-learner',
  standalone: true,
  imports: [CommonModule, FormationStepperComponent],
  templateUrl: './quiz-learner.html',
  styleUrls: ['./quiz-learner.scss']
})
export class QuizLearnerComponent implements OnInit, AfterViewInit {
  moduleId!: number;
  quizzes: Quiz[] = [];
  quiz: Quiz | null = null;
  questions: Question[] = [];
  currentIndex = 0;

  // For QCU / TRUE_FALSE: single selection
  selectedAnswer: number | null = null;
  // For QCM: multiple selections
  selectedAnswers: Set<number> = new Set();
  answerConfirmed = false;

  // Collect all answers for submission
  allAnswers: Record<string, number[]> = {};

  score = 0;
  showResult = false;
  passed = false;
  loading = true;
  tentativeResult: QuizTentativeResult | null = null;
  certificateCode: string | null = null;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: FormationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.moduleId = Number(params.get('moduleId')) || 1;
      this.loadModuleQuizzes();
    });
  }

  private loadModuleQuizzes() {
    this.loading = true;
    this.resetQuizState();
    this.quizzes = [];
    this.quiz = null;
    // Load all quizzes for this module, then auto-load the first one
    this.svc.getQuizzesByModuleId(this.moduleId).pipe(
      timeout(5000),
      catchError(() => of([] as Quiz[])),
      switchMap((quizzes) => {
        this.quizzes = Array.isArray(quizzes) ? quizzes : [];
        if (this.quizzes.length > 0) {
          this.quiz = this.quizzes[0];
          return this.loadQuestionsForSelectedQuiz();
        }
        this.quiz = null;
        return of([] as Question[]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (questions) => {
        this.questions = questions ?? [];
      },
      error: () => {
        this.questions = [];
      }
    });
  }

  selectQuiz(quiz: Quiz) {
    if (!quiz?.id || (this.quiz?.id === quiz.id)) {
      return;
    }
    this.quiz = quiz;
    this.loading = true;
    this.resetQuizState();
    this.loadQuestionsForSelectedQuiz()
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (questions) => {
          this.questions = questions ?? [];
        },
        error: () => {
          this.questions = [];
        }
      });
  }

  selectQuizById(quizId: string) {
    const parsedId = Number(quizId);
    const selected = this.quizzes.find((q) => q.id === parsedId);
    if (selected) {
      this.selectQuiz(selected);
    }
  }

  private loadQuestionsForSelectedQuiz() {
    if (this.quiz?.id && this.quiz.id > 0) {
      return this.svc.getStudentQuestions(this.quiz.id).pipe(
        timeout(5000),
        catchError(() => of([] as Question[]))
      );
    }
    return of([] as Question[]);
  }

  private resetQuizState() {
    this.questions = [];
    this.currentIndex = 0;
    this.selectedAnswer = null;
    this.selectedAnswers = new Set();
    this.answerConfirmed = false;
    this.allAnswers = {};
    this.score = 0;
    this.showResult = false;
    this.passed = false;
    this.tentativeResult = null;
    this.certificateCode = null;
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    setTimeout(() => {
      const el = document.querySelector('.quiz-card');
      if (el) gsap.from(el, { opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(1.2)' });
    }, 200);
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentIndex] ?? null;
  }

  get currentOptions(): string[] {
    if (!this.currentQuestion) return [];
    try { return JSON.parse(this.currentQuestion.options); } catch { return []; }
  }

  get currentType(): QuestionType {
    return this.currentQuestion?.type ?? 'QCU';
  }

  selectAnswer(index: number) {
    if (this.answerConfirmed) return;
    if (this.currentType === 'QCM') {
      if (this.selectedAnswers.has(index)) {
        this.selectedAnswers.delete(index);
      } else {
        this.selectedAnswers.add(index);
      }
    } else {
      // QCU or TRUE_FALSE
      this.selectedAnswer = index;
    }
    this.cdr.detectChanges();
  }

  confirmAnswer() {
    if (this.answerConfirmed) return;
    const q = this.currentQuestion;
    if (!q) return;

    let answer: number[];
    if (this.currentType === 'QCM') {
      answer = Array.from(this.selectedAnswers).sort();
    } else {
      if (this.selectedAnswer === null) return;
      answer = [this.selectedAnswer];
    }

    // Store answer
    this.allAnswers[String(q.id)] = answer;
    this.answerConfirmed = true;

    if (!this.isBrowser) return;
    const btns = document.querySelectorAll('.option-btn');
    if (btns.length) {
      btns.forEach((btn) => {
        gsap.fromTo(btn, { scale: 1 }, { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1 });
      });
    }
  }

  get hasSelection(): boolean {
    if (this.currentType === 'QCM') return this.selectedAnswers.size > 0;
    return this.selectedAnswer !== null;
  }

  nextQuestion() {
    this.selectedAnswer = null;
    this.selectedAnswers = new Set();
    this.answerConfirmed = false;
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.cdr.detectChanges();
      if (this.isBrowser) {
        const card = document.querySelector('.quiz-card');
        if (card) gsap.from(card, { opacity: 0, x: 30, duration: 0.4 });
      }
    } else {
      this.submitQuiz();
    }
  }

  submitQuiz() {
    if (!this.quiz?.id || this.quiz.id <= 0) {
      // Fallback: just show result screen
      this.showResult = true;
      return;
    }

    this.loading = true;
    // userId = 1 as placeholder (would come from auth in real app)
    this.svc.submitQuizTentative({
      quizId: this.quiz.id,
      userId: 1,
      answers: this.allAnswers
    }).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (result) => {
        this.tentativeResult = result;
        this.score = result.score;
        this.passed = result.passed;
        this.certificateCode = result.certificateCode || null;
        this.showResult = true;
        this.animateResult();
      },
      error: () => {
        this.showResult = true;
        this.passed = false;
      }
    });
  }

  private animateResult() {
    if (!this.isBrowser) return;
    setTimeout(() => {
      if (this.passed) {
        const pass = document.querySelector('.result-pass');
        const conf = document.querySelectorAll('.confetti');
        if (pass) gsap.fromTo(pass, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
        if (conf.length) gsap.to(conf, { y: 400, opacity: 0, duration: 2.5, stagger: 0.08, ease: 'power2.out' });
      } else {
        const fail = document.querySelector('.result-fail');
        if (fail) gsap.from(fail, { opacity: 0, y: 20, duration: 0.5 });
      }
    }, 150);
  }

  goToCertificate() {
    const params: any = { score: this.score, total: this.questions.length, moduleId: this.moduleId, passed: this.passed ? '1' : '0' };
    if (this.certificateCode) {
      params.certificateCode = this.certificateCode;
    }
    this.router.navigate(['/app/user-interface/certificat'], { queryParams: params });
  }

  goBack() {
    this.router.navigate(['/app/user-interface']);
  }

  getOptionLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  isSelected(i: number): boolean {
    if (this.currentType === 'QCM') return this.selectedAnswers.has(i);
    return this.selectedAnswer === i;
  }
}
