# 🧪 Guide de Test - Système d'Authentification JWT

## 📋 Plan de Test

Ce guide vous aide à tester le système d'authentification complet:
- Endpoints de base
- Rôles et autorisations
- Erreurs et validations
- Flux complet d'authentification

---

## 🔧 Prérequis

1. Backend Spring Boot en cours d'exécution (port 9086)
2. Frontend Angular en cours d'exécution (port 4200) - optionnel
3. Postman ou cURL disponible
4. Base de données initialisée avec `init-roles.sql`

---

## 🚀 Étape 1: Vérifier que le Backend est Actif

### Test simple
```bash
curl -X GET http://localhost:9086/auth/check
```

**Résultat attendu:**
```json
{
  "message": "Authentification valide"
}
```

---

## 📝 Étape 2: Tester l'Inscription (Sign Up)

### Test 2.1: Inscription réussie

```bash
curl -X POST http://localhost:9086/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@evermind.test",
    "motDePasse": "SecurePassword123!",
    "confirmMotDePasse": "SecurePassword123!",
    "role": "AIDANT"
  }'
```

**Résultat attendu (201 Created):**
```json
{
  "message": "Utilisateur enregistré avec succès!",
  "email": "jean.dupont@evermind.test"
}
```

### Test 2.2: Erreur - Email existant

Utiliser le même email que précédemment:

```bash
curl -X POST http://localhost:9086/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@evermind.test",
    "motDePasse": "SecurePassword123!",
    "confirmMotDePasse": "SecurePassword123!",
    "role": "AIDANT"
  }'
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Email already exists",
  "message": "L'email existe déjà"
}
```

### Test 2.3: Erreur - Mots de passe non identiques

```bash
curl -X POST http://localhost:9086/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@evermind.test",
    "motDePasse": "SecurePassword123!",
    "confirmMotDePasse": "DifferentPassword456!",
    "role": "AIDANT"
  }'
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Validation error",
  "message": "Les mots de passe ne correspondent pas"
}
```

### Test 2.4: Erreur - Mot de passe trop court

```bash
curl -X POST http://localhost:9086/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@evermind.test",
    "motDePasse": "short",
    "confirmMotDePasse": "short",
    "role": "AIDANT"
  }'
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Validation error",
  "message": "Le mot de passe doit contenir au moins 8 caractères"
}
```

---

## 🔐 Étape 3: Tester la Connexion (Login)

### Test 3.1: Connexion réussie - AIDANT

```bash
curl -X POST http://localhost:9086/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@evermind.test",
    "motDePasse": "SecurePassword123!"
  }'
```

**Résultat attendu (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqZWFuLmR1cG9udEBldmVybWluZC50ZXN0Iiwicm9sZXMiOlsiUk9MRV9BSURBNUM0Il0sImlhdCI6MTcxNjQ0MDEyMCwiZXhwIjoxNzE2NTI2NTIwfQ.SIGNATURE",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqZWFuLmR1cG9udEBldmVybWluZC50ZXN0IiwiYXV0aCI6IlJFRlJFU0giLCJpYXQiOjE3MTY0NDAxMjAsImV4cCI6MTcxNzA0NTEyMH0.SIGNATURE",
  "type": "Bearer",
  "id": 1,
  "email": "jean.dupont@evermind.test",
  "nom": "Dupont",
  "prenom": "Jean",
  "roles": ["ROLE_AIDANT"],
  "expiresIn": 86400000
}
```

⚠️ **Sauvegarder le token pour les tests suivants!**

```bash
# Sauvegarder dans une variable
export AIDANT_TOKEN="eyJhbGciOiJIUzUxMiJ9..."
export ADMIN_TOKEN="eyJhbGciOiJIUzUxMiJ9..."
```

### Test 3.2: Connexion échouée - Email inexistant

```bash
curl -X POST http://localhost:9086/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@evermind.test",
    "motDePasse": "SecurePassword123!"
  }'
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Bad credentials",
  "message": "Email ou mot de passe incorrect"
}
```

### Test 3.3: Connexion échouée - Mot de passe incorrect

```bash
curl -X POST http://localhost:9086/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@evermind.test",
    "motDePasse": "WrongPassword123!"
  }'
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Bad credentials",
  "message": "Email ou mot de passe incorrect"
}
```

---

## 🔒 Étape 4: Tester les Routes Protégées

### Test 4.1: GET /auth/me - Infos utilisateur

```bash
curl -X GET http://localhost:9086/auth/me \
  -H "Authorization: Bearer $AIDANT_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@evermind.test",
  "roles": ["ROLE_AIDANT"],
  "actif": true
}
```

### Test 4.2: Erreur - Token manquant

```bash
curl -X GET http://localhost:9086/auth/me
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Token manquant ou invalide"
}
```

### Test 4.3: Erreur - Token invalide

```bash
curl -X GET http://localhost:9086/auth/me \
  -H "Authorization: Bearer invalid_token_xyz"
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Invalid token",
  "message": "Token invalide ou expiré"
}
```

---

## 👨‍💼 Étape 5: Tester les Routes Admin

### Test 5.1: Connexion en tant qu'ADMIN

```bash
curl -X POST http://localhost:9086/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "motDePasse": "admin123"
  }'
