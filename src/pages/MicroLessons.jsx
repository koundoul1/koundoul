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
  const [completions, setCompletions] = useState({}); // { lessonId: { completed, score } }
  const [stats, setStats] = useState(null);
  
  // Initialiser le filtre depuis les paramètres d'URL
  const getInitialFilter = () => {
    const urlSubject = searchParams.get('subject');
    const urlLevel = searchParams.get('level');
    return {
      subject: urlSubject || 'all',
      level: urlLevel || 'all'
    };
  };

  const [filter, setFilter] = useState(() => getInitialFilter());

  // Mettre à jour le filtre si l'URL change (arrivée depuis Courses par exemple)
  useEffect(() => {
    const urlSubject = searchParams.get('subject');
    const urlLevel = searchParams.get('level');
    
    console.log('🔗 URL params changed:', { urlSubject, urlLevel });
    
    setFilter(prev => {
      const newSubject = urlSubject || 'all';
      const newLevel = urlLevel || 'all';
      
      // Ne mettre à jour que si les valeurs ont changé
      if (prev.subject !== newSubject || prev.level !== newLevel) {
        console.log('🔄 Updating filter:', { from: prev, to: { subject: newSubject, level: newLevel } });
        return {
          subject: newSubject,
          level: newLevel
        };
      }
      return prev;
    });
  }, [searchParams]);

  // Mettre à jour l'URL quand le filtre change (mais éviter les boucles)
  useEffect(() => {
    const currentSubject = searchParams.get('subject') || 'all';
    const currentLevel = searchParams.get('level') || 'all';
    
    // Ne mettre à jour l'URL que si le filtre diffère de l'URL actuelle
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
      const params = {
        limit: 1000,  // S'assurer qu'on récupère toutes les leçons
        offset: 0
      }
      if (filter.subject !== 'all') params.subject = filter.subject
      if (filter.level !== 'all') params.level = filter.level
      
      console.log('🔍 Fetching lessons with filter:', filter, 'params:', params);
      
      const response = await api.microlessons.list(params);
      const lessonsData = response.data || response || [];
      
      console.log('📦 API Response:', response);
      console.log('✅ Loaded lessons:', lessonsData.length);
      
      setLessons(lessonsData);
      
      // Charger les complétions si utilisateur connecté
      if (user && lessonsData.length > 0) {
        fetchCompletions(lessonsData);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des leçons:', error);
      console.error('❌ Détails de l\'erreur:', error.message, error.stack);
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
            // Ignorer silencieusement les erreurs 401 (non authentifié)
            if (error.status === 401) {
              return { success: true, data: null };
            }
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
      // Ignorer les erreurs silencieusement
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
    { name: t('microLessons.filters.all'), value: 'all', icon: '📚', color: 'indigo' },
    { name: t('courses.math'), value: 'Mathématiques', icon: '📐', color: 'blue' },
    { name: t('courses.physics'), value: 'Physique', icon: '⚛️', color: 'green' },
    { name: t('courses.chemistry'), value: 'Chimie', icon: '🧪', color: 'purple' }
  ];

  const levels = [
    { name: t('microLessons.filters.all'), value: 'all' },
    { name: t('home.levels.seconde.name'), value: 'Seconde' },
    { name: t('home.levels.premiere.name'), value: 'Première' },
    { name: t('home.levels.terminale.name'), value: 'Terminale' }
  ];

  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-yellow-500',
      3: 'bg-orange-500',
      4: 'bg-red-500',
      5: 'bg-purple-500'
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  // Les leçons sont déjà filtrées côté serveur via l'API
  const filteredLessons = lessons;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📚 {t('microLessons.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {error ? t('microLessons.subtitle') : `${lessons.length} ${t('courses.lessons')} ${t('microLessons.subtitle')}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('microLessons.stats.total')}</p>
                <p className="text-3xl font-bold text-blue-600">{lessons.length}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('microLessons.stats.completed')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.total_completed || Object.keys(completions).filter(id => completions[id]?.completed).length}
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('profile.stats.totalXp')}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.total_xp_earned ? Math.round(stats.total_xp_earned).toLocaleString() : '0'}
                </p>
              </div>
              <Star className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('dashboard.stats.successRate')}</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats?.average_score ? `${Math.round(stats.average_score)}%` : '—'}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-700">{t('actions.filter')}</h2>
          
          {/* Subjects */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-blue-600">{t('microLessons.filters.subject')}</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject.value}
                  onClick={() => setFilter({ ...filter, subject: subject.value })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter.subject === subject.value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{subject.icon}</span>
                  {subject.name}
                  {subject.count && <span className="ml-2 text-xs">({subject.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-purple-600">{t('microLessons.filters.level')}</label>
            <div className="flex flex-wrap gap-2">
            {levels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setFilter({ ...filter, level: level.value })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter.level === level.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-semibold mb-2">
              {t('microLessons.noLessons')}
            </p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => fetchLessons()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('actions.retry')}
            </button>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">{t('microLessons.noLessons')}</p>
            {(filter.subject !== 'all' || filter.level !== 'all') && (
              <p className="text-gray-500 text-sm">
                {t('actions.filter')} — {t('actions.retry')}
              </p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => navigate(`/microlessons/${lesson.id}`)}
                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 ${
                  completions[lesson.id]?.completed 
                    ? 'border-green-300 hover:border-green-500' 
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-xl font-bold text-blue-900">{lesson.title}</h3>
                    <div className="flex items-center gap-2">
                      {completions[lesson.id]?.completed && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" title="Complétée" />
                      )}
                      <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                        {lesson.id}
                      </span>
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {lesson.difficulty || 1}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">{lesson.subject} • {lesson.chapter}</p>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">Niveau: {lesson.level}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration_min || 8} min
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      +{lesson.xp_reward || 50} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-purple-700 capitalize">{lesson.level}</span>
                    <button className="text-blue-700 hover:text-blue-800 font-semibold text-sm flex items-center">
                      Commencer
                      <span className="ml-1">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroLessons;
