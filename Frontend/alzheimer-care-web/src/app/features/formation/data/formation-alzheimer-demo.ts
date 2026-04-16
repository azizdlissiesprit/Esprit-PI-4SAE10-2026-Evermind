import { ProgrammeFormation, Module, Ressource } from '../services/formation.service';

/** Formation réelle : Qu'est-ce que l'Alzheimer ? - Données de démo/fallback */
export const PROGRAMME_ALZHEIMER: ProgrammeFormation = {
  id: 1,
  titre: "Qu'est-ce que l'Alzheimer ?",
  theme: 'Santé cognitive',
  description: 'Formation complète pour comprendre la maladie d\'Alzheimer : définition, symptômes, stades, et accompagnement au quotidien.',
};

export const MODULES_ALZHEIMER: Module[] = [
  {
    id: 1,
    titre: 'Définition et origine de la maladie',
    type: 'Vidéo',
    dureeEstimee: 12,
    contenu: `La maladie d'Alzheimer est une maladie neurodégénérative qui touche le cerveau. Elle a été décrite pour la première fois en 1906 par le médecin allemand Aloïs Alzheimer.

Elle se caractérise par une accumulation progressive de protéines anormales (plaques amyloïdes et dégénérescence neurofibrillaire) dans le cerveau, entraînant la destruction des neurones et des connexions entre eux.

La maladie affecte principalement la mémoire, le raisonnement et les capacités à accomplir les tâches quotidiennes. Elle évolue de manière progressive et irréversible.|||CONSEILS|||

• Prenez des notes pendant la lecture pour mieux retenir.
• Regardez la vidéo jusqu'au bout avant de passer au quiz.
• Réfléchissez aux questions avant de répondre.`,
  },
  {
    id: 2,
    titre: 'Les symptômes et les signes d\'alerte',
    type: 'Article',
    dureeEstimee: 15,
    contenu: `Les premiers signes de la maladie d'Alzheimer passent souvent inaperçus. Voici les symptômes les plus courants :

• Troubles de la mémoire récente : oublis fréquents, difficulté à retenir de nouvelles informations
• Difficultés à planifier ou à résoudre des problèmes du quotidien
• Confusion avec le temps ou les lieux
• Problèmes de langage : difficulté à suivre une conversation, à trouver les bons mots
• Perte d'objets et difficulté à retracer ses pas
• Changements d'humeur ou de personnalité
• Repli sur soi, perte d'intérêt pour les activités habituelles

Ces signes ne signifient pas forcément Alzheimer, mais un avis médical est recommandé.`,
  },
  {
    id: 3,
    titre: 'Les stades de la maladie',
    type: 'Article',
    dureeEstimee: 10,
    contenu: `L'Alzheimer évolue généralement en plusieurs stades :

Stade léger : La personne peut encore vivre de manière autonome. Oublis, difficultés à organiser sa journée, problèmes de concentration.

Stade modéré : Nécessite une aide pour les activités quotidiennes. Confusion accrue, difficultés à reconnaître les proches, troubles du sommeil.

Stade sévère : Perte d'autonomie importante. Difficultés à communiquer, à marcher, à se nourrir. La personne a besoin d'une présence constante.

Chaque personne vit la maladie différemment. L'accompagnement doit s'adapter au stade et aux besoins individuels.`,
  },
  {
    id: 4,
    titre: 'Vivre avec et accompagner au quotidien',
    type: 'Article',
    dureeEstimee: 12,
    contenu: `Accompagner une personne atteinte d'Alzheimer demande patience, bienveillance et adaptabilité.

Conseils pratiques :
• Maintenir une routine stable pour rassurer la personne
• Utiliser des phrases courtes et claires
• Éviter les disputes, privilégier l'écoute
• Adapter l'environnement pour la sécurité (éviter les dangers, sécuriser les sorties)
• Prendre soin de soi : l'aidant a besoin de répit et de soutien
• Consulter des professionnels et rejoindre des groupes d'aidants

L'accompagnement est un défi au quotidien, mais des ressources et des formations existent pour vous aider.`,
  },
];

/** Ressources vidéo YouTube pour le module 1 */
export const RESSOURCES_VIDEO: Record<number, Ressource[]> = {
  1: [
    {
      id: 1,
      url: 'https://www.youtube.com/watch?v=0MYlXF5kJlc',
      typeFichier: 'video',
    },
  ],
};

export function getModuleContenu(moduleId: number): string | undefined {
  return MODULES_ALZHEIMER.find((m) => m.id === moduleId)?.contenu;
}

export function getModuleById(moduleId: number): Module | undefined {
  return MODULES_ALZHEIMER.find((m) => m.id === moduleId);
}

export function getRessourcesForModule(moduleId: number): Ressource[] {
  return RESSOURCES_VIDEO[moduleId] ?? [];
}
