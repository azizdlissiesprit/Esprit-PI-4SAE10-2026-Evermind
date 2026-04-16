# 🔔 Système de Notifications Intelligentes - Documentation Complète

## 📋 Vue d'ensemble

Le système de notifications intelligentes permet de gérer des notifications contextuelles, personnalisées et adaptées au comportement de chaque utilisateur dans le suivi des formations EverMind.

**Cas d'usage:**
- Reminders d'inactivité
- Messages d'encouragement personnalisés
- Notifications de prérequis satisfaits
- Alertes de limite approchante
- Nouveaux contenus disponibles

---

## 📦 Architecture

### Entités créées (2 entités)
- **`Notification.java`** - Modélise chaque notification avec type, priorité, contenu détaillé
- **`NotificationPreference.java`** - Préférences utilisateur (fréquence, heures silencieuses, etc.)

### DTOs (2 DTOs)
- **`NotificationDTO.java`** - Transfer de données des notifications
- **`NotificationStatsDTO.java`** - Statistiques de notifications

### Repositories (2 repositories)
- **`NotificationRepository.java`** - 10+ queries JPA optimisées
- **`NotificationPreferenceRepository.java`** - Gestion des préférences

### Services (interfaces + implémentations)
- **`INotificationService.java`** - Interface complète (40+ méthodes)
- **`NotificationServiceImpl.java`** - Implémentation (600+ lignes)

### Controller
- **`NotificationController.java`** - 25+ endpoints REST

---

## 🎯 Types de Notifications

### 1. **REMINDER** - Rappels
```
Rappels de formation en attente, absences prolongées
Priorité: LOW-MEDIUM
Exemple: "Vous nous manquez ! Reconnecter vous dès maintenant"
```

### 2. **ACHIEVEMENT** - Réalisations
```
Succès, badges, jalons atteints
Priorité: MEDIUM-HIGH
Exemple: "🏆 Jalon atteint : 50 heures d'apprentissage !"
```

### 3. **ENCOURAGEMENT** - Encouragements
```
Messages personnalisés basés sur la progression
Priorité: LOW
Exemple: "Vous avez complété 70% ! Terminez et obtenez votre certificat"
```

### 4. **INACTIVITY_WARNING** - Avertissements d'inactivité
```
Alerte quand l'utilisateur est absent longtemps
Priorité: HIGH
Exemple: "Vous n'avez pas suivi de formation depuis 2 semaines"
```

### 5. **PREREQUISITE_READY** - Prérequis satisfaits
```
Nouvelle formation débloquée après complétion du prérequis
Priorité: HIGH
Exemple: "🔓 Nouvelle formation débloquée : Gestion avancée"
```

### 6. **QUIZ_AVAILABLE** - Quiz disponible
```
Quiz prêt pour une formation
Priorité: MEDIUM
Exemple: "✏️ Un quiz vous attend : 10 questions"
```

### 7. **PROGRESS_UPDATE** - Mise à jour de progrès
```
Progression mise à jour
Priorité: LOW
Exemple: "Vous avez avancé de 20% cette semaine !"
```

### 8. **LEADERBOARD** - Classement
```
Infos de classement
Priorité: MEDIUM
Exemple: "Vous êtes maintenant classé #3"
```

### 9. **CHALLENGE** - Défis
```
Nouveaux défis proposés
Priorité: MEDIUM
Exemple: "Complétez 3 formations en 7 jours pour débloquer un badge !"
```

### 10. **CERTIFICATE_READY** - Certificat prêt
```
Certificat prêt à télécharger
Priorité: HIGH
Exemple: "🎓 Votre certificat est prêt à télécharger"
```

### 11. **SESSION_TIME_WARNING** - Limite de temps
```
Utilisateur approche sa limite de session
Priorité: MEDIUM
Exemple: "⚠️ Vous avez 20% de temps restant"
```

### 12. **PERSONALIZED_TIP** - Conseil personnalisé
```
Conseil basé sur les données utilisateur
Priorité: LOW
Exemple: "💡 Les apprenants actifs complètent 2 formations de plus"
```

### 13. **FORMATION_EXPIRING** - Formation expirante
```
Formation expire bientôt
Priorité: HIGH
Exemple: "Cette formation expire dans 3 jours"
```

### 14. **NEW_CONTENT** - Nouveau contenu
```
Du contenu nouveau est disponible
Priorité: MEDIUM
Exemple: "📚 Nouvelle vidéo : Prévention des chutes"
```

### 15. **MILESTONE_REACHED** - Jalon atteint
```
Jalon important dans le parcours
Priorité: HIGH
Exemple: "🏁 100 heures d'apprentissage complétées !"
```

---

## 🎨 Catégories de Notifications

