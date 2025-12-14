/**
 * 🎉 Composant de Feedback de Réussite
 * Animation et message encourageant lors d'une résolution réussie
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, TrendingUp } from 'lucide-react';

const SuccessFeedback = ({ xpGained = 10, message = "Excellent travail !" }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    // Confettis animation (peut être étendu avec une bibliothèque)
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-bounce-in koundoul-card p-8 max-w-md mx-4 pointer-events-auto koundoul-glow">
        {/* Icône de succès */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <CheckCircle className="h-20 w-20 text-green-400 animate-success" />
            {/* Étoiles brillantes */}
            <Star className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" fill="currentColor" />
            <Star className="h-4 w-4 text-yellow-300 absolute -bottom-1 -left-1 animate-pulse" fill="currentColor" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-2xl font-bold text-gray-200 text-center mb-2">
          {message}
        </h3>

        {/* XP Gagné */}
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30">
          <TrendingUp className="h-6 w-6 text-orange-400" />
          <span className="text-lg font-semibold text-orange-300">
            +{xpGained} XP
          </span>
          <div className="xp-gain absolute">+{xpGained}</div>
        </div>

        {/* Message encourageant */}
        <p className="text-gray-400 text-center mt-4 text-sm">
          Continue comme ça ! Tu progresses de jour en jour 🚀
        </p>
      </div>

      {/* Effet de fond */}
      <div className="fixed inset-0 bg-black bg-opacity-30 -z-10" onClick={() => setShow(false)} />
    </div>
  );
};

export default SuccessFeedback;

