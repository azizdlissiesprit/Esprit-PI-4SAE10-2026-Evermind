/**
 * GUIDE D'UTILISATION - SYSTÈME DE PRÉREQUIS AVANCÉ
 * 
 * Ce guide explique comment utiliser le nouveau système de prérequis pour les formations.
 */

package tn.esprit.formation;

// ============================================
// SECTION 1: EXEMPLES D'APPELS API
// ============================================

/**
 * 1. AJOUTER UN PRÉREQUIS
 * 
 * La formation "Gestion avancée de l'Alzheimer" (ID=2) nécessite que
 * "Fondamentals de l'Alzheimer" (ID=1) soit complétée
 */
/*
POST http://localhost:9086/formation/prerequisites/add
?requiredFormationId=1
&dependentFormationId=2
&prerequisiteType=REQUIRED
&description=Cette formation nécessite de maîtriser les bases d'Alzheimer

Response:
{
  "id": 1,
  "requiredFormationId": 1,
  "requiredFormationTitle": "Fondamentals de l'Alzheimer",
  "dependentFormationId": 2,
  "dependentFormationTitle": "Gestion avancée de l'Alzheimer",
  "prerequisiteType": "REQUIRED",
  "minimumValue": null,
  "description": "Cette formation nécessite de maîtriser les bases d'Alzheimer",
  "active": true
}
*/

/**
 * 2. AJOUTER UN PRÉREQUIS AVEC TEMPS MINIMUM
 * 
 * La formation dépend que l'utilisateur ait passé au minimum 60 minutes
 * sur la formation prérequise
 */
/*
POST http://localhost:9086/formation/prerequisites/add
?requiredFormationId=1
&dependentFormationId=3
&prerequisiteType=MINIMUM_TIME
&minimumValue=60
&description=Au minimum 1 heure requise sur la formation de base

Response:
{
  "id": 2,
  "requiredFormationId": 1,
  "requiredFormationTitle": "Fondamentals de l'Alzheimer",
  "dependentFormationId": 3,
  "dependentFormationTitle": "Communication avec le patient",
  "prerequisiteType": "MINIMUM_TIME",
  "minimumValue": 60,
  "description": "Au minimum 1 heure requise sur la formation de base",
  "active": true
}
*/

/**
 * 3. VALIDER L'ACCÈS D'UN UTILISATEUR
 * 
 * Vérifie si l'utilisateur 5 peut accéder à la formation 2
 */
/*
GET http://localhost:9086/formation/prerequisites/validate/5/2

Response:
{
  "formationId": 2,
  "userId": 5,
  "canAccess": false,
  "satisfiedPercentage": 50,
  "unsatisfiedPrerequisites": [
    {
      "requiredFormationId": 1,
      "requiredFormationTitle": "Fondamentals de l'Alzheimer",
      "prerequisiteType": "REQUIRED",
      "minimumRequired": null,
      "currentValue": 0,
      "message": "Prérequis non satisfait: Cette formation nécessite de maîtriser les bases"
    }
  ],
  "message": "50% des prérequis sont satisfaits"
}
*/

/**
 * 4. VÉRIFIER L'ACCÈS SIMPLE (BOOLEAN)
 */
/*
GET http://localhost:9086/formation/prerequisites/can-access/5/2

Response: false
*/

/**
 * 5. RÉCUPÉRER TOUS LES PRÉREQUIS D'UNE FORMATION
 */
/*
GET http://localhost:9086/formation/prerequisites/2

Response:
[
  {
    "id": 1,
    "requiredFormationId": 1,
    "requiredFormationTitle": "Fondamentals de l'Alzheimer",
    "dependentFormationId": 2,
    "dependentFormationTitle": "Gestion avancée de l'Alzheimer",
    "prerequisiteType": "REQUIRED",
    "active": true
  }
]
*/

/**
 * 6. RÉCUPÉRER LES FORMATIONS DÉPENDANT D'UNE FORMATION
 */
/*
GET http://localhost:9086/formation/prerequisites/1/dependents

Response:
[
  {
    "id": 1,
    "requiredFormationId": 1,
    "dependentFormationId": 2,
    "dependentFormationTitle": "Gestion avancée de l'Alzheimer",
    "prerequisiteType": "REQUIRED"
  },
  {
    "id": 2,
    "requiredFormationId": 1,
    "dependentFormationId": 3,
    "dependentFormationTitle": "Communication avec le patient",
    "prerequisiteType": "MINIMUM_TIME"
  }
]
*/

/**
 * 7. RÉCUPÉRER LES FORMATIONS ACCESSIBLES POUR UN UTILISATEUR
 */
/*
GET http://localhost:9086/formation/prerequisites/accessible/5

Response:
[
  {
    "dependentFormationId": 1,
    "dependentFormationTitle": "Fondamentals de l'Alzheimer"
  },
  {
    "dependentFormationId": 4,
    "dependentFormationTitle": "Formation avancée"
  }
]
*/

/**
 * 8. METTRE À JOUR UN PRÉREQUIS
 */
/*
PUT http://localhost:9086/formation/prerequisites/1
?prerequisiteType=MINIMUM_TIME
&minimumValue=90
&description=Au minimum 1.5 heure requise

Response:
{
  "id": 1,
  "prerequisiteType": "MINIMUM_TIME",
  "minimumValue": 90,
  ...
}
*/

/**
 * 9. ACTIVER/DÉSACTIVER UN PRÉREQUIS
 */
