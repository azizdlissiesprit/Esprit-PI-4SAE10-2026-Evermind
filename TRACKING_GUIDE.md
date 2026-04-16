# 📊 Guide d'implémentation - Suivi du temps réel en apprentissage

## Vue d'ensemble

Ce système permet de tracker le temps réel passé par les utilisateurs dans chaque formation, en filtrant l'inactivité et en fournissant des statistiques détaillées d'apprentissage.

## 🏗️ Architecture

### Backend (Spring Boot - Formation Service)

#### Entités JPA
```
UserTimeTrack.java        → Cumul du temps par utilisateur/cours
UserActivitySession.java  → Sessions individuelles avec temps actif
```

#### Couches
```
Controller  → API REST
Service     → Logique métier (calcul du temps, détection inactivité)
Repository  → Accès aux données JPA
DTO         → Transfert de données
```

#### Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/formation/activity/ping` | Enregistre l'activité utilisateur |
| GET | `/formation/activity/stats/{userId}/{courseId}` | Récupère les stats de temps |
| GET | `/formation/activity/user/{userId}` | Tous les cours d'un utilisateur |
| GET | `/formation/activity/leaderboard/{courseId}` | Top utilisateurs par cours |
| GET | `/formation/activity/sessions/{userId}/{courseId}` | Historique des sessions |
| POST | `/formation/activity/close-session/{userId}/{courseId}` | Ferme une session active |
| GET | `/formation/activity/estimated-time/{userId}/{courseId}/{totalMinutes}` | Temps restant estimé |
| DELETE | `/formation/activity/reset/{userId}/{courseId}` | Réinitialise les stats |

### Frontend (Angular)

#### Services
```
activity-tracking.service.ts  → Gestion du tracking côté client
```

#### Composants
```
time-tracker-widget.component.ts    → Widget de suivi simple
learning-dashboard.component.ts     → Dashboard complet avec stats
```

---

## 🚀 Installation et utilisation

### 1️⃣ Backend - Créer la base de données

Les entités sont créées automatiquement au démarrage de l'application (JPA/Hibernate).

**Tables créées :**
- `user_time_track` - Cumul global
- `user_activity_sessions` - Historique des sessions

### 2️⃣ Frontend - Intégration du service de tracking

#### Dans votre AppConfig (app.config.ts)

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // Autres providers...
  ],
};
```

#### Utilisation simple - Widget de suivi

Dans votre composant de cours:

```typescript
import { TimeTrackerWidgetComponent } from './features/formation/components/time-tracker-widget.component';

@Component({
  selector: 'app-course-player',
  imports: [TimeTrackerWidgetComponent],
  template: `
    <div>
      <h1>Mon cours</h1>
      <app-time-tracker-widget [userId]="1" [courseId]="5"></app-time-tracker-widget>
      <div class="course-content">
        <!-- Contenu du cours -->
      </div>
    </div>
  `
})
export class CoursePlayerComponent {}
```

#### Utilisation avancée - Dashboard complet

```typescript
import { LearningDashboardComponent } from './features/formation/components/learning-dashboard.component';

@Component({
  selector: 'app-learning-stats',
  imports: [LearningDashboardComponent],
  template: `
    <app-learning-dashboard [userId]="userId" [courseId]="courseId"></app-learning-dashboard>
  `
})
export class LearningStatsComponent {
  userId = 1;
  courseId = 5;
}
```

---

## 📋 Détails techniques

### Logique de tracking - Flux

```
1. Utilisateur démarre le suivi
   ↓
2. Service détecte les interactions (click, scroll, keypress, mousemove)
   ↓
3. Ping au serveur toutes les 30 secondes
   ↓
4. Serveur détecte inactivité (> 5 minutes)
   ├─ Si inactif  → Ferme la session
   └─ Si actif    → Cumule le temps
   ↓
5. Session fermée = cumul dans UserTimeTrack
```

### Détection d'inactivité

```
Backend:
- Seuil: 5 minutes sans ping
- Action: Ferme la session automatiquement

Frontend:
- Monitor les pings
- Arrête le suivi si inactivité détectée
```

### Calcul du temps actif

```
- Chaque session enregistre: sessionStartTime, lastPingTime
- Temps actif = Math.min(timeSincLastPing, PING_INTERVAL + 10s)
- Évite les sauts temps importants
```

---

## 🎯 Cas d'usage

### 1. Tracking simple dans un cours

```typescript
// Component - cours.component.ts
export class CoursComponent implements OnInit {
  constructor(private tracking: ActivityTrackingService) {}

  ngOnInit() {
    this.tracking.startTracking(userId, courseId);
  }

  ngOnDestroy() {
    this.tracking.stopTracking();
  }
}
```

### 2. Afficher les stats en temps réel

```typescript
export class StatsComponent implements OnInit {
  stats$: Observable<UserTimeStats>;

  constructor(private tracking: ActivityTrackingService) {}

  ngOnInit() {
    this.stats$ = this.tracking.timeStats$;
  }
}
```

### 3. Récupérer le classement des apprenants

```typescript
export class LeaderboardComponent implements OnInit {
  leaderboard$: Observable<UserTimeStats[]>;

  constructor(private tracking: ActivityTrackingService) {}

