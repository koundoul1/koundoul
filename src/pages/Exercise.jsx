import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Send, CheckCircle, Star, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useGamification } from '../hooks/useGamification';
import { useTranslation } from '../hooks/useTranslation';

export default function Exercise() {
  const { t } = useTranslation();
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { processActionResult } = useGamification();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [revealedHints, setRevealedHints] = useState(0);
  const [phase, setPhase] = useState('solve'); // solve | review | done
  const [selfEval, setSelfEval] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
    setPhase('solve');
    setUserAnswer('');
    setRevealedHints(0);
    setSelfEval(null);
    setResult(null);

    const fetchExercise = async () => {
      setLoading(true);
      try {
        const response = await api.content.getExercise(exerciseId);
        setExercise(response.data);
      } catch (error) {
        console.error('Error loading exercise:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [exerciseId]);

  const hints = exercise?.hints || [];

  const handleRevealHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(revealedHints + 1);
    }
  };

  const handleShowSolution = () => {
    if (!userAnswer.trim()) return;
    setPhase('review');
  };

  const handleSelfEvaluate = async (evaluation) => {
    setSelfEval(evaluation);
    setSubmitting(true);
    try {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      const response = await api.content.submitExercise(exerciseId, {
        userAnswer: userAnswer.trim(),
        selfEvaluation: evaluation,
        timeSpent
      });
      setResult(response.data);
      processActionResult(response.data?.gamification);
      setPhase('done');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kprimary"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="k-card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-2">{t('exercise.notFound') || 'Exercice introuvable'}</p>
          <button onClick={() => navigate(-1)} className="text-kprimary font-semibold hover:underline">
            {t('actions.back') || 'Retour'}
          </button>
        </div>
      </div>
    );
  }

  const solution = exercise.solution || {};
  const diffLabel = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' };

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> {t('actions.back') || 'Retour'}
        </button>

        {/* Header */}
        <div className="k-card p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{exercise.chapter}</span>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-kprimary/20 text-kprimary text-xs font-bold">
                {diffLabel[exercise.difficulty] || `Diff. ${exercise.difficulty}`}
              </span>
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star className="w-4 h-4" /> {exercise.points} pts
              </span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">{exercise.problem}</h1>
        </div>

        {/* Hints */}
        {hints.length > 0 && phase === 'solve' && (
          <div className="k-card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" /> Indices
              </h3>
              {revealedHints < hints.length && (
                <button
                  onClick={handleRevealHint}
                  className="text-xs px-3 py-1.5 bg-yellow-500/15 text-yellow-400 rounded-lg font-bold hover:bg-yellow-500/25 transition-colors"
                >
                  Indice {revealedHints + 1}/{hints.length}
                </button>
              )}
            </div>
            {revealedHints > 0 && (
              <div className="space-y-2">
                {hints.slice(0, revealedHints).map((hint, i) => (
                  <div key={i} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-gray-300">
                    <span className="text-yellow-400 font-bold">#{i + 1}</span> {typeof hint === 'string' ? hint : JSON.stringify(hint)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Phase: Solve */}
        {phase === 'solve' && (
          <div className="k-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-3">{t('exercise.title') || 'Ta reponse'}</h2>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Ecris ta reponse ici..."
              className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-kprimary transition-colors"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleShowSolution}
                disabled={!userAnswer.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-kprimary to-ksecondary rounded-xl text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Send className="w-5 h-5" /> {t('exercise.submit') || 'Soumettre'}
              </button>
            </div>
          </div>
        )}

        {/* Phase: Review — show model solution + self-eval */}
        {(phase === 'review' || phase === 'done') && (
          <>
            {/* User's answer */}
            <div className="k-card p-5 mb-4">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Ta reponse</h3>
              <p className="text-white">{userAnswer}</p>
            </div>

            {/* Model solution */}
            <div className="k-card p-6 mb-6 border border-kprimary/30">
              <h3 className="text-lg font-bold text-kprimary mb-4">{t('exercise.solution') || 'Solution'}</h3>

              {solution.steps && solution.steps.length > 0 && (
                <div className="space-y-3 mb-4">
                  {solution.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 bg-kprimary/20 text-kprimary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-300 text-sm pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              )}

              {solution.final_answer && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Reponse attendue</p>
                  <p className="text-white font-bold text-lg">{solution.final_answer}</p>
                </div>
              )}
            </div>

            {/* Self-evaluation */}
            {phase === 'review' && (
              <div className="k-card p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Comment as-tu trouve ?</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'correct', label: 'Juste', color: 'from-emerald-600 to-emerald-700', desc: '100% XP' },
                    { key: 'partial', label: 'A moitie', color: 'from-yellow-600 to-yellow-700', desc: '50% XP' },
                    { key: 'incorrect', label: 'Faux', color: 'from-red-600 to-red-700', desc: '25% XP' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleSelfEvaluate(opt.key)}
                      disabled={submitting}
                      className={`p-4 rounded-xl bg-gradient-to-r ${opt.color} text-white font-bold text-center hover:opacity-90 transition-opacity disabled:opacity-50`}
                    >
                      <div className="text-lg">{opt.label}</div>
                      <div className="text-xs opacity-75">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase: Done — show XP result */}
            {phase === 'done' && result && (
              <div className="k-card p-6 mb-6 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-white mb-1">+{result.xpEarned} XP</p>
                <p className="text-sm text-gray-400">
                  Auto-evaluation : {selfEval === 'correct' ? 'Juste' : selfEval === 'partial' ? 'A moitie' : 'Faux'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