/*
PATCH http://localhost:9086/formation/prerequisites/1/status?active=false

Response: "Prérequis désactivé avec succès"
*/

/**
 * 10. VÉRIFIER UNE DÉPENDANCE CIRCULAIRE
 */
/*
GET http://localhost:9086/formation/prerequisites/check-cycle/1

Response: false
*/

/**
 * 11. SUPPRIMER UN PRÉREQUIS
 */
/*
DELETE http://localhost:9086/formation/prerequisites/1

Response: "Prérequis supprimé avec succès"
*/

// ============================================
// SECTION 2: CAS D'UTILISATION
// ============================================

/**
 * CAS 1: Parcours de formation progressif
 * 
 * Structure:
 *   1. Fondamentals (aucun prérequis)
 *   2. Intermédiaire (dépend de Fondamentals)
 *   3. Avancé (dépend d'Intermédiaire)
 * 
 * Implémentation:
 * - Étape 1: Formation 1 (aucune dépendance)
 * - Étape 2: Ajouter prérequis(1->2)
 * - Étape 3: Ajouter prérequis(2->3)
 */

/**
 * CAS 2: Prérequis optionnels multiples
 * 
 * La formation "Gestion d'urgence" dépend de:
 * - "Reconnaissance des symptômes" (REQUIRED)
 * - "Communication de base" (MINIMUM_TIME: 30 min)
 * 
 * Implémentation:
 * - Ajouter prérequis(symptomes -> urgent) avec REQUIRED
 * - Ajouter prérequis(communication -> urgent) avec MINIMUM_TIME=30
 */

/**
 * CAS 3: Certifications tierces
 * 
 * Seuls les utilisateurs ayant complété la "Certification AI"
 * peuvent accéder à la formation "IA Avancée"
 */

// ============================================
// SECTION 3: TYPES DE PRÉREQUIS
// ============================================

/**
 * REQUIRED - Formation doit être 100% complétée
 * 
 * Utilisation: Quand vous avez besoin que l'utilisateur termine entièrement
 * une formation avant d'en commencer une autre
 */

/**
 * MINIMUM_TIME - Utilisateur doit passer un temps minimum
 * 
 * Utilisation: Pour les formations avec contenu dense, exiger 2-3 heures d'apprentissage
 * minimumValue = nombre de minutes
 */

/**
 * MINIMUM_SCORE - Utilisateur doit atteindre une note minimale
 * 
 * Utilisation: Pour les quiz, exiger 75% de réussite avant de continuer
 * minimumValue = score en pourcentage
 * (Implémentation future avec système de scoring)
 */

/**
 * MODULE_COMPLETION - Au minimum un module doit être complété
 * 
 * Utilisation: Flexible, permet de commencer une formation après avoir complété
 * au moins 1 module du prérequis
 * (Implémentation future)
 */

// ============================================
// SECTION 4: PROTECTION CONTRE LES ERREURS
// ============================================

/**
 * 1. DÉTECTION DE CYCLES
 * 
 * Le système détecte et empêche les dépendances circulaires:
 * - Formation A -> Formation B -> Formation A (REFUSÉ)
 * 
 * Levée d'exception: "Dépendance circulaire détectée!"
 */

/**
 * 2. UNICITÉ DES PRÉREQUIS
 * 
 * Impossible de créer deux prérequis identiques avec les mêmes formations
 * 
 * Levée d'exception: "Ce prérequis existe déjà"
 */

/**
 * 3. FORMATIONS INEXISTANTES
 * 
 * Les IDs de formation doivent exister dans la base
 * 
 * Levée d'exception: "Formation requise non trouvée: {id}"
 */

// ============================================
// SECTION 5: UTILISATION DANS LES COMPOSANTS
// ============================================

/*
// Exemple Angular - Afficher un message si formation non accessible

import { PrerequisiteFormationService } from '...';

export class FormationComponent {
  constructor(private service: PrerequisiteFormationService) {}

  ngOnInit() {
    this.service.validateAccess(userId, formationId).subscribe(result => {
      if (!result.canAccess) {
        this.showBlockedModal(result.unsatisfiedPrerequisites);
      } else {
        this.loadFormation();
      }
    });
  }

  showBlockedModal(unsatisfied: any[]) {
    let message = 'Vous devez d\'abord compléter:\n';
    unsatisfied.forEach(p => {
      message += `- ${p.requiredFormationTitle}\n`;
    });
    alert(message);
  }
}
*/

// ============================================
// SECTION 6: AVANTAGES DE CE SYSTÈME
// ============================================

/**
 * ✅ Progression pédagogique garantie
 * ✅ Certifications tierces respectées
 * ✅ Flexible avec 4 types de prérequis
 * ✅ Détection automatique de cycles
 * ✅ Performance optimisée avec JPA queries
 * ✅ API simple et intuitive
 * ✅ Validation en temps réel
 * ✅ Détails complets d'accès refusé
 */

// ============================================
// SECTION 7: INTÉGRATION AVEC LE TRACKING
// ============================================

/**
 * Le système utilise automatiquement les données de UserTimeTrack
 * pour valider les prérequis MINIMUM_TIME
 * 
 * Lorsqu'un utilisateur suit une formation en direct:
 * 1. Le service de tracking enregistre le temps passé
 * 2. Le système de prérequis utilise ces données pour validation
 * 3. Les prérequis avec MINIMUM_TIME utilisent ces données
 */
