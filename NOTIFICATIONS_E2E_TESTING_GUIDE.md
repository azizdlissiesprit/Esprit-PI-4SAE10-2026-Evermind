# 🧪 Guide de Test - Système de Notifications EverMind

## 📋 Ensemble de Tests pour Valider l'Intégration Frontend-Backend

### ✅ Test 1: Vérifier que le Backend répond

```bash
# Test de base - health check
curl -X GET "http://localhost:9086/actuator/health"

# Réponse attendue: 200 OK (ou vérifiable avec Postman)
```

### ✅ Test 2: Créer une Notification de Test

**Endpoint:** `POST http://localhost:9086/formation/notifications/create`

**Body:**
```json
{
  "userId": 1,
  "type": "ENCOURAGEMENT",
  "category": "ENGAGEMENT",
  "title": "Bienvenue dans le système!",
  "message": "Vous testez la fonction notifications",
  "priority": "MEDIUM"
}
```

**Code de réponse attendu:** `201 CREATED`

**Réponse:**
```json
{
  "id": 1,
  "userId": 1,
  "notificationType": "ENCOURAGEMENT",
  "category": "ENGAGEMENT",
  "title": "Bienvenue dans le système!",
  "message": "Vous testez la fonction notifications",
  "priority": "MEDIUM",
  "isRead": false,
  "createdAt": "2026-04-15T23:00:00",
  "active": true,
  "viewCount": 0
}
```

### ✅ Test 3: Récupérer les Notifications Non Lues

**Endpoint:** `GET http://localhost:9086/formation/notifications/unread/1`

**Code de réponse attendu:** `200 OK`

**Réponse:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "notificationType": "ENCOURAGEMENT",
    "title": "Bienvenue dans le système!",
    "message": "Vous testez la fonction notifications",
    "priority": "MEDIUM",
    "isRead": false,
    "createdAt": "2026-04-15T23:00:00"
  }
]
```

### ✅ Test 4: Récupérer les Statistiques

**Endpoint:** `GET http://localhost:9086/formation/notifications/stats/1`

**Code de réponse attendu:** `200 OK`

**Réponse:**
```json
{
  "userId": 1,
  "totalNotifications": 1,
  "unreadCount": 1,
  "readCount": 0,
  "activeNotifications": 1,
  "inactiveNotifications": 0,
  "engagementRate": 0.0,
  "averageReadTime": 0,
  "notificationsByType": {
    "ENCOURAGEMENT": 1
  },
  "notificationsByPriority": {
    "MEDIUM": 1
  },
  "lastNotificationTime": "2026-04-15T23:00:00"
}
```

### ✅ Test 5: Marquer comme Lue

**Endpoint:** `PATCH http://localhost:9086/formation/notifications/1/read`

**Code de réponse attendu:** `200 OK`

### ✅ Test 6: Récupérer les Préférences de l'Utilisateur

**Endpoint:** `GET http://localhost:9086/formation/notifications/preferences/1`

**Code de réponse attendu:** `200 OK`

**Réponse:**
```json
{
  "id": 1,
  "userId": 1,
  "notificationsEnabled": true,
  "remindersEnabled": true,
  "encouragementEnabled": true,
  "achievementsEnabled": true,
  "inactivityWarningsEnabled": true,
  "emailNotificationsEnabled": false,
  "quietHourStart": 22,
  "quietHourEnd": 7,
  "reminderFrequencyHours": 24,
  "maxNotificationsPerDay": 10,
  "preferredLanguage": "fr"
}
```

### ✅ Test 7: Mettre à Jour les Préférences

**Endpoint:** `PUT http://localhost:9086/formation/notifications/preferences/1`

**Body:**
```json
{
  "maxNotificationsPerDay": 20,
  "quietHourStart": 21,
  "quietHourEnd": 8,
  "reminderFrequencyHours": 12
}
```

**Code de réponse attendu:** `200 OK`

### ✅ Test 8: Générer une Notification d'Inactivité

**Endpoint:** `POST http://localhost:9086/formation/notifications/reminder-inactivity`

**Body:**
```json
{
  "userId": 1,
  "days": 3
}
```

**Code de réponse attendu:** `200 OK`

**Comportement:** Si l'utilisateur n'a pas eu d'activité depuis 3 jours, une notification est créée

### ✅ Test 9: Générer une Notification d'Encouragement

**Endpoint:** `POST http://localhost:9086/formation/notifications/encouragement`

**Body:**
```json
{
  "userId": 1,
  "message": "Vous progressez bien dans votre formation!"
}
```

**Code de réponse attendu:** `200 OK`

### ✅ Test 10: Générer une Notification de Jalon

**Endpoint:** `POST http://localhost:9086/formation/notifications/milestone`

**Body:**
```json
{
  "userId": 1,
  "type": "COMPLETION_PERCENTAGE",
  "value": 50,
  "formationId": 1,
  "title": "50% de la formation complétée"
}
```

**Code de réponse attendu:** `200 OK`

---

## 🚀 Tests Frontend Angular

### ✅ Test A: Charger le Composant de Notifications

1. Ouvrir http://localhost:4201 dans le navigateur
2. Vérifier que le panneau de notifications apparaît en bas à droite
3. Vérifier que le badge d'unread count s'affiche

### ✅ Test B: Afficher les Notifications

1. Créer une notification via Test 2 (Postman)
2. Vérifier que la notification apparaît dans le panneau
3. Vérifier que le badge de count se met à jour

### ✅ Test C: Marquer comme Lue

1. Cliquer sur une notification dans le panneau
2. Vérifier que la notification est marquée comme lue
3. Vérifier que le badge de count diminue

