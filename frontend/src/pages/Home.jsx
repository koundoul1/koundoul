import { Link } from 'react-router-dom';
import { 
  BookOpen, Target, TrendingUp, Award, Users, Zap, CheckCircle, ArrowRight, 
  Calculator, Brain, Globe, Lightbulb, Sparkles, Rocket, Shield, Clock, 
  MessageSquare, BarChart3, Gamepad2, Trophy, Star, Flame, Eye, Headphones, 
  Hand, Scale, FileText, Microscope, FlaskConical, PieChart
} from 'lucide-react';

export default function Home() {
  const subjects = [
    { name: 'Mathématiques', icon: '📐', color: 'bg-primary-500', topics: 'Algèbre, Géométrie, Analyse' },
    { name: 'Physique', icon: '⚛️', color: 'bg-primary-400', topics: 'Mécanique, Électricité, Optique' },
    { name: 'Chimie', icon: '🧪', color: 'bg-accent-400', topics: 'Atomes, Réactions, Organique' }
  ];

  const levels = [
    { name: 'Seconde', grade: '2nde', difficulty: 'Fondamentaux', icon: '📘' },
    { name: 'Première', grade: '1ère', difficulty: 'Approfondissement', icon: '📗' },
    { name: 'Terminale', grade: 'Tle', difficulty: 'Maîtrise & Bac', icon: '📕' }
  ];

  const features = [
    { 
      icon: <Target className="w-8 h-8" />, 
      title: 'Parcours Personnalisé',
      desc: 'Progression adaptée à votre niveau et vos objectifs académiques'
    },
    { 
      icon: <BookOpen className="w-8 h-8" />, 
      title: 'Exercices Guidés',
      desc: 'Solutions détaillées étape par étape pour comprendre chaque concept'
    },
    { 
      icon: <TrendingUp className="w-8 h-8" />, 
      title: 'Suivi de Progression',
      desc: 'Visualisez vos progrès et identifiez les domaines à améliorer'
    },
    { 
      icon: <Award className="w-8 h-8" />, 
      title: 'Badges & Récompenses',
      desc: 'Gagnez des points XP et débloquez des badges en progressant'
    }
  ];

  // Fonctionnalités principales
  const mainFeatures = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: 'Résolveur IA Intelligent',
      desc: 'Résolvez vos problèmes avec l\'IA. Mode guidé avec indices progressifs et espace de travail personnalisé',
      href: '/solver',
      badge: 'RÉVOLUTIONNAIRE',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: '450 Micro-Leçons',
      desc: 'Capsules de 5-10 min pour maîtriser tous les concepts. Structurées, détaillées et progressives',
      href: '/micro-lessons',
      badge: 'COMPLET',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: '1800 Exercices Corrigés',
      desc: '900 QCM + 900 Exercices avec corrections détaillées. Tous les chapitres du programme',
      href: '/exercices',
      badge: 'EXHAUSTIF',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: <Gamepad2 className="w-10 h-10" />,
      title: 'Mode Défi',
      desc: 'Exercices adaptatifs avec validation flexible. Entraînez-vous sans limite !',
      href: '/defi',
      badge: 'ILLIMITÉ',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: <Trophy className="w-10 h-10" />,
      title: 'Challenge Quotidien',
      desc: 'Défiez-vous chaque jour avec des problèmes sélectionnés. Gagnez des badges et montez de niveau',
      href: '/challenge',
      badge: 'MOTIVANT',
      color: 'from-yellow-600 to-orange-600'
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: 'Visualisations 3D',
      desc: 'Explorez les concepts en 3D et en temps réel. Molécules, vecteurs, graphiques interactifs',
      href: '/visualizations',
      badge: 'IMMERSIF',
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
    { value: '1,800+', label: 'Exercices Corrigés', icon: '📝' },
    { value: '450+', label: 'Micro-Leçons', icon: '📚' },
    { value: '18', label: 'Chapitres Couverts', icon: '🎯' },
    { value: '100%', label: 'Gratuit', icon: '✨' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      
      {/* Hero Section */}
      <section className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-400">
              🎓 Plateforme d'Apprentissage Scientifique
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold koundoul-text-gradient mb-6">
              Réussissez en Maths, Physique & Chimie
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              1800 exercices corrigés + 450 micro-leçons + Explications détaillées. 
              Progressez à votre rythme de la Seconde à la Terminale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/register"
                className="koundoul-btn-primary text-lg px-10 py-5 shadow-2xl"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Commencer Gratuitement
              </Link>
              <Link 
                to="/exercices"
                className="koundoul-btn-secondary text-lg px-10 py-5"
              >
                <Target className="w-5 h-5 inline mr-2" />
                Voir les 1800 Exercices
              </Link>
            </div>

            <p className="text-sm text-gray-400 italic">
              ✨ 100% Gratuit • Explications Détaillées • Tous les Chapitres au Programme
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, i) => (
                <div key={i} className="text-center transform hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-indigo-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Matières Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Trois Matières, Un Objectif : Votre Réussite
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Mathématiques, Physique et Chimie au programme du lycée
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {subjects.map((subject, i) => (
              <div 
                key={i}
                className="group p-8 card card-hover cursor-pointer"
              >
                <div className={`w-16 h-16 ${subject.color} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {subject.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">{subject.name}</h3>
                <p className="text-secondary mb-4">{subject.topics}</p>
                <Link 
                  to="/solver"
                  className="inline-flex items-center text-primary-500 font-semibold hover:text-primary-600"
                >
                  Commencer <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niveaux Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Pour Tous les Niveaux Lycée
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              De la Seconde à la Terminale, progressez à votre rythme
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level, i) => (
              <div 
                key={i}
                className="p-8 card card-hover text-center transform hover:scale-105 transition-transform"
              >
                <div className="text-6xl mb-4">{level.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-2">{level.name}</h3>
                <p className="text-secondary text-lg mb-3">{level.grade}</p>
                <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {level.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités Principales - 6 Cartes */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Rocket className="h-8 w-8 text-blue-600 mr-3" />
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                FONCTIONNALITÉS PRINCIPALES
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout Ce Dont Vous Avez Besoin Pour Réussir
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto">
              Une plateforme complète avec des outils pédagogiques innovants pour exceller en sciences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mainFeatures.map((feature, i) => (
              <Link
                key={i}
                to={feature.href}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-300 relative overflow-hidden"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {feature.badge}
                  </span>
                </div>
                
                {/* Icône */}
                <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                
                {/* Contenu */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {feature.desc}
                </p>
                
                {/* Flèche */}
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  Découvrir <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités Avancées - 8 Mini-Cartes */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                FONCTIONNALITÉS AVANCÉES
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Technologies de Pointe Pour Votre Apprentissage
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto">
              IA, personnalisation cognitive, analyse d'erreurs et bien plus encore
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {advancedFeatures.map((feature, i) => (
              <div
                key={i}
                className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300"
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
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Explorer Toutes les Fonctionnalités Avancées
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1800 Exercices & QCM */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-full text-sm font-semibold border border-blue-400">
              📚 CONTENU PÉDAGOGIQUE COMPLET
            </div>
            <h2 className="text-4xl font-bold text-primary mb-4">
              1 800 Exercices avec Corrections Détaillées
            </h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Entraînez-vous avec des exercices progressifs pour chaque chapitre du programme. 
              Chaque exercice inclut une correction pas à pas pour bien comprendre la méthode.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200">
              <div className="text-5xl mb-4 text-center">📝</div>
              <h3 className="text-2xl font-bold text-blue-600 mb-3 text-center">900 QCM</h3>
              <p className="text-gray-600 text-center mb-4">
                Questions à choix multiples pour vérifier votre compréhension
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Réponse justifiée</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Méthode expliquée</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Tous les chapitres</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200">
              <div className="text-5xl mb-4 text-center">🎯</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-3 text-center">900 Exercices</h3>
              <p className="text-gray-600 text-center mb-4">
                Entraînement progressif avec corrections pas à pas
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Correction détaillée</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Astuces de résolution</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Difficultés variées</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-green-200">
              <div className="text-5xl mb-4 text-center">📖</div>
              <h3 className="text-2xl font-bold text-green-600 mb-3 text-center">Par Chapitre</h3>
              <p className="text-gray-600 text-center mb-4">
                Organisé par matière, niveau et thème du programme
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Maths, Physique, Chimie</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> 2nde, 1ère, Terminale</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Révision ciblée</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/exercices"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Target className="h-6 w-6 mr-3" />
              Accéder aux 1800 Exercices
              <ArrowRight className="h-6 w-6 ml-3" />
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              📖 Programme officiel Seconde, Première et Terminale • Corrections pédagogiques
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
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Pourquoi Choisir Koundoul ?
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Une approche pédagogique complète pour votre réussite au lycée
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="flex gap-4 p-6 card-gradient text-white hover:shadow-xl transition-all"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-white bg-opacity-20 text-white rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white text-opacity-90">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthode Pédagogique */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Notre Méthode d'Apprentissage
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              4 étapes pour réussir en Maths, Physique et Chimie
            </p>
          </div>

          <div className="space-y-6">
            {[
              { step: '1', title: 'Comprendre', desc: 'Explications claires des concepts fondamentaux avec 450 micro-leçons', icon: <BookOpen className="w-5 h-5" /> },
              { step: '2', title: 'Pratiquer', desc: 'Exercices progressifs avec corrections détaillées (1800 exercices)', icon: <Target className="w-5 h-5" /> },
              { step: '3', title: 'Maîtriser', desc: 'Tests et quiz pour valider vos connaissances avec feedback immédiat', icon: <Trophy className="w-5 h-5" /> },
              { step: '4', title: 'Progresser', desc: 'Suivi personnalisé avec dashboard, badges et recommandations IA', icon: <TrendingUp className="w-5 h-5" /> }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                ILS ONT RÉUSSI AVEC KOUNDOUL
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Des Milliers d'Élèves Progressent Chaque Jour
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Découvrez comment Koundoul a transformé leur apprentissage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
              <div key={i} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Texte */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Auteur */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20 card-gradient my-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à Exceller en Sciences ?
          </h2>
          <p className="text-xl mb-8 text-white text-opacity-90">
            Rejoignez des milliers d'étudiants qui progressent chaque jour
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="btn-accent text-lg px-8 py-4"
            >
              Créer Mon Compte Gratuit
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all border border-white border-opacity-30"
            >
              Se Connecter
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}