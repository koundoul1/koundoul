import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, Award, TrendingUp, RotateCcw, Home, Star, Clock } from 'lucide-react';
import { useEffect } from 'react';
import { useGamification } from '../hooks/useGamification';
import { useTranslation } from '../hooks/useTranslation';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { processActionResult } = useGamification();
  const { t } = useTranslation();

  const results = location.state?.results;
  const timeExpired = location.state?.timeExpired;

  // Process gamification on mount (badges, XP update in context)
  useEffect(() => {
    if (results?.gamification) {
      processActionResult(results.gamification);
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-4">Resultats non disponibles</p>
          <button onClick={() => navigate('/quiz')} className="px-6 py-2.5 bg-kprimary text-white rounded-xl font-bold">
            Retour aux quiz
          </button>
        </div>
      </div>
    );
  }

  // Adapt to both response formats:
  // New format (from quiz.js submit): { score, correct, xpEarned, gamification, ... }
  // Old format (if any): { attempt, summary, results }
  const score = results.score ?? results.summary?.percentage ?? 0;
  const correct = results.correct ?? results.summary?.correctAnswers ?? 0;
  const xpEarned = results.xpEarned ?? results.attempt?.xpGained ?? 0;
  const total = results.answers ? Object.keys(results.answers).length : results.summary?.totalQuestions ?? 0;
  const passed = score >= 60;

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">

        {/* Hero result */}
        <div className={`rounded-2xl p-8 text-center mb-6 ${
          passed
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
            : 'bg-gradient-to-r from-red-600 to-red-700'
        }`}>
          <div className="text-6xl mb-3">{passed ? '🎉' : '😔'}</div>
          <h1 className="text-3xl font-black mb-2">
            {passed ? 'Felicitations !' : 'Quiz termine'}
          </h1>
          {timeExpired && (
            <p className="text-white/80 mb-2 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" /> Temps ecoule !
            </p>
          )}
          <p className="text-xl text-white/90 mb-4">
            {passed
              ? 'Tu as reussi le quiz !'
              : 'Continue a t\'entrainer pour atteindre 60% !'}
          </p>

          {/* XP earned — always show */}
          {xpEarned > 0 && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-2xl font-black">+{xpEarned} XP</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="k-card p-5 text-center">
            <Trophy className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-black">{score}%</div>
            <p className="text-xs text-gray-500">Score</p>
          </div>
          <div className="k-card p-5 text-center">
            <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-black">{correct}</div>
            <p className="text-xs text-gray-500">Correct{correct > 1 ? 'es' : 'e'}</p>
          </div>
          <div className="k-card p-5 text-center">
            <TrendingUp className="w-7 h-7 text-kprimary mx-auto mb-2" />
            <div className="text-2xl font-black">{xpEarned}</div>
            <p className="text-xs text-gray-500">XP</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/quiz')}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-kprimary to-ksecondary rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-5 h-5" />
            Refaire un quiz
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
