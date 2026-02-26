# Cognitive Assessment API (Spring Boot)

## Démarrer l’application

```bash
cd Backend/CognitiveAssessment/CognitiveAssessment
mvn spring-boot:run
```

- **Port** : `8085`
- **Base URL** : `http://localhost:8085/api/cognitive-assessments`

## Tests Postman

1. Importer la collection :  
   `postman/Cognitive-Assessment-CRUD.postman_collection.json`
2. Lancer l’appli (voir ci-dessus), puis exécuter les requêtes dans l’ordre :
   - **Create assessment** (POST) → renvoie l’assessment avec `id`
   - **Get all** (GET) → liste tous les assessments
   - **Get by ID** (GET) → remplacer `1` par l’`id` créé
   - **Get by patient ID** (GET) → liste par `patientId`
   - **Update** (PUT) → remplacer `1` par l’`id`, adapter le body
   - **Delete** (DELETE) → remplacer `1` par l’`id`

## Format JSON (Create / Update)

- **type** : `"initial"` | `"complete"` | `"follow-up"`
- **trend** : `"up"` | `"down"` | `"stable"`
- **scores** : `{ "memory", "orientation", "language", "executiveFunctions" }` (0–10 chacun)

## Tests automatisés

```bash
mvn test -Dtest=CognitiveAssessmentControllerTest
```
