/**
 * 🏆 Mode Défi - KOUNDOUL
 * Duels, challenges hebdomadaires et classements
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const Challenge = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weekly');
  const [challenges, setChallenges] = useState([]);
  const [duels, setDuels] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboardScope, setLeaderboardScope] = useState('international');
  const [userRank, setUserRank] = useState(null);
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  // Liste des pays disponibles
  const countries = [
    { code: 'international', name: 'International', flag: '🌍' },
    { code: 'france', name: 'France', flag: '🇫🇷' },
    { code: 'senegal', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'cote-ivoire', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: 'mali', name: 'Mali', flag: '🇲🇱' },
    { code: 'burkina-faso', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'niger', name: 'Niger', flag: '🇳🇪' },
    { code: 'togo', name: 'Togo', flag: '🇹🇬' },
    { code: 'benin', name: 'Bénin', flag: '🇧🇯' },
    { code: 'guinee', name: 'Guinée', flag: '🇬🇳' },
    { code: 'cameroun', name: 'Cameroun', flag: '🇨🇲' },
    { code: 'gabon', name: 'Gabon', flag: '🇬🇦' },
    { code: 'congo', name: 'Congo', flag: '🇨🇬' },
    { code: 'rdc', name: 'RDC', flag: '🇨🇩' },
    { code: 'madagascar', name: 'Madagascar', flag: '🇲🇬' },
    { code: 'mauritanie', name: 'Mauritanie', flag: '🇲🇷' },
    { code: 'tchad', name: 'Tchad', flag: '🇹🇩' },
    { code: 'tunisie', name: 'Tunisie', flag: '🇹🇳' },
    { code: 'maroc', name: 'Maroc', flag: '🇲🇦' },
    { code: 'algerie', name: 'Algérie', flag: '🇩🇿' },
    { code: 'belgique', name: 'Belgique', flag: '🇧🇪' },
    { code: 'suisse', name: 'Suisse', flag: '🇨🇭' },
    { code: 'canada', name: 'Canada', flag: '🇨🇦' }
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
      const response = await api.duels.getAll(true); // Récupérer les duels publics
      if (response.success) {
        setAvailableDuels(response.data.map(duel => ({
          id: duel.id,
          opponent: anonymizeUsername(duel.challenger?.username),
          difficulty: duel.difficulty || 'Moyen',
          subject: duel.subject?.name || 'Mathématiques',
          timeLimit: duel.timeLimit || 10,
          questions: duel.questions || 5,
          prize: `${duel.xpReward || 50} XP`,
          status: duel.status
        })));
      }
    } catch (err) {
      console.error('Erreur chargement duels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const startDuel = useCallback(async (duelId) => {
    try {
      setLoading(true);
      setError(null);
      
      // D'abord accepter le duel si nécessaire
      const duel = availableDuels.find(d => d.id === duelId);
      if (duel && duel.status === 'PENDING') {
        await api.duels.accept(duelId);
      }
      
      const response = await api.duels.start(duelId);
      
      if (response.success) {
        // Rediriger vers la page de quiz avec les paramètres du duel
        navigate(`/quiz?duel=${duelId}`, {
          state: { 
            duel: response.data 
          }
        });
      } else {
        setError('Impossible de démarrer le duel. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur démarrage duel:', err);
      setError(err.message || 'Erreur lors du démarrage du duel');
    } finally {
      setLoading(false);
    }
  }, [availableDuels, navigate]);

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
            {loading && availableDuels.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                <span className="ml-3 text-gray-300">Chargement des duels...</span>
              </div>
            ) : availableDuels.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Sword className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Aucun Duel Disponible
                </h3>
                <p className="text-gray-300">
                  Créez votre propre duel ou attendez qu'un autre utilisateur en crée un !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDuels.map((duel) => (
                <div key={duel.id} className="bg-white/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                        <Sword className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Duel contre</h3>
                        <p className="text-purple-300">{duel.opponent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-300">
                      <Target className="h-4 w-4 mr-2" />
                      {duel.subject}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Zap className="h-4 w-4 mr-2" />
                      Difficulté: {duel.difficulty}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Timer className="h-4 w-4 mr-2" />
                      {duel.timeLimit} min - {duel.questions} questions
                    </div>
                    <div className="flex items-center text-yellow-400 font-semibold">
                      <Award className="h-4 w-4 mr-2" />
                      {duel.prize}
                    </div>
                  </div>

                  <button
                    onClick={() => startDuel(duel.id)}
                    disabled={loading || duel.status === 'IN_PROGRESS'}
                    aria-label={`${duel.status === 'PENDING' ? 'Accepter' : 'Commencer'} le duel contre ${duel.opponent}`}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <Sword className="h-5 w-5 mr-2" />
                        {duel.status === 'PENDING' ? 'Accepter le Duel' : 'Commencer le Duel'}
                      </>
                    )}
                  </button>
                </div>
              ))}
              </div>
            )}

            {/* Créer un duel */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-dashed border-purple-500/50 rounded-xl p-8 text-center">
              <Sword className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Créer votre propre duel</h3>
              <p className="text-gray-300 mb-6">
                Défiez vos amis et camarades dans un duel personnalisé
              </p>
              <button 
                onClick={() => {
                  // TODO: Implémenter la création de duel
                  setError('La création de duel sera bientôt disponible');
                }}
                aria-label="Créer un nouveau duel"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors transform hover:scale-105"
              >
                Créer un Duel
              </button>
            </div>
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
                onClick={() => setLeaderboardScope('france')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  leaderboardScope === 'france'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🇫🇷 France
              </button>
              <button 
                onClick={() => setLeaderboardScope('senegal')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  leaderboardScope === 'senegal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🇸🇳 Sénégal
              </button>
              <button 
                onClick={() => setLeaderboardScope('cote-ivoire')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  leaderboardScope === 'cote-ivoire'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🇨🇮 Côte d'Ivoire
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
