import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, Check, X, Eye, EyeOff,
  Loader2, AlertTriangle, RefreshCw, Trophy
} from 'lucide-react';
import api from '../services/api';

const QUALITY_OPTIONS = [
  {
    value: 2,
    label: 'Difficile',
    sub: 'Revoir bientôt',
    icon: X,
    colors: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
  },
  {
    value: 3,
    label: 'Bon',
    sub: 'Dans quelques jours',
    icon: RotateCcw,
    colors: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40'
  },
  {
    value: 5,
    label: 'Facile',
    sub: 'Plus tard',
    icon: Check,
    colors: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40'
  }
];

export default function FlashcardsReview() {
  const navigate = useNavigate();

  const [flashcards,    setFlashcards]    = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [showAnswer,    setShowAnswer]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [startTime,     setStartTime]     = useState(Date.now());
  const [stats,         setStats]         = useState({ reviewed: 0, correct: 0, incorrect: 0 });
  const [sessionDone,   setSessionDone]   = useState(false);

  useEffect(() => { fetchFlashcards(); }, []);

  const fetchFlashcards = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const response = await api.flashcards.getDue(20);
      setFlashcards(response.data || []);
    } catch (error) {
      setLoadError(error.message || 'Impossible de charger les flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    if (submitting) return;
    const flashcard = flashcards[currentIndex];
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    setSubmitting(true);
    try {
      await api.flashcards.submitReview(flashcard.id, quality, timeSpent);

      const newStats = {
        reviewed:  stats.reviewed  + 1,
        correct:   quality >= 3 ? stats.correct   + 1 : stats.correct,
        incorrect: quality <  3 ? stats.incorrect + 1 : stats.incorrect
      };
      setStats(newStats);

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(i => i + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        setSessionDone(true);
      }
    } catch (error) {
      // Erreur non bloquante : on passe quand même à la carte suivante
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(i => i + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        setSessionDone(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-kprimary" />
      </div>
    );
  }

  // ── Erreur ───────────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-gray-300 font-semibold mb-1">Erreur de chargement</p>
          <p className="text-gray-500 text-sm mb-5">{loadError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchFlashcards}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
            <button
              onClick={() => navigate('/flashcards')}
              className="px-4 py-2 rounded-xl bg-kprimary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              ← Flashcards
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Aucune carte à réviser ───────────────────────────────────────────────────
  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-black text-white mb-2">Tout est à jour !</h2>
          <p className="text-gray-400 text-sm mb-5">Aucune flashcard à réviser pour le moment. Reviens plus tard.</p>
          <button
            onClick={() => navigate('/flashcards')}
            className="px-5 py-2.5 rounded-xl bg-kprimary text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            ← Mes flashcards
          </button>
        </div>
      </div>
    );
  }

  // ── Session terminée ─────────────────────────────────────────────────────────
  if (sessionDone) {
    const pct = flashcards.length > 0 ? Math.round((stats.correct / flashcards.length) * 100) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-20 lg:pb-0">
        <div className="k-card p-8 text-center max-w-md w-full">
          <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-1">Session terminée !</h2>
          <p className="text-gray-400 text-sm mb-6">Tu as révisé {stats.reviewed} flashcard{stats.reviewed !== 1 ? 's' : ''}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="k-card p-3 text-center">
              <p className="text-2xl font-black text-white">{stats.reviewed}</p>
              <p className="text-xs text-gray-500 mt-0.5">Révisées</p>
            </div>
            <div className="k-card p-3 text-center">
              <p className="text-2xl font-black text-emerald-400">{stats.correct}</p>
              <p className="text-xs text-gray-500 mt-0.5">Correctes</p>
            </div>
            <div className="k-card p-3 text-center">
              <p className="text-2xl font-black text-red-400">{stats.incorrect}</p>
              <p className="text-xs text-gray-500 mt-0.5">À retravailler</p>
            </div>
          </div>

          {/* Score */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Score</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-kprimary to-ksecondary rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => navigate('/flashcards')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-kprimary to-ksecondary text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Retour aux flashcards
          </button>
        </div>
      </div>
    );
  }

  // ── Révision ─────────────────────────────────────────────────────────────────
  const currentCard = flashcards[currentIndex];
  const progress    = ((currentIndex + 1) / flashcards.length) * 100;

  // subject peut être une string (id ou nom) ou null
  const subjectLabel = typeof currentCard.subject === 'string'
    ? currentCard.subject
    : currentCard.subject?.name ?? null;

  const difficultyColor = {
    FACILE:   'text-emerald-400 bg-emerald-500/10',
    MOYEN:    'text-amber-400   bg-amber-500/10',
    DIFFICILE:'text-red-400     bg-red-500/10'
  }[currentCard.difficulty] ?? 'text-gray-400 bg-white/5';

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Progression</p>
            <p className="text-xl font-black text-white">
              {currentIndex + 1} <span className="text-gray-500 font-normal">/</span> {flashcards.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Session</p>
            <p className="text-sm font-bold">
              <span className="text-emerald-400">{stats.correct} ✓</span>
              {' · '}
              <span className="text-red-400">{stats.incorrect} ✗</span>
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-kprimary to-ksecondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Contexte (matière / difficulté) */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {subjectLabel && (
            <span className="px-2.5 py-1 rounded-full bg-kprimary/10 text-kprimary text-xs font-semibold">
              {subjectLabel}
            </span>
          )}
          {currentCard.chapter && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
              {currentCard.chapter}
            </span>
          )}
          {currentCard.difficulty && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}>
              {currentCard.difficulty}
            </span>
          )}
        </div>

        {/* Carte */}
        <div
          className="k-card p-8 min-h-[320px] flex flex-col justify-center cursor-pointer hover:border-kprimary/30 transition-all select-none"
          onClick={() => !submitting && setShowAnswer(v => !v)}
        >
          {/* Question */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              {showAnswer
                ? <><Eye className="w-4 h-4" /> Question &amp; Réponse</>
                : <><EyeOff className="w-4 h-4" /> Question</>
              }
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentCard.front}
            </p>
          </div>

          {/* Réponse */}
          {showAnswer ? (
            <div className="pt-5 border-t border-white/10">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Réponse</p>
              <p className="text-lg text-gray-200 leading-relaxed">
                {currentCard.back}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 text-sm">Appuie pour révéler la réponse</p>
            </div>
          )}
        </div>

        {/* Boutons d'évaluation */}
        {showAnswer && (
          <div className="mt-6">
            <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-4">
              Comment as-tu répondu ?
            </p>
            <div className="grid grid-cols-3 gap-3">
              {QUALITY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleReview(opt.value)}
                    disabled={submitting}
                    className={`
                      flex flex-col items-center gap-2 px-4 py-4 rounded-xl border
                      font-semibold text-sm transition-all active:scale-95
                      disabled:opacity-40 ${opt.colors}
                    `}
                  >
                    {submitting
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Icon className="w-5 h-5" />
                    }
                    <span>{opt.label}</span>
                    <span className="text-[11px] font-normal opacity-70">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-gray-600 mt-3">
              Ton choix détermine la prochaine révision (algorithme SM-2)
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
