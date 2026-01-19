import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, Award, TrendingUp, RotateCcw, Home } from 'lucide-react';
import { useEffect } from 'react';
import { useBadgeContext } from '../components/Layout';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { showBadges } = useBadgeContext() || {};
  
  const { results } = location.state || {};

  // Afficher les badges au chargement
  useEffect(() => {
    if (results && results.newBadges && results.newBadges.length > 0 && showBadges) {
      showBadges(results.newBadges);
    }
  }, [results, showBadges]);

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold">Résultats non disponibles</p>
          <button
            onClick={() => navigate('/quiz')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retour aux quiz
          </button>
        </div>
      </div>
    );
  }

  const { attempt, summary, results: questionResults } = results;
  const isPassed = summary.passed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* En-tête résultat */}
          <div className={`rounded-2xl p-8 text-white mb-8 ${
            isPassed 
              ? 'bg-gradient-to-r from-green-600 to-green-700' 
              : 'bg-gradient-to-r from-red-600 to-red-700'
          }`}>
            <div className="text-center">
              <div className="text-6xl mb-4">
                {isPassed ? '🎉' : '😔'}
              </div>
              <h1 className="text-4xl font-bold mb-3">
                {isPassed ? 'Félicitations !' : 'Quiz terminé'}
              </h1>
              <p className="text-2xl mb-6 opacity-90">
                {isPassed 
                  ? 'Tu as réussi le quiz avec succès !' 
                  : `Il te faut ${summary.passingScore}% pour réussir. Continue à t'entraîner !`
                }
              </p>
              
              {isPassed && attempt.xpGained && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Award className="w-6 h-6" />
                  <span className="text-xl font-bold">+{attempt.xpGained} XP gagné !</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.percentage}%
              </div>
              <p className="text-sm text-gray-600">Score final</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.correctAnswers}
              </div>
              <p className="text-sm text-gray-600">Bonnes réponses</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.incorrectAnswers}
              </div>
              <p className="text-sm text-gray-600">Erreurs</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.totalScore}
              </div>
              <p className="text-sm text-gray-600">Points totaux</p>
            </div>
          </div>

          {/* Révision des questions */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📝 Révision détaillée
          </h2>

          <div className="space-y-6">
            {questionResults.map((result, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl p-6 border-2 ${
                  result.isCorrect ? 'border-green-300' : 'border-red-300'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  {result.isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-gray-800 mb-4">
                      {result.questionText}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className={`p-3 rounded-lg ${
                        result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <p className="text-sm font-semibold text-gray-700">
                          Ta réponse :
                        </p>
                        <p className={`text-lg ${
                          result.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.userAnswer || '(Non répondu)'}
                        </p>
                      </div>

                      {!result.isCorrect && (
                        <div className="p-3 rounded-lg bg-green-50">
                          <p className="text-sm font-semibold text-gray-700">
                            Bonne réponse :
                          </p>
                          <p className="text-lg text-green-700">
                            {result.correctAnswer}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        💡 Explication
                      </p>
                      <p className="text-gray-700">
                        {result.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      {result.points}
                    </span>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate(`/quiz/${quizId}`)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Refaire le quiz
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              <Home className="w-5 h-5" />
              Retour aux quiz
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
