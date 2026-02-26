# Tester le CRUD Cognitive Assessment avec Postman

## 1. Démarrer le backend

Dans un terminal, à la racine du projet backend :

```bash
cd Backend/CognitiveAssessment/CognitiveAssessment
mvn spring-boot:run
```

Attends le message **"Started CognitiveAssessmentApplication"** et **"Tomcat started on port 8086"**.

---

## 2. Importer la collection dans Postman (optionnel)

- Ouvre Postman.
- **Import** → **File** → choisis le fichier :
  - `Cognitive-Assessment-CRUD.postman_collection.json` (dans le dossier `postman` du projet).
- La collection **Cognitive Assessment CRUD** apparaît dans la barre latérale. Tu peux exécuter chaque requête en cliquant dessus puis sur **Send**.

Si tu ne veux pas importer, tu peux créer les requêtes à la main avec les détails ci‑dessous.

---

## 3. Tester les opérations (dans l’ordre)

### 1) CREATE (créer un assessment)

- **Méthode :** `POST`
- **URL :** `http://localhost:8086/api/cognitive-assessments`
- **Headers :** `Content-Type` = `application/json`
- **Body (raw, JSON) :**

```json
{
  "patientId": "P-2024-8921",
  "date": "23/02/2025",
  "type": "complete",
  "evaluator": "Dr. Claire Moreau",
  "mmseScore": 22,
  "moocaScore": 19,
  "trend": "stable",
  "trendPoints": 0,
  "scores": {
    "memory": 5,
    "orientation": 6,
    "language": 7,
    "executiveFunctions": 5
  },
  "observations": "Assessment créé via Postman."
}
```

- **Résultat attendu :** statut **201 Created**, et dans la réponse un objet avec un **`id`** (ex. `1`). Note cet **id** pour les étapes suivantes.

**Valeurs possibles :**
- `type` : `"initial"` | `"complete"` | `"follow-up"`
- `trend` : `"up"` | `"down"` | `"stable"`

---

### 2) GET ALL (tous les assessments)

- **Méthode :** `GET`
- **URL :** `http://localhost:8086/api/cognitive-assessments`
- **Body :** aucun

- **Résultat attendu :** **200 OK**, body = tableau JSON des assessments (au moins celui créé à l’étape 1).

---

### 3) GET BY ID (un assessment par id)

- **Méthode :** `GET`
- **URL :** `http://localhost:8086/api/cognitive-assessments/1`
  - Remplace **1** par l’**id** renvoyé à l’étape CREATE (ex. `2` → `.../2`).

- **Résultat attendu :** **200 OK**, un seul objet assessment.

---

### 4) GET BY PATIENT ID (assessments d’un patient)

- **Méthode :** `GET`
- **URL :** `http://localhost:8086/api/cognitive-assessments/patient/P-2024-8921`
  - Tu peux changer `P-2024-8921` par un autre `patientId` si tu en as créé.

- **Résultat attendu :** **200 OK**, tableau d’assessments pour ce patient.

---

### 5) UPDATE (modifier un assessment)

- **Méthode :** `PUT`
- **URL :** `http://localhost:8086/api/cognitive-assessments/1`
  - Remplace **1** par l’**id** de l’assessment à modifier.
- **Headers :** `Content-Type` = `application/json`
- **Body (raw, JSON) :** même structure que CREATE, avec les champs modifiés (et éventuellement `id` dans le body, mais l’URL prime).

Exemple (modifier observations et scores) :

```json
{
  "patientId": "P-2024-8921",
  "date": "23/02/2025",
  "type": "complete",
  "evaluator": "Dr. Claire Moreau",
  "mmseScore": 24,
  "moocaScore": 21,
  "trend": "up",
  "trendPoints": 2,
  "scores": {
    "memory": 6,
    "orientation": 7,
    "language": 8,
    "executiveFunctions": 6
  },
  "observations": "Assessment mis à jour via Postman."
}
```

- **Résultat attendu :** **200 OK**, body = assessment mis à jour.

---

### 6) DELETE (supprimer un assessment)

- **Méthode :** `DELETE`
- **URL :** `http://localhost:8086/api/cognitive-assessments/1`
  - Remplace **1** par l’**id** à supprimer.

- **Résultat attendu :** **204 No Content** (body vide).

Ensuite, un **GET** sur le même id doit retourner **404 Not Found**.

---

## 4. Ordre recommandé pour un test complet

1. **POST** (Create) → noter l’**id** dans la réponse.
2. **GET** (Get all) → vérifier que l’assessment apparaît.
3. **GET** `.../1` (Get by ID) → remplacer 1 par l’id noté.
4. **GET** `.../patient/P-2024-8921` (Get by patient).
5. **PUT** `.../1` (Update) → remplacer 1 par l’id.
6. **DELETE** `.../1` → remplacer 1 par l’id.
7. **GET** `.../1` → doit retourner **404**.

---

## 5. En cas d’erreur

- **Connection refused / pas de réponse**  
  Le backend n’est pas démarré ou n’écoute pas sur **8086**. Relance `mvn spring-boot:run` et vérifie qu’il n’y a pas d’erreur au démarrage.

- **404 sur GET by ID après DELETE**  
  Comportement normal : l’assessment a bien été supprimé.

- **400 Bad Request**  
  Vérifie que le body est bien du **JSON valide** et que `type` / `trend` ont les valeurs autorisées.

- **500 Internal Server Error**  
  Regarde les logs dans le terminal où tourne `mvn spring-boot:run` pour voir le détail de l’erreur.
