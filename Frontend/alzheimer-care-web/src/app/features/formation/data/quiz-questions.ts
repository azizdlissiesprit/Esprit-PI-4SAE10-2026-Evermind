export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

/** Questions pour la formation "Qu'est-ce que l'Alzheimer ?" - Modules 1 à 4 */
export const SAMPLE_QUESTIONS: Record<number, QuizQuestion[]> = {
  1: [
    { id: 1, question: 'Qu\'est-ce que la maladie d\'Alzheimer ?', options: ['Une infection virale', 'Une maladie neurodégénérative du cerveau', 'Un trouble hormonal', 'Une maladie cardiaque'], correctIndex: 1 },
    { id: 2, question: 'Qui a décrit la maladie pour la première fois et en quelle année ?', options: ['Pasteur en 1850', 'Aloïs Alzheimer en 1906', 'Freud en 1920', 'Charcot en 1880'], correctIndex: 1 },
    { id: 3, question: 'Que provoque l\'Alzheimer dans le cerveau ?', options: ['Une inflammation aiguë', 'L\'accumulation de protéines anormales et la destruction des neurones', 'Un arrêt de la circulation sanguine', 'Une tumeur'], correctIndex: 1 },
    { id: 4, question: 'L\'évolution de la maladie est-elle réversible ?', options: ['Oui, avec un traitement', 'Non, elle est progressive et irréversible', 'Parfois', 'Dépend du patient'], correctIndex: 1 },
    { id: 5, question: 'Quelles capacités sont principalement affectées ?', options: ['La vue et l\'ouïe', 'La mémoire, le raisonnement et les tâches quotidiennes', 'La mobilité uniquement', 'La parole uniquement'], correctIndex: 1 },
  ],
  2: [
    { id: 1, question: 'Quel est souvent le premier signe observé ?', options: ['Paralysie', 'Troubles de la mémoire récente', 'Perte de vue', 'Surdité'], correctIndex: 1 },
    { id: 2, question: 'Parmi ces symptômes, lequel est typique de l\'Alzheimer ?', options: ['Fièvre', 'Difficulté à planifier ou à résoudre des problèmes', 'Éruptions cutanées', 'Toux'], correctIndex: 1 },
    { id: 3, question: 'Les signes d\'alerte indiquent-ils forcément une maladie d\'Alzheimer ?', options: ['Oui, toujours', 'Non, un avis médical est recommandé pour établir un diagnostic', 'Jamais', 'Seulement chez les personnes âgées'], correctIndex: 1 },
    { id: 4, question: 'Quel symptôme peut apparaître avec la maladie ?', options: ['Force musculaire accrue', 'Confusion avec le temps ou les lieux', 'Meilleure acuité visuelle', 'Aucun changement'], correctIndex: 1 },
    { id: 5, question: 'Un repli sur soi et une perte d\'intérêt peuvent-ils être des signes ?', options: ['Non', 'Oui, ce sont des symptômes possibles', 'Seulement à un stade avancé', 'Jamais'], correctIndex: 1 },
  ],
  3: [
    { id: 1, question: 'Au stade léger, la personne peut-elle encore vivre de manière autonome ?', options: ['Non', 'Oui, en général', 'Jamais à aucun stade', 'Seulement avec une aide 24h/24'], correctIndex: 1 },
    { id: 2, question: 'Au stade modéré, que nécessite la personne ?', options: ['Aucune aide', 'Une aide pour les activités quotidiennes', 'Une hospitalisation permanente', 'Un isolement complet'], correctIndex: 1 },
    { id: 3, question: 'Au stade sévère, quels besoins la personne a-t-elle ?', options: ['Une simple surveillance', 'Une présence constante et une aide totale', 'Un suivi mensuel', 'Des médicaments uniquement'], correctIndex: 1 },
    { id: 4, question: 'L\'évolution est-elle identique pour tous les patients ?', options: ['Oui, toujours', 'Non, chaque personne vit la maladie différemment', 'Seulement pour les hommes', 'Uniquement selon l\'âge'], correctIndex: 1 },
    { id: 5, question: 'L\'accompagnement doit-il s\'adapter au stade ?', options: ['Non', 'Oui, aux besoins individuels et au stade', 'Uniquement au début', 'Jamais'], correctIndex: 1 },
  ],
  4: [
    { id: 1, question: 'Quel élément aide à rassurer la personne atteinte ?', options: ['Les changements constants', 'Une routine stable', 'L\'isolement', 'Le stress'], correctIndex: 1 },
    { id: 2, question: 'Comment communiquer efficacement ?', options: ['Parler vite', 'Utiliser des phrases courtes et claires', 'Éviter le contact visuel', 'Ignorer ses émotions'], correctIndex: 1 },
    { id: 3, question: 'Que doit faire l\'aidant pour lui-même ?', options: ['Tout sacrifier', 'Prendre soin de soi et chercher du répit', 'Ne jamais demander d\'aide', 'Travailler plus'], correctIndex: 1 },
    { id: 4, question: 'Que faut-il éviter en priorité ?', options: ['L\'écoute', 'Les disputes, privilégier l\'écoute et l\'adaptation', 'La patience', 'La bienveillance'], correctIndex: 1 },
    { id: 5, question: 'Existe-t-il des ressources pour aider les aidants ?', options: ['Non', 'Oui : professionnels, groupes d\'aidants, formations', 'Seulement à l\'hôpital', 'Uniquement en ligne'], correctIndex: 1 },
  ],
};

export function getQuestionsForModule(moduleId: number): QuizQuestion[] {
  return SAMPLE_QUESTIONS[moduleId] ?? SAMPLE_QUESTIONS[1] ?? [];
}
