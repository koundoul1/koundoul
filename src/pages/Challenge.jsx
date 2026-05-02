/**
 * 🏆 Mode Défi - KOUNDOUL
 * Duels, challenges hebdomadaires et classements
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  Flame,
  Zap,
  Sword,
  Shield,
  Sparkles,
  Star,
  Loader2,
  ArrowRight,
  Play,
  Timer,
  Medal,
  BookOpen,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  History
} from 'lucide-react';
import api from '../services/api';
import { useGamification } from '../hooks/useGamification';

const Challenge = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { processActionResult } = useGamification();
  const [activeTab, setActiveTab] = useState('weekly');
  const [challenges, setChallenges] = useState([]);
  const [duels, setDuels] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboardScope, setLeaderboardScope] = useState('international');
  const [userRank, setUserRank] = useState(null);
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  // Duel state
  const [duelView, setDuelView] = useState('menu'); // menu, create, join, play, results, myduels
  const [duelSubject, setDuelSubject] = useState('Mathématiques');
  const [duelLevel, setDuelLevel] = useState('Terminale');
  const [duelDifficulty, setDuelDifficulty] = useState('Moyen');
  const [createdDuel, setCreatedDuel] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeDuel, setActiveDuel] = useState(null);
  const [duelQuestions, setDuelQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [duelAnswers, setDuelAnswers] = useState([]);
  const [duelTimer, setDuelTimer] = useState(600); // 10 min in seconds
  const [duelResults, setDuelResults] = useState(null);
  const [myDuels, setMyDuels] = useState(null);

  // Liste des pays disponibles
  const countries = [
    { code: 'international', name: 'International', flag: '🌍' },
    // Afrique de l'Ouest
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: 'GN', name: 'Guinée', flag: '🇬🇳' },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: 'LR', name: 'Libéria', flag: '🇱🇷' },
    { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼' },
    { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻' },
    { code: 'GM', name: 'Gambie', flag: '🇬🇲' },
    { code: 'MR', name: 'Mauritanie', flag: '🇲🇷' },
    // Afrique centrale
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: 'CD', name: 'RDC', flag: '🇨🇩' },
    { code: 'TD', name: 'Tchad', flag: '🇹🇩' },
    { code: 'CF', name: 'RCA', flag: '🇨🇫' },
    { code: 'GQ', name: 'Guinée équatoriale', flag: '🇬🇶' },
    { code: 'ST', name: 'São Tomé', flag: '🇸🇹' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴' },
    // Afrique de l'Est
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿' },
    { code: 'UG', name: 'Ouganda', flag: '🇺🇬' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: 'ET', name: 'Éthiopie', flag: '🇪🇹' },
    { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
    { code: 'SO', name: 'Somalie', flag: '🇸🇴' },
    { code: 'ER', name: 'Érythrée', flag: '🇪🇷' },
    { code: 'SS', name: 'Soudan du Sud', flag: '🇸🇸' },
    { code: 'SD', name: 'Soudan', flag: '🇸🇩' },
    { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: 'KM', name: 'Comores', flag: '🇰🇲' },
    { code: 'MU', name: 'Maurice', flag: '🇲🇺' },
    { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
    // Afrique australe
    { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
    { code: 'ZM', name: 'Zambie', flag: '🇿🇲' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
    { code: 'NA', name: 'Namibie', flag: '🇳🇦' },
    { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
    { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
    { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
    // Afrique du Nord
    { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
    { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
    { code: 'LY', name: 'Libye', flag: '🇱🇾' },
    { code: 'EG', name: 'Égypte', flag: '🇪🇬' },
    // Francophonie hors Afrique
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' }
  ];

  // Fonction d'anonymisation améliorée
  const anonymizeUsername = useCallback((username) => {
    if (!username || username.length < 4) return 'Anonyme';
    return `***${username.slice(0, 4)}***`;
  }, []);

  // Validation du challenge
  const isValidChallenge = useCallback((challenge) => {
    return (
      challenge &&
      challenge.id &&
      challenge.title &&
      (challenge.questions > 0 || challenge.questions === undefined) &&
      (challenge.timeLimit > 0 || challenge.timeLimit === undefined)
    );
  }, []);

  // Pays actuel mémorisé
  const getCurrentCountry = useCallback(() => {
    return countries.find(c => c.code === leaderboardScope) || countries[0];
  }, [leaderboardScope]);

  const currentCountry = useMemo(() => getCurrentCountry(), [getCurrentCountry]);

  // État du challenge hebdomadaire
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [availableDuels, setAvailableDuels] = useState([]);

  // Charger le challenge hebdomadaire
  useEffect(() => {
    loadWeeklyChallenge();
  }, []);

  // Auto-join duel from URL ?duel=inviteCode
  useEffect(() => {
    const duelCode = searchParams.get('duel');
    if (duelCode) {
      setActiveTab('duels');
      setJoinCode(duelCode);
      setDuelView('join');
    }
  }, [searchParams]);

  // Charger les duels quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'duels') {
      loadDuels();
    }
  }, [activeTab]);

  // Nettoyer l'erreur après 5 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Charger le classement quand on change d'onglet ou de scope
  useEffect(() => {
    if (activeTab === 'leaderboard' && weeklyChallenge?.id) {
      loadLeaderboard();
      loadUserRank();
    }
  }, [activeTab, leaderboardScope, weeklyChallenge?.id]);

  // Duel timer
  useEffect(() => {
    if (duelView !== 'play' || duelTimer <= 0) return;
    const interval = setInterval(() => {
      setDuelTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitDuelAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duelView, duelTimer]);

  const loadWeeklyChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.challenges.getWeekly();
      if (response.success && response.data) {
        setWeeklyChallenge({
          ...response.data,
          subject: response.data.subject?.name || 'Mathématiques',
          difficulty: response.data.difficulty || 'Moyen'
        });
      } else {
        // Challenge par défaut si aucun n'est actif
        setWeeklyChallenge({
          id: null,
          title: 'Aucun challenge actif',
          description: 'Il n\'y a pas de challenge hebdomadaire actif pour le moment.',
          subject: 'Mathématiques',
          difficulty: 'Moyen',
          participants: 0,
          endDate: null,
          prize: 'Récompenses à venir',
          questions: 10,
          timeLimit: 20,
          isActive: false
        });
      }
    } catch (err) {
      console.error('Erreur chargement challenge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDuels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.duels.getAll(true);
      if (response.success) {
        setAvailableDuels(response.data.map(duel => ({
          id: duel.id,
          inviteCode: duel.inviteCode,
          challenger: duel.challenger?.username || 'Anonyme',
          difficulty: duel.difficulty || 'Moyen',
          subject: duel.subject || 'Mathématiques',
          level: duel.level || 'Terminale',
          timeLimit: duel.timeLimit || 10,
          questions: Array.isArray(duel.questions) ? duel.questions.length : (duel.questions || 10),
          prize: `${duel.xpReward || 200} XP`,
          status: duel.status,
          expiresAt: duel.expiresAt
        })));
      }
    } catch (err) {
      console.error('Erreur chargement duels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDuel = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.duels.create({
        subject: duelSubject,
        level: duelLevel,
        difficulty: duelDifficulty
      });
      if (response.success) {
        setCreatedDuel(response.data);
        setDuelView('created');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinDuel = async () => {
    if (!joinCode.trim()) {
      setError('Veuillez entrer un code de duel');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.duels.joinByCode(joinCode.trim());
      if (response.success) {
        setActiveDuel(response.data);
        setDuelQuestions(response.data.questions || []);
        setCurrentQuestion(0);
        setDuelAnswers([]);
        setDuelTimer(response.data.timeLimit * 60 || 600);
        setDuelView('play');
      }
    } catch (err) {
      setError(err.message || 'Code de duel invalide');
    } finally {
      setLoading(false);
    }
  };

  const startDuelFromList = async (duelId) => {
    try {
      setLoading(true);
      setError(null);
      const duel = availableDuels.find(d => d.id === duelId);
      if (duel && duel.status === 'pending') {
        await api.duels.accept(duelId);
      }
      const response = await api.duels.start(duelId);
      if (response.success) {
        setActiveDuel(response.data);
        setDuelQuestions(response.data.questions || []);
        setCurrentQuestion(0);
        setDuelAnswers([]);
        setDuelTimer(response.data.timeLimit * 60 || 600);
        setDuelView('play');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const answerDuelQuestion = (questionId, answer) => {
    setDuelAnswers(prev => {
      const existing = prev.filter(a => a.questionId !== questionId);
      return [...existing, { questionId, answer, timeSpent: (600 - duelTimer) * 1000 }];
    });
    // Auto-advance to next question
    if (currentQuestion < duelQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    }
  };

  const submitDuelAnswers = async () => {
    if (!activeDuel) return;
    try {
      setLoading(true);
      const response = await api.duels.submit(activeDuel.id, {
        answers: duelAnswers,
        timeSpent: (600 - duelTimer) * 1000
      });
      if (response.success) {
        setDuelResults(response.data);
        setDuelView('results');
        // Gamification feedback comes from the backend duel submit
        // (the server calls processAction for both players)
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyDuels = async () => {
    try {
      setLoading(true);
      const response = await api.duels.getMy();
      if (response.success) {
        setMyDuels(response.data);
        setDuelView('myduels');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (!createdDuel) return;
    const text = createdDuel.shareLink || createdDuel.inviteCode;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const createRematch = () => {
    if (!activeDuel) return;
    setDuelSubject(activeDuel.subject || 'Mathématiques');
    setDuelDifficulty(activeDuel.difficulty || 'Moyen');
    setDuelLevel(activeDuel.level || 'Terminale');
    setDuelView('create');
  };

  const loadLeaderboard = async () => {
    if (!weeklyChallenge?.id) return;
    
    try {
      setLoading(true);
      const response = await api.challenges.getLeaderboard(weeklyChallenge.id, leaderboardScope);
      if (response.success) {
        setRankings(response.data);
      }
    } catch (err) {
      console.error('Erreur chargement classement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRank = async () => {
    if (!weeklyChallenge?.id) return;
    
    try {
      const response = await api.challenges.getUserRank(weeklyChallenge.id, leaderboardScope);
      if (response.success && response.data) {
        setUserRank(response.data);
      } else {
        setUserRank(null);
      }
    } catch (err) {
      console.error('Erreur chargement rang utilisateur:', err);
      setUserRank(null);
    }
  };

  const startChallenge = useCallback(async () => {
    if (!isValidChallenge(weeklyChallenge)) {
      setError('Aucun challenge disponible ou challenge invalide');
      return;
    }

    if (!weeklyChallenge.isActive) {
      setError('Ce challenge n\'est plus actif');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.challenges.start(weeklyChallenge.id);
      
      if (response.success && response.data.quiz) {
        // Rediriger vers le quiz avec le challenge ID
        navigate(`/quiz/${response.data.quiz.id}?challenge=${weeklyChallenge.id}`, {
          state: { 
            challenge: weeklyChallenge,
            session: response.data 
          }
        });
      } else {
        setError('Impossible de démarrer le challenge. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur démarrage challenge:', err);
      setError(err.message || 'Erreur lors du démarrage du challenge');
    } finally {
      setLoading(false);
    }
  }, [weeklyChallenge, navigate, isValidChallenge]);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryMenu && !event.target.closest('.relative')) {
        setShowCountryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryMenu]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center">
                  Mode Défi
                  <Sparkles className="h-8 w-8 ml-3 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-purple-200 mt-1">
                  Duels, challenges hebdomadaires et classements
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setActiveTab('weekly')}
                aria-label="Onglet Challenge Hebdomadaire"
                aria-selected={activeTab === 'weekly'}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-yellow-500 text-indigo-950 shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Calendar className="h-5 w-5 inline mr-2" />
                Challenge Hebdomadaire
              </button>
              <button
                onClick={() => setActiveTab('duels')}
                aria-label="Onglet Duels"
                aria-selected={activeTab === 'duels'}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'duels'
                    ? 'bg-yellow-500 text-indigo-950 shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Sword className="h-5 w-5 inline mr-2" />
                Duels
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                aria-label="Onglet Classements"
                aria-selected={activeTab === 'leaderboard'}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-yellow-500 text-indigo-950 shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Trophy className="h-5 w-5 inline mr-2" />
                Classements
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Challenge Hebdomadaire */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {loading && !weeklyChallenge ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              </div>
            ) : weeklyChallenge ? (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {weeklyChallenge?.isActive && (
                      <div className="flex items-center mb-2">
                        <Flame className="h-6 w-6 text-orange-500 mr-2 animate-pulse" />
                        <span className="px-3 py-1 bg-orange-500/30 text-orange-200 rounded-full text-sm font-semibold">
                          Challenge Actif
                        </span>
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-2">{weeklyChallenge?.title || 'Aucun challenge actif'}</h2>
                    <p className="text-gray-300">{weeklyChallenge?.description || 'Il n\'y a pas de challenge hebdomadaire actif pour le moment.'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-yellow-400 mb-1">{weeklyChallenge?.participants || 0}</div>
                    <div className="text-sm text-gray-300">Participants</div>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center text-gray-300 mb-2">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Matière
                  </div>
                    <div className="text-xl font-bold text-white">{weeklyChallenge?.subject || 'Mathématiques'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center text-gray-300 mb-2">
                    <Target className="h-5 w-5 mr-2" />
                    Difficulté
                  </div>
                  <div className="text-xl font-bold text-yellow-400">{weeklyChallenge?.difficulty || 'Moyen'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center text-gray-300 mb-2">
                    <Timer className="h-5 w-5 mr-2" />
                    Durée
                  </div>
                  <div className="text-xl font-bold text-white">{weeklyChallenge?.timeLimit || 20} min</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center text-gray-300 mb-2">
                    <Award className="h-5 w-5 mr-2" />
                    Récompense
                  </div>
                  <div className="text-lg font-bold text-purple-300">{weeklyChallenge?.prize || 'Récompenses à venir'}</div>
                </div>
              </div>

                <button
                  onClick={startChallenge}
                  disabled={loading || !weeklyChallenge?.isActive}
                  aria-label="Commencer le challenge hebdomadaire"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Play className="h-6 w-6 mr-2" />
                      Commencer le Challenge
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Aucun Challenge Actif
                </h3>
                <p className="text-gray-300">
                  Revenez bientôt pour participer au prochain challenge hebdomadaire !
                </p>
              </div>
            )}

            {/* Règles */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-400" />
                Règles du Challenge
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Vous avez {weeklyChallenge?.timeLimit || 20} minutes pour répondre à {weeklyChallenge?.questions || 10} questions
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Les meilleurs scores sont classés anonymement
                </li>
 <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Les récompenses sont attribuées à la fin du challenge
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Un classement anonymisé est disponible (École/Région/Pays)
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Duels */}
        {activeTab === 'duels' && (
          <div className="space-y-6">

            {/* MODE DUEL: Jouer */}
            {duelView === 'play' && duelQuestions.length > 0 ? (
              <div className="space-y-6">
                {/* Timer + Progress */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Sword className="h-5 w-5 text-red-400 mr-2" />
                      <span className="font-bold text-white">
                        Duel — {activeDuel?.subject}
                      </span>
                    </div>
                    <div className={`flex items-center font-mono text-xl font-bold ${duelTimer < 60 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                      <Timer className="h-5 w-5 mr-1" />
                      {formatTime(duelTimer)}
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestion + 1) / duelQuestions.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Question {currentQuestion + 1} / {duelQuestions.length}
                  </div>
                </div>

                {/* Question */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">
                    {duelQuestions[currentQuestion]?.question}
                  </h3>
                  <div className="space-y-3">
                    {(duelQuestions[currentQuestion]?.options || []).map((option, idx) => {
                      const qId = duelQuestions[currentQuestion]?.id;
                      const selected = duelAnswers.find(a => a.questionId === qId)?.answer === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => answerDuelQuestion(qId, idx)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selected
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/50 hover:bg-white/10'
                          }`}
                        >
                          <span className="font-bold mr-3 text-purple-400">{String.fromCharCode(65 + idx)}.</span>
                          {typeof option === 'string' ? option : option?.text || option?.label || JSON.stringify(option)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg disabled:opacity-30"
                  >
                    Précédent
                  </button>
                  {currentQuestion === duelQuestions.length - 1 ? (
                    <button
                      onClick={submitDuelAnswers}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 flex items-center"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                      Terminer le Duel
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                      Suivant
                    </button>
                  )}
                </div>
              </div>

            /* RÉSULTATS DU DUEL */
            ) : duelView === 'results' && duelResults ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">
                    {duelResults.duelResult?.winnerId === null ? '🤝' :
                     duelResults.duelStatus === 'completed' && duelResults.duelResult ? '🏆' : '⏳'}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {duelResults.duelStatus === 'completed'
                      ? (duelResults.duelResult?.winnerId === null ? 'Égalité !' : 'Duel Terminé !')
                      : 'Réponses Soumises !'}
                  </h2>
                  <p className="text-gray-300">
                    {duelResults.duelStatus !== 'completed'
                      ? 'En attente de l\'adversaire...'
                      : `Score: ${duelResults.score} / ${duelResults.totalQuestions}`}
                  </p>
                </div>

                {/* Score Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-400" />
                    Vos Résultats
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-400">{duelResults.score}</div>
                      <div className="text-sm text-gray-400">Bonnes réponses</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-3xl font-bold text-white">{duelResults.totalQuestions}</div>
                      <div className="text-sm text-gray-400">Questions</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-400">{formatTime(Math.round((duelResults.totalTime || 0) / 1000))}</div>
                      <div className="text-sm text-gray-400">Temps</div>
                    </div>
                  </div>
                </div>

                {/* Comparaison si duel terminé */}
                {duelResults.duelResult && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">Toi vs Adversaire</h3>
                    <div className="grid grid-cols-3 gap-4 items-center text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{duelResults.duelResult.challengerScore}</div>
                        <div className="text-sm text-gray-400">Challenger</div>
                      </div>
                      <div className="text-3xl font-bold text-gray-500">VS</div>
                      <div>
                        <div className="text-2xl font-bold text-red-400">{duelResults.duelResult.opponentScore}</div>
                        <div className="text-sm text-gray-400">Adversaire</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={createRematch}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-bold flex items-center justify-center hover:from-red-600 hover:to-pink-600"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Revanche !
                  </button>
                  <button
                    onClick={() => { setDuelView('menu'); setDuelResults(null); setActiveDuel(null); }}
                    className="flex-1 bg-white/10 text-white py-3 rounded-lg font-bold hover:bg-white/20"
                  >
                    Retour
                  </button>
                </div>
              </div>

            /* DUEL CRÉÉ — afficher le code */
            ) : duelView === 'created' && createdDuel ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Duel Créé !</h2>
                  <p className="text-gray-300 mb-6">
                    Partage ce code avec ton adversaire
                  </p>

                  {/* Code d'invitation */}
                  <div className="bg-indigo-950 border-2 border-dashed border-purple-500 rounded-xl p-6 mb-6 max-w-md mx-auto">
                    <div className="text-4xl font-mono font-bold text-yellow-400 tracking-wider mb-3">
                      {createdDuel.inviteCode?.slice(0, 12)}
                    </div>
                    <button
                      onClick={copyInviteCode}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center mx-auto"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copié !' : 'Copier le lien'}
                    </button>
                  </div>

                  <div className="text-sm text-gray-400 flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Expire dans 24h — {createdDuel.questions} questions — {createdDuel.subject}
                  </div>
                </div>

                <button
                  onClick={() => { setDuelView('menu'); setCreatedDuel(null); }}
                  className="w-full bg-white/10 text-white py-3 rounded-lg font-bold hover:bg-white/20"
                >
                  Retour au menu
                </button>
              </div>

            /* CRÉER UN DUEL */
            ) : duelView === 'create' ? (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Sword className="h-6 w-6 mr-2 text-red-400" />
                    Créer un Défi
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Matière</label>
                      <select
                        value={duelSubject}
                        onChange={e => setDuelSubject(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                      >
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Physique">Physique</option>
                        <option value="Chimie">Chimie</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Niveau</label>
                      <select
                        value={duelLevel}
                        onChange={e => setDuelLevel(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                      >
                        <option value="Seconde">Seconde</option>
                        <option value="Première">Première</option>
                        <option value="Terminale">Terminale</option>
                        <option value="Supérieur">Supérieur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulté</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Facile', 'Moyen', 'Difficile'].map(d => (
                          <button
                            key={d}
                            onClick={() => setDuelDifficulty(d)}
                            className={`py-3 rounded-lg font-medium transition-all ${
                              duelDifficulty === d
                                ? 'bg-purple-600 text-white border-2 border-purple-400'
                                : 'bg-white/10 text-gray-300 border-2 border-transparent hover:bg-white/20'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-400">
                      <div className="flex items-center mb-1"><Timer className="h-4 w-4 mr-1" /> 10 minutes</div>
                      <div className="flex items-center mb-1"><Target className="h-4 w-4 mr-1" /> 10 questions QCM</div>
                      <div className="flex items-center"><Award className="h-4 w-4 mr-1" /> 200 XP pour le gagnant</div>
                    </div>
                  </div>

                  <button
                    onClick={createDuel}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:from-red-600 hover:to-pink-600 flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Sword className="h-6 w-6 mr-2" />}
                    Créer le Défi
                  </button>
                </div>

                <button
                  onClick={() => setDuelView('menu')}
                  className="w-full bg-white/10 text-gray-300 py-3 rounded-lg hover:bg-white/20"
                >
                  Retour
                </button>
              </div>

            /* REJOINDRE UN DUEL */
            ) : duelView === 'join' ? (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Share2 className="h-6 w-6 mr-2 text-blue-400" />
                    Rejoindre un Défi
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Code d'invitation</label>
                      <input
                        type="text"
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value)}
                        placeholder="Colle le code ici..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white text-center text-xl font-mono placeholder-gray-500"
                      />
                    </div>
                    <button
                      onClick={joinDuel}
                      disabled={loading || !joinCode.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-cyan-600 flex items-center justify-center disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Play className="h-6 w-6 mr-2" />}
                      Rejoindre
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setDuelView('menu')}
                  className="w-full bg-white/10 text-gray-300 py-3 rounded-lg hover:bg-white/20"
                >
                  Retour
                </button>
              </div>

            /* MES DUELS */
            ) : duelView === 'myduels' && myDuels ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <History className="h-6 w-6 mr-2 text-purple-400" />
                    Mes Duels
                  </h3>
                  <button onClick={() => setDuelView('menu')} className="text-gray-400 hover:text-white text-sm">
                    Retour
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{myDuels.stats?.wins || 0}</div>
                    <div className="text-xs text-gray-400">Victoires</div>
                  </div>
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{myDuels.stats?.losses || 0}</div>
                    <div className="text-xs text-gray-400">Défaites</div>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{myDuels.stats?.draws || 0}</div>
                    <div className="text-xs text-gray-400">Égalités</div>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">{myDuels.stats?.total || 0}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </div>

                {/* En cours */}
                {(myDuels.pending?.length > 0 || myDuels.active?.length > 0) && (
                  <div>
                    <h4 className="text-sm font-bold text-yellow-400 uppercase mb-2">En cours</h4>
                    {[...(myDuels.pending || []), ...(myDuels.active || [])].map(d => (
                      <div key={d.id} className="bg-white/5 border border-white/10 rounded-lg p-4 mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{d.subject}</span>
                          <span className="text-gray-400 text-sm ml-2">vs {d.opponent?.username || 'En attente...'}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${d.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {d.status}
                          </span>
                        </div>
                        {d.status === 'active' && (
                          <button
                            onClick={() => startDuelFromList(d.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          >
                            Jouer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Terminés */}
                {myDuels.completed?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Terminés</h4>
                    {myDuels.completed.slice(0, 10).map(d => (
                      <div key={d.id} className="bg-white/5 border border-white/10 rounded-lg p-4 mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{d.subject}</span>
                          <span className="text-gray-400 text-sm ml-2">
                            {d.challengerScore} - {d.opponentScore}
                          </span>
                        </div>
                        <div>
                          {d.winnerId === user?.id ? (
                            <span className="text-green-400 text-sm font-bold flex items-center"><CheckCircle className="h-4 w-4 mr-1" />Victoire</span>
                          ) : d.winnerId ? (
                            <span className="text-red-400 text-sm font-bold flex items-center"><XCircle className="h-4 w-4 mr-1" />Défaite</span>
                          ) : (
                            <span className="text-yellow-400 text-sm font-bold">Égalité</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(!myDuels.pending?.length && !myDuels.active?.length && !myDuels.completed?.length) && (
                  <div className="text-center text-gray-400 py-8">Aucun duel pour le moment</div>
                )}
              </div>

            /* MENU PRINCIPAL DUELS */
            ) : (
              <div className="space-y-6">
                {/* Actions principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setDuelView('create')}
                    className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-500/40 rounded-xl p-6 text-center hover:border-red-500/70 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Sword className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Créer un Défi</h3>
                    <p className="text-sm text-gray-400">Défie un ami avec un code</p>
                  </button>

                  <button
                    onClick={() => setDuelView('join')}
                    className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-xl p-6 text-center hover:border-blue-500/70 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Share2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Rejoindre</h3>
                    <p className="text-sm text-gray-400">Entre un code d'invitation</p>
                  </button>

                  <button
                    onClick={loadMyDuels}
                    className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-500/40 rounded-xl p-6 text-center hover:border-purple-500/70 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <History className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Mes Duels</h3>
                    <p className="text-sm text-gray-400">Historique et résultats</p>
                  </button>
                </div>

                {/* Duels publics disponibles */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                  </div>
                ) : availableDuels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-yellow-400" />
                      Duels Publics Disponibles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableDuels.map(duel => (
                        <div key={duel.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Sword className="h-5 w-5 text-red-400 mr-2" />
                              <span className="font-bold text-white">{duel.subject}</span>
                              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">{duel.difficulty}</span>
                            </div>
                            <span className="text-yellow-400 text-sm font-bold">{duel.prize}</span>
                          </div>
                          <div className="text-sm text-gray-400 mb-3">
                            {duel.questions} questions — {duel.timeLimit} min — par {anonymizeUsername(duel.challenger)}
                          </div>
                          <button
                            onClick={() => startDuelFromList(duel.id)}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 flex items-center justify-center disabled:opacity-50"
                          >
                            <Sword className="h-4 w-4 mr-2" />
                            Accepter le Duel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Règles des duels */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-400" />
                    Comment fonctionnent les duels ?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start"><span className="text-green-400 mr-2">1.</span>Crée un duel et partage le code avec ton adversaire</li>
                    <li className="flex items-start"><span className="text-green-400 mr-2">2.</span>10 questions QCM en 10 minutes</li>
                    <li className="flex items-start"><span className="text-green-400 mr-2">3.</span>Le gagnant est celui qui a le meilleur score (à égalité, le plus rapide)</li>
                    <li className="flex items-start"><span className="text-green-400 mr-2">4.</span>Gagnant : +200 XP — Perdant : +50 XP — Égalité : +100 XP</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Classements */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Sélecteur de classement */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {/* Bouton principal avec menu déroulant */}
              <div className="relative">
                <button 
                  onClick={() => setShowCountryMenu(!showCountryMenu)}
                  aria-label="Sélectionner un pays pour le classement"
                  aria-expanded={showCountryMenu}
                  className="px-6 py-3 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                >
                  <span>{currentCountry.flag}</span>
                  <span>{currentCountry.name}</span>
                  <ArrowRight className={`h-4 w-4 transition-transform ${showCountryMenu ? 'rotate-90' : ''}`} />
                </button>
                
                {/* Menu déroulant */}
                {showCountryMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-indigo-900 border border-purple-500/50 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto min-w-[200px]">
                    <div className="p-2">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setLeaderboardScope(country.code);
                            setShowCountryMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                            leaderboardScope === country.code
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons rapides pour les pays les plus utilisés */}
              <button
                onClick={() => setLeaderboardScope('SN')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  leaderboardScope === 'SN'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🇸🇳 Sénégal
              </button>
              <button
                onClick={() => setLeaderboardScope('CI')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  leaderboardScope === 'CI'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🇨🇮 Côte d'Ivoire
              </button>
              <button
                onClick={() => setLeaderboardScope('FR')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  leaderboardScope === 'FR'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🇫🇷 France
              </button>
            </div>

            {/* Classement */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 border-b border-yellow-500/30">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Trophy className="h-7 w-7 mr-3 text-yellow-400" />
                    Classement {currentCountry.name} - Challenge Hebdomadaire
                  </h2>
                  <p className="text-gray-300 mt-2">
                    Classement anonymisé pour préserver la confidentialité des élèves
                  </p>
                </div>

                <div className="divide-y divide-white/10">
                  {rankings.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-semibold mb-1">Aucun participant pour le moment</p>
                      <p className="text-sm">Soyez le premier à compléter ce challenge !</p>
                    </div>
                  ) : (
                    rankings.map((player, index) => (
                  <div
                    key={index}
                    className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors ${
                      index === 0 ? 'bg-yellow-500/10' :
                      index === 1 ? 'bg-gray-500/10' :
                      index === 2 ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {index === 0 && <Crown className="h-8 w-8 text-yellow-400" />}
                        {index === 1 && <Medal className="h-8 w-8 text-gray-400" />}
                        {index === 2 && <Medal className="h-8 w-8 text-orange-400" />}
                        {index > 2 && (
                          <span className="text-2xl font-bold text-gray-400">#{player.rank}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{player.username}</h3>
                        <p className="text-sm text-gray-400">
                          {player.school} • {player.region}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{player.score} pts</div>
                      <div className="text-sm text-gray-400">{player.level}</div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            )}

            {/* Votre position */}
            {userRank ? (
              <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Votre Position</h3>
                    <p className="text-gray-300">Classé #{userRank.rank} avec {userRank.score} points</p>
                  </div>
                  <div className="text-4xl font-bold text-purple-300">#{userRank.rank}</div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <p className="text-gray-400">Vous n'avez pas encore complété ce challenge</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenge;
