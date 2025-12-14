import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedForum() {
  console.log('💬 Seeding forum discussions...');

  // Récupérer un utilisateur de test
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('⚠️ Aucun utilisateur trouvé, skip forum seed');
    return;
  }

  // Récupérer la matière mathématiques
  const mathSubject = await prisma.subject.findFirst({
    where: { slug: 'mathematiques' }
  });

  const lesson = await prisma.lesson.findFirst();

  // Discussions de test
  const discussions = [
    {
      title: "Comment résoudre une équation du second degré ?",
      content: "Bonjour,\n\nJe ne comprends pas comment utiliser le discriminant pour résoudre x² - 5x + 6 = 0.\n\nPouvez-vous m'expliquer les étapes ?\n\nMerci !",
      category: 'QUESTION',
      subjectId: mathSubject?.id,
      userId: user.id
    },
    {
      title: "Astuce pour retenir les ensembles de nombres",
      content: "Salut à tous,\n\nJe partage ma méthode pour retenir l'inclusion des ensembles :\n\nℕ (Naturels) → Comme \"Naissance\" (on compte depuis 0)\nℤ (Entiers relatifs) → Comme \"Zéro\" (négatifs et positifs)\nℚ (Rationnels) → Comme \"Quotient\" (fractions)\nℝ (Réels) → Comme \"Réalité\" (tous les nombres)\n\nEt on retient : ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ\n\nJ'espère que ça aide ! 😊",
      category: 'EXPLANATION',
      subjectId: mathSubject?.id,
      userId: user.id
    },
    {
      title: "Ressource : Vidéo sur les fonctions affines",
      content: "Hello,\n\nJe recommande cette excellente série de vidéos sur les fonctions affines :\n[Lien YouTube fictif]\n\nTrès bien expliqué avec des exemples concrets !",
      category: 'RESOURCE',
      subjectId: mathSubject?.id,
      userId: user.id
    },
    {
      title: "Différence entre coefficient directeur et ordonnée à l'origine ?",
      content: "Dans f(x) = ax + b, je confonds toujours :\n- Le coefficient directeur (a)\n- L'ordonnée à l'origine (b)\n\nQuelle est la différence concrète ? Comment les visualiser sur un graphique ?",
      category: 'QUESTION',
      subjectId: mathSubject?.id,
      lessonId: lesson?.id,
      userId: user.id
    }
  ];

  // Créer les discussions
  for (const data of discussions) {
    const discussion = await prisma.discussion.create({
      data
    });

    // Ajouter quelques réponses à certaines discussions
    if (data.category === 'QUESTION') {
      await prisma.reply.create({
        data: {
          discussionId: discussion.id,
          userId: user.id,
          content: "Excellente question ! Pour résoudre une équation du second degré ax² + bx + c = 0, on utilise le discriminant Δ = b² - 4ac.\n\nSi Δ > 0 : 2 solutions réelles\nSi Δ = 0 : 1 solution double\nSi Δ < 0 : Pas de solution réelle\n\nLes solutions sont : x = (-b ± √Δ) / (2a)"
        }
      });
    }
  }

  console.log(`✅ ${discussions.length} discussions créées avec réponses`);
}

export default seedForum;


