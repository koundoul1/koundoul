import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Send, CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/api';
import { useBadgeContext } from '../components/Layout';

export default function Exercise() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { showBadges } = useBadgeContext() || {};
  
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchExercise();
  }, [exerciseId]);

  const fetchExercise = async () => {
    try {
      const response = await api.content.getExercise(exerciseId);
      setExercise(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      alert('Veuillez entrer une réponse');
      return;
    }

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const response = await api.content.submitExercise(exerciseId, {
        userAnswer: userAnswer.trim(),
        timeSpent,
        hintsUsed
      });

      // Afficher les nouveaux badges
      if (response.data.newBadges && response.data.newBadges.length > 0 && showBadges) {
        showBadges(response.data.newBadges);
      }

      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la soumission');
    }
  };

  const handleRetry = () => {
    setUserAnswer('');
    setSubmitted(false);
    setResult(null);
    setShowHints(false);
    setHintsUsed(0);
  };

  const handleUseHint = () => {
    setShowHints(true);
    setHintsUsed(hintsUsed + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold">Exercice non trouvé</p>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    FACILE: 'bg-green-100 text-green-700',
    MOYEN: 'bg-yellow-100 text-yellow-700',
    DIFFICILE: 'bg-orange-100 text-orange-700',
    EXPERT: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Trophy className="w-4 h-4" />
                {exercise.points} points
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* En-tête exercice */}
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 mb-8">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <span>{exercise.subject.icon}</span>
              <span>{exercise.subject.name}</span>
              {exercise.chapter && (
                <>
                  <span>•</span>
                  <span>{exercise.chapter.title}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {exercise.title}
            </h1>
            
            {/* Métadonnées */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{exercise.timeEstimate} min
              </span>
              <span className={`px-2 py-1 rounded ${difficultyColors[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
              <span>Type: {exercise.type}</span>
            </div>
          </div>

          {/* Énoncé */}
          <div className="bg-white rounded-xl p-8 border-2 border-blue-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📝 Énoncé
            </h2>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {exercise.statement}
              </ReactMarkdown>
            </div>
          </div>

          {/* Indices (si demandés) */}
          {showHints && exercise.hints && exercise.hints.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200 mb-8">
              <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-900 mb-3">
                <Lightbulb className="w-5 h-5" />
                Indices ({hintsUsed}/{exercise.hints.length})
              </h3>
              {exercise.hints.slice(0, hintsUsed).map((hint, index) => (
                <div key={index} className="bg-white rounded-lg p-4 mb-2 border border-yellow-300">
                  <p className="text-gray-700">
                    <strong>Indice {index + 1}:</strong> {hint}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Zone de réponse */}
          {!submitted ? (
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ✍️ Ta réponse
              </h2>
              
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Écris ta réponse ici..."
                className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              />

              <div className="flex items-center justify-between mt-4">
                <div>
                  {!showHints && exercise.hints && exercise.hints.length > 0 && (
                    <button
                      onClick={handleUseHint}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-200 transition-all"
                    >
                      <Lightbulb className="w-5 h-5" />
                      Besoin d'un indice ?
                    </button>
                  )}
                  {showHints && hintsUsed < exercise.hints.length && (
                    <button
                      onClick={handleUseHint}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-200 transition-all"
                    >
                      <Lightbulb className="w-5 h-5" />
                      Indice suivant ({hintsUsed}/{exercise.hints.length})
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Soumettre ma réponse
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Résultat */}
              <div className={`rounded-xl p-8 border-2 mb-8 ${
                result.isCorrect 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.isCorrect ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <h2 className="text-2xl font-bold text-green-900">
                        🎉 Bravo ! Réponse correcte !
                      </h2>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-red-600" />
                      <h2 className="text-2xl font-bold text-red-900">
                        Réponse incorrecte
                      </h2>
                    </>
                  )}
                </div>
                
                <p className="text-lg mb-2">
                  <strong>Ta réponse :</strong> {userAnswer}
                </p>
                
                {result.isCorrect && (
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <Trophy className="w-5 h-5" />
                    <span>+{result.score} points XP !</span>
                  </div>
                )}
              </div>

              {/* Solution détaillée */}
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📖 Solution détaillée
                </h2>
                
                <div className="prose prose-lg max-w-none mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.solution}
                  </ReactMarkdown>
                </div>

                {result.steps && result.steps.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Étapes de résolution
                    </h3>
                    <div className="space-y-4">
                      {result.steps.map((step, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                            <p className="text-gray-700">{step.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!result.isCorrect && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Réessayer
                  </button>
                )}
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Retour aux exercices
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
