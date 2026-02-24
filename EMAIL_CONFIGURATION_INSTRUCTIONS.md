# Instructions de Configuration Email pour EverMind

## 📧 Configuration Gmail pour Notifications d'Assessment

### Étape 1: Activer la vérification en 2 étapes sur Gmail
1. Connectez-vous à votre compte Gmail (benkhalifatasnim70@gmail.com)
2. Allez dans **Paramètres** > **Sécurité**
3. Activez **Vérification en 2 étapes** si ce n'est pas déjà fait

### Étape 2: Créer un mot de passe d'application
1. Allez dans **Paramètres** > **Sécurité** 
2. Cherchez **Mots de passe des applications**
3. Cliquez sur **Mots de passe des applications**
4. Sélectionnez:
   - **Application**: **Autre (nom personnalisé)**
   - **Nom**: `EverMind Assessment System`
5. Cliquez sur **Générer**
6. **Copiez le mot de passe de 16 caractères** (important: ne l'oubliez pas!)

### Étape 3: Mettre à jour les fichiers de configuration
Remplacez `your_app_password_here` dans les deux fichiers suivants:

#### Backend Autonomy (port 8089):
**Fichier**: `Backend/Autonomy/Autonomy/src/main/resources/application.properties`
```properties
spring.mail.password=VOTRE_MOT_DE_PASSE_16_CARACTERES
```

#### Backend Cognitive Assessment (port 8087):
**Fichier**: `Backend/CognitiveAssessment/CognitiveAssessment/src/main/resources/application.properties`
```properties
spring.mail.password=VOTRE_MOT_DE_PASSE_16_CARACTERES
```

### Étape 4: Redémarrer les services backend
```bash
# Arrêter les services actuels (Ctrl+C dans les terminaux)
# Redémarrer Autonomy
cd Backend/Autonomy/Autonomy
mvn spring-boot:run

# Dans un autre terminal, redémarrer Cognitive Assessment  
cd Backend/CognitiveAssessment/CognitiveAssessment
mvn spring-boot:run
```

## 🧪 Tests de Notification

### Test 1: Créer un Assessment Cognitive
1. Allez dans le frontend: http://localhost:4200
2. Naviguez vers **Cognitive Assessments**
3. Cliquez sur **Nouvelle évaluation**
4. Remplissez le formulaire avec des données valides:
   - Date: `25/02/2026`
   - Évaluateur: `Dr Test`
   - Scores: `5, 6, 7, 8`
5. Soumettez le formulaire
6. **Vérifiez votre email** (benkhalifatasnim70@gmail.com)

### Test 2: Créer un Assessment Autonomie
1. Allez dans le frontend: http://localhost:4200
2. Naviguez vers **Autonomy Assessments**
3. Cliquez sur **Nouvelle évaluation**
4. Remplissez le formulaire avec des données valides:
   - Date: `25/02/2026`
   - Évaluateur: `Dr Test`
   - Scores: `3, 4, 2, 5, 3`
5. Soumettez le formulaire
6. **Vérifiez votre email** (benkhalifatasnim70@gmail.com)

## 📧 Contenu des Emails

### Email Cognitive Assessment Contient:
- 📋 Informations de l'évaluation (ID, Patient, Date, Évaluateur, Type)
- 📊 Scores MMSE et MoCA
- 🧠 Scores détaillés par domaine cognitif
- 📋 Observations cliniques
- 📈 Analyse des tendances
- 🎯 Interprétation des scores (Normal/Léger/Modéré/Sévère)
- 🔗 Actions recommandées

### Email Autonomy Assessment Contient:
- 📋 Informations de l'évaluation (ID, Patient, Date, Évaluateur)
- 📊 Score total sur 25
- 🚿 Scores détaillés par domaine (Hygiène, Alimentation, etc.)
- 🔧 Niveau d'assistance requis
- 📋 Observations cliniques
- 📈 Analyse des tendances
- 🔗 Actions recommandées

## 🔧 Dépannage

### Email non reçu:
1. **Vérifiez le dossier Spam/Promotions**
2. **Vérifiez le mot de passe d'application** (16 caractères)
3. **Vérifiez les logs backend** pour les erreurs
4. **Assurez-vous que les deux services sont démarrés**

### Erreurs communes:
- **Mot de passe incorrect**: Utilisez le mot de passe d'application de 16 caractères, PAS votre mot de passe Gmail normal
- **Services non démarrés**: Vérifiez que les deux backends tournent sur les ports 8087 et 8089
- **Configuration CORS**: Les origines localhost:4200 et localhost:4201 sont déjà configurées

## ✅ Résultat Final Attendu

Une fois configuré correctement:
- ✅ Chaque nouvel assessment cognitive envoie un email détaillé à benkhalifatasnim70@gmail.com
- ✅ Chaque nouvel assessment autonomie envoie un email détaillé à benkhalifatasnim70@gmail.com  
- ✅ Les emails contiennent toutes les informations pertinentes de l'assessment
- ✅ Le système est prêt pour la production

---

**Note de sécurité**: Ne partagez jamais le mot de passe d'application. Il est lié à votre compte Gmail.
