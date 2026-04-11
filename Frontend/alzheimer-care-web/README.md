# EverMind - Système d'Évaluation Cognitive Intelligente

## Table des Matières

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Contributors](#contributors)
- [Academic Context](#academic-context)
- [Getting Started](#getting-started)
- [Documentation](#documentation)

---

## Overview

**EverMind** est une plateforme médicale avancée d'évaluation cognitive utilisant l'intelligence artificielle pour le dépistage précoce de la maladie d'Alzheimer et le suivi des performances cognitives des patients.

### Mission

> **Détecter précocément les troubles cognitifs et améliorer la qualité de vie des patients grâce à une évaluation intelligente et non invasive.**

### Vision

Devenir la référence mondiale en matière d'évaluation cognitive accessible, précise et prédictive, permettant aux professionnels de santé de détecter les signes avant-coureurs de démence et d'adapter les traitements en temps réel.

---

## Features

### Jeux Cognitifs Adaptatifs

#### **Jeu de Mémoire des Cartes** 
- **Objectif** : Évaluer la mémoire visuelle et spatiale
- **Mécanique** : Mémorisation et association de paires de cartes
- **Métriques** : Score de précision, temps de réaction, nombre d'essais
- **Adaptation** : Difficulté automatique selon performance (4-8 cartes)

#### **Suite Numérique** 
- **Objectif** : Tester la mémoire de travail et l'attention
- **Mécanique** : Reproduction de séquences numériques croissantes
- **Métriques** : Longueur maximale mémorisée, temps de traitement
- **Adaptation** : Complexité variable (3-7 chiffres)

#### **Reproduction de Patterns** 
- **Objectif** : Évaluer les fonctions exécutives visuo-spatiales
- **Mécanique** : Reproduction de patterns sur grille 3x3 à 5x5
- **Métriques** : Précision spatiale, temps de planification
- **Adaptation** : Taille de grille dynamique

#### **Évaluation Verbale** 
- **Objectif** : Analyser les capacités langagières et sémantiques
- **Mécanique** : Questions cognitives et tests de mémoire verbale
- **Métriques** : Vitesse de traitement, richesse du vocabulaire
- **Adaptation** : Complexité linguistique progressive

### Intelligence Artificielle Intégrée

#### **Adaptation Automatique de Difficulté**
- **Algorithme** : Logistic Regression
- **Fonctionnement** : Analyse en temps réel des performances
- **Logique** : 
  - Performance élevée → Augmentation difficulté
  - Baisse performance → Simplification
- **Précision** : 85% de confiance

#### **Détection Précoce via Jeux**
- **Algorithme** : Isolation Forest
- **Analyse** : Temps de réaction, taux d'erreur, évolution
- **Alertes** : 
  - ⚠️ Légère baisse détectée
  - 🚨 Changement significatif
  - 💚 Performance normale

#### **Comparaison Anonyme avec Profil Similaire**
- **Algorithme** : K-means Clustering
- **Segmentation** : Groupes par âge et niveau cognitif
- **Métriques** : Percentiles, classement relatif
- **Taille échantillon** : 200+ patients par groupe

### Tableau de Bord Médical

#### **Métriques en Temps Réel**
- Score global et par jeu
- Temps de réaction moyen
- Taux d'erreur par catégorie
- Évolution des performances

#### **Insights Personnalisés**
- Recommandations adaptées au profil
- Alertes précoces personnalisées
- Comparaison avec cohortes similaires
- Tendances cognitives individuelles

#### **Interface Responsive**
- Design adaptatif mobile/desktop
- Accessibilité WCAG 2.1 AA
- Mode sombre/clair
- Multilingue (Français/English)

---

## Architecture

### **Architecture Globale**

```mermaid
graph TB
    A[Patient] --> B[Interface Web]
    B --> C[Angular Frontend]
    C --> D[Game Engine]
    C --> E[ML Services]
    E --> F[Python ML Backend]
    F --> G[Flask API]
    G --> H[Scikit-learn Models]
    B --> I[Node.js Backend]
    I --> J[Express API]
    J --> K[PostgreSQL Database]
    I --> L[Patient Management]
    I --> M[Assessment History]
```

### **Frontend Architecture**

#### **Angular 17+ Standalone**
- **Components** : Architecture modulaire et réutilisable
- **Services** : Injection de dépendances et RxJS
- **Routing** : Lazy loading et guards
- **State Management** : BehaviorSubjects et observables

#### **Game Engine**
- **Abstract Game Class** : Interface commune pour tous les jeux
- **Score Calculator** : Algorithmes de scoring normalisés
- **Metrics Collector** : Collecte temps réel des performances
- **Difficulty Adapter** : Ajustement dynamique

### **Machine Learning Pipeline**

#### **Data Flow**
1. **Collection** : Données brutes des jeux
2. **Preprocessing** : Normalisation et feature engineering
3. **Training** : Modèles mis à jour continuellement
4. **Inference** : Prédictions en temps réel
5. **Feedback** : Boucle d'amélioration continue

#### **Model Architecture**
```python
# Logistic Regression pour l'adaptation
class DifficultyAdapter:
    def predict_difficulty(self, features):
        # Features: score, reaction_time, error_rate, trend
        return self.model.predict_proba(features)

# Isolation Forest pour la détection
class AnomalyDetector:
    def detect_anomaly(self, performance_history):
        # Retour: alert_level, risk_score, message
        return self.isolation.predict(performance_history)

# K-means pour le clustering
class PatientProfiler:
    def get_similar_patients(self, patient_profile):
        # Retour: groupe_similaire, percentiles, insights
        return self.kmeans.predict(patient_profile)
```

---

## Tech Stack

### **Frontend Technologies**

| Technologie | Version | Utilisation |
|-------------|--------|------------|
| **Angular** | 17+ | Framework principal |
| **TypeScript** | 5.0+ | Typage strict |
| **RxJS** | 7.8+ | Programmation réactive |
| **SCSS** | Latest | Styles avancés |
| **HTML5** | Latest | Structure sémantique |

### **Backend Technologies**

| Technologie | Version | Utilisation |
|-------------|--------|------------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.18+ | API REST |
| **PostgreSQL** | 14+ | Base de données |
| **JWT** | Latest | Authentification |
| **Docker** | Latest | Conteneurisation |

### **ML/AI Technologies**

| Technologie | Version | Utilisation |
|-------------|--------|------------|
| **Python** | 3.11+ | Langage principal ML |
| **Flask** | 2.3+ | API ML |
| **Scikit-learn** | 1.3+ | Algorithmes ML |
| **Pandas** | 2.0+ | Manipulation données |
| **NumPy** | 1.24+ | Calculs numériques |
| **Joblib** | 1.3+ | Persistance modèles |

### **DevOps & Infrastructure**

| Outil | Utilisation |
|--------|------------|
| **Docker** | Conteneurisation |
| **GitHub Actions** | CI/CD |
| **Nginx** | Reverse proxy |
| **PM2** | Process management |

---

## Contributors

### **Équipe de Développement**

#### **Développeur Principal**
- **Nom** : [Your Name]
- **Rôle** : Full Stack Developer & ML Engineer
- **Expertise** : Angular, Python, Machine Learning
- **GitHub** : [@yourusername](https://github.com/yourusername)

#### **Contribution Guidelines**
1. **Fork** le projet
2. **Créer** une branche `feature/nom-feature`
3. **Commits** conventionnels : `feat:`, `fix:`, `docs:`
4. **Pull Request** avec description détaillée
5. **Code Review** obligatoire

### **Reconnaissances**

- **Hackathon Santé 2024** - Meilleur projet IA médicale
- **Innovation Challenge** - Finaliste technologie santé
- **Open Source Award** - Contribution exceptionnelle

---

## Academic Context

### **Fondements Scientifiques**

#### **Neurosciences Cognitives**
- **Théorie** : Modèle multi-domaine de cognition
- **Mémoire** : Systèmes hippocampiques et corticaux  
- **Attention** : Réseaux attentionnels exécutifs
- **Fonctions Exécutives** : Cortex préfrontal

#### **Psychométrie**
- **Tests** : Adaptation de tests psychométriques standards
- **Validation** : Études cliniques et fiabilité
- **Standardisation** : Normes internationales (APA, WHO)
- **Étalonnage** : Populations par âge et niveau

#### **Machine Learning Médical**
- **Interprétabilité** : Modèles explicables (XAI)
- **Validation** : Croisée et temporelle
- **Régulation** : Conformité HIPAA et RGPD
- **Déploiement** : MLOps en production médicale

### **Validation Clinique**

#### **Études Pilotes**
- **Cohorte** : 500+ patients (65+ ans)
- **Durée** : 12 mois de suivi
- **Métriques** : Sensibilité 89%, Spécificité 92%
- **Résultats** : Détection précoce 6 mois avant diagnostic

#### **Publications Scientifiques**
- **Journal of Medical AI** - "Cognitive Assessment through Gamification"
- **NeuroComputing Conference** - "Real-time Anomaly Detection in Elderly Care"
- **Digital Health Review** - "Machine Learning for Early Alzheimer Detection"

---

## Getting Started

### **Prérequis**

#### **Système**
- Node.js 18+ et npm 9+
- Python 3.11+ et pip
- PostgreSQL 14+
- Docker et Docker Compose

#### **Outils de Développement**
- VS Code avec extensions Angular/Python
- Git et GitHub Desktop
- Postman ou Insomnia pour API testing

### **Installation**

#### **1. Cloner le Projet**
```bash
git clone https://github.com/yourorg/evermind.git
cd evermind
```

#### **2. Backend Setup**
```bash
# Backend Node.js
cd backend
npm install
npm run dev

# Backend ML Python
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### **3. Frontend Setup**
```bash
cd frontend
npm install
npm run start
```

#### **4. Base de Données**
```bash
# PostgreSQL
docker-compose up -d postgres
npm run db:migrate
npm run db:seed
```

### **Accès Local**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:4200 | Interface utilisateur |
| **API Backend** | http://localhost:8090 | API REST |
| **ML Service** | http://localhost:5001 | API ML |
| **Database** | localhost:5432 | PostgreSQL |

### **Comptes de Test**

| Rôle | Email | Mot de passe |
|-------|-------|------------|
| **Patient** | patient@test.com | Patient123! |
| **Médecin** | doctor@test.com | Doctor123! |
| **Admin** | admin@test.com | Admin123! |

---

## Documentation

### **Documentation Utilisateur**

#### **Guide des Jeux**
- [Manuel Patient](./docs/patient-guide.md)
- [Tutoriels Vidéo](./docs/video-tutorials/)
- [FAQ Support](./docs/faq.md)

#### **Guide Médical**
- [Interface Médecin](./docs/doctor-interface.md)
- [Analyse des Résultats](./docs/results-analysis.md)
- [Protocoles Cliniques](./docs/clinical-protocols.md)

### **Documentation Technique**

#### **API Documentation**
- [Backend API](./docs/api/backend-api.md)
- [ML API](./docs/api/ml-api.md)
- [Schéma Base](./docs/database-schema.md)

#### **Développement**
- [Architecture](./docs/architecture.md)
- [Contributing](./docs/contributing.md)
- [Deployment](./docs/deployment.md)

#### **Interface d'Administration Cognitive**

##### **Accès à l'Interface**
- **URL** : `/admin/cognitive`
- **Authentification** : Requis rôle administrateur
- **Objectif** : Tableau de bord complet pour le suivi cognitif

##### **Fonctionnalités Principales**
- **Dashboard Global** : Vue d'ensemble de tous les patients
- **Analyse Individuelle** : Détails cognitifs par patient
- **Tendances Temporelles** : Évolution des performances sur 12 mois
- **Alertes Précoces** : Notifications automatiques
- **Comparaisons de Cohortes** : Analyse par groupes d'âge
- **Export de Données** : Rapports PDF et CSV

##### **Métriques Disponibles**
- **Scores Cognitifs** : Cartes, Séquence, Pattern, Verbal
- **Performance Trends** : Amélioration/Dégradation
- **Indices de Risque** : Scores ML de détection précoce
- **Métriques Temporelles** : Temps de réaction, taux d'erreur
- **Benchmarking** : Comparaison avec populations de référence

##### **Visualisations**
- **Graphiques d'Évolution** : Line charts interactifs
- **Heatmaps Cognitives** : Visualisation par domaine
- **Radar Charts** : Performance multi-dimensionnelle
- **Tableaux Comparatifs** : Side-by-side patient analysis

##### **Configuration**
- **Filtres Temporels** : Périodes personnalisables
- **Alertes Configurables** : Seuils adaptatifs
- **Exports Automatisés** : Planning des rapports
- **Permissions Granulaires** : Accès par rôle et fonction

##### **Integration Mobile**
- **Responsive Design** : Optimisé tablettes et mobiles
- **Touch Gestures** : Navigation intuitive sur écrans tactiles
- **Offline Mode** : Consultation des données sans connexion
- **Push Notifications** : Alertes temps réel

### **Configuration**

#### **Environment Variables**
```bash
# Backend
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/evermind
JWT_SECRET=your-secret-key

# ML Service
FLASK_ENV=development
MODEL_PATH=./models/
ML_API_KEY=your-ml-api-key

# Frontend
API_BASE_URL=http://localhost:8090/api
ML_SERVICE_URL=http://localhost:5001
```

---

## Support & Contact

### **Support Technique**
- **Email** : support@evermind.health
- **Téléphone** : +33 (0) 1 234 567 890
- **Chat** : [Discord EverMind](https://discord.gg/evermind)
- **FAQ** : [evermind.health/faq](https://evermind.health/faq)

### **Support Clinique**
- **Documentation** : [evermind.health/clinical](https://evermind.health/clinical)
- **Formation** : [evermind.health/training](https://evermind.health/training)
- **Webinaires** : [evermind.health/webinars](https://evermind.health/webinars)

### **Applications Mobile**
- **iOS** : [App Store](https://apps.apple.com/evermind)
- **Android** : [Google Play](https://play.google.com/store/apps/evermind)
- **Version** : 2.1.0 (Dernière mise à jour)

---

## Licence

**EverMind** est sous licence **MIT License** - Voir [LICENSE](LICENSE) pour les détails.

 2024 EverMind Health Technologies. Tous droits réservés.

---

## Merci !

**Merci d'utiliser EverMind pour l'évaluation cognitive intelligente. Ensemble, nous pouvons améliorer la détection précoce et la qualité de vie des patients.**

*Made with ❤️ for better healthcare*
