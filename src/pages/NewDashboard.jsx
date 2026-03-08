/**
 * Dashboard élève complet — données réelles depuis l'API
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import {
  Flame, Star, TrendingUp, Target, Brain, Trophy, BookOpen,
  Zap, Award, Clock, Activity, ChevronRight, Crown, Rocket,
  Play, BookMarked
} from 'lucide-react'
import api from '../services/api'

const SUBJECT_ICONS = { 'Mathématiques': '📐', 'Physique': '⚛️', 'Chimie': '🧪' }
const SUBJECT_COLORS = {
  'Mathématiques': 'from-blue-500 to-cyan-500',
  'Physique': 'from-green-500 to-emerald-500',
  'Chimie': 'from-purple-500 to-pink-500'
}

const NewDashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.dashboard.get()
      const data = response.data?.data || response.data || response
      setDashboard(data)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.greeting.morning')
    if (hour < 18) return t('dashboard.greeting.afternoon')
    return t('dashboard.greeting.evening')
  }

  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0 min'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m} min`
    return `${h}h ${m > 0 ? m + 'min' : ''}`
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
          <p className="text-gray-400 mb-4">{t('dashboard.loadingError')}</p>
          <button onClick={fetchDashboard} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white">
            {t('actions.retry')}
          </button>
        </div>
      </div>
    )
  }

  const { profile, stats, subjectProgress, badges, recentActivity, recommendations } = dashboard

  const xp = profile?.xp || 0
  const level = profile?.level || 1
  const xpInLevel = profile?.xpInCurrentLevel || 0
  const xpForNext = profile?.xpForNextLevel || 1000
  const streak = profile?.streak || 0
  const lessonsCompleted = stats?.lessonsCompleted || 0
  const totalLessons = stats?.totalLessons || 395
  const avgScore = stats?.averageScore || 0

  const statCards = [
    {
      icon: <Star className="w-5 h-5 text-blue-400" />,
      value: xp.toLocaleString(),
      label: 'XP Total',
      progress: Math.min(100, (xpInLevel / xpForNext) * 100),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      value: `${t('dashboard.level')} ${level}`,
      label: t('dashboard.currentLevel'),
      progress: (xpInLevel / xpForNext) * 100,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Target className="w-5 h-5 text-green-400" />,
      value: `${lessonsCompleted}/${totalLessons}`,
      label: t('dashboard.lessons'),
      progress: totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Award className="w-5 h-5 text-amber-400" />,
      value: `${avgScore}%`,
      label: t('dashboard.avgScore'),
      progress: avgScore,
      gradient: 'from-amber-500 to-orange-500'
    }
  ]

  const quickActions = [
    { name: t('dashboard.actions.solver'), href: '/solver', icon: <Brain className="w-6 h-6" />, gradient: 'from-blue-500 to-purple-500' },
    { name: t('dashboard.actions.challenge'), href: '/challenge', icon: <Trophy className="w-6 h-6" />, gradient: 'from-amber-500 to-orange-500' },
    { name: t('dashboard.actions.microLessons'), href: '/micro-lessons', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Quiz', href: '/quiz', icon: <Zap className="w-6 h-6" />, gradient: 'from-pink-500 to-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {profile?.firstName || profile?.username || t('dashboard.student')}
            </span> 👋
          </h1>
          <p className="text-gray-400">{t('dashboard.subtitle')}</p>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 mb-6 shadow-2xl shadow-orange-500/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Flame className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                  {streak} {t('dashboard.days')}
                </div>
                <div className="text-sm text-white/90">
                  {streak > 0 ? t('dashboard.streakActive') : t('dashboard.streakStart')}
                </div>
              </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/90 font-medium">{t('dashboard.levelProgress')}</span>
                <span className="text-sm text-white font-bold">{xpInLevel}/{xpForNext} XP</span>
              </div>
              <div className="w-full sm:w-48 h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(xpInLevel / xpForNext) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-400 mb-3">{stat.label}</div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, stat.progress)}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Subject Progress */}
        {subjectProgress && subjectProgress.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10 mb-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-blue-400" />
              {t('dashboard.subjectProgress')}
            </h2>
            <div className="space-y-4">
              {subjectProgress.map((sp) => (
                <div key={sp.name} className="flex items-center gap-4">
                  <span className="text-2xl w-8">{SUBJECT_ICONS[sp.name] || '📖'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-sm">{t(`common.subjects.${sp.name}`) || sp.name}</span>
                      <span className="text-xs text-gray-400">{sp.completed}/{sp.total} ({sp.percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${SUBJECT_COLORS[sp.name] || 'from-gray-500 to-gray-400'} rounded-full transition-all duration-700`} style={{ width: `${sp.percentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sp.mastery === 'advanced' && t('dashboard.mastery.advanced')}
                      {sp.mastery === 'intermediate' && t('dashboard.mastery.intermediate')}
                      {sp.mastery === 'beginner' && t('dashboard.mastery.beginner')}
                      {sp.mastery === 'none' && t('dashboard.mastery.none')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-400" />
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.href} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group">
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

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                {t('dashboard.recentActivity')}
              </h2>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900 transition-colors group cursor-pointer" onClick={() => navigate(`/micro-lessons/${item.lessonId}`)}>
                      <div className="text-3xl">{SUBJECT_ICONS[item.subject] || '📖'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.title}</div>
                        <div className="text-xs text-gray-400">{t(`common.subjects.${item.subject}`) || item.subject}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.score !== null && <span className="text-xs text-green-400">{item.score}%</span>}
                        {!item.completed && (
                          <button className="px-3 py-1 bg-purple-600 rounded-lg text-xs font-bold hover:bg-purple-500 transition-colors flex items-center gap-1">
                            <Play className="w-3 h-3" /> {t('dashboard.resume')}
                          </button>
                        )}
                        {item.completed && <span className="text-xs text-green-400">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('dashboard.noActivity')}</p>
                  <Link to="/micro-lessons" className="mt-3 inline-block px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold">
                    {t('dashboard.startLearning')}
                  </Link>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-pink-400" />
                  {t('dashboard.recommendations')}
                </h2>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <Link key={i} to={`/micro-lessons/${rec.lessonId}`} className="block p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{SUBJECT_ICONS[rec.subject] || '📖'}</div>
                          <div>
                            <div className="font-semibold text-sm group-hover:text-purple-400 transition-colors truncate">{rec.title}</div>
                            <div className="text-xs text-gray-400">
                              {t(`common.subjects.${rec.subject}`) || rec.subject} • {t(`common.levels.${rec.level}`) || rec.level}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Badges */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                {t('dashboard.badges')} ({badges?.unlocked || 0}/{badges?.total || 15})
              </h2>

              {badges?.recent && badges.recent.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {badges.recent.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                      <span className="text-2xl">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{b.name}</div>
                        <div className="text-xs text-gray-500">{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">{t('dashboard.noBadgesYet')}</p>
              )}

              {/* Next badge */}
              {badges?.next && (
                <div className="p-3 bg-gray-900/50 rounded-xl border border-dashed border-yellow-500/30 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl opacity-50">{badges.next.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-yellow-400">{t('dashboard.nextBadge')}</div>
                      <div className="text-xs text-gray-400">{badges.next.name}</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all" style={{ width: `${badges.next.target > 0 ? (badges.next.current / badges.next.target) * 100 : 0}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">{badges.next.current}/{badges.next.target}</div>
                </div>
              )}

              <Link to="/badges" className="block text-center text-sm text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                {t('dashboard.viewAllBadges')} →
              </Link>
            </div>

            {/* Study Time */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-400" />
                {t('dashboard.studyTime')}
              </h2>
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {formatTime(stats?.totalStudyTimeMinutes || 0)}
              </div>
              <div className="text-sm text-gray-400">{t('dashboard.totalEstimated')}</div>
            </div>

            {/* Profile Link */}
            <Link to="/profile" className="block bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-center font-bold hover:scale-105 transition-all duration-300">
              {t('dashboard.viewProfile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewDashboard
