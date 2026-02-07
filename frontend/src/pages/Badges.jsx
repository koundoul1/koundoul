import { useState, useEffect } from 'react';
import { Award, Trophy, Lock, TrendingUp, CheckCircle, Sparkles, Crown } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

export default function Badges() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [badgesRes, statsRes] = await Promise.all([
        api.badges.getAll(),
        api.badges.getStats()
      ]);
      
      setBadges(badgesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const filteredBadges = badges.filter(badge => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return badge.unlocked;
    if (filter === 'locked') return !badge.unlocked;
    return true;
  });

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20 lg:pb-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30 backdrop-blur-sm mb-6">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Collection de Badges</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              🏆 Badges
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Débloquez des badges en progressant dans votre apprentissage
          </p>
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-2xl shadow-yellow-500/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-black mb-2">
                {stats?.unlocked || 0} / {stats?.total || 0} Badges
              </h2>
              <p className="text-xl opacity-90">
                {stats?.percentage || 0}% de collection complétée
              </p>
            </div>
            <Trophy className="w-20 h-20 sm:w-24 sm:h-24 opacity-50" />
          </div>
          
          {/* Barre de progression */}
          <div className="mt-6 w-full h-4 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${stats?.percentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            Tous ({badges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            Débloqués ({unlockedBadges.length})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
            }`}
          >
            Verrouillés ({lockedBadges.length})
          </button>
        </div>

        {/* Galerie de badges */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border transition-all duration-300 ${
                badge.unlocked
                  ? 'border-yellow-500/50 hover:border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105'
                  : 'border-white/10 opacity-60'
              }`}
            >
              {badge.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              <div className="relative z-10 text-center">
                {/* Icône du badge */}
                <div className={`relative inline-block mb-4 ${
                  badge.unlocked ? 'animate-pulse' : ''
                }`}>
                  <div 
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-4xl sm:text-5xl transition-transform group-hover:scale-110 ${
                      badge.unlocked ? '' : 'grayscale'
                    }`}
                    style={{ 
                      backgroundColor: badge.unlocked ? (badge.color || '#fbbf24') + '20' : 'rgba(255,255,255,0.05)'
                    }}
                  >
                    {badge.unlocked ? badge.icon : <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />}
                  </div>
                  
                  {badge.unlocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Nom */}
                <h3 className={`text-base sm:text-lg font-bold mb-2 ${
                  badge.unlocked ? 'text-white' : 'text-gray-500'
                }`}>
                  {badge.name}
                </h3>

                {/* Description */}
                <p className={`text-xs sm:text-sm mb-3 leading-tight ${
                  badge.unlocked ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {badge.description}
                </p>

                {/* Date de déblocage */}
                {badge.unlocked && badge.unlockedAt && (
                  <p className="text-xs text-green-400 font-semibold">
                    Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}

                {!badge.unlocked && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Verrouillé</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun badge */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Aucun badge dans cette catégorie
            </p>
          </div>
        )}

        {/* Encouragement */}
        {lockedBadges.length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-blue-500/30 text-center">
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">
              Continue à progresser !
            </h3>
            <p className="text-gray-300 text-lg">
              Il te reste {lockedBadges.length} badge{lockedBadges.length > 1 ? 's' : ''} à débloquer.
              Continue à apprendre pour tous les collectionner !
            </p>
          </div>
        )}

      </div>
    </div>
  );
}