```

Sauvegarder le token ADMIN:
```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzUxMiJ9..."
```

### Test 5.2: Accès Dashboard Admin - ADMIN OK

```bash
curl -X GET http://localhost:9086/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Bienvenue sur le dashboard admin!",
  "status": "ok"
}
```

### Test 5.3: Accès Dashboard Admin - AIDANT refusé

```bash
curl -X GET http://localhost:9086/admin/dashboard \
  -H "Authorization: Bearer $AIDANT_TOKEN"
```

**Résultat attendu (403 Forbidden):**
```json
{
  "error": "Access Denied",
  "message": "Vous n'avez pas les permissions requises"
}
```

---

## 👤 Étape 6: Tester la Gestion des Utilisateurs (Admin)

### Test 6.1: Récupérer infos utilisateur

```bash
curl -X GET http://localhost:9086/admin/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@evermind.test",
  "actif": true,
  "roles": ["ROLE_AIDANT"],
  "createdAt": "2026-04-16T10:30:00",
  "updatedAt": "2026-04-16T10:30:00"
}
```

### Test 6.2: Désactiver un utilisateur

```bash
curl -X POST http://localhost:9086/admin/users/1/deactivate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Utilisateur désactivé avec succès"
}
```

### Test 6.3: Activer un utilisateur

```bash
curl -X POST http://localhost:9086/admin/users/1/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Utilisateur activé avec succès"
}
```

---

## 🔄 Étape 7: Tester le Flux Complet

Voici le flux complet à tester dans l'ordre:

### 1. Inscription
```bash
# Créer un nouvel utilisateur
curl -X POST http://localhost:9086/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "TestUser",
    "prenom": "Flow",
    "email": "testflow@evermind.test",
    "motDePasse": "TestPassword123!",
    "confirmMotDePasse": "TestPassword123!",
    "role": "AIDANT"
  }'
```

### 2. Connexion
```bash
# Se connecter avec les identifiants créés
curl -X POST http://localhost:9086/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testflow@evermind.test",
    "motDePasse": "TestPassword123!"
  }' > response.json
```

### 3. Récupérer le Token
```bash
# Sauvegarder le token
export TEST_TOKEN=$(cat response.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TEST_TOKEN"
```

### 4. Utiliser le Token
```bash
# Tester une requête protégée
curl -X GET http://localhost:9086/auth/me \
  -H "Authorization: Bearer $TEST_TOKEN"
```

### 5. Vérifier les Rôles
```bash
# Essayer d'accéder à une route admin (devrait être refusée)
curl -X GET http://localhost:9086/admin/dashboard \
  -H "Authorization: Bearer $TEST_TOKEN"
```

---

## ✅ Matrice de Test - Résumé

| Test | Endpoint | Méthode | Rôle | Statut attendu |
|------|----------|---------|------|----------------|
| Inscription valide | /auth/register | POST | - | 201 |
| Inscription - email existe | /auth/register | POST | - | 400 |
| Connexion OK | /auth/login | POST | - | 200 |
| Connexion - mauvais mdp | /auth/login | POST | - | 401 |
| Infos utilisateur | /auth/me | GET | AIDANT | 200 |
| Infos utilisateur - pas de token | /auth/me | GET | - | 401 |
| Dashboard admin - ADMIN | /admin/dashboard | GET | ADMIN | 200 |
| Dashboard admin - AIDANT | /admin/dashboard | GET | AIDANT | 403 |
| Récupérer utilisateur | /admin/users/1 | GET | ADMIN | 200 |
| Désactiver utilisateur | /admin/users/1/deactivate | POST | ADMIN | 200 |
| Activer utilisateur | /admin/users/1/activate | POST | ADMIN | 200 |

---

## 🐛 Dépannage

### Problème: "Connection refused"
```
Solution: Vérifier que le backend est en cours d'exécution sur le port 9086
mvn spring-boot:run
```

### Problème: "Token invalide"
```
Solution: Le token peut avoir expiré (24h). Se reconnecter
curl -X POST http://localhost:9086/auth/login ...
```

### Problème: "Email already exists"
```
Solution: Utiliser un email différent ou supprimer l'utilisateur de la BD
```

### Problème: "Access Denied"
```
Solution: Vérifier que vous avez le bon rôle pour accéder à la ressource
```

---

## 📊 Logs Utiles

Pour déboguer, vérifiez les logs du backend:

```yaml
logging:
  level:
    tn.esprit.formation: DEBUG
    org.springframework.security: DEBUG
```

Cherchez ces messages:
- `[DEBUG] Attempting authentication` - Tentative de connexion
- `[DEBUG] Authentication success` - Connexion réussie
- `[DEBUG] Invalid token` - Token invalide
- `[DEBUG] Access denied` - Accès refusé

---

## 🎯 Étapes Suivantes

Une fois tous les tests réussis:

1. ✅ Compiler et déployer le backend
2. ✅ Créer les composants Angular (Login/SignUp)
3. ✅ Intégrer l'authentification dans le frontend
4. ✅ Tester le flux complet (frontend → backend)
5. ✅ Configurer HTTPS en production

---

**Statut:** 🟢 Tous les tests passent = Système prêt pour la production

**Note:** Ce guide suppose que les rôles ont été initialisés via `init-roles.sql`
