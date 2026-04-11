import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { GameService } from '../../../core/services/game.service';
import { PatientComparisonService } from '../../../core/services/patient-comparison.service';

// Components
import { MlInsightsComponent } from '../../../shared/components/ml-insights/ml-insights.component';
import { CardsGameComponent } from '../../../shared/components/games/cards-game/cards-game.component';
import { SequenceGameComponent } from '../../../shared/components/games/sequence-game/sequence-game.component';
import { PatternGameComponent } from '../../../shared/components/games/pattern-game/pattern-game.component';

// Models
import { GameSession, GameDifficulty, GameConfig, MiniGameResult, GameMetrics, MlDifficultyResponse, MlDetectionResponse } from '../../../core/models/game.models';

export interface GameSelection {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: GameDifficulty;
  estimatedTime: number;
  completed: boolean;
  score?: number;
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    MlInsightsComponent,
    CardsGameComponent,
    SequenceGameComponent,
    PatternGameComponent
  ],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent implements OnInit, OnDestroy {

  patientId = '';
  gameHistory: GameSession[] = [];
  mlDifficulty: MlDifficultyResponse | null = null;
  mlDetection: MlDetectionResponse | null = null;
  currentDifficulty: GameDifficulty = 'EASY';
  gameConfig: GameConfig | null = null;

  gamePhase: 'selection' | 'playing' | 'results' = 'selection';
  isLoading = false;
  selectedGameType: string = '';

  // Scores jeux en cours
  currentScores = { cards: 0, sequence: 0, pattern: 0, verbal: 0 };
  currentMetrics = { reactionTime: 0, errorRate: 0, totalQuestions: 0, errors: 0 };

  // Liste des jeux disponibles
  availableGames: GameSelection[] = [
    {
      id: 'cards',
      name: 'Jeu de Mémoire des Cartes',
      icon: '🃏',
      description: 'Mémorisez et retrouvez les paires de cartes identiques',
      difficulty: 'EASY',
      estimatedTime: 5,
      completed: false
    },
    {
      id: 'sequence',
      name: 'Suite Numérique',
      icon: '🔢',
      description: 'Reproduisez des séquences de nombres de mémoire',
      difficulty: 'MEDIUM',
      estimatedTime: 8,
      completed: false
    },
    {
      id: 'pattern',
      name: 'Reproduction de Patterns',
      icon: '🔷',
      description: 'Reproduisez des patterns visuels sur une grille',
      difficulty: 'MEDIUM',
      estimatedTime: 10,
      completed: false
    },
    {
      id: 'verbal',
      name: 'Évaluation Verbale',
      icon: '🗣️',
      description: 'Questions cognitives et tests de mémoire verbale',
      difficulty: 'HARD',
      estimatedTime: 15,
      completed: false
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.patientId = 'P-2024-8521';
    this.initializeGameConfig();
    this.loadGameData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser la configuration des jeux
   */
  private initializeGameConfig(): void {
    this.gameConfig = {
      cardsCount: 8,
      sequenceLength: 4,
      patternSize: 3,
      verbalQuestions: 5,
      timeLimit: 300,
      difficulty: this.currentDifficulty
    };
  }

  /**
   * Charger les données de jeu existantes
   */
  private loadGameData(): void {
    this.isLoading = true;
    
    // Charger l'historique des sessions
    this.gameService.getGameHistory(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.gameHistory = sessions;
          this.updateGameCompletionStatus();
          this.loadMLData();
        },
        error: (error) => {
          console.error('Error loading game history:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Mettre à jour le statut de complétion des jeux
   */
  private updateGameCompletionStatus(): void {
    if (this.gameHistory.length > 0) {
      const latestSession = this.gameHistory[0];
      this.currentScores = {
        cards: latestSession.cardsScore || 0,
        sequence: latestSession.sequenceScore || 0,
        pattern: latestSession.patternScore || 0,
        verbal: latestSession.verbalScore || 0
      };

      // Mettre à jour le statut des jeux
      this.availableGames.forEach(game => {
        game.completed = this.currentScores[game.id as keyof typeof this.currentScores] > 0;
        game.score = this.currentScores[game.id as keyof typeof this.currentScores];
      });
    }
  }

  /**
   * Charger les données ML
   */
  private loadMLData(): void {
    // Charger les recommandations de difficulté
    this.gameService.getDifficultyRecommendation(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (difficulty) => {
          this.mlDifficulty = difficulty;
          if (difficulty.recommendedDifficulty) {
            this.currentDifficulty = difficulty.recommendedDifficulty;
            this.updateGameDifficulties();
          }
        },
        error: (error) => {
          console.error('Error loading ML difficulty:', error);
        }
      });

    // Charger les détections d'anomalies
    this.gameService.getAnomalyDetection(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detection) => {
          this.mlDetection = detection;
        },
        error: (error) => {
          console.error('Error loading ML detection:', error);
        }
      });

    this.isLoading = false;
  }

  /**
   * Mettre à jour les difficultés des jeux
   */
  private updateGameDifficulties(): void {
    this.availableGames.forEach(game => {
      // Adapter la difficulté selon la recommandation ML
      if (this.currentDifficulty === 'EASY' && game.difficulty === 'HARD') {
        game.difficulty = 'MEDIUM';
      } else if (this.currentDifficulty === 'HARD' && game.difficulty === 'EASY') {
        game.difficulty = 'MEDIUM';
      }
    });
  }

  /**
   * Sélectionner un jeu à jouer
   */
  selectGame(gameId: string): void {
    this.selectedGameType = gameId;
    this.gamePhase = 'playing';
  }

  /**
   * Gérer la complétion d'un jeu
   */
  onGameComplete(result: MiniGameResult): void {
    console.log('🎮 GAME COMPLETED - DÉTAILS COMPLETS:');
    console.log('📊 Résultat reçu:', result);
    console.log('🎯 Type de jeu:', result.type);
    console.log('💯 Score reçu:', result.score);
    console.log('⏱️ Métriques:', result.metrics);
    
    console.log('📈 ÉTAT AVANT MISE À JOUR:');
    console.log('Scores actuels:', this.currentScores);
    console.log('Jeux disponibles:', this.availableGames);
    
    // Mettre à jour les scores
    this.currentScores[result.type] = result.score;
    this.currentMetrics = result.metrics;
    
    console.log('✅ SCORES MIS À JOUR:');
    console.log('Nouveaux scores:', this.currentScores);
    
    // Mettre à jour le statut du jeu
    const game = this.availableGames.find(g => g.id === result.type);
    if (game) {
      console.log('🎮 Jeu trouvé:', game);
      game.completed = true;
      game.score = result.score;
      console.log('✅ Jeu mis à jour:', game);
    } else {
      console.error('❌ Jeu non trouvé pour le type:', result.type);
    }

    // Mettre à jour les scores dans le service
    console.log('🔄 Mise à jour des scores dans le service...');
    this.gameService.updateGameScores(this.patientId, result.type, result.score, result.metrics);

    // Envoyer les données au service ML
    console.log('🤖 Envoi des données au service ML...');
    this.sendGameDataToML(result);

    // Revenir à la sélection
    this.gamePhase = 'selection';
    this.selectedGameType = '';
    
    console.log('🏁 ÉTAT FINAL:');
    console.log('Scores finaux:', this.currentScores);
    console.log('Jeux finaux:', this.availableGames);
    console.log('Phase de jeu:', this.gamePhase);
  }

  /**
   * Envoyer les données de jeu au service ML
   */
  private sendGameDataToML(result: MiniGameResult): void {
    const gameData = {
      patientId: this.patientId,
      gameType: result.type,
      score: result.score,
      metrics: result.metrics,
      timestamp: new Date().toISOString(),
      difficulty: this.currentDifficulty
    };

    // Envoyer pour analyse ML
    this.gameService.submitGameResult(gameData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Game data sent to ML successfully:', response);
          // Recharger les données ML après envoi
          this.loadMLData();
        },
        error: (error) => {
          console.error('Error sending game data to ML:', error);
        }
      });
  }

  /**
   * Commencer une nouvelle session d'évaluation
   */
  startNewSession(): void {
    this.gamePhase = 'selection';
    this.currentScores = { cards: 0, sequence: 0, pattern: 0, verbal: 0 };
    this.availableGames.forEach(game => {
      game.completed = false;
      game.score = undefined;
    });
  }

  /**
   * Obtenir les jeux complétés
   */
  get completedGames(): GameSelection[] {
    return this.availableGames.filter(game => game.completed);
  }

  /**
   * Obtenir les jeux disponibles
   */
  get availableGamesToPlay(): GameSelection[] {
    return this.availableGames.filter(game => !game.completed);
  }

  /**
   * Calculer le score total
   */
  calculateTotalScore(): number {
    const completedGames = this.completedGames;
    if (completedGames.length === 0) return 0;
    
    const totalScore = completedGames.reduce((sum, game) => sum + (game.score || 0), 0);
    return Math.round(totalScore / completedGames.length);
  }

  /**
   * Calculer le temps total estimé
   */
  calculateTotalEstimatedTime(): number {
    return this.availableGamesToPlay.reduce((total, game) => total + game.estimatedTime, 0);
  }

  /**
   * Obtenir le niveau cognitif basé sur le score
   */
  getCognitiveStage(score: number): string {
    if (score >= 90) return "NORMAL";
    if (score >= 80) return "MCI_0";
    if (score >= 70) return "MCI_1";
    if (score >= 55) return "MCI_2";
    if (score >= 40) return "MCI_3";
    return "MCI_4";
  }

  /**
   * Obtenir la couleur du badge de difficulté
   */
  getDifficultyColor(difficulty: GameDifficulty): string {
    switch (difficulty) {
      case 'EASY': return '#27ae60';
      case 'MEDIUM': return '#f39c12';
      case 'HARD': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  /**
   * Obtenir le jeu actuel
   */
  get currentGame(): GameSelection | undefined {
    return this.availableGames.find(game => game.id === this.selectedGameType);
  }

  /**
   * Vérifier si tous les jeux sont complétés
   */
  get allGamesCompleted(): boolean {
    return this.availableGames.every(game => game.completed);
  }

  /**
   * Réinitialiser à l'état idle
   */
  resetToIdle(): void {
    this.gamePhase = 'selection';
    this.selectedGameType = '';
  }

  /**
   * Simuler le jeu verbal
   */
  simulateVerbalGame(): void {
    const result: MiniGameResult = {
      type: 'verbal',
      score: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
      metrics: {
        reactionTime: Math.random() * 500 + 1000, // 1000-1500ms
        errorRate: Math.random() * 0.2 + 0.2, // 20-40%
        totalQuestions: this.gameConfig?.verbalQuestions || 5,
        errors: Math.floor(Math.random() * 3)
      }
    };
    this.onGameComplete(result);
  }
}