  ngOnInit() {
    this.leaderboard$ = this.tracking.getLeaderboard(courseId, 10);
  }
}
```

---

## 🎁 Fonctionnalités bonus

### Estimation du temps restant

```typescript
// Récupère le temps estimé restant pour compléter le cours
this.tracking.getEstimatedTime(userId, courseId, 100) // 100 minutes total
  .subscribe(result => {
    console.log(result.formattedTime); // "1h 30m 0s"
  });
```

### Historique des sessions

```typescript
// Affiche toutes les sessions d'apprentissage
this.tracking.getUserSessions(userId, courseId)
  .subscribe(sessions => {
    sessions.forEach(s => {
      console.log(`Session: ${s.formattedTime}`);
    });
  });
```

### Dashboard complet

Le composant `LearningDashboardComponent` inclut:
- 📊 Statistiques globales
- 📋 Historique des sessions
- 🏆 Classement des apprenants
- ⏱️ Temps estimé restant

---

## ⚙️ Configuration

### Modifier les seuils (Backend - UserTimeTrackingServiceImpl.java)

```java
private static final long INACTIVITY_THRESHOLD_SECONDS = 300; // 5 minutes
private static final long PING_INTERVAL_SECONDS = 30;         // 30 secondes
```

### Modifier les seuils (Frontend - activity-tracking.service.ts)

```typescript
private readonly INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes en ms
private readonly PING_INTERVAL = 30 * 1000;            // 30 secondes
```

---

## 🔒 Sécurité

### À implémenter (optionnel)

1. **Authentification utilisateur**
   - Vérifier que l'utilisateur est authentifié avant de tracker

2. **Validation d'accès au cours**
   - Vérifier que l'utilisateur a accès au cours

3. **Prevent API abuse**
   - Rate limiting sur les endpoints de ping
   - Validation des IDs

### Exemple de sécurité

```java
@PostMapping("/ping")
@PreAuthorize("isAuthenticated()")  // Ajouter annotation de sécurité
public ResponseEntity<Map<String, String>> recordActivity(@RequestBody ActivityPingRequest request) {
    // Vérifier que l'utilisateur ne peut tracker que ses propres sessions
    Long currentUserId = getCurrentUserIdFromSecurityContext();
    if (!currentUserId.equals(request.getUserId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    // ... reste du code
}
```

---

## 📊 Exemple de réponse API

### GET /formation/activity/stats/1/5

```json
{
  "userId": 1,
  "courseId": 5,
  "totalTimeSpent": 7200,
  "totalTimeSpentMinutes": 120,
  "sessionCount": 4,
  "formattedTime": "2h 0m 0s",
  "estimatedCompletion": 20.0
}
```

### GET /formation/activity/sessions/1/5

```json
[
  {
    "sessionId": 1,
    "userId": 1,
    "courseId": 5,
    "sessionStartTime": "2026-04-15T14:30:00",
    "sessionEndTime": "2026-04-15T15:00:00",
    "activeTimeInSeconds": 1800,
    "formattedTime": "30m 0s",
    "isActive": false
  },
  {
    "sessionId": 2,
    "userId": 1,
    "courseId": 5,
    "sessionStartTime": "2026-04-15T15:30:00",
    "sessionEndTime": null,
    "activeTimeInSeconds": 300,
    "formattedTime": "5m 0s",
    "isActive": true
  }
]
```

---

## 🧪 Bonnes pratiques

1. **Toujours arrêter le suivi** lors de ngOnDestroy
2. **Vérifier isTrackingActive()** avant de redémarrer un suivi
3. **Utiliser takeUntil()** pour éviter les memory leaks
4. **Optimiser les appels API** - pas plus d'un ping par 30 secondes
5. **Gérer les erreurs** du service HTTP gracieusement

---

## 🐛 Dépannage

### Le tracking n'enregistre rien

**Vérifier:**
- Service HTTP est bien injecté
- L'ID utilisateur et de cours sont corrects
- L'URL de base de l'API est correcte
- Vérifier la console browser pour les erreurs

### Sessions qui se ferment trop vite

**Solution:**
- Augmenter `INACTIVITY_THRESHOLD_SECONDS` à 300-600 secondes
- Vérifier que les événements de souris/clavier sont détectés

### Performance

**Optimisations possibles:**
- Augmenter `PING_INTERVAL` à 45-60 secondes
- Ajouter du throttling sur les événements DOM
- Réduire la taille des logs (utiliser @Slf4j avec niveau WARN)

---

## 📝 Fichiers créés

Backend:
- `Entity/UserTimeTrack.java`
- `Entity/UserActivitySession.java`
- `DTO/ActivityPingRequest.java`
- `DTO/UserTimeStatsDTO.java`
- `DTO/SessionStatsDTO.java`
- `Repository/UserTimeTrackRepository.java`
- `Repository/UserActivitySessionRepository.java`
- `Service/IUserTimeTrackingService.java`
- `Service/UserTimeTrackingServiceImpl.java`
- `Controller/UserActivityTrackingController.java`

Frontend:
- `core/services/activity-tracking.service.ts`
- `features/formation/components/time-tracker-widget.component.ts`
- `features/formation/components/learning-dashboard.component.ts`

---

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs du backend (logs Spring Boot)
2. Vérifier la console du navigateur (browser DevTools)
3. Vérifier que la base de données a bien créé les tables
4. Tester les endpoints API avec Postman/Insomnia

---

**Version:** 1.0  
**Date:** 15/04/2026  
**Auteur:** Implémentation IA
