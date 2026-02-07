/**
 * 📊 NewDashboard - Dashboard gamifié moderne
 * Design mobile-first avec streak counter et stats
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Flame, 
  Star, 
  TrendingUp, 
  Target,
  Brain,
  Trophy,
  BookOpen,
  Zap,
  Award,
  Clock,
  Activity,
  ChevronRight,
  Crown,
  Rocket
} from 'lucide-react'
import api from '../services/api'

const NewDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.dashboard.get()
      setDashboard(response.data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Greeting dynamique
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Erreur de chargement</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  const { profile, stats } = dashboard
  const streak = stats?.streak || 7
  const dailyGoal = 5 // Objectif quotidien
  const dailyProgress = 3 // Progression du jour

  const statCards = [
    {
      icon: <Star className="w-5 h-5 text-blue-400" />,
      value: profile?.xp || 2450,
      label: 'XP Total',
      progress: 70,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      value: `Niveau ${profile?.level || 5}`,
      label: 'Niveau Actuel',
      progress: (profile?.xp / profile?.nextLevelXp) * 100 || 65,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Target className="w-5 h-5 text-green-400" />,
      value: stats?.lessonsCompleted || 42,
      label: 'Exercices',
      progress: 85,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Award className="w-5 h-5 text-amber-400" />,
      value: `${stats?.successRate || 87}%`,
      label: 'Score Moyen',
      progress: stats?.successRate || 87,
      gradient: 'from-amber-500 to-orange-500'
    }
  ]

  const quickActions = [
    {
      name: 'Résolveur IA',
      href: '/solver',
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-blue-500 to-purple-500',
      badge: 'Populaire'
    },
    {
      name: 'Défi',
      href: '/challenge',
      icon: <Trophy className="w-6 h-6" />,
      gradient: 'from-amber-500 to-orange-500',
      badge: 'Nouveau'
    },
    {
      name: 'Exercices',
      href: '/exercices',
      icon: <BookOpen className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Quiz',
      href: '/quiz',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-pink-500 to-purple-500'
    }
  ]

  const recentActivity = [
    { title: 'Exercice de Mathématiques', subject: 'Maths', xp: 50, icon: '📐' },
    { title: 'Quiz de Physique', subject: 'Physique', xp: 30, icon: '⚛️' },
    { title: 'Micro-leçon Chimie', subject: 'Chimie', xp: 20, icon: '🧪' },
    { title: 'Défi terminé', subject: 'Général', xp: 100, icon: '🏆' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header avec Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {profile?.firstName || profile?.username || 'Élève'}
            </span> 👋
          </h1>
          <p className="text-gray-400">Prêt à continuer ta progression ?</p>
        </div>

        {/* Streak Card Proéminente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 mb-6 shadow-2xl shadow-orange-500/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Flame className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                  {streak} Jours
                </div>
                <div className="text-sm text-white/90">Série en cours ! Continue 🚀</div>
              </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/90 font-medium">Objectif quotidien</span>
                <span className="text-sm text-white font-bold">{dailyProgress}/{dailyGoal}</span>
              </div>
              <div className="w-full sm:w-48 h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-400 mb-3">{stat.label}</div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-400" />
            Actions Rapides
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group`}
              >
                {action.badge && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-xs font-bold text-white">
                    {action.badge}
                  </div>
                )}
                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{action.icon}</div>
                </div>
                <div className="font-bold text-sm sm:text-base">{action.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Colonne principale - Activité récente + Recommandations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Activité Récente */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Activité Récente
              </h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    <div className="text-3xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{activity.title}</div>
                      <div className="text-xs text-gray-400">{activity.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-400">+{activity.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandations IA */}
            {dashboard.recommendations && dashboard.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-pink-400" />
                  Recommandations IA
                </h2>
                <div className="space-y-3">
                  {dashboard.recommendations.slice(0, 3).map((rec, index) => (
                    <Link
                      key={index}
                      to={rec.action}
                      className="block p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{rec.icon}</div>
                          <div>
                            <div className="font-semibold group-hover:text-purple-400 transition-colors">
                              {rec.title}
                            </div>
                            <div className="text-xs text-gray-400">{rec.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Badges + Stats */}
          <div className="space-y-6">
            
            {/* Badges Collection */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Badges
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl"
                  >
                    🏆
                  </div>
                ))}
              </div>
              <Link
                to="/badges"
                className="block text-center text-sm text-purple-400 font-semibold hover:text-purple-300 transition-colors"
              >
                Voir tous les badges →
              </Link>
            </div>

            {/* Temps d'étude */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-400" />
                Temps d'étude
              </h2>
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {stats?.totalTimeSpent || '2h 30'}
              </div>
              <div className="text-sm text-gray-400">Cette semaine</div>
            </div>

            {/* Lien Profil */}
            <Link
              to="/profile"
              className="block bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-center font-bold hover:scale-105 transition-all duration-300"
            >
              Voir mon Profil Complet
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewDashboard

