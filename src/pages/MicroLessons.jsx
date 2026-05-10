import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Clock, Star, Target, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const MicroLessons = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completions, setCompletions] = useState({});
  const [stats, setStats] = useState(null);

  const getInitialFilter = () => {
    const urlSubject = searchParams.get('subject');
    const urlLevel = searchParams.get('level');
    return {
      subject: urlSubject || 'all',
      level: urlLevel || 'all'
    };
  };

  const [filter, setFilter] = useState(() => getInitialFilter());

  useEffect(() => {
    const urlSubject = searchParams.get('subject');
    const urlLevel = searchParams.get('level');

    setFilter(prev => {
      const newSubject = urlSubject || 'all';
      const newLevel = urlLevel || 'all';

      if (prev.subject !== newSubject || prev.level !== newLevel) {
        return { subject: newSubject, level: newLevel };
      }
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    const currentSubject = searchParams.get('subject') || 'all';
    const currentLevel = searchParams.get('level') || 'all';

    if (filter.subject !== currentSubject || filter.level !== currentLevel) {
      const params = new URLSearchParams();
      if (filter.subject !== 'all') params.set('subject', filter.subject);
      if (filter.level !== 'all') params.set('level', filter.level);

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [filter, searchParams]);

  useEffect(() => {
    fetchLessons();
  }, [filter]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 1000, offset: 0 };
      if (filter.subject !== 'all') params.subject = filter.subject;
      if (filter.level !== 'all') params.level = filter.level;

      const response = await api.microlessons.list(params);
      const lessonsData = response.data || response || [];
      setLessons(lessonsData);

      if (user && lessonsData.length > 0) {
        fetchCompletions(lessonsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des leçons:', error);
      setError(error.message || 'Erreur lors du chargement des leçons');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async (lessonList) => {
    try {
      const completionPromises = lessonList.slice(0, 50).map(lesson =>
        api.microlessons.getCompletion(lesson.id)
          .catch(error => {
            if (error.status === 401) return { success: true, data: null };
            return null;
          })
      );
      const results = await Promise.all(completionPromises);

      const completionMap = {};
      results.forEach((result, index) => {
        if (result?.success && result?.data) {
          completionMap[lessonList[index].id] = result.data;
        }
      });
      setCompletions(completionMap);
    } catch (error) {
      console.debug('Chargement des complétions:', error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.microlessons.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const subjects = [
    { name: t('microLessons.filters.all'), value: 'all', icon: '📚' },
    { name: t('courses.math'), value: 'Mathématiques', icon: '📐' },
    { name: t('courses.physics'), value: 'Physique', icon: '⚛️' },
    { name: t('courses.chemistry'), value: 'Chimie', icon: '🧪' }
  ];

  const levels = [
    { name: t('microLessons.filters.all'), value: 'all' },
    { name: t('home.levels.seconde.name'), value: 'Seconde' },
    { name: t('home.levels.premiere.name'), value: 'Première' },
    { name: t('home.levels.terminale.name'), value: 'Terminale' }
  ];

  // Difficulty dots: green/orange/red
  const getDifficultyDots = (difficulty) => {
    const level = difficulty || 1;
    const colors = ['bg-emerald-400', 'bg-emerald-400', 'bg-amber-400', 'bg-orange-500', 'bg-red-500'];
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i < level ? colors[Math.min(level - 1, 4)] : 'bg-white/10'}`}
          />
        ))}
      </div>
    );
  };

  const filteredLessons = lessons;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kprimary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3 gradient-text">
            {t('microLessons.title')}
          </h1>
          <p className="text-gray-400 text-lg">
            {error ? t('microLessons.subtitle') : `${lessons.length} ${t('courses.lessons')} ${t('microLessons.subtitle')}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-8">
          {[
            { label: t('microLessons.stats.total'), value: lessons.length, icon: <BookOpen className="w-6 h-6" />, color: 'text-kprimary', bg: 'bg-kprimary/15' },
            { label: t('microLessons.stats.completed'), value: stats?.total_completed || Object.keys(completions).filter(id => completions[id]?.completed).length, icon: <CheckCircle2 className="w-6 h-6" />, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
            { label: t('profile.stats.totalXp'), value: stats?.total_xp_earned ? Math.round(stats.total_xp_earned).toLocaleString() : '0', icon: <Star className="w-6 h-6" />, color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
            { label: t('dashboard.stats.successRate'), value: stats?.average_score ? `${Math.round(stats.average_score)}%` : '—', icon: <TrendingUp className="w-6 h-6" />, color: 'text-ksecondary', bg: 'bg-ksecondary/15' }
          ].map((stat, i) => (
            <div key={i} className="k-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="k-card p-5 mb-8">
          {/* Subjects */}
          <div className="mb-4">
            <label className="block text-xs font-bold mb-2 text-gray-400 uppercase tracking-wide">{t('microLessons.filters.subject')}</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject.value}
                  onClick={() => setFilter({ ...filter, subject: subject.value })}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    filter.subject === subject.value
                      ? 'bg-kprimary text-white shadow-lg shadow-kprimary/30'
                      : 'bg-transparent border border-white/10 text-gray-400 hover:border-kprimary/50 hover:text-white'
                  }`}
                >
                  <span className="mr-1.5">{subject.icon}</span>
                  {subject.name}
                </button>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <label className="block text-xs font-bold mb-2 text-gray-400 uppercase tracking-wide">{t('microLessons.filters.level')}</label>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setFilter({ ...filter, level: level.value })}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    filter.level === level.value
                      ? 'bg-kprimary text-white shadow-lg shadow-kprimary/30'
                      : 'bg-transparent border border-white/10 text-gray-400 hover:border-kprimary/50 hover:text-white'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {error ? (
          <div className="k-card p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-kaccent mx-auto mb-4" />
            <p className="text-kaccent text-lg font-semibold mb-2">{t('microLessons.noLessons')}</p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => fetchLessons()}
              className="inline-flex items-center px-6 py-3 bg-kprimary text-white font-semibold rounded-xl hover:bg-kprimary-500 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('actions.retry')}
            </button>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="k-card p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">{t('microLessons.noLessons')}</p>
            {(filter.subject !== 'all' || filter.level !== 'all') && (
              <p className="text-gray-600 text-sm">{t('actions.filter')} — {t('actions.retry')}</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((lesson) => {
              const isCompleted = completions[lesson.id]?.completed;
              return (
                <div
                  key={lesson.id}
                  onClick={() => navigate(`/microlessons/${lesson.id}`)}
                  className={`k-card cursor-pointer hover:scale-[1.02] transition-all p-5 ${
                    isCompleted ? 'border-emerald-500/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-white leading-tight flex-1 mr-2">{lesson.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-kprimary font-medium mb-3">
                    {t(`common.subjects.${lesson.subject}`) || lesson.subject} • {lesson.chapter}
                  </p>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {t(`common.levels.${lesson.level}`) || lesson.level}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <span className="flex items-center text-gray-400">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">{lesson.duration_min || 8} min</span>
                      </span>
                      {getDifficultyDots(lesson.difficulty)}
                    </div>
                    {/* XP gold badge */}
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-bold">
                      <Star className="h-3 w-3" />
                      +{lesson.xp_reward || 50}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-gray-500 capitalize">{t(`common.levels.${lesson.level}`) || lesson.level}</span>
                    <span className="text-kprimary font-semibold text-xs flex items-center">
                      {isCompleted ? t('dashboard.resume') || 'Revoir' : 'Commencer'}
                      <span className="ml-1">→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroLessons;
