```
╔══════════════════════════════════════════════════════════════════╗
║            📌 CHEAT SHEET - SUIVI TEMPS D'APPRENTISSAGE         ║
║                         UNE PAGE DE RÉFÉRENCE                   ║
╚══════════════════════════════════════════════════════════════════╝
```

# 🚀 QUICK REFERENCE

## ✅ Vérification rapide
```bash
# Backend actif?
curl http://localhost:9086/formation/programmes

# Tester ping
curl -X POST http://localhost:9086/formation/activity/ping \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"courseId":5,"activityType":"click","isActive":true}'

# Récupérer stats
curl http://localhost:9086/formation/activity/stats/1/5
```

---

## 🎯 UTILISATION FRONTEND

### Cas 1: Widget simple (RECOMMANDÉ)
```typescript
import { TimeTrackerWidgetComponent } from '@app/features/formation/components/time-tracker-widget.component';

@Component({
  imports: [TimeTrackerWidgetComponent]
})
export class CourseComponent {}
```

Template:
```html
<app-time-tracker-widget [userId]="userId" [courseId]="courseId"></app-time-tracker-widget>
```

### Cas 2: Dashboard complet
```typescript
import { LearningDashboardComponent } from '@app/features/formation/components/learning-dashboard.component';

@Component({
  imports: [LearningDashboardComponent]
})
export class StatsComponent {}
```

Template:
```html
<app-learning-dashboard [userId]="userId" [courseId]="courseId"></app-learning-dashboard>
```

### Cas 3: Service direct
```typescript
constructor(private tracking: ActivityTrackingService) {}

// Démarrer tracking
this.tracking.startTracking(userId, courseId);

// Arrêter tracking
this.tracking.stopTracking();

// Récupérer stats
this.tracking.getUserTimeStats(userId, courseId).subscribe(stats => {
  console.log(stats.formattedTime); // "2h 30m 45s"
});

// Top utilisateurs
this.tracking.getLeaderboard(courseId, 10).subscribe(top => {
  console.table(top);
});

// Sessions utilisateur
this.tracking.getUserSessions(userId, courseId).subscribe(sessions => {
  console.table(sessions);
});

// Temps restant estimé (100 min total)
this.tracking.getEstimatedTime(userId, courseId, 100).subscribe(time => {
  console.log(time.formattedTime);
});

// Stats tous les cours
this.tracking.getAllUserStats(userId).subscribe(allCourses => {
  console.table(allCourses);
});
```

---

## 📊 API ENDPOINTS

```
POST   /formation/activity/ping
       └─ { userId, courseId, activityType, isActive }

GET    /formation/activity/stats/{userId}/{courseId}
       └─ Returns: UserTimeStatsDTO

GET    /formation/activity/user/{userId}
       └─ Returns: UserTimeStatsDTO[]

GET    /formation/activity/leaderboard/{courseId}?limit=10
       └─ Returns: UserTimeStatsDTO[]

GET    /formation/activity/sessions/{userId}/{courseId}
       └─ Returns: SessionStatsDTO[]

POST   /formation/activity/close-session/{userId}/{courseId}

GET    /formation/activity/estimated-time/{userId}/{courseId}/{totalMinutes}
       └─ Returns: { remainingSeconds, formattedTime }

DELETE /formation/activity/reset/{userId}/{courseId}
```

---

## ⚙️ CONFIG RAPIDE

### Modifier seuil inactivité (Backend)
File: `UserTimeTrackingServiceImpl.java` line 24
```java
private static final long INACTIVITY_THRESHOLD_SECONDS = 300;  // ← Changer
```

### Modifier seuil inactivité (Frontend)
File: `activity-tracking.service.ts` line 34
```typescript
private readonly INACTIVITY_THRESHOLD = 5 * 60 * 1000;  // ← Changer
```

---

## 📁 FICHIERS CLÉS

| Fichier | Localisation | Rôle |
|---------|-------------|------|
| `UserTimeTrack.java` | Entity/ | Cumul du temps |
| `UserActivitySession.java` | Entity/ | Sessions individuelles |
| `UserTimeTrackingServiceImpl.java` | Service/ | Logique métier |
| `UserActivityTrackingController.java` | Controller/ | API REST |
| `activity-tracking.service.ts` | core/services/ | Client HTTP |
| `time-tracker-widget.component.ts` | features/formation/ | Widget simple |
| `learning-dashboard.component.ts` | features/formation/ | Dashboard complet |

---

## 🧪 TESTS MANUELS

```
1. Ouvrir widget
   ✓ Voir bouton "Démarrer"
   
2. Démarrer tracking
   ✓ Console: "🟢 Tracking started"
   ✓ Network: POST /ping (200)
   
3. Faire activités
   ✓ Click / scroll / keypress
   ✓ Temps augmente
   
4. Attendre 5 min
   ✓ Pas d'activité
   ✓ Session auto-fermée
   ✓ Console: "Session closed"
   
5. Faire nouvelle activité
   ✓ Nouvelle session créée
   ✓ Ping envoyé
   
6. Voir stats
   ✓ Temps cumulé
   ✓ Nombre de sessions = 2
```

---

