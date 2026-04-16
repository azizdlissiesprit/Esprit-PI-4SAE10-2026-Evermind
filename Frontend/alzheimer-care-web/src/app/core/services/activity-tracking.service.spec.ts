/**
 * Exemple de test pour le service de tracking d'activité
 * 
 * À placer dans: Frontend\alzheimer-care-web\src\app\core\services\activity-tracking.service.spec.ts
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivityTrackingService, ActivityPingRequest } from './activity-tracking.service';

describe('ActivityTrackingService', () => {
  let service: ActivityTrackingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivityTrackingService]
    });
    service = TestBed.inject(ActivityTrackingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send activity ping', () => {
    const mockRequest: ActivityPingRequest = {
      userId: 1,
      courseId: 5,
      activityType: 'click',
      isActive: true
    };

    service.startTracking(1, 5);

    // Attendre le ping initial
    const req = httpMock.expectOne('/formation/activity/ping');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.userId).toBe(1);
    expect(req.request.body.courseId).toBe(5);
    req.flush({ message: 'Activity recorded' });
  });

  it('should get user time stats', () => {
    service.getUserTimeStats(1, 5).subscribe(stats => {
      expect(stats.userId).toBe(1);
      expect(stats.courseId).toBe(5);
      expect(stats.formattedTime).toBeDefined();
    });

    const req = httpMock.expectOne('/formation/activity/stats/1/5');
    expect(req.request.method).toBe('GET');
    req.flush({
      userId: 1,
      courseId: 5,
      totalTimeSpent: 3600,
      formattedTime: '1h 0m 0s',
      sessionCount: 2,
      estimatedCompletion: 50
    });
  });

  it('should get user sessions', () => {
    service.getUserSessions(1, 5).subscribe(sessions => {
      expect(Array.isArray(sessions)).toBeTruthy();
    });

    const req = httpMock.expectOne('/formation/activity/sessions/1/5');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        sessionId: 1,
        userId: 1,
        courseId: 5,
        activeTimeInSeconds: 1800,
        formattedTime: '30m 0s',
        isActive: false
      }
    ]);
  });

  it('should format time correctly', () => {
    expect(service['formatTime'](3661)).toBe('1h 1m 1s');
    expect(service['formatTime'](120)).toBe('0h 2m 0s');
    expect(service['formatTime'](0)).toBe('0h 0m 0s');
  });

  it('should detect inactivity', (done) => {
    service.startTracking(1, 5);
    
    // Attendre le ping initial
    httpMock.expectOne('/formation/activity/ping').flush({ message: 'OK' });

    setTimeout(() => {
      // Vérifier que la session s'arrête après inactivité
      const closeReq = httpMock.expectOne(req => 
        req.url.includes('/close-session')
      );
      expect(closeReq).toBeTruthy();
      done();
    }, 300000 + 1000); // 5 minutes + 1 seconde
  });

  it('should stop tracking', () => {
    service.startTracking(1, 5);
    httpMock.expectOne('/formation/activity/ping').flush({ message: 'OK' });

    service.stopTracking();
    expect(service.isTrackingActive()).toBeFalsy();

    // Vérifier que close-session est appelé
    const closeReq = httpMock.expectOne(req => 
      req.url.includes('/close-session')
    );
    expect(closeReq.request.method).toBe('POST');
  });

  it('should get leaderboard', () => {
    service.getLeaderboard(5, 10).subscribe(leaderboard => {
      expect(Array.isArray(leaderboard)).toBeTruthy();
    });

    const req = httpMock.expectOne('/formation/activity/leaderboard/5?limit=10');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        userId: 1,
        courseId: 5,
        totalTimeSpent: 7200,
        formattedTime: '2h 0m 0s',
        sessionCount: 4
      }
    ]);
  });

  it('should get estimated remaining time', () => {
    service.getEstimatedTime(1, 5, 100).subscribe(result => {
      expect(result.remainingSeconds).toBeDefined();
      expect(result.formattedTime).toBeDefined();
    });

    const req = httpMock.expectOne('/formation/activity/estimated-time/1/5/100');
    expect(req.request.method).toBe('GET');
    req.flush({
      remainingSeconds: '201600',
      formattedTime: '56h 0m 0s'
    });
  });

  it('should reset stats', () => {
    service.resetStats(1, 5).subscribe(response => {
      expect(response.message).toContain('success');
    });

    const req = httpMock.expectOne('/formation/activity/reset/1/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Statistics reset successfully' });
  });

  it('should handle multiple courses for same user', () => {
    service.getUserAllStats(1).subscribe(stats => {
      expect(Array.isArray(stats)).toBeTruthy();
    });

    const req = httpMock.expectOne('/formation/activity/user/1');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        userId: 1,
        courseId: 5,
        totalTimeSpent: 3600,
        formattedTime: '1h 0m 0s'
      },
      {
        userId: 1,
        courseId: 6,
        totalTimeSpent: 7200,
        formattedTime: '2h 0m 0s'
      }
    ]);
  });

  it('should handle getAllUserStats', () => {
    service.getAllUserStats(1).subscribe(stats => {
      expect(Array.isArray(stats)).toBeTruthy();
    });

    const req = httpMock.expectOne('/formation/activity/user/1');
    req.flush([]);
  });
});

/**
 * Scénarios de test manuels (à exécuter dans le navigateur)
 * 
 * 1. Test de tracking simple:
 *    - Ouvrir le composant TimeTrackerWidgetComponent
 *    - Cliquer sur "Démarrer le suivi"
 *    - Faire des activités (clic, scroll)
 *    - Vérifier que le temps augmente
 *    - Attendre 5 minutes sans bouger
 *    - Vérifier que le suivi s'arrête
 * 
 * 2. Test d'inactivité:
 *    - Démarrer le suivi
 *    - Ne rien faire pendant 6 minutes
 *    - Vérifier que la session se ferme
 *    - Vérifier que le temps n'a pas décollé
 * 
 * 3. Test du dashboard:
 *    - Charger le LearningDashboardComponent
 *    - Vérifier que les stats s'affichent
 *    - Vérifier que le classement s'affiche
 *    - Vérifier l'historique des sessions
 * 
 * 4. Test de multiple sessions:
 *    - Démarrer une première session
 *    - Laisser le navigateur inactif > 5 minutes
 *    - Faire une nouvelle activité
 *    - Vérifier que sessionCount = 2
 *    - Vérifier que le temps total est cumulatif
 * 
 * 5. Test de fermeture d'onglet:
 *    - Démarrer le suivi
 *    - Fermer/rafraîchir l'onglet
 *    - Vérifier que closeSession est appelé
 *    - Vérifier que les données sont persistées
 */
