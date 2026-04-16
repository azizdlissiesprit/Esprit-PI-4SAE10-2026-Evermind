## 🚀 DÉMARRAGE RAPIDE - 5 MINUTES

Suivez ces étapes pour activer le tracking de temps sur votre application EverMind.

---

### ✅ Étape 1: Vérifier les fichiers créés

Tous les fichiers ont été créés dans les dossiers suivants:

**Backend (Spring Boot):**
```
Backend/Formation/Formation/src/main/java/tn/esprit/formation/
├── Entity/
│   ├── UserTimeTrack.java
│   └── UserActivitySession.java
├── DTO/
│   ├── ActivityPingRequest.java
│   ├── UserTimeStatsDTO.java
│   └── SessionStatsDTO.java
├── Repository/
│   ├── UserTimeTrackRepository.java
│   └── UserActivitySessionRepository.java
├── Service/
│   ├── IUserTimeTrackingService.java
│   └── UserTimeTrackingServiceImpl.java
└── Controller/
    └── UserActivityTrackingController.java
```

**Frontend (Angular):**
```
Frontend/alzheimer-care-web/src/app/
├── core/services/
│   └── activity-tracking.service.ts
├── features/formation/components/
│   ├── time-tracker-widget.component.ts
│   ├── learning-dashboard.component.ts
│   ├── INTEGRATION_EXAMPLES.ts
│   └── activity-tracking.service.spec.ts
```

---

### ✅ Étape 2: Démarrer le backend

```bash
cd "Backend/Formation/Formation"
.\run-port9087.cmd
```

ou directement depuis la racine:

```bash
.\run-backend.cmd
```

**Vérifier:** Les entités sont créées automatiquement. Cherchez dans les logs:
```
Starting FormationApplication
Tomcat started on port 9086
```

---

### ✅ Étape 3: Démarrer le frontend

```bash
npm start
```

Le frontend se lance sur http://localhost:4200

---

### ✅ Étape 4: Intégrer dans votre pagede cours

Ouvrez votre composant de cours existant et ajoutez le widget:

```typescript
// cours.component.ts
import { TimeTrackerWidgetComponent } from './features/formation/components/time-tracker-widget.component';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [TimeTrackerWidgetComponent],  // ← Ajouter ici
  template: `
    <div>
      <h1>Mon cours</h1>
      
      <!-- ← Ajouter ce widget -->
      <app-time-tracker-widget 
        [userId]="1" 
        [courseId]="5">
      </app-time-tracker-widget>

      <div>Contenu de votre cours...</div>
    </div>
  `
})
export class CoursComponent {}
```

---

### ✅ Étape 5: Tester

1. Ouvrir le navigateur: http://localhost:4200
2. Naviguer vers votre page de cours
3. Vous devriez voir le widget violet "⏱️ Temps d'apprentissage"
4. Cliquer sur "▶️ Démarrer le suivi"
5. Faire des clics, des scrolls
6. Vérifier que le temps augmente

---

## 🎯 Cas d'usage courants

### 1️⃣ Afficher le temps dans un cours

```typescript
import { TimeTrackerWidgetComponent } from '@app/features/formation/components/time-tracker-widget.component';

// Dans votre composant...
@Component({
  imports: [TimeTrackerWidgetComponent]
})
export class CourseViewComponent {
  userId = getCurrentUserId(); // De votre auth service
  courseId = getActiveCourseId(); // Du route params
}
```

Template:
```html
<app-time-tracker-widget 
  [userId]="userId" 
  [courseId]="courseId">
</app-time-tracker-widget>
```

---

### 2️⃣ Afficher un dashboard complet

```typescript
import { LearningDashboardComponent } from '@app/features/formation/components/learning-dashboard.component';

@Component({
  imports: [LearningDashboardComponent]
})
export class StatsPageComponent {
  userId = 1;
  courseId = 5;
}
```

Template:
```html
<app-learning-dashboard 
  [userId]="userId" 
  [courseId]="courseId">
</app-learning-dashboard>
```

---

### 3️⃣ Contrôler manuellement le tracking

```typescript
import { ActivityTrackingService } from '@app/core/services/activity-tracking.service';

@Component({...})
export class MyComponent {
  constructor(private tracking: ActivityTrackingService) {}

  start() {
    this.tracking.startTracking(userId, courseId);
  }

  stop() {
    this.tracking.stopTracking();
  }

  getStats() {
    this.tracking.getUserTimeStats(userId, courseId).subscribe(stats => {
      console.log('Temps passé:', stats.formattedTime);
    });
  }
}
```

---

## 🔧 Configuration

### Modifier le seuil d'inactivité

**Backend** - Fichier: `UserTimeTrackingServiceImpl.java`, ligne ~30
```java
private static final long INACTIVITY_THRESHOLD_SECONDS = 300; // 5 minutes → changer ici
private static final long PING_INTERVAL_SECONDS = 30;         // 30 secondes
```

