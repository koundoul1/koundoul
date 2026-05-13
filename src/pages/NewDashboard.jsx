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
  Play, BookMarked, BarChart3, Lock
} from 'lucide-react'
import api from '../services/api'
import useAiQuota from '../hooks/useAiQuota'

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
  const [promoDismissed, setPromoDismissed] = useState(false)
  const [referralCode, setReferralCode] = useState(null)
  const aiQuota = useAiQuota()
  const isFreeUser = !aiQuota.quota?.plan || aiQuota.quota?.plan === 'FREE' || aiQuota.quota?.plan === 'Gratuit'

  useEffect(() => {
    fetchDashboard()
    api.referral.getCode().then(r => {
      if (r.success) setReferralCode(r.data)
    }).catch(() => {})
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

        {/* Premium 24h Promo Banner — free users only */}
        {isFreeUser && !promoDismissed && (
          <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-purple-600/90 to-pink-600/90 border border-purple-500/30">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
            <button onClick={() => setPromoDismissed(true)} className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/20 text-white/60 hover:text-white flex items-center justify-center text-xs">&times;</button>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-white font-bold text-base sm:text-lg">
                  Premium 24h des 125 FCFA
                </h3>
                <p className="text-white/80 text-sm mt-0.5">
                  Teste toutes les fonctionnalites et debloque 20 appels IA/jour
                </p>
              </div>
              <button
                onClick={() => navigate('/subscriptions?period=daily')}
                className="flex-shrink-0 px-5 py-2.5 bg-white text-purple-700 font-bold rounded-xl text-sm hover:bg-white/90 transition-all shadow-lg"
              >
                Essayer maintenant
              </button>
            </div>
          </div>
        )}

        {/* Referral Share Card */}
        {referralCode && (
          <div className="k-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-lg">🎁</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white font-bold text-sm">Invite un ami, recevez Premium 24h gratuit !</p>
              <p className="text-gray-400 text-xs mt-0.5">Ton ami et toi recevez 24h premium a l&apos;inscription</p>
            </div>
            <button
              onClick={() => {
                const msg = `Rejoins-moi sur Koundoul ! Inscris-toi avec mon code et on recoit tous les deux Premium 24h gratuit 🎁\n\n${referralCode.shareUrl}`
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
              }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.643-1.216A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.753.722.735-2.686-.278-.442A9.776 9.776 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12s-4.4 9.818-9.818 9.818z"/></svg>
              Inviter via WhatsApp
            </button>
          </div>
        )}

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

        {/* Advanced Stats — Premium only */}
        <AdvancedStatsSection />
      </div>
    </div>
  )
}

// ── Advanced Stats (Premium) ──────────────────────────────────────────

function AdvancedStatsSection() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.dashboard.getAdvancedStats()
        setData(res.data || res)
      } catch (e) { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null

  // Locked for free users — show upsell card
  if (!data || data.locked) {
    return (
      <div className="mt-8">
        <div className="k-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-kprimary/5 to-ksecondary/5" />
          <div className="relative text-center py-4">
            <BarChart3 className="w-10 h-10 text-kprimary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Statistiques Avancees</h3>
            <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
              Progression sur 30 jours, scores par matiere, temps d&apos;etude detaille, et plus encore.
            </p>
            <Link
              to="/subscriptions"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-kprimary to-ksecondary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Lock className="w-4 h-4" />
              Debloquer avec Premium
            </Link>
          </div>
        </div>
      </div>
    )
  }

  var dailyActivity = data.dailyActivity || []
  var xpBySubject = data.xpBySubject || []
  var weeklyStudyTime = data.weeklyStudyTime || []
  var flashcardStats = data.flashcardStats || {}
  var quizHistory = data.quizHistory || []

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-kprimary" />
        Statistiques Avancees
        <span className="px-2 py-0.5 text-[10px] font-bold bg-kprimary/20 text-kprimary rounded-full">{data.plan}</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Activity Chart (30 days) */}
        <div className="k-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Activite sur 30 jours</h3>
          {dailyActivity.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">Pas encore de donnees</p>
          ) : (
            <div className="flex items-end gap-0.5 h-24">
              {dailyActivity.map(function(d, i) {
                var maxCount = Math.max.apply(null, dailyActivity.map(function(x) { return x.count; })) || 1
                var pct = (d.count / maxCount) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-kprimary/60 rounded-t" style={{ height: Math.max(pct, 4) + '%' }} title={d.date + ': ' + d.count + ' activites'} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* XP by Subject */}
        <div className="k-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">XP par matiere</h3>
          {xpBySubject.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">Complete des lecons pour voir tes stats</p>
          ) : (
            <div className="space-y-3">
              {xpBySubject.map(function(s, i) {
                var maxXp = Math.max.apply(null, xpBySubject.map(function(x) { return x.estimatedXp; })) || 1
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 font-medium">{s.subject}</span>
                      <span className="text-yellow-400 font-bold">{s.estimatedXp} XP</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full">
                      <div className="h-2 bg-gradient-to-r from-kprimary to-ksecondary rounded-full" style={{ width: ((s.estimatedXp / maxXp) * 100) + '%' }} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{s.lessonsCompleted} lecons, score moyen {s.avgScore || 0}%</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Weekly Study Time */}
        <div className="k-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Temps d&apos;etude hebdomadaire</h3>
          {weeklyStudyTime.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">Pas encore de donnees</p>
          ) : (
            <div className="space-y-2">
              {weeklyStudyTime.map(function(w, i) {
                var weekLabel = new Date(w.week).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">{weekLabel}</span>
                    <div className="flex-1 h-3 bg-white/10 rounded-full">
                      <div className="h-3 bg-emerald-500 rounded-full" style={{ width: Math.min((w.totalMinutes / 300) * 100, 100) + '%' }} />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">{w.totalMinutes} min</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Flashcards + AI Usage */}
        <div className="k-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Flashcards & IA</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{flashcardStats.mastered || 0}</p>
              <p className="text-[10px] text-gray-500">Maitrisees</p>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-400">{flashcardStats.learning || 0}</p>
              <p className="text-[10px] text-gray-500">En cours</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-400">{flashcardStats.newCards || 0}</p>
              <p className="text-[10px] text-gray-500">Nouvelles</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-purple-400">{data.aiUsageMonth || 0}</p>
              <p className="text-[10px] text-gray-500">Appels IA ce mois</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewDashboard
