import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameMetrics, MiniGameResult } from '../../../../core/models/game.models';

@Component({
  selector: 'app-cards-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cards-game-container">
      <div class="game-header">
        <h3>🃏 Jeu de Mémoire des Cartes</h3>
        <div class="game-stats">
          <span class="timer">⏱️ {{ timeLeft }}s</span>
          <span class="moves">🔄 {{ moves }} coups</span>
          <span class="score">⭐ {{ score }}%</span>
        </div>
      </div>

      <div class="game-board" *ngIf="!isGameComplete">
        <div class="cards-grid" [ngClass]="{ 'flipped': allCardsMatched }">
          <div 
            *ngFor="let card of cards; let i = index"
            class="card"
            [class.flipped]="card.isFlipped"
            [class.matched]="card.isMatched"
            (click)="flipCard(i)"
            [style.animation-delay]="i * 0.1 + 's'">
            
            <div class="card-inner">
              <div class="card-front">🎴</div>
              <div class="card-back">
                <span class="card-emoji">{{ card.emoji }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="game-complete" *ngIf="isGameComplete">
        <div class="celebration">
          <div class="trophy">🏆</div>
          <h4>Excellent !</h4>
          <p>Vous avez trouvé toutes les paires en {{ moves }} coups</p>
          <div class="final-stats">
            <span>Score: {{ score }}%</span>
            <span>Temps: {{ totalTime }}s</span>
          </div>
          <button class="btn-restart" (click)="restartGame()">🔄 Rejouer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cards-game-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .game-header {
      text-align: center;
      margin-bottom: 20px;
      
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

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      max-width: 400px;
      margin: 0 auto;
      perspective: 1000px;
    }

    .card {
      aspect-ratio: 1;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .card.flipped {
      transform: rotateY(180deg);
    }

    .card.matched {
      animation: matchPulse 0.6s ease-out;
      pointer-events: none;
    }

    @keyframes matchPulse {
      0% { transform: rotateY(180deg) scale(1); }
      50% { transform: rotateY(180deg) scale(1.1); }
      100% { transform: rotateY(180deg) scale(1); }
    }

    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    .card-front, .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .card-front {
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      border: 3px solid rgba(255,255,255,0.3);
    }

    .card-back {
      background: linear-gradient(45deg, #48dbfb, #0abde3);
      transform: rotateY(180deg);
      border: 3px solid rgba(255,255,255,0.5);
    }

    .card-emoji {
      font-size: 2.5rem;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    }

    .game-complete {
      text-align: center;
      padding: 40px 20px;
    }

    .celebration {
      animation: celebrate 0.8s ease-out;
    }

    @keyframes celebrate {
      0% { transform: scale(0) rotate(0deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
      100% { transform: scale(1) rotate(360deg); opacity: 1; }
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
      .cards-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        max-width: 300px;
      }
      
      .card-emoji {
        font-size: 2rem;
      }
    }
  `]
})
export class CardsGameComponent {
  @Input() config: any;
  @Output() gameComplete = new EventEmitter<MiniGameResult>();

  cards: any[] = [];
  flippedCards: number[] = [];
  matchedPairs: number = 0;
  moves: number = 0;
  score: number = 100;
  timeLeft: number = 60;
  totalTime: number = 0;
  isGameComplete: boolean = false;
  timer: any;
  startTime: number = 0;

  // Emojis créatifs pour les cartes
  emojis = ['🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻'];

  ngOnInit() {
    this.initializeGame();
  }

  initializeGame() {
    // Créer des paires de cartes
    const cardPairs = [];
    const cardCount = this.config?.cardsCount || 4;
    
    for (let i = 0; i < cardCount; i++) {
      const emoji = this.emojis[i % this.emojis.length];
      cardPairs.push({ emoji, id: i, isFlipped: false, isMatched: false });
      cardPairs.push({ emoji, id: i + 100, isFlipped: false, isMatched: false }); // ID unique
    }

    // Mélanger les cartes
    this.cards = this.shuffleArray(cardPairs);
    this.startTimer();
    this.startTime = Date.now();
  }

  shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  flipCard(index: number) {
    const card = this.cards[index];
    
    // Empêcher de cliquer sur les cartes déjà retournées ou appariées
    if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
      return;
    }

    // Retourner la carte
    card.isFlipped = true;
    this.flippedCards.push(index);

    // Vérifier si deux cartes sont retournées
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }
  }

  checkMatch() {
    const [first, second] = this.flippedCards;
    const firstCard = this.cards[first];
    const secondCard = this.cards[second];

    if (firstCard.id === secondCard.id || firstCard.emoji === secondCard.emoji) {
      // Les cartes correspondent
      setTimeout(() => {
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        this.matchedPairs++;
        this.flippedCards = [];

        // Calculer le score
        this.calculateScore();

        // Vérifier si le jeu est terminé
        if (this.matchedPairs === this.cards.length / 2) {
          this.endGame();
        }
      }, 600);
    } else {
      // Les cartes ne correspondent pas
      setTimeout(() => {
        firstCard.isFlipped = false;
        secondCard.isFlipped = false;
        this.flippedCards = [];
      }, 1000);
    }
  }

  calculateScore() {
    // Score basé sur le temps et le nombre de coups
    const timeBonus = Math.max(0, this.timeLeft * 2);
    const movesPenalty = Math.max(0, (this.moves - this.cards.length) * 5);
    this.score = Math.max(0, Math.min(100, 100 + timeBonus - movesPenalty));
  }

  endGame() {
    clearInterval(this.timer);
    this.isGameComplete = true;
    this.totalTime = 60 - this.timeLeft;

    // Émettre le résultat
    const result: MiniGameResult = {
      type: 'cards',
      score: this.score,
      metrics: {
        reactionTime: 800 + Math.random() * 400,
        errorRate: this.moves / (this.cards.length * 2),
        totalQuestions: this.cards.length,
        errors: this.moves - this.matchedPairs
      }
    };

    setTimeout(() => {
      this.gameComplete.emit(result);
    }, 1000);
  }

  restartGame() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 100;
    this.timeLeft = 60;
    this.isGameComplete = false;
    this.initializeGame();
  }

  get allCardsMatched(): boolean {
    return this.matchedPairs === this.cards.length / 2;
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
