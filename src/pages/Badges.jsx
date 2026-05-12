import { useState, useEffect } from 'react';
import { Award, Trophy, Lock, TrendingUp, CheckCircle, Star } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

/** Turn a badge condition string into a human-readable label */
function conditionLabel(condition) {
  if (!condition) return '';
  const parts = condition.split(':');
  const type = parts[0];
  const value = parts[parts.length - 1];

  const labels = {
    complete_lesson: `${value} lecon(s)`,
    complete_quiz: `${value} quiz`,
    streak: `${value} jours consecutifs`,
    level: `Niveau ${value}`,
    perfect_quiz: `${value} quiz parfait(s)`,
    subject: `${value} lecons de ${parts[1]}`,
    level_mastery: `${value} lecons niveau ${parts[1]}`
  };
  return labels[type] || condition;
}

export default function Badges() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    var badgesLoaded = [];
    try {
      const badgesRes = await api.badges.getAll();
      badgesLoaded = badgesRes?.data || (Array.isArray(badgesRes) ? badgesRes : []);
      setBadges(badgesLoaded);
    } catch (error) {
      console.error('Erreur badges:', error);
      // If 401, don't redirect — just show badges without unlock state
      if (error.status === 401) {
        try {
          const publicRes = await fetch(
            (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api') + '/badges/all'
          );
          const publicData = await publicRes.json();
          badgesLoaded = publicData?.data || [];
          setBadges(badgesLoaded);
        } catch (e) { /* ignore */ }
      }
    }
    try {
      const statsRes = await api.badges.getStats();
      setStats(statsRes?.data || statsRes);
    } catch (error) {
      // Stats fail for unauthenticated — generate from badges
      if (badgesLoaded.length > 0) {
        var unlocked = badgesLoaded.filter(function(b) { return b.unlocked; }).length;
        setStats({ total: badgesLoaded.length, unlocked: unlocked, percentage: Math.round((unlocked / badgesLoaded.length) * 100) });
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kprimary"></div>
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
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            {t('badges.title') || 'Badges'}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('badges.subtitle') || 'Debloque des badges en apprenant'}
          </p>
        </div>

        {/* Stats banner */}
        {stats && (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black mb-1">
                  {stats.unlocked} / {stats.total}
                </h2>
                <p className="text-lg text-white/80 font-medium">
                  {stats.percentage}% {t('badges.stats.unlocked') || 'debloques'}
                </p>
              </div>
              <Trophy className="w-20 h-20 text-white/30" />
            </div>
            <div className="mt-4 w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {[
            { key: 'all', label: t('badges.filters.all') || 'Tous', count: badges.length, active: 'bg-kprimary' },
            { key: 'unlocked', label: t('badges.filters.unlocked') || 'Debloques', count: unlockedBadges.length, active: 'bg-emerald-600' },
            { key: 'locked', label: t('badges.filters.locked') || 'Verrouilles', count: lockedBadges.length, active: 'bg-gray-600' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                filter === f.key
                  ? `${f.active} text-white shadow-lg`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Badge grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`k-card p-5 text-center transition-all ${
                badge.unlocked
                  ? 'border border-yellow-500/30 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/10'
                  : 'opacity-50'
              }`}
            >
              {/* Icon */}
              <div className="relative inline-block mb-3">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto ${
                  badge.unlocked
                    ? 'bg-yellow-500/15'
                    : 'bg-white/5'
                }`}>
                  {badge.unlocked ? badge.icon : <Lock className="w-10 h-10 text-gray-600" />}
                </div>
                {badge.unlocked && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                {badge.name}
              </h3>

              {/* Description */}
              <p className={`text-xs mb-2 leading-relaxed ${badge.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                {badge.description}
              </p>

              {/* Points */}
              {badge.points > 0 && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-bold">+{badge.points} XP</span>
                </div>
              )}

              {/* Condition (for locked badges) */}
              {!badge.unlocked && badge.condition && (
                <div className="text-[11px] text-gray-500 bg-white/5 rounded-lg px-2 py-1 mt-1">
                  {conditionLabel(badge.condition)}
                </div>
              )}

              {/* Unlock date */}
              {badge.unlocked && badge.unlockedAt && (
                <p className="text-[11px] text-emerald-400 font-medium mt-1">
                  {new Date(badge.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredBadges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Award className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-400 mb-2">
              {filter === 'unlocked'
                ? (t('badges.noUnlocked') || 'Aucun badge debloque')
                : badges.length === 0
                  ? (t('badges.noBadges') || 'Aucun badge disponible')
                  : (t('badges.noBadges') || 'Aucun badge dans cette categorie')}
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
              {filter === 'unlocked'
                ? (t('badges.startLearning') || 'Complete des lecons et des quiz pour debloquer tes premiers badges !')
                : badges.length === 0
                  ? (t('badges.checkConnection') || 'Verifie ta connexion et reessaye.')
                  : ''}
            </p>
          </div>
        )}

        {/* Encouragement */}
        {lockedBadges.length > 0 && (
          <div className="mt-8 k-card p-6 text-center border border-dashed border-kprimary/30">
            <TrendingUp className="w-10 h-10 text-kprimary mx-auto mb-3" />
            <h3 className="text-xl font-black mb-1">
              {t('badges.encouragement.title') || 'Continue comme ca !'}
            </h3>
            <p className="text-gray-400">
              {lockedBadges.length} badge{lockedBadges.length > 1 ? 's' : ''} {t('badges.encouragement.remaining') || 'encore a debloquer'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
