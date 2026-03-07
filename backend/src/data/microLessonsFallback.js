/**
 * Catalogue statique de micro-leçons (fallback si Supabase non configuré ou vide)
 */
const STATIC_LESSONS = [
  {
    id: 'ml-derivation-1',
    title: 'Introduction à la dérivation',
    subject: 'Mathématiques',
    chapter: 'Dérivation',
    level: 'Première',
    difficulty: 2,
    duration_min: 15,
    xp_reward: 80,
    content_sections: [
      {
        title: 'Rappel : fonction et courbe',
        content:
          "On modélise une grandeur y en fonction d'une variable x à l'aide d'une fonction f : x ↦ f(x)."
      },
      {
        title: "Idée de la dérivée",
        items: [
          "La dérivée mesure la variation instantanée de f en un point.",
          "C'est la pente de la tangente à la courbe au point considéré."
        ]
      }
    ]
  },
  {
    id: 'ml-kinematics-1',
    title: 'MRU : Mouvement Rectiligne Uniforme',
    subject: 'Physique',
    chapter: 'Cinématique',
    level: 'Seconde',
    difficulty: 1,
    duration_min: 10,
    xp_reward: 60,
    content_sections: []
  },
  {
    id: 'ml-functions-1',
    title: 'Fonctions affines',
    subject: 'Mathématiques',
    chapter: 'Fonctions',
    level: 'Seconde',
    difficulty: 1,
    duration_min: 12,
    xp_reward: 70,
    content_sections: []
  }
];

function filterStatic(subject, level) {
  return STATIC_LESSONS.filter((lesson) => {
    if (subject && subject !== 'all' && lesson.subject !== subject) return false;
    if (level && level !== 'all' && lesson.level !== level) return false;
    return true;
  });
}

function getStaticById(id) {
  return STATIC_LESSONS.find((l) => l.id === id) || null;
}

module.exports = {
  STATIC_LESSONS,
  filterStatic,
  getStaticById
};
