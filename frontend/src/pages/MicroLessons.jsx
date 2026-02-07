import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Clock, Star, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MicroLessons = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLessons([]); // Réinitialiser les leçons en cas d'erreur
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
    { name: 'Tous', value: 'all', icon: '📚', color: 'indigo' },
    { name: 'Mathématiques', value: 'Mathématiques', icon: '📐', color: 'blue' },
    { name: 'Physique', value: 'Physique', icon: '⚛️', color: 'green' },
    { name: 'Chimie', value: 'Chimie', icon: '🧪', color: 'purple' }
  ];

  const levels = [
    { name: 'Tous', value: 'all' },
    { name: 'Seconde', value: 'Seconde' },
    { name: 'Première', value: 'Première' },
    { name: 'Terminale', value: 'Terminale' }
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20 lg:pb-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm mb-6">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Micro-Leçons</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              📚 Micro-Leçons
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            {lessons.length} leçons disponibles • 8 minutes par leçon
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { icon: BookOpen, label: 'Total', value: lessons.length, color: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-400' },
            { icon: CheckCircle2, label: 'Complétées', value: stats?.total_completed || Object.keys(completions).filter(id => completions[id]?.completed).length, color: 'from-green-500 to-emerald-500', iconColor: 'text-green-400' },
            { icon: Star, label: 'XP Gagné', value: stats?.total_xp_earned ? Math.round(stats.total_xp_earned).toLocaleString() : '0', color: 'from-purple-500 to-pink-500', iconColor: 'text-purple-400' },
            { icon: TrendingUp, label: 'Taux de réussite', value: stats?.average_score ? `${Math.round(stats.average_score)}%` : '—', color: 'from-indigo-500 to-purple-500', iconColor: 'text-indigo-400' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">{stat.label}</p>
                    <p className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10 mb-8">
          <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-center sm:text-left">Filtres</h2>
          
          {/* Subjects */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">Matière</label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {subjects.map(subject => (
                <button
                  key={subject.value}
                  onClick={() => setFilter({ ...filter, subject: subject.value })}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                    filter.subject === subject.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
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
            <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">Niveau</label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
            {levels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setFilter({ ...filter, level: level.value })}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                    filter.level === level.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-2">Aucune leçon trouvée avec les filtres sélectionnés</p>
            <p className="text-gray-400 text-sm">
              {lessons.length === 0 ? (
                <span>Chargement des leçons en cours...</span>
              ) : (
                <span>Essayez de changer les filtres pour voir plus de résultats</span>
              )}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => navigate(`/microlessons/${lesson.id}`)}
                className={`group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border transition-all duration-300 cursor-pointer hover:scale-105 ${
                  completions[lesson.id]?.completed 
                    ? 'border-green-500/50 hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/50' 
                    : 'border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/50'
                }`}
              >
                {completions[lesson.id]?.completed && (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-black text-white flex-1 pr-2 line-clamp-2">{lesson.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {completions[lesson.id]?.completed && (
                        <CheckCircle2 className="h-5 w-5 text-green-400" title="Complétée" />
                      )}
                      <span className="bg-white/10 backdrop-blur-sm text-gray-300 text-xs font-bold px-2 py-1 rounded">
                        {lesson.id}
                      </span>
                      <span className={`bg-gradient-to-r ${getDifficultyColor(lesson.difficulty || 1)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {lesson.difficulty || 1}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{lesson.subject} • {lesson.chapter}</p>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">Niveau: {lesson.level}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration_min || 8} min
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      +{lesson.xp_reward || 50} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-purple-400 capitalize">{lesson.level}</span>
                    <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
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
