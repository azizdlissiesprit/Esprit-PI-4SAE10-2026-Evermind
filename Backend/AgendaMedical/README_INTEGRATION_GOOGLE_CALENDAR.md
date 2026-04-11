# 🎯 Intégration Google Calendar API - Guide Complet

## 📋 Vue d'Ensemble

L'intégration Google Calendar API est maintenant **complètement fonctionnelle** avec synchronisation automatique des rendez-vous entre le backend Spring Boot et Google Calendar.

---

## 🏗️ Architecture Technique

### Backend (Spring Boot 3.2.3 + Java 17)
- **Framework**: Spring Boot avec Spring Data JPA
- **Base de données**: H2 en mémoire (agendadb)
- **API Google Calendar**: Google Calendar API v3
- **Authentification**: OAuth2 avec tokens refresh automatiques
- **Port par défaut**: 8080

### Frontend (Angular 21)
- **Framework**: Angular standalone avec TypeScript
- **Services**: HttpClient pour communication backend
- **Interface**: Composant d'intégration Google Calendar
- **Port par défaut**: 4200

---

## 🔧 Configuration Requise

### 1. Google Cloud Console
- **Projet**: `projetpi`
- **API activée**: Google Calendar API
- **Credentials OAuth2**: Configurés et validés
- **Utilisateurs test**: `benkhalifatasnim70@gmail.com` ajouté

### 2. Backend Configuration
```properties
# application.properties
server.port=8080
google.calendar.credentials-file=classpath:credentials.json
google.calendar.tokens-directory=tokens
google.calendar.application-name=Projet PI Agenda Medical
google.calendar.calendar-id=primary
```

### 3. Frontend Configuration
```typescript
// Services configurés avec les bons imports
GoogleCalendarService: API Google Calendar
RendezVousService: CRUD rendez-vous
```

---

## 🚀 Lancement de l'Application

### Étape 1: Démarrer le Backend
```bash
cd Backend/AgendaMedical
mvn spring-boot:run
```

### Étape 2: Démarrer le Frontend
```bash
cd Frontend/alzheimer-care-web
ng serve --port 4200
```

### Étape 3: Première Authentification (uniquement)
1. Le backend affiche un URL OAuth2
2. Copier-coller l'URL dans le navigateur
3. Se connecter avec `benkhalifatasnim70@gmail.com`
4. Autoriser l'accès au calendrier
5. Le token est sauvegardé automatiquement

---

## 📱 Utilisation de l'Interface

### Créer un Rendez-vous
1. Accéder à `http://localhost:4200`
2. Naviguer vers la section admin/appointments
3. Remplir le formulaire:
   - **Patient**: Nom et prénom
   - **Type**: Consultation, Téléconsultation, Suivi, Bilan, Évaluation, Résultats, 1ère visite
   - **Statut**: Confirmé, En attente, Annulé, Libre
   - **Date/Heure**: Sélectionnée avec datetime-local
   - **Durée**: En minutes (15-120)
   - **Notes**: Optionnel

### Synchronisation Automatique
- ✅ **Création**: Le RDV est créé en base H2 ET dans Google Calendar
- ✅ **Mise à jour**: Les modifications sont synchronisées automatiquement
- ✅ **Suppression**: L'événement est supprimé des deux côtés
- ✅ **Couleurs**: Chaque type a sa couleur dans Google Calendar
- ✅ **Rappels**: 24h avant (email) + 30min avant (popup)

---

## 🔍 Points d'Accès API

### Backend Endpoints
```http
GET    /api/rendezvous              # Liste tous les RDV
GET    /api/rendezvous/semaine/{date}  # RDV par semaine
GET    /api/rendezvous/jour/{date}      # RDV par jour
POST   /api/rendezvous              # Créer un RDV
PUT    /api/rendezvous/{id}         # Modifier un RDV
DELETE /api/rendezvous/{id}      # Supprimer un RDV

GET    /api/google-calendar/events?day={date}  # Événements Google Calendar
```

### Tests API
```bash
# Tester si le backend répond
curl http://localhost:8080/api/rendezvous

# Créer un RDV test
curl -X POST http://localhost:8080/api/rendezvous \
  -H "Content-Type: application/json" \
  -d '{
    "patientNom": "Test",
    "patientPrenom": "Patient",
    "type": "CONSULTATION",
    "statut": "CONFIRME",
    "dateHeure": "2026-04-10T14:00:00",
    "dureeMinutes": 30
  }'
```

---

## 🎨 Couleurs et Types

