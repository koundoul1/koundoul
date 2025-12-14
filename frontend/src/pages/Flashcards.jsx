import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Calendar, TrendingUp, Target, Clock, Flame, Play, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Flashcards() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dueFlashcards, setDueFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Rediriger vers la connexion si pas authentifié
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      const [statsRes, dueRes] = await Promise.all([
        api.flashcards.getStats(),
        api.flashcards.getDue(20)
      ]);
      
      setStats(statsRes.data);
      setDueFlashcards(dueRes.data);
    } catch (error) {
      console.error('Erreur:', error);
      if (error.status === 401) {
        // Token expiré, rediriger vers la connexion
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune donnée</h2>
          <p className="text-gray-600">Aucune statistique disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-600" />
            Révision Espacée
          </h1>
          <p className="text-gray-600 text-lg">
            Mémorisez durablement avec l'algorithme scientifique SM-2
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.dueCount}</span>
            </div>
            <p className="text-gray-600 font-semibold">À réviser aujourd'hui</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Plus className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.newCount}</span>
            </div>
            <p className="text-gray-600 font-semibold">Nouvelles cartes</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.retentionRate}%</span>
            </div>
            <p className="text-gray-600 font-semibold">Taux de rétention</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.streak}</span>
            </div>
            <p className="text-gray-600 font-semibold">Jours consécutifs</p>
          </div>
        </div>

        {/* Section principale */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Révisions du jour */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-blue-600" />
                  Révisions du jour
                </h2>
                {dueFlashcards.length > 0 && (
                  <Link
                    to="/flashcards/review"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Commencer ({dueFlashcards.length})
                  </Link>
                )}
              </div>

              {dueFlashcards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Bravo ! Aucune révision aujourd'hui
                  </h3>
                  <p className="text-gray-600">
                    Revenez demain pour continuer votre apprentissage
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dueFlashcards.slice(0, 5).map((flashcard) => (
                    <div
                      key={flashcard.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{flashcard.subject.icon}</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {flashcard.subject.name}
                            </span>
                            {flashcard.isNew && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                NOUVEAU
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {flashcard.question.substring(0, 100)}
                            {flashcard.question.length > 100 ? '...' : ''}
                          </p>
                          {flashcard.lesson && (
                            <p className="text-sm text-gray-500">
                              Leçon: {flashcard.lesson.title}
                            </p>
                          )}
                        </div>
                        {flashcard.lastReview && (
                          <div className="text-right text-sm text-gray-500">
                            <p>Répétitions: {flashcard.lastReview.repetitions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {dueFlashcards.length > 5 && (
                    <p className="text-center text-gray-600">
                      ... et {dueFlashcards.length - 5} autres cartes
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Progression */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-purple-600" />
                Votre progression
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-semibold">Cartes maîtrisées</span>
                    <span className="text-gray-900 font-bold">
                      {stats.totalReviews - stats.dueCount - stats.newCount} / {stats.totalFlashcards}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                      style={{
                        width: `${((stats.totalReviews - stats.dueCount - stats.newCount) / stats.totalFlashcards) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Total révisions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">30 derniers jours</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reviewedLast30Days}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Conseil du jour */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                💡 Conseil du jour
              </h3>
              <p className="text-blue-100 leading-relaxed">
                La révision espacée fonctionne mieux avec des sessions courtes et régulières. 
                Visez 10-15 minutes par jour pour des résultats optimaux !
              </p>
            </div>

            {/* Statistiques détaillées */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📊 Statistiques
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cartes totales</span>
                  <span className="font-bold text-gray-900">{stats.totalFlashcards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux de réussite</span>
                  <span className="font-bold text-green-600">{stats.retentionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streak actuel</span>
                  <span className="font-bold text-orange-600">{stats.streak} jours</span>
                </div>
              </div>
            </div>

            {/* Liens rapides */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🔗 Liens rapides
              </h3>
              <div className="space-y-2">
                <Link
                  to="/courses"
                  className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-semibold"
                >
                  📚 Parcourir les cours
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-semibold"
                >
                  📊 Mon dashboard
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

