import React from 'react';

const WhyItWorks = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">🎓 Pourquoi Koundoul Fonctionne</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">🎯 Approche Scientifique</h2>
          <p className="text-gray-700">
            Koundoul s'appuie sur des méthodes pédagogiques éprouvées : la révision espacée, 
            l'apprentissage actif et la pédagogie différenciée.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">🤖 Intelligence Artificielle</h2>
          <p className="text-gray-700">
            Notre IA analyse vos forces et faiblesses pour vous proposer un parcours 
            personnalisé et adapté à votre niveau.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">🎮 Gamification</h2>
          <p className="text-gray-700">
            Les badges, XP et niveaux rendent l'apprentissage amusant et motivant, 
            transformant chaque leçon en défi à relever.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">👥 Communauté</h2>
          <p className="text-gray-700">
            Partagez vos solutions, posez des questions et apprenez ensemble dans 
            un environnement bienveillant et collaboratif.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhyItWorks;