### Types de Consultation
| Type | Couleur Google Calendar | Description |
|-------|-------------------|-------------|
| CONSULTATION | Bleu (#1A73E8) | Consultation physique |
| TÉLÉCONSULTATION | Rouge (#B3266F) | Consultation à distance |
| SUIVI | Vert (#34A853) | Suivi régulier |
| BILAN | Orange (#F4511E) | Bilan de santé |
| ÉVALUATION | Violet (#8E244E) | Évaluation cognitive |
| RÉSULTATS | Turquoise (#039BE5) | Résultats d'examens |
| 1ÈRE VISITE | Indigo (#4285F4) | Première consultation |

### Statuts de Rendez-vous
- **CONFIRMÉ**: RDV validé et planifié
- **EN ATTENTE**: En attente de confirmation
- **ANNULÉ**: RDV annulé
- **LIBRE**: Créneau disponible

---

## 🛠️ Dépannage

### Problèmes Communs

#### Port 8080 déjà utilisé
```bash
# Identifier le processus
netstat -ano | findstr :8080

# Arrêter le processus
taskkill /PID [PROCESS_ID] /F

# Redémarrer le backend
mvn spring-boot:run
```

#### Erreur OAuth2 redirect_uri_mismatch
**Cause**: URI de redirection incorrecte
**Solution**: 
1. Mettre à jour Google Cloud Console
2. Ajouter `http://localhost:8888/Callback` dans les URIs autorisées

#### Erreur 403 access_denied
**Cause**: Application en mode test, utilisateur non approuvé
**Solution**:
1. Ajouter l'email comme utilisateur test dans Google Cloud Console
2. Ou publier l'application

#### Synchronisation échouée
**Vérifications**:
1. Backend démarré sur port 8080
2. Logs du backend pour erreurs Google Calendar
3. Token OAuth2 valide dans le dossier `tokens/`
4. Configuration `credentials.json` correcte

---

## 📊 Monitoring et Logs

### Logs Backend
- **Console Spring Boot**: Erreurs de synchronisation visibles
- **Logs H2**: Requêtes SQL de création/modification
- **Logs Google Calendar**: Appels API réussis/échoués

### Base de Données H2
- **Console**: `http://localhost:8080/h2-console`
- **Tables**: `RENDEZ_VOUS`, `GOOGLE_EVENTS` (si créé)

---

## 🔄 Mises à Jour

### Backend
- **Maven**: `mvn clean install` pour recompiler
- **Dépendances**: Vérifier les versions dans `pom.xml`
- **Java**: Assurer Java 17+ installé

### Frontend
- **Node**: `npm install` pour mettre à jour les dépendances
- **Angular CLI**: `ng update` pour dernière version
- **Build**: `ng build` pour production

---

## 🎯 Cas d'Usage

### Scénario 1: Création de RDV
1. **Utilisateur** remplit le formulaire Angular
2. **Frontend** envoie `POST /api/rendezvous`
3. **Backend** sauvegarde en base H2
4. **Backend** appelle `GoogleCalendarService.createEvent()`
5. **Google Calendar** crée l'événement avec couleur et rappels
6. **Backend** sauvegarde `googleEventId` dans la base
7. **Frontend** affiche "✅ Synchronisé avec Google Calendar"

### Scénario 2: Modification de RDV
1. **Utilisateur** modifie un RDV existant
2. **Frontend** envoie `PUT /api/rendezvous/{id}`
3. **Backend** met à jour la base H2
4. **Backend** appelle `GoogleCalendarService.updateEvent()`
5. **Google Calendar** met à jour l'événement existant
6. **Frontend** affiche le statut de synchronisation

### Scénario 3: Suppression de RDV
1. **Utilisateur** supprime un RDV
2. **Frontend** envoie `DELETE /api/rendezvous/{id}`
3. **Backend** supprime de la base H2
4. **Backend** appelle `GoogleCalendarService.deleteEvent()`
5. **Google Calendar** supprime l'événement
6. **Frontend** affiche la confirmation

---

## 🔒 Sécurité

### Tokens OAuth2
- **Stockage**: Dossier `tokens/` local chiffré
- **Refresh**: Tokens automatiquement rafraîchis
- **Scope**: `https://www.googleapis.com/auth/calendar` (accès complet)

### Données Sensibles
- **credentials.json**: Contient client_id et client_secret
- **Ne jamais** commettre ces fichiers dans le contrôle de version

---

## 📈 Performance

### Optimisations
- **Connection pooling**: HikariCP pour la base de données
- **Lazy loading**: Entités JPA configurées
- **Cache**: Spring Boot cache activé
- **Async**: Appels Google Calendar asynchrones

### Monitoring
- **Actuator**: `/actuator/health` pour vérifier l'état
- **Metrics**: Temps de réponse des API Google Calendar
- **Alertes**: Logs d'erreurs de synchronisation

---

## 🎉 Conclusion

L'intégration Google Calendar API est **production-ready** avec :
- ✅ **Synchronisation bidirectionnelle** complète
- ✅ **Gestion des erreurs** robuste
- ✅ **Interface utilisateur** moderne
- ✅ **Architecture scalable** et maintenable
- ✅ **Documentation complète** pour l'équipe

**L'application est prête pour un déploiement en production !**
