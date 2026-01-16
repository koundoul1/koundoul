import { Link } from 'react-router-dom';
import { 
  BookOpen, Target, TrendingUp, Award, Users, Zap, CheckCircle, ArrowRight, 
  Calculator, Brain, Globe, Lightbulb, Sparkles, Rocket, Shield, Clock, 
  MessageSquare, BarChart3, Gamepad2, Trophy, Star, Flame, Eye, Headphones, 
  Hand, Scale, FileText, Microscope, FlaskConical, PieChart
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();
  const subjects = [
    { name: t('home.subjects.math'), icon: '📐', color: 'bg-primary-500', topics: t('home.subjectsTopics.math') },
    { name: t('home.subjects.physics'), icon: '⚛️', color: 'bg-primary-400', topics: t('home.subjectsTopics.physics') },
    { name: t('home.subjects.chemistry'), icon: '🧪', color: 'bg-accent-400', topics: t('home.subjectsTopics.chemistry') }
  ];

  const levels = [
    { name: t('home.levels.seconde.name'), grade: t('home.levels.seconde.grade'), difficulty: t('home.levels.seconde.difficulty'), icon: '📘' },
    { name: t('home.levels.premiere.name'), grade: t('home.levels.premiere.grade'), difficulty: t('home.levels.premiere.difficulty'), icon: '📗' },
    { name: t('home.levels.terminale.name'), grade: t('home.levels.terminale.grade'), difficulty: t('home.levels.terminale.difficulty'), icon: '📕' }
  ];

  const features = [
    { 
      icon: <Target className="w-8 h-8" />, 
      title: t('home.features.personalized.title'),
      desc: t('home.features.personalized.desc')
    },
    { 
      icon: <BookOpen className="w-8 h-8" />, 
      title: t('home.features.guided.title'),
      desc: t('home.features.guided.desc')
    },
    { 
      icon: <TrendingUp className="w-8 h-8" />, 
      title: t('home.features.progress.title'),
      desc: t('home.features.progress.desc')
    },
    { 
      icon: <Award className="w-8 h-8" />, 
      title: t('home.features.badges.title'),
      desc: t('home.features.badges.desc')
    }
  ];

  // Fonctionnalités principales
  const mainFeatures = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: t('home.mainFeatures.solver.title'),
      desc: t('home.mainFeatures.solver.desc'),
      href: '/solver',
      badge: t('home.mainFeatures.solver.badge'),
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: t('home.mainFeatures.microLessons.title'),
      desc: t('home.mainFeatures.microLessons.desc'),
      href: '/micro-lessons',
      badge: t('home.mainFeatures.microLessons.badge'),
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: t('home.mainFeatures.exercises.title'),
      desc: t('home.mainFeatures.exercises.desc'),
      href: '/exercices',
      badge: t('home.mainFeatures.exercises.badge'),
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: <Gamepad2 className="w-10 h-10" />,
      title: t('home.mainFeatures.defi.title'),
      desc: t('home.mainFeatures.defi.desc'),
      href: '/defi',
      badge: t('home.mainFeatures.defi.badge'),
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: <Trophy className="w-10 h-10" />,
      title: t('home.mainFeatures.challenge.title'),
      desc: t('home.mainFeatures.challenge.desc'),
      href: '/challenge',
      badge: t('home.mainFeatures.challenge.badge'),
      color: 'from-yellow-600 to-orange-600'
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: t('home.mainFeatures.visualizations.title'),
      desc: t('home.mainFeatures.visualizations.desc'),
      href: '/visualizations',
      badge: t('home.mainFeatures.visualizations.badge'),
      color: 'from-indigo-600 to-purple-600'
    }
  ];

  // Fonctionnalités avancées
  const advancedFeatures = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Profils d\'Apprentissage',
      desc: '4 profils cognitifs (Visuel, Auditif, Kinesthésique, Équilibré) pour adapter les explications',
      badge: 'IA'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Système de Hints',
      desc: 'Indices progressifs avec pénalité XP. Apprenez à résoudre par vous-même',
      badge: 'PÉDAGOGIQUE'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Espace de Travail',
      desc: 'Écrivez votre démarche et recevez un feedback intelligent sur votre raisonnement',
      badge: 'INTERACTIF'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analyse d\'Erreurs',
      desc: 'Détection automatique de 10 types d\'erreurs courantes avec explications ciblées',
      badge: 'INTELLIGENT'
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: 'Graphiques Interactifs',
      desc: 'Visualisez les fonctions avec zoom, dérivée et téléchargement haute résolution',
      badge: 'PLOTLY'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Forum Communautaire',
      desc: 'Posez vos questions, partagez vos solutions et aidez les autres élèves',
      badge: 'SOCIAL'
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: 'Flashcards Intelligentes',
      desc: 'Révision espacée avec algorithme adaptatif. Mémorisez efficacement',
      badge: 'SMART'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Dashboard Parents',
      desc: 'Suivi bienveillant de la progression. Alertes intelligentes et recommandations',
      badge: 'FAMILLE'
    }
  ];

  const stats = [
    { value: '1,800+', label: t('home.stats.exercises'), icon: '📝' },
    { value: '450+', label: t('home.stats.microLessons'), icon: '📚' },
    { value: '18', label: t('home.stats.chapters'), icon: '🎯' },
    { value: '100%', label: t('home.stats.free'), icon: '✨' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      
      {/* Hero Section */}
      <section className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-xs sm:text-sm font-semibold border border-indigo-400">
              🎓 {t('home.platformBadge')}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold koundoul-text-gradient mb-4 sm:mb-6 leading-tight">
              {t('home.title')}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Link 
                to="/register"
                className="koundoul-btn-primary text-base sm:text-lg px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 shadow-2xl rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>{t('home.startButton')}</span>
              </Link>
              <Link 
                to="/exercices"
                className="koundoul-btn-secondary text-base sm:text-lg px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                <span>{t('home.seeExercises')}</span>
              </Link>
            </div>

            <p className="text-sm text-gray-400 italic">
              ✨ {t('home.freeBadge')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 px-2">
              {stats.map((stat, i) => (
                <div key={i} className="text-center transform hover:scale-105 active:scale-95 transition-transform p-2 sm:p-4 rounded-lg hover:bg-white/5">
                  <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-300 font-medium leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Matières Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.subjectsTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium px-2">
              {t('home.subjectsSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {subjects.map((subject, i) => (
              <div 
                key={i}
                className="group p-6 sm:p-8 card card-hover cursor-pointer active:scale-95 transition-all"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${subject.color} rounded-xl flex items-center justify-center text-2xl sm:text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {subject.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">{subject.name}</h3>
                <p className="text-sm sm:text-base text-secondary mb-4">{subject.topics}</p>
                <Link 
                  to="/solver"
                  className="inline-flex items-center text-primary-500 font-semibold hover:text-primary-600 active:scale-95 transition-transform text-sm sm:text-base"
                >
                  {t('home.continue')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niveaux Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.levelsTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium px-2">
              {t('home.levelsSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {levels.map((level, i) => (
              <div 
                key={i}
                className="p-6 sm:p-8 card card-hover text-center transform hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="text-5xl sm:text-6xl mb-4">{level.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">{level.name}</h3>
                <p className="text-secondary text-base sm:text-lg mb-3">{level.grade}</p>
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-semibold">
                  {level.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités Principales - 6 Cartes */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
              <span className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                FONCTIONNALITÉS PRINCIPALES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.mainFeaturesTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto px-2">
              {t('home.mainFeaturesSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {mainFeatures.map((feature, i) => (
              <Link
                key={i}
                to={feature.href}
                className="group p-5 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-300 relative overflow-hidden active:scale-95"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {feature.badge}
                  </span>
                </div>
                
                {/* Icône */}
                <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10">{feature.icon}</div>
                </div>
                
                {/* Contenu */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 text-xs sm:text-sm leading-relaxed">
                  {feature.desc}
                </p>
                
                {/* Flèche */}
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  {t('home.discover')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités Avancées - 8 Mini-Cartes */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3" />
              <span className="bg-purple-100 text-purple-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                FONCTIONNALITÉS AVANCÉES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.advancedFeaturesTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto px-2">
              {t('home.advancedFeaturesSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {advancedFeatures.map((feature, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300 active:scale-95"
              >
                {/* Badge */}
                <div className="mb-3">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                    {feature.badge}
                  </span>
                </div>
                
                {/* Icône */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                
                {/* Contenu */}
                <h4 className="text-base font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
              <Link
                to="/advanced-features"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {t('home.exploreAdvanced')}
              </Link>
          </div>
        </div>
      </section>

      {/* Section 1800 Exercices & QCM */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-400">
              📚 CONTENU PÉDAGOGIQUE COMPLET
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4 px-2">
              {t('home.exercisesSectionTitle')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-3xl mx-auto px-2">
              {t('home.exercisesSectionSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200 active:scale-95">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">📝</div>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-3 text-center">{t('home.exercisesSection.qcm.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4">
                {t('home.exercisesSection.qcm.desc')}
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.qcm.points.0')}</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.qcm.points.1')}</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.qcm.points.2')}</li>
              </ul>
            </div>

            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 active:scale-95">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">🎯</div>
              <h3 className="text-xl sm:text-2xl font-bold text-purple-600 mb-2 sm:mb-3 text-center">{t('home.exercisesSection.exercises.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4">
                {t('home.exercisesSection.exercises.desc')}
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.exercises.points.0')}</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.exercises.points.1')}</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.exercises.points.2')}</li>
              </ul>
            </div>

            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-green-200 active:scale-95 sm:col-span-2 md:col-span-1">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-center">📖</div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-2 sm:mb-3 text-center">{t('home.exercisesSection.byChapter.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4">
                {t('home.exercisesSection.byChapter.desc')}
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.byChapter.points.0')}</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.byChapter.points.1')}</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" /> {t('home.exercisesSection.byChapter.points.2')}</li>
              </ul>
            </div>
          </div>

          <div className="text-center px-2">
            <Link
              to="/exercices"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl font-bold text-sm sm:text-base md:text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              {t('home.exercisesSection.accessButton')}
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3" />
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 px-2">
              {t('home.exercisesSection.footer')}
            </p>
          </div>
        </div>
      </section>

      {/* Résolveur IA - Section Spéciale */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Gauche - Texte */}
            <div className="text-white">
              <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                🤖 INTELLIGENCE ARTIFICIELLE
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Résolveur IA avec Mode Guidé Révolutionnaire
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Résolvez vos problèmes avec l'IA la plus avancée. Le mode guidé vous accompagne étape par étape avec des indices progressifs, un espace de travail et une analyse intelligente de vos erreurs.
              </p>
              
              {/* Points clés */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">4 Profils d'Apprentissage</div>
                    <div className="text-blue-100 text-sm">Visuel, Auditif, Kinesthésique ou Équilibré - L'IA s'adapte à vous</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">Indices Progressifs</div>
                    <div className="text-blue-100 text-sm">3 niveaux d'aide pour vous guider sans tout révéler</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">Analyse d'Erreurs</div>
                    <div className="text-blue-100 text-sm">Détection automatique de 10 types d'erreurs courantes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">Graphiques Interactifs</div>
                    <div className="text-blue-100 text-sm">Visualisez les fonctions avec Plotly.js</div>
                  </div>
                </div>
              </div>
              
              <Link
                to="/solver"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <Brain className="h-6 w-6 mr-2" />
                Essayer le Résolveur IA
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
            
            {/* Droite - Visuel */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  {/* Profils */}
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                    <Eye className="h-8 w-8 text-blue-300" />
                    <div>
                      <div className="font-bold text-white">Profil Visuel</div>
                      <div className="text-blue-100 text-sm">Schémas et graphiques</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                    <Headphones className="h-8 w-8 text-purple-300" />
                    <div>
                      <div className="font-bold text-white">Profil Auditif</div>
                      <div className="text-blue-100 text-sm">Explications verbales</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                    <Hand className="h-8 w-8 text-green-300" />
                    <div>
                      <div className="font-bold text-white">Profil Kinesthésique</div>
                      <div className="text-blue-100 text-sm">Pratique et action</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                    <Scale className="h-8 w-8 text-yellow-300" />
                    <div>
                      <div className="font-bold text-white">Profil Équilibré</div>
                      <div className="text-blue-100 text-sm">Combinaison adaptative</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.featuresTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium px-2">
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="flex gap-3 sm:gap-4 p-5 sm:p-6 card-gradient text-white hover:shadow-xl transition-all active:scale-95 rounded-xl"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white bg-opacity-20 text-white rounded-lg flex items-center justify-center">
                  <div className="text-xl sm:text-2xl md:text-3xl">{feature.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-white text-opacity-90">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthode Pédagogique */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.methodTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium px-2">
              {t('home.methodSubtitle')}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {[
              { step: '1', title: 'Comprendre', desc: 'Explications claires des concepts fondamentaux avec 450 micro-leçons', icon: <BookOpen className="w-5 h-5" /> },
              { step: '2', title: 'Pratiquer', desc: 'Exercices progressifs avec corrections détaillées (1800 exercices)', icon: <Target className="w-5 h-5" /> },
              { step: '3', title: 'Maîtriser', desc: 'Tests et quiz pour valider vos connaissances avec feedback immédiat', icon: <Trophy className="w-5 h-5" /> },
              { step: '4', title: 'Progresser', desc: 'Suivi personnalisé avec dashboard, badges et recommandations IA', icon: <TrendingUp className="w-5 h-5" /> }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 active:scale-95">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5">{item.icon}</span>
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
                </div>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-2 sm:mr-3" />
              <span className="bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                ILS ONT RÉUSSI AVEC KOUNDOUL
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              {t('home.testimonialsTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium px-2">
              {t('home.testimonialsSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                name: 'Marie L.',
                level: 'Terminale S',
                rating: 5,
                text: 'Le résolveur IA avec le mode guidé m\'a sauvé la vie ! Les indices progressifs m\'ont appris à réfléchir par moi-même. J\'ai gagné 3 points en maths !',
                avatar: 'M'
              },
              {
                name: 'Lucas D.',
                level: 'Première STI2D',
                rating: 5,
                text: 'Les 1800 exercices corrigés sont une mine d\'or. Chaque correction est détaillée, c\'est comme avoir un prof particulier 24/7. Les micro-leçons sont parfaites pour réviser.',
                avatar: 'L'
              },
              {
                name: 'Sarah K.',
                level: 'Seconde',
                rating: 5,
                text: 'Le profil d\'apprentissage visuel change tout ! Les graphiques interactifs m\'aident vraiment à comprendre les fonctions. Et le dashboard parents rassure mes parents 😊',
                avatar: 'S'
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 sm:p-6 border-2 border-blue-200 hover:border-blue-400 transition-all active:scale-95">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Texte */}
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Auteur */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base text-gray-900 truncate">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{testimonial.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 card-gradient my-12 sm:my-16 md:my-20 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 md:mx-0">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-2">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white text-opacity-90 px-2">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link 
              to="/register"
              className="btn-accent text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold active:scale-95 transition-all"
            >
              {t('home.ctaButtons.createAccount')}
            </Link>
            <Link 
              to="/login"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white bg-opacity-20 text-white rounded-xl font-semibold hover:bg-opacity-30 transition-all border border-white border-opacity-30 active:scale-95 text-base sm:text-lg"
            >
              {t('home.ctaButtons.login')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}