## 🐛 DÉBOGAGE RAPIDE

```
❌ "Cannot GET /formation/activity/stats/1/5"
→ Backend down: curl http://localhost:9086/formation/programmes

❌ CORS error
→ Vérifier proxy.conf.json, relancer npm start

❌ Widget vide
→ Vérifier [userId] et [courseId] sont définis

❌ Pas de pings
→ F12 → Network → filter "ping", vérifier erreurs

❌ Inactivité trop rapide
→ Augmenter INACTIVITY_THRESHOLD_SECONDS

❌ Données incohérentes
→ Vérifier logs backend pour exceptions
```

---

## 📊 RÉPONSE EXEMPLE

```json
GET /formation/activity/stats/1/5

{
  "userId": 1,
  "courseId": 5,
  "totalTimeSpent": 7200,          // secondes
  "totalTimeSpentMinutes": 120,    // minutes
  "sessionCount": 3,               // nombre de sessions
  "formattedTime": "2h 0m 0s",     // formaté
  "estimatedCompletion": 20.0      // % progression
}
```

---

## 🎯 FLUX COMPLET

```
User ouvre cours
    ↓
Frontend: Page charge
    ↓
Service: Détecte composant avec [userId] et [courseId]
    ↓
Service: Démarrer tracking automatique
    ↓
Service: Écouter click, scroll, keypress, mousemove
    ↓
Service: Envoyer ping toutes les 30s
    ↓
Backend: Recevoir ping
    ↓
Backend: Créer/update UserActivitySession
    ↓
Backend: Calculer temps actif (depuis dernier ping)
    ↓
Backend: Détecter inactivité? (> 5 min)
    ├─ Non: Continue
    └─ Oui: Ferme session
    ↓
Backend: Update UserTimeTrack (cumul)
    ↓
Frontend: Requête GET /stats/1/5
    ↓
Frontend: UI affiche temps mis à jour
    ↓
User quitte page
    ↓
Frontend: Appel close-session
    ↓
Backend: Ferme session active
    ↓
Fin
```

---

## 🎓 ÉTAPES POUR INTÉGRER (5 MIN)

1. **Import** (10s)
```typescript
import { TimeTrackerWidgetComponent } from '@app/features/formation/components/time-tracker-widget.component';
```

2. **Déclarer** (10s)
```typescript
@Component({
  imports: [TimeTrackerWidgetComponent]
})
```

3. **Utiliser** (10s)
```html
<app-time-tracker-widget [userId]="1" [courseId]="5"></app-time-tracker-widget>
```

4. **Tester** (4:30)
- Faire des clics/scrolls
- Vérifier temps qui augmente
- Vérifier pings dans Network

🎉 DONE!

---

## 💾 CONFIGURATIONS UTILES

```typescript
// Afficher stats en temps réel
constructor(private tracking: ActivityTrackingService) {}

ngOnInit() {
  this.tracking.timeStats$.subscribe(stats => {
    if (stats) {
      console.log('Temps:', stats.formattedTime);
    }
  });
}

// Auto-refresh toutes les 10s
interval(10000).pipe(
  switchMap(() => this.tracking.getUserTimeStats(userId, courseId))
).subscribe(stats => console.log(stats));

// Fermer session si user quitte
@HostListener('window:beforeunload')
beforeUnload() {
  this.tracking.stopTracking();
}
```

---

## 🎯 CHECKLIST DÉPLOIEMENT

- [ ] Tests backend OK
- [ ] Tests frontend OK
- [ ] Tests intégration OK
- [ ] Performance OK (< 200ms réponses)
- [ ] Sécurité check (auth, validation)
- [ ] Logs configurés (niveau production)
- [ ] Database backup Setup
- [ ] Monitoring en place
- [ ] Documentation a jour

---

## 🚨 SEUIL D'ALERTE

```
⚠️ Si temps explose:
→ Vérifier que inactivité se détecte (5 min)
→ Vérifier que sessions se ferment

⚠️ Si pas de données:
→ Vérifier les pings arrivent (F12 Network)
→ Vérifier backend logs pour erreurs

⚠️ Si très lent:
→ Vérifier pas trop de logs
→ Vérifier queries DB optimisées
→ Vérifier pas de boucles infinies
```

---

## 📚 DOCUMENTATION

| Doc | Page | Temps |
|-----|------|-------|
| QUICK_START | 200 | 5 min |
| TRACKING_GUIDE | 500 | 30 min |
| IMPLEMENTATION_SUMMARY | 300 | 15 min |
| REALISTIC_INTEGRATION | 250 | 10 min |
| INDEX | 400 | 10 min |

---

## 🎉 READY TO GO!

```bash
# 3 commandes pour démarrer:

# Terminal 1
cd "Backend/Formation/Formation" && .\run-port9087.cmd

# Terminal 2  
cd "Frontend/alzheimer-care-web" && npm start

# Code dans votre composant
<app-time-tracker-widget [userId]="1" [courseId]="5"></app-time-tracker-widget>
```

**C'EST TOUT! ✨**

---

**Version:** 1.0  
**Date:** 15/04/2026  
**État:** ✅ PRODUCTION-READY
