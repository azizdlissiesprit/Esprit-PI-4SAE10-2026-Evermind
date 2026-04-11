import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniGameResult } from '../../../../core/models/game.models';

@Component({
  selector: 'app-pattern-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pattern-game-container">
      <div class="game-header">
        <h3>🔷 Maître des Patterns</h3>
        <div class="game-stats">
          <span class="level">🎯 Niveau {{ currentLevel }}</span>
          <span class="score">⭐ {{ score }}%</span>
          <span class="timer">⏱️ {{ timeLeft }}s</span>
        </div>
      </div>

      <div class="game-phase" *ngIf="phase === 'show'">
        <div class="instruction">
          <h4>👁️ Mémorisez le pattern</h4>
          <p>Observez attentivement les cases colorées</p>
        </div>
        
        <div class="pattern-grid" [ngClass]="'grid-' + gridSize">
          <div 
            *ngFor="let cell of patternGrid; let i = index"
            class="pattern-cell"
            [class.active]="cell.isActive"
            [style.animation-delay]="(cell.delay || 0) + 's'">
            <span class="cell-content" *ngIf="cell.isActive">
              {{ cell.emoji || '' }}
            </span>
          </div>
        </div>
        
        <div class="countdown">
          <div class="countdown-bar" [style.width.%]="(showTime / maxShowTime) * 100"></div>
        </div>
      </div>

      <div class="game-phase" *ngIf="phase === 'play'">
        <div class="instruction">
          <h4>🎯 Reproduisez le pattern</h4>
          <p>Cliquez sur les cases pour recréer le motif</p>
        </div>
        
        <div class="pattern-grid" [ngClass]="'grid-' + gridSize">
          <div 
            *ngFor="let cell of userGrid; let i = index"
            class="pattern-cell user-cell"
            [class.active]="cell.isActive"
            [class.correct]="cell.isCorrect"
            [class.incorrect]="cell.isIncorrect"
            (click)="toggleCell(i)">
            <span class="cell-content" *ngIf="cell.isActive">
              {{ cell.emoji || '' }}
            </span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-check" (click)="checkPattern()" [disabled]="getActiveCount() === 0">
            ✓ Vérifier
          </button>
          <button class="btn-clear" (click)="clearPattern()">
            🗑️ Effacer
          </button>
          <button class="btn-hint" (click)="showHint()" [disabled]="hintsUsed >= maxHints">
            💡 Indice ({{ maxHints - hintsUsed }})
          </button>
        </div>
      </div>

      <div class="game-phase" *ngIf="phase === 'feedback'">
        <div class="feedback" [class]="feedbackType">
          <div class="feedback-icon">
            <span *ngIf="feedbackType === 'perfect'">🏆</span>
            <span *ngIf="feedbackType === 'good'">🎉</span>
            <span *ngIf="feedbackType === 'partial'">🤔</span>
            <span *ngIf="feedbackType === 'wrong'">😔</span>
          </div>
          <h4>{{ feedbackTitle }}</h4>
          <p>{{ feedbackMessage }}</p>
          
          <div class="pattern-comparison">
            <div class="comparison-grid">
              <div class="grid-label">Original:</div>
              <div class="pattern-grid small" [ngClass]="'grid-' + gridSize">
                <div *ngFor="let cell of patternGrid" class="pattern-cell small" [class.active]="cell.isActive"></div>
              </div>
            </div>
            <div class="comparison-grid">
              <div class="grid-label">Votre réponse:</div>
              <div class="pattern-grid small" [ngClass]="'grid-' + gridSize">
                <div *ngFor="let cell of userGrid" class="pattern-cell small" [class.active]="cell.isActive"></div>
              </div>
            </div>
          </div>
          
          <div class="stats">
            <span>✅ Correct: {{ correctCells }}</span>
            <span>❌ Incorrect: {{ incorrectCells }}</span>
            <span>⏱️ Temps: {{ usedTime }}s</span>
          </div>
          
          <button class="btn-next" (click)="nextRound()">
            {{ feedbackType === 'perfect' || feedbackType === 'good' ? '➡️ Niveau Suivant' : '🔄 Réessayer' }}
          </button>
        </div>
      </div>

      <div class="game-complete" *ngIf="phase === 'complete'">
        <div class="completion">
          <div class="trophy">🏆</div>
          <h4>Maître des Patterns !</h4>
          <p>Vous avez atteint le niveau {{ currentLevel }} !</p>
          <div class="final-stats">
            <span>Score Final: {{ score }}%</span>
            <span>Niveaux: {{ currentLevel }}</span>
            <span>Précision: {{ overallAccuracy }}%</span>
          </div>
          <button class="btn-restart" (click)="restartGame()">🔄 Rejouer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pattern-game-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .game-header {
      text-align: center;
      margin-bottom: 24px;
      
      h3 {
        margin: 0 0 12px 0;
        font-size: 1.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .game-stats {
        display: flex;
        justify-content: center;
        gap: 20px;
        font-size: 0.9rem;
        
        span {
          background: rgba(255,255,255,0.2);
          padding: 6px 12px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
      }
    }

    .game-phase {
      text-align: center;
    }

    .instruction {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 1.2rem;
      }
      
      p {
        margin: 0;
        opacity: 0.9;
      }
    }

    .pattern-grid {
      display: grid;
      gap: 8px;
      max-width: 400px;
      margin: 0 auto 24px;
      padding: 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }

    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    .grid-5 { grid-template-columns: repeat(5, 1fr); }

    .pattern-cell {
      aspect-ratio: 1;
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .pattern-cell.active {
      background: linear-gradient(45deg, #f093fb, #f5576c);
      border-color: rgba(255,255,255,0.5);
      animation: pulse 2s infinite;
      box-shadow: 0 0 20px rgba(240, 147, 251, 0.5);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .user-cell {
      cursor: pointer;
    }

    .user-cell.correct {
      background: linear-gradient(45deg, #11998e, #38ef7d);
      border-color: #38ef7d;
    }

    .user-cell.incorrect {
      background: linear-gradient(45deg, #eb3349, #f45c43);
      border-color: #f45c43;
      animation: shake 0.5s ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .cell-content {
      font-size: 1.5rem;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .pattern-cell.small {
      max-width: 30px;
      max-height: 30px;
      font-size: 0.8rem;
    }

    .countdown {
      width: 200px;
      height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      margin: 0 auto;
      overflow: hidden;
    }

    .countdown-bar {
      height: 100%;
      background: linear-gradient(90deg, #00d2ff, #3a7bd5);
      border-radius: 4px;
      transition: width 0.1s linear;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-check, .btn-clear, .btn-hint {
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-check {
      background: linear-gradient(45deg, #00d2ff, #3a7bd5);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-clear {
      background: rgba(255,255,255,0.2);
      color: white;
      
      &:hover {
        background: rgba(255,255,255,0.3);
      }
    }

    .btn-hint {
      background: linear-gradient(45deg, #f2994a, #f2c94c);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .feedback {
      padding: 32px;
      border-radius: 16px;
      margin: 20px 0;
      animation: fadeIn 0.5s ease-out;
    }

    .feedback.perfect {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #333;
    }

    .feedback.good {
      background: linear-gradient(135deg, #11998e, #38ef7d);
    }

    .feedback.partial {
      background: linear-gradient(135deg, #f2994a, #f2c94c);
    }

    .feedback.wrong {
      background: linear-gradient(135deg, #eb3349, #f45c43);
    }

    .feedback-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .pattern-comparison {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    .comparison-grid {
      text-align: center;
    }

    .grid-label {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .pattern-grid.small {
      padding: 8px;
      gap: 4px;
      max-width: 150px;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 16px 0;
      flex-wrap: wrap;
      
      span {
        background: rgba(255,255,255,0.2);
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 0.9rem;
      }
    }

    .btn-next {
      background: rgba(255,255,255,0.3);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255,255,255,0.4);
        transform: translateY(-2px);
      }
    }

    .completion {
      text-align: center;
      padding: 40px 20px;
    }

    .trophy {
      font-size: 4rem;
      margin-bottom: 16px;
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .final-stats {
      margin: 16px 0;
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      
      span {
        background: rgba(255,255,255,0.2);
        padding: 8px 16px;
        border-radius: 20px;
      }
    }

    .btn-restart {
      background: linear-gradient(45deg, #00d2ff, #3a7bd5);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      }
    }

    @media (max-width: 480px) {
      .pattern-grid {
        gap: 6px;
        padding: 12px;
      }
      
      .pattern-comparison {
        gap: 16px;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn-check, .btn-clear, .btn-hint {
        width: 200px;
      }
    }
  `]
})
export class PatternGameComponent {
  @Input() config: any;
  @Output() gameComplete = new EventEmitter<MiniGameResult>();

  phase: 'show' | 'play' | 'feedback' | 'complete' = 'show';
  currentLevel: number = 1;
  score: number = 100;
  timeLeft: number = 30;
  usedTime: number = 0;
  
  gridSize: number = 3;
  patternGrid: any[] = [];
  userGrid: any[] = [];
  
  showTime: number = 3000;
  maxShowTime: number = 3000;
  timer: any;
  startTime: number = 0;
  
  hintsUsed: number = 0;
  maxHints: number = 3;
  
  correctCells: number = 0;
  incorrectCells: number = 0;
  totalCorrectCells: number = 0;
  totalAttempts: number = 0;
  
  feedbackType: 'perfect' | 'good' | 'partial' | 'wrong' = 'perfect';
  feedbackTitle: string = '';
  feedbackMessage: string = '';

  // Emojis créatifs pour les patterns
  emojis = ['🌟', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺'];

  ngOnInit() {
    this.initializeLevel();
  }

  initializeLevel() {
    // Taille de grille selon le niveau
    this.gridSize = Math.min(3 + Math.floor((this.currentLevel - 1) / 2), 5);
    
    // Générer un pattern
    this.patternGrid = this.generatePattern();
    this.userGrid = this.createEmptyGrid();
    
    // Temps selon la difficulté
    this.maxShowTime = Math.max(2000, 4000 - (this.currentLevel * 200));
    this.showTime = this.maxShowTime;
    this.timeLeft = Math.max(15, 30 - this.currentLevel);
    
    this.phase = 'show';
    this.startShowPhase();
  }

  generatePattern(): any[] {
    const grid: any[] = [];
    const totalCells = this.gridSize * this.gridSize;
    const activeCount = Math.min(3 + this.currentLevel, Math.floor(totalCells * 0.6));
    
    // Créer une grille vide
    for (let i = 0; i < totalCells; i++) {
      grid.push({
        isActive: false,
        emoji: '',
        delay: 0
      });
    }
    
    // Placer aléatoirement les cases actives
    const activeIndices = this.getRandomIndices(totalCells, activeCount);
    activeIndices.forEach((index, i) => {
      grid[index].isActive = true;
      grid[index].emoji = this.emojis[i % this.emojis.length];
      grid[index].delay = i * 0.2; // Animation delay
    });
    
    return grid;
  }

  createEmptyGrid(): any[] {
    const grid = [];
    const totalCells = this.gridSize * this.gridSize;
    
    for (let i = 0; i < totalCells; i++) {
      grid.push({
        isActive: false,
        emoji: '',
        isCorrect: false,
        isIncorrect: false
      });
    }
    
    return grid;
  }

  getRandomIndices(max: number, count: number): number[] {
    const indices = [];
    const used = new Set<number>();
    
    while (indices.length < count) {
      const index = Math.floor(Math.random() * max);
      if (!used.has(index)) {
        used.add(index);
        indices.push(index);
      }
    }
    
    return indices;
  }

  startShowPhase() {
    this.startTime = Date.now();
    
    // Timer pour le temps d'affichage
    this.timer = setInterval(() => {
      this.showTime -= 100;
      if (this.showTime <= 0) {
        clearInterval(this.timer);
        this.phase = 'play';
        this.startPlayPhase();
      }
    }, 100);
  }

  startPlayPhase() {
    // Timer pour le temps de jeu
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.checkPattern();
      }
    }, 1000);
  }

  toggleCell(index: number) {
    if (this.phase === 'play') {
      this.userGrid[index].isActive = !this.userGrid[index].isActive;
      this.userGrid[index].emoji = this.userGrid[index].isActive ? this.patternGrid[index].emoji : '';
    }
  }

  clearPattern() {
    this.userGrid = this.createEmptyGrid();
  }

  showHint() {
    if (this.hintsUsed < this.maxHints) {
      this.hintsUsed++;
      
      // Trouver une case correcte non activée
      const emptyCorrectIndices = [];
      for (let i = 0; i < this.patternGrid.length; i++) {
        if (this.patternGrid[i].isActive && !this.userGrid[i].isActive) {
          emptyCorrectIndices.push(i);
        }
      }
      
      if (emptyCorrectIndices.length > 0) {
        const hintIndex = emptyCorrectIndices[Math.floor(Math.random() * emptyCorrectIndices.length)];
        this.userGrid[hintIndex].isActive = true;
        this.userGrid[hintIndex].emoji = this.patternGrid[hintIndex].emoji;
        
        // Pénalité pour l'indice
        this.score = Math.max(0, this.score - 5);
      }
    }
  }

  getActiveCount(): number {
    return this.userGrid.filter(cell => cell.isActive).length;
  }

  checkPattern() {
    clearInterval(this.timer);
    this.usedTime = Math.max(0, this.timeLeft - this.timeLeft);
    
    // Calculer les résultats
    this.correctCells = 0;
    this.incorrectCells = 0;
    
    for (let i = 0; i < this.patternGrid.length; i++) {
      if (this.patternGrid[i].isActive && this.userGrid[i].isActive) {
        this.correctCells++;
        this.userGrid[i].isCorrect = true;
      } else if (!this.patternGrid[i].isActive && this.userGrid[i].isActive) {
        this.incorrectCells++;
        this.userGrid[i].isIncorrect = true;
      }
    }
    
    this.totalCorrectCells += this.correctCells;
    this.totalAttempts++;
    
    // Déterminer le feedback
    const totalActiveCells = this.patternGrid.filter(cell => cell.isActive).length;
    const accuracy = this.correctCells / totalActiveCells;
    
    if (accuracy === 1 && this.incorrectCells === 0) {
      this.handlePerfect();
    } else if (accuracy >= 0.8) {
      this.handleGood();
    } else if (accuracy >= 0.5) {
      this.handlePartial();
    } else {
      this.handleWrong();
    }
  }

  handlePerfect() {
    this.phase = 'feedback';
    const timeBonus = this.timeLeft * 2;
    this.score = Math.min(100, this.score + 15 + timeBonus);
    
    this.feedbackType = 'perfect';
    this.feedbackTitle = '🏆 Parfait !';
    this.feedbackMessage = 'Pattern reproduit parfaitement avec aucune erreur !';
  }

  handleGood() {
    this.phase = 'feedback';
    const timeBonus = this.timeLeft;
    this.score = Math.min(100, this.score + 10 + timeBonus);
    
    this.feedbackType = 'good';
    this.feedbackTitle = '🎉 Excellent !';
    this.feedbackMessage = 'Très bonne reproduction du pattern !';
  }

  handlePartial() {
    this.phase = 'feedback';
    this.score = Math.max(0, this.score - 5);
    
    this.feedbackType = 'partial';
    this.feedbackTitle = '🤔 Presque...';
    this.feedbackMessage = 'Quelques erreurs, mais vous y êtes presque !';
  }

  handleWrong() {
    this.phase = 'feedback';
    this.score = Math.max(0, this.score - 15);
    
    this.feedbackType = 'wrong';
    this.feedbackTitle = '😔 Incorrect';
    this.feedbackMessage = 'Le pattern n\'est pas correct. Essayez encore !';
  }

  get overallAccuracy(): number {
    return this.totalAttempts > 0 ? Math.round((this.totalCorrectCells / (this.gridSize * this.gridSize * this.totalAttempts)) * 100) : 0;
  }

  nextRound() {
    if (this.feedbackType === 'perfect' || this.feedbackType === 'good') {
      this.currentLevel++;
      if (this.currentLevel > 10) {
        this.handleGameComplete();
      } else {
        this.initializeLevel();
      }
    } else {
      this.initializeLevel();
    }
  }

  handleGameComplete() {
    this.phase = 'complete';
    
    const result: MiniGameResult = {
      type: 'pattern',
      score: this.score,
      metrics: {
        reactionTime: 700 + Math.random() * 400,
        errorRate: this.incorrectCells / (this.gridSize * this.gridSize),
        totalQuestions: this.currentLevel,
        errors: this.incorrectCells
      }
    };

    setTimeout(() => {
      this.gameComplete.emit(result);
    }, 1000);
  }

  restartGame() {
    this.currentLevel = 1;
    this.score = 100;
    this.hintsUsed = 0;
    this.totalCorrectCells = 0;
    this.totalAttempts = 0;
    this.initializeLevel();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
