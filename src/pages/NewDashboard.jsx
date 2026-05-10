/**
 * Dashboard élève — Premium design with violet/turquoise palette
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
  'Mathématiques': { ring: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  'Physique': { ring: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
  'Chimie': { ring: '#00D9A3', bg: 'rgba(0,217,163,0.15)' }
}

// Circular progress ring component
const CircularProgress = ({ percentage, color, size = 80, strokeWidth = 6, children }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// 7-day activity grid — uses real per-day counts from backend
const WeekActivityGrid = ({ activityData }) => {
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7 // Monday=0

  // Build a map of date string -> count
  const countMap = {}
  if (activityData) {
    for (const entry of activityData) {
      countMap[entry.date] = entry.count
    }
  }

  // Build last 7 days starting from Monday of this week
  const mondayOffset = todayDow
  const monday = new Date(today)
  monday.setDate(monday.getDate() - mondayOffset)

  return (
    <div className="flex items-center gap-2">
      {dayLabels.map((label, i) => {
        const d = new Date(monday)
        d.setDate(d.getDate() + i)
        const key = d.toISOString().slice(0, 10)
        const count = countMap[key] || 0
        const isPast = i <= todayDow

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              count > 0
                ? 'bg-gradient-to-br from-kprimary to-ksecondary text-white shadow-md shadow-kprimary/20'
                : isPast
                  ? 'bg-white/5 text-gray-600'
                  : 'bg-white/[0.02] text-gray-700'
            }`}>
              {count > 0 ? count : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const NewDashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [activityData, setActivityData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const [dashRes, actRes] = await Promise.all([
        api.dashboard.get(),
        api.dashboard.getActivity(7).catch(() => ({ data: [] }))
      ])
      const data = dashRes.data?.data || dashRes.data || dashRes
      setDashboard(data)
      setActivityData(actRes.data || [])
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kprimary"></div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{t('dashboard.loadingError')}</p>
          <button onClick={fetchDashboard} className="px-6 py-3 bg-gradient-to-r from-kprimary to-ksecondary rounded-xl font-bold text-white">
            {t('actions.retry')}
          </button>
        </div>
      </div>
    )
  }

  const { profile, stats, subjectProgress, badges, recentActivity, recommendations } = dashboard

  // Use context user for live XP/level/streak (updated by useGamification after mutations)
  const XP_PER_LEVEL = 1000
  const xp = user?.xp ?? profile?.xp ?? 0
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const xpForNext = XP_PER_LEVEL
  const streak = user?.streak ?? profile?.streak ?? 0
  const lessonsCompleted = stats?.lessonsCompleted || 0
  const totalLessons = stats?.totalLessons || 395
  const avgScore = stats?.averageScore || 0

  const quickActions = [
    { name: t('dashboard.actions.solver'), href: '/solver', icon: <Brain className="w-6 h-6" />, gradient: 'from-kprimary to-ksecondary' },
    { name: t('dashboard.actions.challenge'), href: '/challenge', icon: <Trophy className="w-6 h-6" />, gradient: 'from-amber-500 to-orange-500' },
    { name: t('dashboard.actions.microLessons'), href: '/micro-lessons', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Quiz', href: '/quiz', icon: <Zap className="w-6 h-6" />, gradient: 'from-pink-500 to-rose-500' }
  ]

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Hero Card — gradient violet→turquoise */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 bg-gradient-to-r from-kprimary to-ksecondary shadow-2xl shadow-kprimary/30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">{getGreeting()}</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">
                {profile?.firstName || profile?.username || t('dashboard.student')}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="font-bold">{streak} {t('dashboard.days')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold">{xp.toLocaleString()} XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="font-bold">{t('dashboard.level')} {level}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress percentage={(xpInLevel / xpForNext) * 100} color="#FFD700" size={90} strokeWidth={7}>
                <div className="text-center">
                  <div className="text-lg font-black text-white">{level}</div>
                  <div className="text-[11px] text-white/70 font-medium">LEVEL</div>
                </div>
              </CircularProgress>
            </div>
          </div>

          {/* XP Progress bar — gold gradient */}
          <div className="relative z-10 mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/70 font-medium">{t('dashboard.levelProgress')}</span>
              <span className="text-xs text-white font-bold">{xpInLevel}/{xpForNext} XP</span>
            </div>
            <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (xpInLevel / xpForNext) * 100)}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* 7-Day Activity Grid */}
        <div className="k-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-ksecondary" />
              {t('dashboard.recentActivity')}
            </h2>
            <span className="text-xs text-gray-500">{streak > 0 ? t('dashboard.streakActive') : t('dashboard.streakStart')}</span>
          </div>
          <WeekActivityGrid activityData={activityData} />
        </div>

        {/* Subject Progress — Circular rings */}
        {subjectProgress && subjectProgress.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {subjectProgress.map((sp) => {
              const colors = SUBJECT_COLORS[sp.name] || { ring: '#6C63FF', bg: 'rgba(108,99,255,0.15)' }
              return (
                <div key={sp.name} className="k-card k-card-glow p-5 flex flex-col items-center text-center">
                  <CircularProgress percentage={sp.percentage} color={colors.ring} size={90} strokeWidth={6}>
                    <span className="text-2xl">{SUBJECT_ICONS[sp.name] || '📖'}</span>
                  </CircularProgress>
                  <h3 className="font-bold text-sm mt-3 text-white">{t(`common.subjects.${sp.name}`) || sp.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{sp.completed}/{sp.total} ({sp.percentage}%)</p>
                  <span className="text-xs mt-1 px-2 py-0.5 rounded-full font-medium" style={{ background: colors.bg, color: colors.ring }}>
                    {sp.mastery === 'advanced' && t('dashboard.mastery.advanced')}
                    {sp.mastery === 'intermediate' && t('dashboard.mastery.intermediate')}
                    {sp.mastery === 'beginner' && t('dashboard.mastery.beginner')}
                    {sp.mastery === 'none' && t('dashboard.mastery.none')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Star className="w-5 h-5" />, value: xp.toLocaleString(), label: 'XP Total', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
            { icon: <Target className="w-5 h-5" />, value: `${lessonsCompleted}/${totalLessons}`, label: t('dashboard.lessons'), color: 'text-ksecondary', bg: 'bg-ksecondary/15' },
            { icon: <Award className="w-5 h-5" />, value: `${avgScore}%`, label: t('dashboard.avgScore'), color: 'text-kprimary', bg: 'bg-kprimary/15' },
            { icon: <Clock className="w-5 h-5" />, value: formatTime(stats?.totalStudyTimeMinutes || 0), label: t('dashboard.studyTime'), color: 'text-emerald-400', bg: 'bg-emerald-500/15' }
          ].map((stat, i) => (
            <div key={i} className="k-card p-4 sm:p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-xl sm:text-2xl font-black mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA — Continue last lesson */}
        {recommendations && recommendations.length > 0 && (
          <Link
            to={`/micro-lessons/${recommendations[0].lessonId}`}
            className="block mb-6 p-5 rounded-2xl bg-gradient-to-r from-kaccent to-orange-500 shadow-lg shadow-kaccent/30 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">{t('dashboard.resume') || 'Continuer'}</div>
                  <div className="text-sm text-white/80 truncate max-w-[200px]">{recommendations[0].title}</div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80" />
            </div>
          </Link>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-kprimary" />
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.href} className="k-card p-5 hover:scale-105 transition-transform group">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{action.icon}</div>
                </div>
                <div className="font-bold text-sm">{action.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Badges Row */}
        <div className="k-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              {t('dashboard.badges')} ({badges?.unlocked || 0}/{badges?.total || 15})
            </h2>
            <Link to="/badges" className="text-sm text-kprimary font-semibold hover:text-kprimary-300 transition-colors">
              {t('dashboard.viewAllBadges')} →
            </Link>
          </div>

          {badges?.recent && badges.recent.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {badges.recent.map((b, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-yellow-500/20 min-w-[70px] sm:min-w-[80px]">
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs font-semibold text-yellow-400 text-center leading-tight">{b.name}</span>
                </div>
              ))}
              {/* Locked badges placeholder */}
              {Array.from({ length: Math.max(0, 4 - (badges.recent?.length || 0)) }).map((_, i) => (
                <div key={`locked-${i}`} className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 min-w-[70px] sm:min-w-[80px] opacity-40">
                  <span className="text-2xl">🔒</span>
                  <span className="text-xs font-semibold text-gray-600 text-center">???</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 min-w-[70px] sm:min-w-[80px] opacity-40">
                  <span className="text-2xl">🔒</span>
                  <span className="text-xs font-semibold text-gray-600 text-center">???</span>
                </div>
              ))}
            </div>
          )}

          {badges?.next && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-dashed border-yellow-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl opacity-60">{badges.next.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-yellow-400">{t('dashboard.nextBadge')}</div>
                  <div className="text-xs text-gray-400">{badges.next.name}</div>
                </div>
                <span className="text-xs text-gray-500">{badges.next.current}/{badges.next.target}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all" style={{ width: `${badges.next.target > 0 ? (badges.next.current / badges.next.target) * 100 : 0}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column — Recent Activity */}
          <div className="lg:col-span-2">
            <div className="k-card p-5">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-ksecondary" />
                {t('dashboard.recentActivity')}
              </h2>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer group" onClick={() => navigate(`/micro-lessons/${item.lessonId}`)}>
                      <div className="text-2xl">{SUBJECT_ICONS[item.subject] || '📖'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.title}</div>
                        <div className="text-xs text-gray-500">{t(`common.subjects.${item.subject}`) || item.subject}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.score !== null && <span className="text-xs text-emerald-400 font-bold">{item.score}%</span>}
                        {!item.completed && (
                          <button className="px-3 py-1 bg-kprimary/20 text-kprimary rounded-lg text-xs font-bold hover:bg-kprimary/30 transition-colors flex items-center gap-1">
                            <Play className="w-3 h-3" /> {t('dashboard.resume')}
                          </button>
                        )}
                        {item.completed && <span className="text-emerald-400 text-sm">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('dashboard.noActivity')}</p>
                  <Link to="/micro-lessons" className="mt-3 inline-block px-4 py-2 bg-kprimary rounded-lg text-sm font-bold text-white">
                    {t('dashboard.startLearning')}
                  </Link>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 1 && (
              <div className="k-card p-5 mt-6">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-kprimary" />
                  {t('dashboard.recommendations')}
                </h2>
                <div className="space-y-2">
                  {recommendations.slice(1).map((rec, i) => (
                    <Link key={i} to={`/micro-lessons/${rec.lessonId}`} className="block p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{SUBJECT_ICONS[rec.subject] || '📖'}</div>
                          <div>
                            <div className="font-semibold text-sm group-hover:text-kprimary transition-colors truncate">{rec.title}</div>
                            <div className="text-xs text-gray-500">
                              {t(`common.subjects.${rec.subject}`) || rec.subject} • {t(`common.levels.${rec.level}`) || rec.level}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-kprimary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Time */}
            <div className="k-card p-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                {t('dashboard.studyTime')}
              </h2>
              <div className="text-3xl font-black gradient-text">
                {formatTime(stats?.totalStudyTimeMinutes || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">{t('dashboard.totalEstimated')}</div>
            </div>

            {/* Profile Link */}
            <Link to="/profile" className="block bg-gradient-to-r from-kprimary to-ksecondary rounded-2xl p-5 text-center font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-kprimary/20">
              {t('dashboard.viewProfile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewDashboard
