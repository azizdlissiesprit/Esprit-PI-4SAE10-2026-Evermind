import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import {
  GameResultDto, GameSession,
  MlDifficultyResponse, MlDetectionResponse,
  GameConfig, GameDifficulty
} from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class GameService {

  private apiUrl = 'http://localhost:8090/api/games';

  // État global du jeu
  private currentDifficulty = new BehaviorSubject<GameDifficulty>('EASY');
  private mlAlert = new BehaviorSubject<MlDetectionResponse | null>(null);
  private gameHistory = new BehaviorSubject<GameSession[]>([]);

  currentDifficulty$ = this.currentDifficulty.asObservable();
  mlAlert$ = this.mlAlert.asObservable();
  gameHistory$ = this.gameHistory.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtenir l'historique des jeux pour un patient
   */
  getGameHistory(patientId: string): Observable<GameSession[]> {
    // Simuler des données pour la démo
    const mockSessions: GameSession[] = [
      {
        id: 1,
        patientId,
        cardsScore: 85,
        sequenceScore: 78,
        patternScore: 82,
        verbalScore: 75,
        totalScore: 80,
        reactionTime: 850,
        errorRate: 0.18,
        difficulty: 'EASY',
        cognitiveStage: 'NORMAL',
        mlDifficultyRecommended: 'MEDIUM',
        mlRiskScore: 0.15,
        mlAlertLevel: 'NONE',
        mlMessage: 'Performance cognitive dans les normes attendues.',
        sessionDate: new Date().toISOString(),
        sessionNumber: 1
      }
    ];
    return of(mockSessions);
  }

  /**
   * Obtenir les recommandations de difficulté ML
   */
  getDifficultyRecommendation(patientId: string): Observable<MlDifficultyResponse> {
    // Simuler une réponse ML
    const mockResponse: MlDifficultyResponse = {
      recommendedDifficulty: 'MEDIUM',
      probabilities: { EASY: 0.2, MEDIUM: 0.6, HARD: 0.2 },
      confidence: 0.85,
      reasoning: 'Performance stable avec légère amélioration du temps de réaction'
    };
    return of(mockResponse);
  }

  /**
   * Obtenir la détection d'anomalies ML
   */
  getAnomalyDetection(patientId: string): Observable<MlDetectionResponse> {
    // Simuler une détection ML
    const mockResponse: MlDetectionResponse = {
      status: 'NORMAL',
      alert: false,
      alertLevel: 'NONE',
      message: '✅ Performance cognitive dans les normes attendues.',
      riskScore: 0.15,
      metrics: {
        avg_score: 75,
        avg_reaction_time: 850,
        avg_error_rate: 0.18,
        performance_trend: 0.5
      }
    };
    return of(mockResponse);
  }

  /**
   * Soumettre les résultats d'un jeu pour analyse ML
   */
  submitGameResult(gameData: any): Observable<any> {
    // Simuler l'envoi et retourner une réponse
    console.log('Game data submitted to ML:', gameData);
    return of({ success: true, message: 'Data processed successfully' });
  }

  /**
   * Config du jeu selon difficulté
   */
  getGameConfig(difficulty: GameDifficulty): GameConfig {
    const configs = {
      EASY: {
        difficulty: 'EASY' as GameDifficulty,
        cardsCount: 4,
        sequenceLength: 3,
        patternSize: 3,
        verbalQuestions: 3,
        timeLimit: 60
      },
      MEDIUM: {
        difficulty: 'MEDIUM' as GameDifficulty,
        cardsCount: 6,
        sequenceLength: 5,
        patternSize: 4,
        verbalQuestions: 5,
        timeLimit: 45
      },
      HARD: {
        difficulty: 'HARD' as GameDifficulty,
        cardsCount: 8,
        sequenceLength: 7,
        patternSize: 5,
        verbalQuestions: 7,
        timeLimit: 30
      }
    };
    return configs[difficulty] || configs.MEDIUM;
  }

  /**
   * Mettre à jour les scores après un jeu
   */
  updateGameScores(patientId: string, gameType: string, score: number, metrics: any): void {
    console.log(' GAME SERVICE - MISE À JOUR DES SCORES:');
    console.log(' Patient ID:', patientId);
    console.log(' Type de jeu:', gameType);
    console.log('💯 Score:', score);
    console.log('📊 Métriques:', metrics);
    
    // Mettre à jour l'historique local
    const currentHistory = this.gameHistory.value;
    console.log('📚 Historique actuel:', currentHistory);
    
    const latestSession = currentHistory[0];
    
    if (latestSession) {
      console.log('🎯 Session trouvée, mise à jour en cours...');
      const updatedSession = { ...latestSession };
      
      switch (gameType) {
        case 'cards':
          console.log('🃏 Mise à jour du jeu de cartes:', score);
          updatedSession.cardsScore = score;
          break;
        case 'sequence':
          console.log('🔢 Mise à jour du jeu de séquence:', score);
          updatedSession.sequenceScore = score;
          break;
        case 'pattern':
          console.log('🔷 Mise à jour du jeu de pattern:', score);
          updatedSession.patternScore = score;
          break;
        case 'verbal':
          console.log('🗣️ Mise à jour du jeu verbal:', score);
          updatedSession.verbalScore = score;
          break;
      }
      
      // Recalculer le score total
      const oldTotal = updatedSession.totalScore;
      updatedSession.totalScore = Math.round(
        (updatedSession.cardsScore + updatedSession.sequenceScore + 
         updatedSession.patternScore + updatedSession.verbalScore) / 4
      );
      
      console.log('📈 Ancien score total:', oldTotal);
      console.log('📈 Nouveau score total:', updatedSession.totalScore);
      console.log('📊 Session mise à jour:', updatedSession);
      
      // Mettre à jour l'historique
      currentHistory[0] = updatedSession;
      this.gameHistory.next(currentHistory);
      
      console.log('✅ Historique mis à jour avec succès!');
      console.log('📚 Nouvel historique:', this.gameHistory.value);
    } else {
      console.error('❌ Aucune session trouvée dans l\'historique!');
    }
  }

  /**
   * Obtenir les scores actuels
   */
  getCurrentScores(patientId: string): Observable<any> {
    return this.getGameHistory(patientId);
  }
}
