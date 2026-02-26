# Tester le CRUD Autonomy Assessment avec Postman

## 1. Base PostgreSQL

Crée la base **autonomy** si elle n’existe pas :

```sql
CREATE DATABASE autonomy;
```

(psql, pgAdmin ou outil de ton choix, en tant que `postgres`.)

## 2. Démarrer le backend

Dans un terminal :

```bash
cd Backend/Autonomy/Autonomy
mvn spring-boot:run
```

Attends **"Started AutonomyApplication"** et **"Tomcat started on port 8087"**.

---

## 3. Importer la collection dans Postman (optionnel)

- **Import** → **File** → `Autonomy-Assessment-CRUD.postman_collection.json` (dossier `postman`).
- Exécute chaque requête avec **Send**.

---

## 4. Tester les opérations (dans l’ordre)

### 1) CREATE (créer un assessment)

- **Méthode :** `POST`
- **URL :** `http://localhost:8087/api/autonomy-assessments`
- **Headers :** `Content-Type` = `application/json`
- **Body (raw, JSON) :**

```json
{
  "patientId": "P-2024-8921",
  "date": "23/02/2025",
  "evaluator": "Dr. Claire Moreau",
  "scores": {
    "hygiene": 4,
    "feeding": 3,
    "dressing": 4,
    "mobility": 3,
    "communication": 5
  },
  "totalScore": 19,
  "trend": "stable",
  "trendPoints": 0,
  "assistanceLevel": "Moderate",
  "observations": "Assessment créé via Postman.",
  "recommendedDevicesJson": null,
  "caregiverRecommendationsJson": null
}
```

- **Résultat attendu :** **201 Created**, réponse avec un **`id`**. Note cet id pour la suite.

**Valeurs possibles pour `trend` :** `"up"` | `"down"` | `"stable"`.

**Scores :** chaque domaine (hygiene, feeding, dressing, mobility, communication) entre 0 et 5. `totalScore` = somme des 5 (0–25).

---

### 2) GET ALL

- **Méthode :** `GET`
- **URL :** `http://localhost:8087/api/autonomy-assessments`
- **Résultat attendu :** **200 OK**, tableau JSON des assessments.

---

### 3) GET BY ID

- **Méthode :** `GET`
- **URL :** `http://localhost:8087/api/autonomy-assessments/1` (remplace **1** par l’id créé)
- **Résultat attendu :** **200 OK**, un objet assessment.

---

### 4) GET BY PATIENT ID

- **Méthode :** `GET`
- **URL :** `http://localhost:8087/api/autonomy-assessments/patient/P-2024-8921`
- **Résultat attendu :** **200 OK**, tableau d’assessments pour ce patient.

---

### 5) UPDATE

- **Méthode :** `PUT`
- **URL :** `http://localhost:8087/api/autonomy-assessments/1` (remplace **1** par l’id)
- **Headers :** `Content-Type` = `application/json`
- **Body :** même structure que CREATE, champs modifiés.

Exemple :

```json
{
  "patientId": "P-2024-8921",
  "date": "23/02/2025",
  "evaluator": "Dr. Claire Moreau",
  "scores": {
    "hygiene": 5,
    "feeding": 4,
    "dressing": 4,
    "mobility": 4,
    "communication": 5
  },
  "totalScore": 22,
  "trend": "up",
  "trendPoints": 3,
  "assistanceLevel": "Low",
  "observations": "Assessment mis à jour via Postman.",
  "recommendedDevicesJson": null,
  "caregiverRecommendationsJson": null
}
```

- **Résultat attendu :** **200 OK**, assessment mis à jour.

---

### 6) DELETE

- **Méthode :** `DELETE`
- **URL :** `http://localhost:8087/api/autonomy-assessments/1` (remplace **1** par l’id)
- **Résultat attendu :** **204 No Content**. Un GET sur le même id doit ensuite retourner **404**.

---

## 5. Ordre recommandé pour un test complet

1. **POST** (Create) → noter l’**id**.
2. **GET** (Get all).
3. **GET** `.../1` (Get by ID).
4. **GET** `.../patient/P-2024-8921`.
5. **PUT** `.../1` (Update).
6. **DELETE** `.../1`.
7. **GET** `.../1` → **404**.

---

## 6. En cas d’erreur

- **Connection refused** : backend pas démarré ou pas sur **8087**. Vérifie aussi que PostgreSQL tourne et que la base `autonomy` existe.
- **Mot de passe PostgreSQL** : modifie `spring.datasource.password` dans `src/main/resources/application.properties` si besoin (ex. `1303`).
- **400 / 500** : vérifie le JSON (virgules, guillemets) et les valeurs (`trend`, scores 0–5).
