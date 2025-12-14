import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FlashcardsDueNotification() {
  const [dueCount, setDueCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return; // Ne rien faire si non connecté

    checkDueFlashcards();
    // Vérifier toutes les heures
    const interval = setInterval(checkDueFlashcards, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkDueFlashcards = async () => {
    try {
      if (!isAuthenticated) return;
      const response = await api.flashcards.getStats();
      const count = response.data.dueCount;
      
      setDueCount(count);
      
      // Afficher la notification si > 0 et pas déjà dismissée aujourd'hui
      const lastDismissed = localStorage.getItem('flashcards_notif_dismissed');
      const today = new Date().toDateString();
      
      if (count > 0 && (!lastDismissed || lastDismissed !== today) && !dismissed) {
        setShowNotification(true);
      }
    } catch (error) {
      // Silencieux si non connecté / 401 / 500
      setShowNotification(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setDismissed(true);
    localStorage.setItem('flashcards_notif_dismissed', new Date().toDateString());
  };

  if (!showNotification || dueCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-2xl p-4 w-80 animate-slide-in">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            Révisions du jour 📚
          </h3>
          <p className="text-white/90 text-sm mb-3">
            Vous avez <strong>{dueCount} flashcard{dueCount > 1 ? 's' : ''}</strong> à réviser aujourd'hui !
          </p>
          <Link
            to="/flashcards/review"
            className="inline-block px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm"
          >
            Commencer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}