| Catégorie | Description | Cas d'usage |
|-----------|-------------|-----------|
| **FORMATION** | Liées aux formations | Prérequis, nouveaux contenus |
| **ACHIEVEMENT** | Réalisations | Badges, certificats, jalons |
| **SYSTEM** | Système | Maintenance, mises à jour |
| **ENGAGEMENT** | Engagement utilisateur | Reminders, inactivité |
| **HEALTH** | Santé/Bien-être | Recommandations | 
| **REMINDER** | Rappels | Tâches pending |
| **REWARD** | Récompenses | Points, badges |

---

## 📊 Niveaux de Priorité

```
LOW       → Non urgent, peut être envoyé pendant les heures silencieuses
MEDIUM    → Normal, envoyer pendant les heures actives
HIGH      → Important, signaler à l'utilisateur
CRITICAL  → Critique, ignorer les heures silencieuses et quotas
```

---

## 🔌 Endpoints API

### Gestion des Notifications

```
POST   /formation/notifications/create                                    → Créer
GET    /formation/notifications/user/{userId}?page=0&size=10            → Récupérer (paginé)
GET    /formation/notifications/unread/{userId}                         → Non lues
GET    /formation/notifications/unread-count/{userId}                   → Compter
PATCH  /formation/notifications/{notificationId}/read                   → Marquer lue
PATCH  /formation/notifications/{userId}/read-all                       → Tout marquer lue
DELETE /formation/notifications/{notificationId}                        → Supprimer
GET    /formation/notifications/priority/{userId}                       → Prioritaires uniquement
GET    /formation/notifications/active/{userId}                         → Actives (paginé)
GET    /formation/notifications/type/{userId}/{type}?page=0&size=10    → Par type
GET    /formation/notifications/category/{userId}/{category}            → Par catégorie
```

### Notifications Intelligentes (Auto-Générées)

```
POST   /formation/notifications/reminder-inactivity?userId=1&formationId=5&inactionMinutes=300
POST   /formation/notifications/encouragement?userId=1&completionPercentage=70&formationTitle=Alzheimer
POST   /formation/notifications/prerequisite-ready?userId=1&prerequisiteTitle=Basics&nextFormationId=2
POST   /formation/notifications/milestone?userId=1&milestoneTitle=100 heures&badge=5
POST   /formation/notifications/approaching-limit?userId=1&limitType=Temps&percentage=20
POST   /formation/notifications/new-content?userId=1&contentTitle=Prévention des chutes&contentType=Vidéo
POST   /formation/notifications/quiz-available?userId=1&quizTitle=Quiz Alzheimer&quizId=3&formationId=1
POST   /formation/notifications/certificate-ready?userId=1&certificateId=7&certificateName=Certification Alzheimer
POST   /formation/notifications/behavior-based/{userId}
```

### Statistiques

```
GET    /formation/notifications/stats/{userId}                          → Stats complètes
GET    /formation/notifications/engagement-rate/{userId}                → Taux engagement
```

### Préférences Utilisateur

```
POST   /formation/notifications/preferences/create/{userId}             → Créer (défaut)
GET    /formation/notifications/preferences/{userId}                    → Récupérer
PUT    /formation/notifications/preferences/{userId}                    → Mettre à jour
PATCH  /formation/notifications/preferences/{userId}/toggle?enabled=true
PATCH  /formation/notifications/preferences/{userId}/reminder-frequency?frequencyHours=24
PATCH  /formation/notifications/preferences/{userId}/quiet-hours?startHour=22&endHour=7
```

### Maintenance

```
DELETE /formation/notifications/cleanup                                  → Nettoyer expirées
GET    /formation/notifications/should-remind/{userId}/{formationId}    → Vérifier condition
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Créer une notification simple

```bash
curl -X POST "http://localhost:9086/formation/notifications/create" \
  -d "userId=1" \
  -d "type=ENCOURAGEMENT" \
  -d "category=ENGAGEMENT" \
  -d "title=Excellent progrès !" \
  -d "message=Vous avez complété 50% de la formation" \
  -d "priority=MEDIUM"
```

### Exemple 2 : Générer un reminder d'inactivité

```bash
curl -X POST "http://localhost:9086/formation/notifications/reminder-inactivity" \
  -d "userId=1" \
  -d "formationId=5" \
  -d "inactionMinutes=300"
```

### Exemple 3 : Récupérer les notifications non lues

```bash
curl "http://localhost:9086/formation/notifications/unread/1"
```

### Exemple 4 : Mettre à jour les préférences

```bash
curl -X PUT "http://localhost:9086/formation/notifications/preferences/1" \
  -H "Content-Type: application/json" \
  -d '{
    "remindersEnabled": true,
    "reminderFrequencyHours": 48,
    "maxNotificationsPerDay": 5,
    "quietHourStart": 22,
    "quietHourEnd": 7
  }'
```

### Exemple 5 : Obtenir les statistiques

```bash
curl "http://localhost:9086/formation/notifications/stats/1"

