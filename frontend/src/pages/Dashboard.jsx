import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Target, Award, TrendingUp, Clock, Flame, 
  ChevronRight, CheckCircle, Trophy, Zap, Activity 
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

export default function Dashboard() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);
  const fetchCalledRef = useRef(false);

  useEffect(() => {
    // Éviter les appels multiples (React StrictMode en développement)
    if (fetchCalledRef.current) return;
    fetchCalledRef.current = true;
    
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    // Éviter les appels multiples si une redirection est déjà en cours
    if (hasRedirectedRef.current) return;
    
    try {
      const response = await api.dashboard.get();
      setDashboard(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      // Si erreur 401 (non authentifié), rediriger vers la page de connexion
      if (error.status === 401 || error.message?.includes('Token') || error.message?.includes('Session')) {
        // Éviter les redirections multiples
        if (hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;
        
        api.auth.logout();
        navigate('/login', { 
          replace: true,
          state: { 
            message: t('dashboard.loadingError')
          } 
        });
        return;
      }
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

  if (!dashboard && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-4">{t('dashboard.loadingError')}</p>
          <Link 
            to="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.connectButton')}
          </Link>
        </div>
      </div>
    );
  }

  const { profile, stats, subjectProgress, chaptersInProgress, recommendations, recentActivity } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Header avec profil */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 md:p-8 text-white mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {t('dashboard.title').replace('{name}', profile.firstName || profile.username)}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                {t('dashboard.level').replace('{level}', profile.level)}
              </div>
              <div className="text-sm sm:text-base text-blue-200">
                {t('dashboard.xp').replace('{xp}', profile.xp).replace('{nextXp}', profile.nextLevelXp)}
              </div>
              <div className="w-32 sm:w-40 md:w-48 h-2 bg-blue-500 rounded-full mt-2">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(profile.xp / profile.nextLevelXp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 transition-all hover:shadow-lg active:scale-95">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.lessonsCompleted}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">{t('dashboard.stats.lessonsCompleted')}</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 transition-all hover:shadow-lg active:scale-95">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.successRate}%</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">{t('dashboard.stats.successRate')}</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 transition-all hover:shadow-lg active:scale-95">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.streak}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">{t('dashboard.stats.streak')}</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 transition-all hover:shadow-lg active:scale-95">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalTimeSpent}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">{t('dashboard.stats.totalTime')}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recommandations */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-7 h-7 text-yellow-500" />
                  {t('dashboard.recommendations.title')}
                </h2>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <Link
                      key={index}
                      to={rec.action}
                      className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{rec.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600">
                            {rec.title}
                          </h3>
                          <p className="text-gray-600">{rec.description}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Progression par matière */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-7 h-7 text-blue-600" />
                  {t('dashboard.subjectProgress.title')}
                </h2>
              <div className="space-y-4">
                {subjectProgress.map(subject => (
                  <Link
                    key={subject.id}
                    to={`/courses/${subject.slug}`}
                    className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{subject.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600">
                          {t('dashboard.subjectProgress.lessons').replace('{completed}', subject.lessons.completed).replace('{total}', subject.lessons.total)} • {t('dashboard.subjectProgress.exercises').replace('{attempted}', subject.exercises.attempted).replace('{total}', subject.exercises.total)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {t('dashboard.subjectProgress.progress').replace('{progress}', subject.overallProgress)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${subject.overallProgress}%`,
                          backgroundColor: subject.color
                        }}
                      ></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Chapitres en cours */}
            {chaptersInProgress.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-7 h-7 text-green-600" />
                  {t('dashboard.chaptersInProgress.title')}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {chaptersInProgress.map(chapter => (
                    <Link
                      key={chapter.id}
                      to={`/courses/${chapter.subject.slug}/chapters/${chapter.slug}`}
                      className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <span>{chapter.subject.icon}</span>
                        <span>{chapter.subject.name}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {chapter.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{t('dashboard.chaptersInProgress.lessons').replace('{count}', chapter.lessons.length)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar : Activité récente */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-7 h-7 text-orange-500" />
              {t('dashboard.recentActivity.title')}
            </h2>
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="space-y-4">
                {recentActivity.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.subject} • {new Date(activity.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {activity.type === 'EXERCISE' && activity.isCorrect !== undefined && (
                        activity.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <span className="text-xs text-red-500">✗</span>
                        )
                      )}
                      <span className="text-xs font-bold text-blue-600">
                        +{activity.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                {t('dashboard.dailyGoal.title')}
              </h3>
              <p className="text-green-100 mb-4">
                {t('dashboard.dailyGoal.desc')}
              </p>
              <Link
                to="/courses"
                className="inline-block px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all"
              >
                {t('dashboard.dailyGoal.startButton')}
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}