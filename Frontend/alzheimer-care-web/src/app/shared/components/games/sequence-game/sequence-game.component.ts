import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniGameResult } from '../../../../core/models/game.models';

@Component({
  selector: 'app-sequence-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sequence-game-container">
      <div class="game-header">
        <h3>🔢 Suite Numérique Mystérieuse</h3>
        <div class="game-stats">
          <span class="level">🎯 Niveau {{ currentLevel }}</span>
          <span class="score">⭐ {{ score }}%</span>
          <span class="lives">❤️ {{ lives }}</span>
        </div>
      </div>

      <div class="game-phase" *ngIf="phase === 'show'">
        <div class="instruction">
          <h4>👁️ Mémorisez la suite</h4>
          <p>Observez attentivement la séquence qui va apparaître</p>
        </div>
        
        <div class="sequence-display">
          <div 
            *ngFor="let num of currentSequence; let i = index"
            class="sequence-number"
            [style.animation-delay]="i * 0.5 + 's'">
            {{ num }}
          </div>
        </div>
        
        <div class="countdown">
          <div class="countdown-bar" [style.width.%]="(showTime / maxShowTime) * 100"></div>
        </div>
      </div>

      <div class="game-phase" *ngIf="phase === 'input'">
        <div class="instruction">
          <h4>✍️ Reproduisez la suite</h4>
          <p>Cliquez sur les nombres dans le bon ordre</p>
        </div>
        
        <div class="user-sequence">
          <div *ngFor="let num of userSequence; let i = index" class="user-number">
            {{ num }}
            <span class="remove-btn" (click)="removeLastNumber()">×</span>
          </div>
        </div>
        
        <div class="number-pad">
          <button 
            *ngFor="let num of availableNumbers"
            class="number-btn"
            [class.used]="isNumberUsed(num)"
            [disabled]="isNumberUsed(num)"
            (click)="addNumber(num)">
            {{ num }}
          </button>
        </div>
        
        <div class="action-buttons">
          <button class="btn-submit" (click)="submitSequence()" [disabled]="userSequence.length === 0">
            ✓ Valider
          </button>
          <button class="btn-clear" (click)="clearSequence()">
            🗑️ Effacer
          </button>
        </div>
      </div>

      <div class="game-phase" *ngIf="phase === 'feedback'">
        <div class="feedback" [class]="feedbackType">
          <div class="feedback-icon">
            <span *ngIf="feedbackType === 'success'">🎉</span>
            <span *ngIf="feedbackType === 'error'">😔</span>
            <span *ngIf="feedbackType === 'partial'">🤔</span>
          </div>
          <h4>{{ feedbackTitle }}</h4>
          <p>{{ feedbackMessage }}</p>
          
          <div class="comparison" *ngIf="feedbackType !== 'success'">
            <div class="expected">
              <span class="label">Attendu:</span>
              <div class="sequence-numbers">{{ currentSequence.join(' - ') }}</div>
            </div>
            <div class="yours">
              <span class="label">Votre réponse:</span>
              <div class="sequence-numbers">{{ userSequence.join(' - ') }}</div>
            </div>
          </div>
          
          <button class="btn-next" (click)="nextRound()">
            {{ feedbackType === 'success' ? '➡️ Niveau Suivant' : '🔄 Réessayer' }}
          </button>
        </div>
      </div>

      <div class="game-complete" *ngIf="phase === 'complete'">
        <div class="completion">
          <div class="trophy">🏆</div>
          <h4>Excellent !</h4>
          <p>Vous avez atteint le niveau {{ currentLevel }} !</p>
          <div class="final-stats">
            <span>Score Final: {{ score }}%</span>
            <span>Niveaux: {{ currentLevel }}</span>
          </div>
          <button class="btn-restart" (click)="restartGame()">🔄 Rejouer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sequence-game-container {
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

    .sequence-display {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .sequence-number {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #f093fb, #f5576c);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      animation: fadeInScale 0.5s ease-out forwards;
      opacity: 0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    @keyframes fadeInScale {
      0% { opacity: 0; transform: scale(0); }
      100% { opacity: 1; transform: scale(1); }
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

    .user-sequence {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      min-height: 40px;
    }

    .user-number {
      background: rgba(255,255,255,0.3);
      padding: 8px 16px;
      border-radius: 25px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .remove-btn {
      cursor: pointer;
      font-size: 1.2rem;
      opacity: 0.7;
      transition: opacity 0.2s;
      
      &:hover { opacity: 1; }
    }

    .number-pad {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      max-width: 400px;
      margin: 0 auto 24px;
    }

    .number-btn {
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 15px;
      background: linear-gradient(45deg, #4facfe, #00f2fe);
      color: white;
      font-size: 1.3rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      
      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        transform: scale(0.9);
      }
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .btn-submit, .btn-clear {
      padding: 12px 24px;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-submit {
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

    .feedback {
      padding: 32px;
      border-radius: 16px;
      margin: 20px 0;
      animation: fadeIn 0.5s ease-out;
    }

    .feedback.success {
      background: linear-gradient(135deg, #11998e, #38ef7d);
    }

    .feedback.error {
      background: linear-gradient(135deg, #eb3349, #f45c43);
    }

    .feedback.partial {
      background: linear-gradient(135deg, #f2994a, #f2c94c);
    }

    .feedback-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .comparison {
      margin: 20px 0;
      text-align: left;
      
      .label {
        font-weight: 600;
        display: block;
        margin-bottom: 4px;
      }
      
      .sequence-numbers {
        background: rgba(255,255,255,0.2);
        padding: 8px 12px;
        border-radius: 8px;
        font-family: monospace;
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
      .number-pad {
        grid-template-columns: repeat(4, 1fr);
        max-width: 320px;
      }
      
      .number-btn {
        width: 50px;
        height: 50px;
        font-size: 1.1rem;
      }
    }
  `]
})
export class SequenceGameComponent {
  @Input() config: any;
  @Output() gameComplete = new EventEmitter<MiniGameResult>();

  phase: 'show' | 'input' | 'feedback' | 'complete' = 'show';
  currentLevel: number = 1;
  score: number = 100;
  lives: number = 3;
  
  currentSequence: number[] = [];
  userSequence: number[] = [];
  availableNumbers: number[] = [];
  
  showTime: number = 3000;
  maxShowTime: number = 3000;
  timer: any;
  startTime: number = 0;
  
  feedbackType: 'success' | 'error' | 'partial' = 'success';
  feedbackTitle: string = '';
  feedbackMessage: string = '';

  ngOnInit() {
    this.initializeLevel();
  }

  initializeLevel() {
    // Générer une séquence selon le niveau
    const sequenceLength = Math.min(3 + this.currentLevel, 8);
    this.currentSequence = this.generateSequence(sequenceLength);
    this.userSequence = [];
    this.availableNumbers = Array.from({length: 10}, (_, i) => i + 1);
    
    // Temps d'affichage selon la difficulté
    this.maxShowTime = Math.max(2000, 5000 - (this.currentLevel * 500));
    this.showTime = this.maxShowTime;
    
    this.phase = 'show';
    this.startShowPhase();
  }

  generateSequence(length: number): number[] {
    const sequence = [];
    const usedNumbers = new Set<number>();
    
    for (let i = 0; i < length; i++) {
      let num;
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (usedNumbers.has(num) && usedNumbers.size < 9);
      
      usedNumbers.add(num);
      sequence.push(num);
    }
    
    return sequence;
  }

  startShowPhase() {
    this.startTime = Date.now();
    
    // Timer pour le temps d'affichage
    this.timer = setInterval(() => {
      this.showTime -= 100;
      if (this.showTime <= 0) {
        clearInterval(this.timer);
        this.phase = 'input';
      }
    }, 100);
  }

  addNumber(num: number) {
    if (this.userSequence.length < this.currentSequence.length) {
      this.userSequence.push(num);
      
      // Validation automatique si la séquence est complète
      if (this.userSequence.length === this.currentSequence.length) {
        setTimeout(() => this.submitSequence(), 500);
      }
    }
  }

  removeLastNumber() {
    if (this.userSequence.length > 0) {
      this.userSequence.pop();
    }
  }

  clearSequence() {
    this.userSequence = [];
  }

  isNumberUsed(num: number): boolean {
    return this.userSequence.includes(num);
  }

  submitSequence() {
    clearInterval(this.timer);
    
    const isCorrect = this.arraysEqual(this.userSequence, this.currentSequence);
    
    if (isCorrect) {
      this.handleSuccess();
    } else {
      this.handleError();
    }
  }

  handleSuccess() {
    this.phase = 'feedback';
    
    // Bonus pour rapidité
    const timeBonus = Math.max(0, Math.floor((this.maxShowTime - (Date.now() - this.startTime)) / 100));
    this.score = Math.min(100, this.score + 10 + timeBonus);
    
    this.feedbackType = 'success';
    this.feedbackTitle = '🎉 Parfait !';
    this.feedbackMessage = `Excellent ! Vous avez reproduit la séquence de ${this.currentSequence.length} nombres`;
  }

  handleError() {
    this.phase = 'feedback';
    this.lives--;
    this.score = Math.max(0, this.score - 15);
    
    if (this.lives <= 0) {
      this.handleGameOver();
    } else {
      const correctCount = this.getCorrectCount();
      
      if (correctCount === 0) {
        this.feedbackType = 'error';
        this.feedbackTitle = '😔 Incorrect';
        this.feedbackMessage = 'Aucun nombre correct. Essayez encore !';
      } else {
        this.feedbackType = 'partial';
        this.feedbackTitle = '🤔 Presque !';
        this.feedbackMessage = `${correctCount}/${this.currentSequence.length} nombres corrects`;
      }
    }
  }

  getCorrectCount(): number {
    let correct = 0;
    for (let i = 0; i < Math.min(this.userSequence.length, this.currentSequence.length); i++) {
      if (this.userSequence[i] === this.currentSequence[i]) {
        correct++;
      } else {
        break;
      }
    }
    return correct;
  }

  arraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
  }

  handleGameOver() {
    this.phase = 'complete';
    
    const result: MiniGameResult = {
      type: 'sequence',
      score: this.score,
      metrics: {
        reactionTime: 600 + Math.random() * 300,
        errorRate: (3 - this.lives) / 3,
        totalQuestions: this.currentLevel,
        errors: 3 - this.lives
      }
    };

    setTimeout(() => {
      this.gameComplete.emit(result);
    }, 1000);
  }

  nextRound() {
    if (this.feedbackType === 'success') {
      this.currentLevel++;
      if (this.currentLevel > 8) {
        this.handleGameOver();
      } else {
        this.initializeLevel();
      }
    } else {
      this.initializeLevel();
    }
  }

  restartGame() {
    this.currentLevel = 1;
    this.score = 100;
    this.lives = 3;
    this.initializeLevel();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
