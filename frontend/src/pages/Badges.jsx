import { useState, useEffect } from 'react';
import { Award, Trophy, Lock, TrendingUp, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function Badges() {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Badges
          </h1>
          <p className="text-gray-600 text-lg">
            Débloquez des badges en progressant dans votre apprentissage
          </p>
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {stats.unlocked} / {stats.total} Badges
              </h2>
              <p className="text-xl opacity-90">
                {stats.percentage}% de collection complétée
              </p>
            </div>
            <Trophy className="w-24 h-24 opacity-50" />
          </div>
          
          {/* Barre de progression */}
          <div className="mt-6 w-full h-4 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Tous ({badges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Débloqués ({unlockedBadges.length})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Verrouillés ({lockedBadges.length})
          </button>
        </div>

        {/* Galerie de badges */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`bg-white rounded-xl p-6 border-2 transition-all ${
                badge.unlocked
                  ? 'border-yellow-300 hover:shadow-xl hover:scale-105'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="text-center">
                {/* Icône du badge */}
                <div className={`relative inline-block mb-4 ${
                  badge.unlocked ? 'animate-pulse-slow' : ''
                }`}>
                  <div 
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
                      badge.unlocked ? '' : 'grayscale'
                    }`}
                    style={{ 
                      backgroundColor: badge.unlocked ? badge.color + '20' : '#F3F4F6'
                    }}
                  >
                    {badge.unlocked ? badge.icon : <Lock className="w-12 h-12 text-gray-400" />}
                  </div>
                  
                  {badge.unlocked && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Nom */}
                <h3 className={`text-lg font-bold mb-2 ${
                  badge.unlocked ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {badge.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-3 ${
                  badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {badge.description}
                </p>

                {/* Date de déblocage */}
                {badge.unlocked && badge.unlockedAt && (
                  <p className="text-xs text-green-600 font-semibold">
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
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Aucun badge dans cette catégorie
            </p>
          </div>
        )}

        {/* Encouragement */}
        {lockedBadges.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-xl p-8 border-2 border-blue-200 text-center">
            <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Continue à progresser !
            </h3>
            <p className="text-gray-700 text-lg">
              Il te reste {lockedBadges.length} badge{lockedBadges.length > 1 ? 's' : ''} à débloquer.
              Continue à apprendre pour tous les collectionner !
            </p>
          </div>
        )}

      </div>
    </div>
  );
}


