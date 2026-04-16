# 🔐 Guide Complet - Système d'Authentification et d'Autorisation

## 📋 Table des matières
1. [Architecture](#architecture)
2. [Installation et Configuration](#installation-et-configuration)
3. [Utilisation](#utilisation)
4. [Endpoints API](#endpoints-api)
5. [Exemples](#exemples)
6. [Sécurité](#sécurité)

---

## 🏗️ Architecture

### Composants Clés

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                       │
│  - Formulaire d'inscription/connexion                       │
│  - Stockage du token JWT en localStorage                    │
│  - Envoi du token en header Authorization                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthController                           │
│  - POST /auth/register : Inscription                        │
│  - POST /auth/login : Connexion                             │
│  - GET /auth/check : Vérification                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthService                              │
│  - registerUser(SignUpDTO)                                  │
│  - authenticateUser(LoginDTO)                               │
│  - Gestion des utilisateurs                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                 AuthTokenFilter (JWT)                        │
│  - Extraction du token du header Authorization              │
│  - Validation du token                                      │
│  - Définition du contexte de sécurité                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   SecurityConfig                            │
│  - Configuration de Spring Security                         │
│  - Définition des routes protégées                          │
│  - Gestion des rôles et permissions                         │
└──────────────────────────────────────────────────────────────┘
```

### Flux d'Authentification

```
1. INSCRIPTION
   SignUpDTO (nom, prenom, email, mdp) 
   → AuthController.register()
   → AuthService.registerUser()
   → Validation & BCrypt
   → Sauvegarde en DB
   → ✅ 201 Created

2. CONNEXION
   LoginDTO (email, mdp)
   → AuthController.login()
   → AuthService.authenticateUser()
   → AuthenticationManager.authenticate()
   → JwtUtils.generateJwtToken()
   → ✅ 200 OK + JWT Token

3. REQUÊTE AUTHENTIFIÉE
   GET /formation/programmes
   Header: Authorization: Bearer <JWT_TOKEN>
   → AuthTokenFilter.doFilterInternal()
   → JwtUtils.validateJwtToken()
   → SecurityContext.setAuthentication()
   → ✅ Accès accordé/refusé selon les rôles
```

---

## 📦 Installation et Configuration

### 1. Dépendances Maven
```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT (JJWT) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 2. Configuration application.yml

```yaml
# JWT Configuration
app:
  jwtSecret: "votre-clé-secrète-très-longue-et-complexe-d-au-moins-256-bits-pour-HS512"
  jwtExpirationMs: 86400000    # 24 heures
  jwtRefreshExpirationMs: 604800000  # 7 jours

# Spring Configuration
spring:
  application:
    name: formation
  datasource:
    url: jdbc:postgresql://localhost:5434/formation
    username: votre_user
    password: votre_password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    show-sql: false
    open-in-view: false

# Logging
logging:
  level:
    tn.esprit.formation: DEBUG
    org.springframework.security: DEBUG
```

### 3. Initialisation de la Base de Données

Après le premier démarrage, exécutez:
```sql
-- Vérifier que les tables ont été créées
SELECT * FROM roles;
SELECT * FROM users;
SELECT * FROM user_roles;

-- Exécuter le script init-roles.sql pour créer les rôles de test
```

---

## 🚀 Utilisation

### Démarrage de l'application

```bash
cd Backend/Formation/Formation
mvn clean install
mvn spring-boot:run
```

L'application démarre sur `http://localhost:9086`

---

## 📡 Endpoints API

### 🔓 Routes Publiques

#### 1. Inscription (Sign Up)
```http
POST /auth/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "motDePasse": "SecurePassword123!",
  "confirmMotDePasse": "SecurePassword123!",
  "role": "AIDANT"  // ou "ADMIN"
}
```

**Réponse (201 Created):**
```json
{
  "message": "Utilisateur enregistré avec succès!",
  "email": "jean.dupont@example.com"
}
```

#### 2. Connexion (Login)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "motDePasse": "SecurePassword123!"
}
```

**Réponse (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqZWFuLmR1cG9udEBleGFtcGxlLmNvbSIsInJvbGVzIjoiUk9MRV9BSURBOUNUIIWASMDM...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "jean.dupont@example.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "roles": ["ROLE_AIDANT"],
  "expiresIn": 86400000
}
```

#### 3. Vérification d'Authentification
```http
GET /auth/check
```

**Réponse (200 OK):**
```json
{
  "message": "Authentification valide"
}
```

### 🔒 Routes Protégées - ADMIN

#### 1. Dashboard Admin
```http
GET /admin/dashboard
Authorization: Bearer <JWT_TOKEN>
```

**Réponse (200 OK):**
```json
{
  "message": "Bienvenue sur le dashboard admin!",
  "status": "ok"
}
```

#### 2. Désactiver un Utilisateur
```http
POST /admin/users/{id}/deactivate
Authorization: Bearer <JWT_TOKEN>
```

#### 3. Activer un Utilisateur
```http
POST /admin/users/{id}/activate
Authorization: Bearer <JWT_TOKEN>
```

#### 4. Récupérer un Utilisateur
```http
GET /admin/users/{id}
Authorization: Bearer <JWT_TOKEN>
```

### 🔒 Routes Protégées - AIDANT et ADMIN

#### Voir les Formations
```http
GET /formation/programmes
Authorization: Bearer <JWT_TOKEN>
```

---

## 💡 Exemples

### Exemple 1: Inscription en cURL

```bash
curl -X POST http://localhost:9086/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "motDePasse": "SecurePassword123!",
    "confirmMotDePasse": "SecurePassword123!",
    "role": "AIDANT"
  }'
```

### Exemple 2: Connexion en cURL

```bash
curl -X POST http://localhost:9086/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "motDePasse": "SecurePassword123!"
  }'
```

Réponse:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "jean.dupont@example.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "roles": ["ROLE_AIDANT"],
  "expiresIn": 86400000
}
```

### Exemple 3: Requête Authentifiée

```bash
# Récupérer les formations avec le token
curl -X GET http://localhost:9086/formation/programmes \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

### Exemple 4: Accès Admin

```bash
# Accéder au dashboard admin (uniquement avec rôle ADMIN)
curl -X GET http://localhost:9086/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

---

## 🔐 Sécurité

### Meilleures Pratiques Implémentées

✅ **1. Chiffrement des Mots de Passe**
- Utilisation de BCryptPasswordEncoder
- 10 rounds de salting

✅ **2. Tokens JWT**
- Signature avec HS512
- Expiration après 24 heures
- Refresh tokens pour renouvellement

✅ **3. Spring Security**
- Protection CSRF désactivée (API stateless)
- Gestion des rôles (ROLE_ADMIN, ROLE_AIDANT)
- Routes protégées selon le rôle

✅ **4. Authentification par Filtre**
- AuthTokenFilter extrait le token du header
- Validation avant chaque requête
- Gestion des erreurs 401/403

✅ **5. Validation des Données**
- Validation des DTOs avec annotations Jakarta
- Messages d'erreur explicites
- Vérification des emails uniques

### Configuration de Sécurité Recommandée

```yaml
# .env ou variables d'environnement
JWT_SECRET=générer-une-clé-très-complexe-et-longue
JWT_EXPIRATION_MS=86400000
```

### Changer la Clé Secrète JWT

1. Générer une nouvelle clé (minimum 256 bits pour HS512):
```bash
# En Java
import javax.crypto.KeyGenerator;
import java.util.Base64;

KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA512");
keyGen.init(512);
byte[] secretKey = keyGen.generateKey().getEncoded();
String encodedKey = Base64.getEncoder().encodeToString(secretKey);
System.out.println(encodedKey);
```

2. Mettre à jour dans `application.yml`:
```yaml
app:
  jwtSecret: "votre-nouvelle-clé-générée"
```

### Tests des Rôles

**Utilisateurs de Test**

| Email | Mot de passe | Rôle |
|-------|------------|------|
| admin@example.com | admin123 | ADMIN |
| aidant@example.com | aidant123 | AIDANT |

> Note: Ces credentials sont générir uniquement pour le test. À modifier en production!

---

## 📚 Ressources

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT (JJWT) Library](https://github.com/jwtk/jjwt)
- [BCrypt Password Encoder](https://en.wikipedia.org/wiki/Bcrypt)
- [OAuth 2.0 & OpenID Connect](https://openid.net/connect/)

---

## ❓ FAQ

**Q: Comment renouveler le token après expiration?**
R: Utilisez le `refreshToken` pour obtenir un nouveau token via un endpoint `/auth/refresh` (à implémenter).

**Q: Puis-je avoir plusieurs rôles?**
R: Oui, modifiez `AuthService.registerUser()` pour ajouter plusieurs rôles.

**Q: Comment protéger une nouvelle route?**
R: Ajoutez dans `SecurityConfig.filterChain()`:
```java
.requestMatchers("/api/nouvelle-route/**").hasRole("ADMIN")
```

**Q: Le token est-il stocké en base de données?**
R: Non, c'est un JWT stateless. Aucun stockage backend nécessaire.

---

**Auteur:** Système d'Authentification Spring Boot + JWT  
**Version:** 1.0.0  
**Dernière mise à jour:** 2026-04-16
