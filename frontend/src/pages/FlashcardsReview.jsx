import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Check, X, Eye, EyeOff, Lightbulb } from 'lucide-react';
import api from '../services/api';

export default function FlashcardsReview() {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [stats, setStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0
  });

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await api.flashcards.getDue(20);
      setFlashcards(response.data);
      
      if (response.data.length === 0) {
        alert('Aucune flashcard à réviser !');
        navigate('/flashcards');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    const flashcard = flashcards[currentIndex];
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      await api.flashcards.submitReview(flashcard.id, quality, timeSpent);
      
      // Mettre à jour les stats
      setStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect
      }));

      // Passer à la carte suivante
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        // Fin de la session
        navigate('/flashcards', {
          state: { sessionComplete: true, stats }
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la soumission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return null;
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Progression</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentIndex + 1} / {flashcards.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Session</p>
            <p className="text-lg font-bold text-green-600">
              {stats.correct} ✓ / {stats.incorrect} ✗
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Flashcard */}
        <div className="max-w-3xl mx-auto">
          
          {/* Contexte */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{currentCard.subject.icon}</span>
            <div>
              <p className="text-sm text-gray-600">{currentCard.subject.name}</p>
              {currentCard.lesson && (
                <p className="text-xs text-gray-500">{currentCard.lesson.title}</p>
              )}
            </div>
            {currentCard.isNew && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                NOUVEAU
              </span>
            )}
          </div>

          {/* Carte */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-200 min-h-[400px] flex flex-col justify-center cursor-pointer hover:shadow-3xl transition-all"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            
            {/* Question */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 uppercase font-semibold mb-3 flex items-center gap-2">
                {showAnswer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showAnswer ? 'Question & Réponse' : 'Question'}
              </p>
              <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            {/* Réponse */}
            {showAnswer ? (
              <div className="pt-6 border-t-2 border-gray-200">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-3">
                  Réponse
                </p>
                <p className="text-xl text-gray-800 leading-relaxed mb-4">
                  {currentCard.answer}
                </p>
                
                {currentCard.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Explication
                    </p>
                    <p className="text-gray-700">
                      {currentCard.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  Cliquez pour révéler la réponse
                </p>
              </div>
            )}
          </div>

          {/* Boutons de réponse (si réponse affichée) */}
          {showAnswer && (
            <div className="mt-8">
              <p className="text-center text-gray-700 font-semibold mb-4">
                Comment avez-vous répondu ?
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Difficile */}
                <button
                  onClick={() => handleReview(2)}
                  className="group px-6 py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="font-bold text-red-700">Difficile</p>
                  <p className="text-xs text-red-600 mt-1">Revoir demain</p>
                </button>

                {/* Bon */}
                <button
                  onClick={() => handleReview(3)}
                  className="group px-6 py-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-400 rounded-xl transition-all"
                >
                  <RotateCcw className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="font-bold text-yellow-700">Bon</p>
                  <p className="text-xs text-yellow-600 mt-1">Dans quelques jours</p>
                </button>

                {/* Facile */}
                <button
                  onClick={() => handleReview(5)}
                  className="group px-6 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all"
                >
                  <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-green-700">Facile</p>
                  <p className="text-xs text-green-600 mt-1">Plus tard</p>
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                Votre choix détermine la prochaine révision selon l'algorithme SM-2
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}