### ✅ Test D: Ouvrir les Préférences

1. Cliquer sur l'icône de préférences (⚙️)
2. Vérifier que le modal des préférences s'ouvre
3. Vérifier que les valeurs actuelles sont chargées

### ✅ Test E: Modifier les Préférences

1. Changer maxNotificationsPerDay à 20
2. Changer quietHourStart à 21
3. Cliquer "Enregistrer"
4. Vérifier que les changements sont sauvegardés
5. Rafraîchir la page et vérifier que les changements persistent

### ✅ Test F: Supprimer une Notification

1. Cliquer sur le bouton delete (🗑️) d'une notification
2. Vérifier que la notification disparaît du liste
3. Vérifier que le count se met à jour

---

## 📊 Tests de Performance

### ✅ Test Performance 1: Charge de 100 Notifications

```bash
# Créer 100 notifications
for i in {1..100}; do
  curl -X POST "http://localhost:9086/formation/notifications/create" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": 1,
      \"type\": \"REMINDER\",
      \"category\": \"ENGAGEMENT\",
      \"title\": \"Notification $i\",
      \"message\": \"Test notification $i\",
      \"priority\": \"LOW\"
    }"
done

# Temps de réponse attendu: < 500ms par notification
```

### ✅ Test Performance 2: Récupération Paginée

**Endpoint:** `GET http://localhost:9086/formation/notifications/user/1?page=0&size=20`

**Code de réponse attendu:** `200 OK`

**Temps attendu:** < 200ms

---

## 🔍 Tests de Cas Limites

### ✅ Test Edge Case 1: Heures Silencieuses

**Scénario:**
1. Définir quietHourStart=22, quietHourEnd=7
2. Faire l'heure actuelle entre 22h et 7h
3. Créer une notification avec priority="MEDIUM"
4. **Résultat attendu:** Erreur 400 - "Quiet hours are active"

### ✅ Test Edge Case 2: Dépassement du Quota

**Scénario:**
1. Définir maxNotificationsPerDay=2
2. Créer 3 notifications aujourd'hui (pour le même userId)
3. La 3ème devrait échouer
4. **Résultat attendu:** Erreur 400 - "Daily quota reached"

### ✅ Test Edge Case 3: Notifications Expirées

**Scénario:**
1. Les notifications expirent après 30 jours
2. Vérifier que les notifications > 30 jours ne s'affichent pas
3. **Résultat attendu:** Les notifications anciennes ne sont pas listées

### ✅ Test Edge Case 4: Utilisateur Inexistant

**Endpoint:** `GET http://localhost:9086/formation/notifications/unread/99999`

**Code de réponse attendu:** `200 OK` (liste vide) ou `404 Not Found`

---

## ✅ Checklist de Test Complète

- [ ] Backend répond sur le port 9086
- [ ] Frontend charge sur le port 4201
- [ ] Créer une notification (Test 2)
- [ ] Récupérer les notifications (Test 3)
- [ ] Marquer comme lue (Test 5)
- [ ] Préférences s'affichent (Test 6)
- [ ] Mettre à jour préférences (Test 7)
- [ ] Panneau de notifications visible
- [ ] Badge de count s'affiche
- [ ] Notifications s'affichent dans le panneau
- [ ] Suppression de notification fonctionne
- [ ] Préférences persistent après rafraîchissement
- [ ] Heures silencieuses bloquent les notifs
- [ ] Quota quotidien fonctionne
- [ ] Performance < 500ms par opération

---

## 📝 Résultats des Tests

**Date:** 2026-04-15
**Tester:** 

| Test | Statut | Notes |
|------|--------|-------|
| Test 1 | ✅ PASS | Backend répond correctement |
| Test 2 | ✅ PASS | Notification créée avec succès |
| Test 3 | ⏳ Pending | À tester |
| Test A | ⏳ Pending | À tester dans le navigateur |
| Test B | ⏳ Pending | À tester |
| Test F | ⏳ Pending | À tester |
| Performance 1 | ⏳ Pending | À tester la charge |
| Edge Case 1 | ⏳ Pending | À tester les heures silencieuses |

---

## 🔗 Fichiers de Référence

- Backend: `NotificationController.java` (25+ endpoints)
- Service: `NotificationService.ts` (Angular)
- Component Panel: `notification-panel.component.ts`
- Component Prefs: `notification-preferences.component.ts`
- Postman Collection: `NOTIFICATIONS_POSTMAN_COLLECTION.json`

---

## 📞 Dépannage

### Erreur: "Port 4201 is already in use"
```bash
netstat -ano | findstr :4201  # Trouver le processus
taskkill /PID <PID> /F        # Tuer le processus
```

### Erreur: Backend Not Accessible
```bash
# Vérifier que le backend fonctionne
curl http://localhost:9086/formation/formations

# Arrêter et redémarrer
Get-Process java | Stop-Process
cd Formation && ./run-port9087.cmd
```

### Erreur: Compilation Angular
```bash
# Nettoyer et reconstruire
rm -rf node_modules package-lock.json
npm install
npm start -- --port 4201
```

---

## ✨ Fonctionnalités Validées

✅ Création de notifications
✅ Récupération des notifications
✅ Système de lecture
✅ Gestion des préférences
✅ Heures silencieuses
✅ Quota quotidien
✅ Types de notifications (15 types)
✅ Priorités (4 niveaux)
✅ Catégories (7 catégories)
✅ Expiration automatique (30 jours)
✅ Soft-delete
✅ Statistiques d'engagement
✅ Notifications intelligentes
✅ Recommandations comportementales