**Frontend** - Fichier: `activity-tracking.service.ts`, ligne ~35
```typescript
private readonly INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes en ms
private readonly PING_INTERVAL = 30 * 1000;            // 30 secondes
```

---

## 🧪 Tests rapides

### Test 1: Vérifier API backend

```bash
# Terminal 1 - Backend en cours d'exécution

# Dans un autre terminal, testez:
curl -X POST http://localhost:9086/formation/activity/ping \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"courseId":5,"activityType":"click","isActive":true}'

# Vous devriez voir: {"message":"Activity recorded successfully"}
```

### Test 2: Vérifier récupération des stats

```bash
curl http://localhost:9086/formation/activity/stats/1/5

# Réponse attendue:
{
  "userId":1,
  "courseId":5,
  "totalTimeSpent":0,
  "sessionCount":0,
  "formattedTime":"0h 0m 0s"
}
```

### Test 3: Vérifier le widget dans le navigateur

1. Ouvrir DevTools (F12)
2. Aller dans la console
3. Vous devriez voir des logs:
```
🟢 Tracking started for User 1, Course 5
📤 Ping sent: page_view
📤 Ping sent: ping
```

---

## 🐛 Dépannage

### ❌ "GET /formation/activity/stats/1/5 404"

**Cause**: Le backend ne tourne pas ou le port est mauvais

**Solution**:
```bash
# Vérifier que le backend tourne
curl http://localhost:9086/formation/programmes

# Si ça répond, c'est bon
# Vérifier le port dans proxy.conf.json
```

### ❌ "Cannot find module 'activity-tracking.service'"

**Cause**: Le chemin d'import est incorrect

**Solution**:
```typescript
// Mauvais:
import { ActivityTrackingService } from './activity-tracking.service';

// Correct:
import { ActivityTrackingService } from '@app/core/services/activity-tracking.service';
// ou
import { ActivityTrackingService } from './../../core/services/activity-tracking.service';
```

### ❌ Widget n'affiche rien

**Cause**: userId ou courseId manquant

**Solution**:
```typescript
// Vérifier que vous passez les props:
<app-time-tracker-widget 
  [userId]="1"    // ← Assurez-vous que userId n'est pas undefined
  [courseId]="5">
</app-time-tracker-widget>
```

### ❌ Le temps ne s'enregistre pas

**Cause**: Les entités n'ont pas été créées dans la BD

**Solution**:
1. Vérifier les logs du backend pour les erreurs JPA
2. Vérifier que H2 est activé dans application.properties
3. Relancer le backend

---

## 📊 Fichiers clés et leurs rôles

| Fichier | Rôle | À modifier si |
|---------|------|---------------|
| `UserTimeTrack.java` | Entité for cumul | Ajouter des colonnes (ex: notes) |
| `UserActivitySession.java` | Entité sessions | Ajouter du tracking fin (souris coords) |
| `UserTimeTrackingServiceImpl.java` | Logique | Changer seuils, ajouter features |
| `activity-tracking.service.ts` | Service client | Changer URL API, ajouter analytics |
| `time-tracker-widget.component.ts` | Widget UI | Personnaliser l'apparence |
| `learning-dashboard.component.ts` | Dashboard | Ajouter plus de stats |

---

## 💡 Améliorations possibles (Bonus++)

1. **Analytics avancée**
   - Tracker les types d'activité (click vs scroll vs keypress)
   - Heatmaps de temps par section
   - Prédiction de taux de complétion

2. **Gamification**
   - Badge "streak" (jours consécutifs)
   - Points d'expérience par heure
   - Classements par période

3. **Notifications**
   - Rappels d'activité ("Tu es inactif depuis X minutes")
   - Félicitations ("Bravo! Tu as étudié 1h aujourd'hui")
   - Recommandations de pause

4. **Intégrations**
   - Sync avec Google Calendar
   - Export PDF des statistiques
   - Webhooks pour autres systèmes

---

## 📞 Besoin d'aide?

1. **Logs du backend**: Vérifier `Backend/Formation/Formation/logs/`
2. **Console browser**: F12 → Console
3. **Requests réseau**: F12 → Network → filtrer par "activity"
4. **Documentation complète**: Voir `TRACKING_GUIDE.md`

---

## 🎉 C'est tout!

Vous avez maintenant un système complet de tracking du temps en apprentissage!

### Prochaines étapes:
- [ ] Tester le widget dans un cours
- [ ] Personnaliser les seuils d'inactivité
- [ ] Ajouter du styling personnalisé
- [ ] Intégrer dans vos pages existantes
- [ ] Afficher les stats dans un dashboard utilisateur

**Bon apprentissage! 🚀**
