const prisma = require('../config/database');

const CONCEPT_NODES = [
  // ========== Mathématiques — Seconde: Fonctions ==========
  {
    id: 'cn-math-2-01',
    conceptId: 'math-seconde-fonctions-affines',
    name: 'Fonctions affines',
    domain: 'Mathématiques',
    level: 'SECONDE',
    description: 'Étude des fonctions de la forme f(x) = ax + b, représentation graphique et coefficient directeur',
    prerequisites: [],
    masteryRequired: 0.7
  },
  {
    id: 'cn-math-2-02',
    conceptId: 'math-seconde-variations',
    name: 'Variations de fonctions',
    domain: 'Mathématiques',
    level: 'SECONDE',
    description: 'Sens de variation, fonctions croissantes et décroissantes, tableau de variations',
    prerequisites: ['math-seconde-fonctions-affines'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-math-2-03',
    conceptId: 'math-seconde-tableaux-signes',
    name: 'Tableaux de signes',
    domain: 'Mathématiques',
    level: 'SECONDE',
    description: 'Signe d\'une expression algébrique, résolution d\'inéquations par tableau de signes',
    prerequisites: ['math-seconde-fonctions-affines', 'math-seconde-variations'],
    masteryRequired: 0.7
  },

  // ========== Mathématiques — Première: Dérivation ==========
  {
    id: 'cn-math-1-01',
    conceptId: 'math-premiere-nombre-derive',
    name: 'Nombre dérivé',
    domain: 'Mathématiques',
    level: 'PREMIERE',
    description: 'Taux de variation, limite du taux de variation, nombre dérivé en un point',
    prerequisites: ['math-seconde-variations'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-math-1-02',
    conceptId: 'math-premiere-fonction-derivee',
    name: 'Fonction dérivée',
    domain: 'Mathématiques',
    level: 'PREMIERE',
    description: 'Dérivées des fonctions usuelles, règles de dérivation (somme, produit, quotient)',
    prerequisites: ['math-premiere-nombre-derive'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-math-1-03',
    conceptId: 'math-premiere-tangente',
    name: 'Équation de la tangente',
    domain: 'Mathématiques',
    level: 'PREMIERE',
    description: 'Équation de la tangente à une courbe en un point, interprétation graphique',
    prerequisites: ['math-premiere-nombre-derive', 'math-seconde-fonctions-affines'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-math-1-04',
    conceptId: 'math-premiere-extremums',
    name: 'Extremums et optimisation',
    domain: 'Mathématiques',
    level: 'PREMIERE',
    description: 'Recherche d\'extremums locaux à l\'aide de la dérivée, problèmes d\'optimisation',
    prerequisites: ['math-premiere-fonction-derivee'],
    masteryRequired: 0.75
  },

  // ========== Mathématiques — Terminale: Intégration ==========
  {
    id: 'cn-math-t-01',
    conceptId: 'math-terminale-primitive',
    name: 'Primitives',
    domain: 'Mathématiques',
    level: 'TERMINALE',
    description: 'Notion de primitive, primitives des fonctions usuelles, primitive vérifiant une condition initiale',
    prerequisites: ['math-premiere-fonction-derivee'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-math-t-02',
    conceptId: 'math-terminale-integrale',
    name: 'Intégrale d\'une fonction',
    domain: 'Mathématiques',
    level: 'TERMINALE',
    description: 'Intégrale d\'une fonction continue sur un intervalle, propriétés (linéarité, relation de Chasles)',
    prerequisites: ['math-terminale-primitive'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-math-t-03',
    conceptId: 'math-terminale-aire',
    name: 'Calcul d\'aires',
    domain: 'Mathématiques',
    level: 'TERMINALE',
    description: 'Aire sous une courbe, aire entre deux courbes, unités d\'aire',
    prerequisites: ['math-terminale-integrale'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-math-t-04',
    conceptId: 'math-terminale-theoreme-fondamental',
    name: 'Théorème fondamental',
    domain: 'Mathématiques',
    level: 'TERMINALE',
    description: 'Lien entre intégrale et primitive, théorème fondamental de l\'analyse',
    prerequisites: ['math-terminale-primitive', 'math-terminale-integrale'],
    masteryRequired: 0.8
  },

  // ========== Physique — Seconde: Cinématique ==========
  {
    id: 'cn-phys-2-01',
    conceptId: 'phys-seconde-mru',
    name: 'Mouvement rectiligne uniforme',
    domain: 'Physique',
    level: 'SECONDE',
    description: 'Mouvement à vitesse constante, équation horaire x(t) = v·t + x₀',
    prerequisites: [],
    masteryRequired: 0.7
  },
  {
    id: 'cn-phys-2-02',
    conceptId: 'phys-seconde-vitesse',
    name: 'Vitesse moyenne et instantanée',
    domain: 'Physique',
    level: 'SECONDE',
    description: 'Calcul de la vitesse moyenne, notion de vitesse instantanée, unités (m/s, km/h)',
    prerequisites: ['phys-seconde-mru'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-phys-2-03',
    conceptId: 'phys-seconde-mruv',
    name: 'Mouvement rectiligne uniformément varié',
    domain: 'Physique',
    level: 'SECONDE',
    description: 'Mouvement avec accélération constante, équations horaires, chute libre',
    prerequisites: ['phys-seconde-mru', 'phys-seconde-vitesse'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-phys-2-04',
    conceptId: 'phys-seconde-acceleration',
    name: 'Accélération',
    domain: 'Physique',
    level: 'SECONDE',
    description: 'Notion d\'accélération, accélération positive et négative, lien avec la vitesse',
    prerequisites: ['phys-seconde-vitesse'],
    masteryRequired: 0.7
  },

  // ========== Physique — Première: Forces & Énergie ==========
  {
    id: 'cn-phys-1-01',
    conceptId: 'phys-premiere-lois-newton',
    name: 'Lois de Newton',
    domain: 'Physique',
    level: 'PREMIERE',
    description: 'Trois lois de Newton : inertie, relation fondamentale F=ma, action-réaction',
    prerequisites: ['phys-seconde-mruv', 'phys-seconde-acceleration'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-phys-1-02',
    conceptId: 'phys-premiere-energie-cinetique',
    name: 'Énergie cinétique',
    domain: 'Physique',
    level: 'PREMIERE',
    description: 'Expression Ec = ½mv², théorème de l\'énergie cinétique',
    prerequisites: ['phys-premiere-lois-newton'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-phys-1-03',
    conceptId: 'phys-premiere-travail-force',
    name: 'Travail d\'une force',
    domain: 'Physique',
    level: 'PREMIERE',
    description: 'Travail d\'une force constante, travail moteur et résistant, puissance',
    prerequisites: ['phys-premiere-lois-newton'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-phys-1-04',
    conceptId: 'phys-premiere-conservation-energie',
    name: 'Conservation de l\'énergie',
    domain: 'Physique',
    level: 'PREMIERE',
    description: 'Énergie mécanique, conservation et non-conservation, transferts d\'énergie',
    prerequisites: ['phys-premiere-energie-cinetique', 'phys-premiere-travail-force'],
    masteryRequired: 0.75
  },

  // ========== Physique — Terminale: Ondes ==========
  {
    id: 'cn-phys-t-01',
    conceptId: 'phys-terminale-onde-mecanique',
    name: 'Onde mécanique',
    domain: 'Physique',
    level: 'TERMINALE',
    description: 'Définition, propagation d\'une perturbation, ondes transversales et longitudinales',
    prerequisites: [],
    masteryRequired: 0.75
  },
  {
    id: 'cn-phys-t-02',
    conceptId: 'phys-terminale-frequence',
    name: 'Fréquence et période',
    domain: 'Physique',
    level: 'TERMINALE',
    description: 'Période T, fréquence f = 1/T, unités (Hz, s)',
    prerequisites: ['phys-terminale-onde-mecanique'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-phys-t-03',
    conceptId: 'phys-terminale-longueur-onde',
    name: 'Longueur d\'onde',
    domain: 'Physique',
    level: 'TERMINALE',
    description: 'Relation λ = v·T = v/f, spectre électromagnétique',
    prerequisites: ['phys-terminale-frequence'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-phys-t-04',
    conceptId: 'phys-terminale-diffraction',
    name: 'Diffraction',
    domain: 'Physique',
    level: 'TERMINALE',
    description: 'Phénomène de diffraction, condition d\'observation, relation θ = λ/a',
    prerequisites: ['phys-terminale-longueur-onde'],
    masteryRequired: 0.8
  },

  // ========== Chimie — Seconde: Atomes & Molécules ==========
  {
    id: 'cn-chim-2-01',
    conceptId: 'chim-seconde-atome',
    name: 'Structure de l\'atome',
    domain: 'Chimie',
    level: 'SECONDE',
    description: 'Noyau (protons, neutrons), électrons, numéro atomique Z, nombre de masse A',
    prerequisites: [],
    masteryRequired: 0.7
  },
  {
    id: 'cn-chim-2-02',
    conceptId: 'chim-seconde-couches-electroniques',
    name: 'Couches électroniques',
    domain: 'Chimie',
    level: 'SECONDE',
    description: 'Configuration électronique, couches K, L, M, règles de remplissage',
    prerequisites: ['chim-seconde-atome'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-chim-2-03',
    conceptId: 'chim-seconde-liaison-covalente',
    name: 'Liaison covalente',
    domain: 'Chimie',
    level: 'SECONDE',
    description: 'Mise en commun d\'électrons, liaison simple, double, triple, règle de l\'octet',
    prerequisites: ['chim-seconde-couches-electroniques'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-chim-2-04',
    conceptId: 'chim-seconde-formule-lewis',
    name: 'Formule de Lewis',
    domain: 'Chimie',
    level: 'SECONDE',
    description: 'Représentation de Lewis des molécules, doublets liants et non liants',
    prerequisites: ['chim-seconde-liaison-covalente'],
    masteryRequired: 0.7
  },

  // ========== Chimie — Première: Réactions chimiques ==========
  {
    id: 'cn-chim-1-01',
    conceptId: 'chim-premiere-equation-bilan',
    name: 'Équation bilan',
    domain: 'Chimie',
    level: 'PREMIERE',
    description: 'Écriture et équilibrage d\'une équation de réaction chimique',
    prerequisites: ['chim-seconde-formule-lewis'],
    masteryRequired: 0.7
  },
  {
    id: 'cn-chim-1-02',
    conceptId: 'chim-premiere-stoechiometrie',
    name: 'Stœchiométrie',
    domain: 'Chimie',
    level: 'PREMIERE',
    description: 'Coefficients stœchiométriques, proportions molaires, calculs de quantités',
    prerequisites: ['chim-premiere-equation-bilan'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-chim-1-03',
    conceptId: 'chim-premiere-avancement',
    name: 'Tableau d\'avancement',
    domain: 'Chimie',
    level: 'PREMIERE',
    description: 'Avancement x, état initial, intermédiaire et final, avancement maximal',
    prerequisites: ['chim-premiere-stoechiometrie'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-chim-1-04',
    conceptId: 'chim-premiere-reactif-limitant',
    name: 'Réactif limitant',
    domain: 'Chimie',
    level: 'PREMIERE',
    description: 'Identification du réactif limitant, réactif en excès, mélange stœchiométrique',
    prerequisites: ['chim-premiere-avancement'],
    masteryRequired: 0.75
  },

  // ========== Chimie — Terminale: Acides & Bases ==========
  {
    id: 'cn-chim-t-01',
    conceptId: 'chim-terminale-ph',
    name: 'pH d\'une solution',
    domain: 'Chimie',
    level: 'TERMINALE',
    description: 'Définition du pH, mesure, relation pH = -log[H₃O⁺], échelle de pH',
    prerequisites: [],
    masteryRequired: 0.75
  },
  {
    id: 'cn-chim-t-02',
    conceptId: 'chim-terminale-acide-fort-faible',
    name: 'Acide fort et acide faible',
    domain: 'Chimie',
    level: 'TERMINALE',
    description: 'Réaction totale vs partielle, constante d\'acidité Ka, pKa',
    prerequisites: ['chim-terminale-ph'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-chim-t-03',
    conceptId: 'chim-terminale-base',
    name: 'Bases et couples acide/base',
    domain: 'Chimie',
    level: 'TERMINALE',
    description: 'Définition de Brønsted, couples acide/base conjugués, réaction acido-basique',
    prerequisites: ['chim-terminale-acide-fort-faible'],
    masteryRequired: 0.75
  },
  {
    id: 'cn-chim-t-04',
    conceptId: 'chim-terminale-titrage',
    name: 'Titrage acido-basique',
    domain: 'Chimie',
    level: 'TERMINALE',
    description: 'Principe du titrage, équivalence, détermination de la concentration, indicateurs colorés',
    prerequisites: ['chim-terminale-base', 'chim-terminale-ph'],
    masteryRequired: 0.8
  }
];

async function seedConceptNodes() {
  console.log('🧠 Seeding concept nodes...');

  for (const node of CONCEPT_NODES) {
    await prisma.concept_nodes.upsert({
      where: { conceptId: node.conceptId },
      update: {
        name: node.name,
        domain: node.domain,
        level: node.level,
        description: node.description,
        prerequisites: node.prerequisites,
        masteryRequired: node.masteryRequired
      },
      create: {
        ...node,
        updatedAt: new Date()
      }
    });
  }

  console.log(`✅ ${CONCEPT_NODES.length} concept nodes seeded successfully`);
}

module.exports = seedConceptNodes;
