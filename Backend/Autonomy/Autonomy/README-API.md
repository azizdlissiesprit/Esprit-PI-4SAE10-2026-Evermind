# API Autonomy Assessment (Spring Boot + PostgreSQL)

## Résumé

- **Port :** 8087  
- **Base de données :** PostgreSQL, base `autonomy`  
- **URL de base :** `http://localhost:8087/api/autonomy-assessments`

## Endpoints

| Méthode | URL | Description |
|--------|-----|-------------|
| POST | `/api/autonomy-assessments` | Créer un assessment |
| GET | `/api/autonomy-assessments` | Liste de tous les assessments |
| GET | `/api/autonomy-assessments/{id}` | Un assessment par id |
| GET | `/api/autonomy-assessments/patient/{patientId}` | Assessments d’un patient |
| PUT | `/api/autonomy-assessments/{id}` | Modifier un assessment |
| DELETE | `/api/autonomy-assessments/{id}` | Supprimer un assessment |

## Configuration PostgreSQL

1. Créer la base : `CREATE DATABASE autonomy;`
2. Dans `src/main/resources/application.properties` :  
   - `spring.datasource.password=1303` (à adapter à ton mot de passe postgres)

## Lancer l’application

```bash
cd Backend/Autonomy/Autonomy
mvn spring-boot:run
```

## Tester avec Postman

Voir **postman/INSTRUCTIONS-POSTMAN.md** et importer **postman/Autonomy-Assessment-CRUD.postman_collection.json**.