Response:
{
  "totalNotifications": 25,
  "unreadCount": 3,
  "highlightPriority": 2,
  "engagementRate": 84.0,
  "thisWeekCount": 12,
  "thisMonthCount": 25
}
```

---

## 🎛️ Préférences Utilisateur

### Paramètres disponibles

```
notificationsEnabled      → Active/Désactive globalement (defaut: true)
remindersEnabled          → Active ces reminders (defaut: true)
encouragementEnabled      → Active messages d'encouragement (defaut: true)
achievementsEnabled       → Active notifications de réalisation (defaut: true)
inactivityWarningsEnabled → Active alertes inactivité (defaut: true)

reminderFrequencyHours    → Fréquence entre reminders en heures (defaut: 24)
quietHourStart            → Début des heures silencieuses (defaut: 22)
quietHourEnd              → Fin des heures silencieuses (defaut: 7)
maxNotificationsPerDay    → Max notifications/jour (defaut: 10)

preferredLanguage         → Langue (defaut: "fr")
notificationEmail         → Email optionnel
emailNotificationsEnabled → Envoyer aussi par email (defaut: false)
```

---

## 🧠 Intelligence du Système

### Heure Silencieuses
```
Les notifications LOW/MEDIUM ne sont pas envoyées entre 22h et 7h
Seules les CRITICAL ignorent ces heures
```

### Quota Quotidien
```
Maximum 10 notifications par jour par défaut
Configurable par utilisateur
```

### Détection de Cycles
```
N'envoie pas plusieurs reminders identiques rapidement
Espacement intelligent basé sur type et fréquence
```

### Taux d'Engagement
```
Calcule le % de notifications lues vs total
Utilisé pour générer des notifications comportementales
```

---

## 📈 Cas d'Usage Réels

### Scénario 1 : Suivi de Formation Alzheimer

```
1. Utilisateur commence formation Alzheimer
2. Après 30 min → Notification d'encouragement: "Vous avez commencé !"
3. Après 7 jours sans action → Reminder d'inactivité
4. Complète prérequis → Notification: "Nouvelle formation débloquée"
5. À 70% → "Presque là ! Terminez pour obtenir votre certificat"
6. Passe le quiz → Certificat généré et notifié
```

### Scénario 2 : Apprentissage Gamifié

```
1. Atteint 10h d'apprentissage → Badge débloqué
2. Atteint 50h → Jalon atteint → Récompense
3. Classerie au top 10 → "Vous êtes classé #8 !"
4. Nouveau défi proposé → "Complétez 3 formations en une semaine"
```

### Scénario 3 : Gestion de l'Inactivité

```
1. L'utilisateur n'accède pas pendant 1 semaine
2. Système génère reminder (si enabled)
3. Si toujours inactif après 2 semaines → Alerte CRITICAL
4. Si toujours rien après 30 jours → Marquer comme inactif
```

---

## 🔍 Monitoring et Analytics

### Tableau de Bord Recommandé

```
- Total notifications par utilisateur
- Taux d'engagement (% lues)
- Types les plus engageants
- Heures d'accès optimales
- Performance par type de notification
```

---

## 🛠️ Intégration Frontend

### Service Angular (à implémenter)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = 'http://localhost:9086/formation/notifications';

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  // Récupérer les unread
  getUnread(userId: number) {
    return this.http.get(`${this.api}/unread/${userId}`);
  }

  // Marquer comme lue
  markRead(notificationId: number) {
    return this.http.patch(`${this.api}/${notificationId}/read`, {});
  }

  // Polling automatique toutes les 30 secondes
  startPolling() {
    interval(30000).subscribe(() => {
      this.getUnread(userId).subscribe(notifications => {
        this.showNotifications(notifications);
      });
    });
  }
}
```

---

## ⚡ Performance

| Opération | Temps estimé |
|-----------|------------|
| Créer notification | < 50ms |
| Récupérer unread | < 100ms |
| Marquer tout comme lue | < 200ms |
| Récupérer stats | < 150ms |
| Nettoyer expirées | < 300ms |

---

## 🔒 Sécurité

✅ Préférences par utilisateur (isolation des données)  
✅ Validation des heures silencieuses  
✅ Quotas quotidiens anti-spam  
✅ Expiration automatique (30 jours)  
✅ Soft-delete (flag active)  
✅ Indexation optimisée (performance)  

---

## 📞 Diagnostique

### Si les notifications ne s'envoient pas :

1. Vérifier `notificationsEnabled = true`
2. Vérifier les heures silencieuses
3. Vérifier le quota quotidien
4. Vérifier les préférences spécifiques (reminders, etc.)
5. Vérifier les logs du service

### Si les performances dégradent :

1. Nettoyer les notifications expirées régulièrement
2. Archiver les anciennes notifications
3. Ajouter des index supplémentaires si besoin

---

## 🚀 Extensions Futures

1. **WebSocket** - Notifications en temps réel
2. **Push Notifications** - Mobile native
3. **SMS** - Reminders critiques par SMS
4. **A/B Testing** - Tester différents messages
5. **ML** - Prédire les meilleures heures pour notifier
6. **Segmentation** - Notifier par groupe démographique

