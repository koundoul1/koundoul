/**
 * Page d'accueil Koundoul — Landing page complete
 * Sections: Hero, Stats, 10 Modules, Solver Demo, Coach Demo,
 *           Matieres, Comment ca marche, CTA final, Footer
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Target,
  ArrowRight,
  Flame,
  BookOpen,
  Brain,
  Trophy,
  Award,
  Globe,
  Swords,
  HelpCircle,
  GraduationCap,
  Users,
  MessageCircle,
  Layers,
  Sparkles,
  Send,
  ChevronRight,
  CheckCircle
} from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const SOLVER_SUBJECTS = ['math', 'physics', 'chemistry']
const SUBJECT_COLORS = {
  math: { gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', emoji: '📐' },
  physics: { gradient: 'from-purple-500 to-pink-600', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', emoji: '⚛️' },
  chemistry: { gradient: 'from-orange-500 to-red-600', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', emoji: '🧪' },
}

const NewHome = () => {
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [solverTab, setSolverTab] = useState('math')

  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0)
    const [started, setStarted] = useState(false)
    useEffect(() => {
      if (!started) return
      const num = parseInt(String(end).replace(/\D/g, ''), 10)
      if (!num) { setCount(end); return }
      let start = 0
      const step = Math.ceil(num / (duration / 30))
      const timer = setInterval(() => {
        start += step
        if (start >= num) { setCount(end); clearInterval(timer) }
        else setCount(String(end).replace(/\d+/, String(start)))
      }, 30)
      return () => clearInterval(timer)
    }, [started])
    return [count, setStarted]
  }

  // Intersection observer for counter animation
  const [statsRef, setStatsRef] = useState(null)
  const [countersStarted, setCountersStarted] = useState(false)
  useEffect(() => {
    if (!statsRef || countersStarted) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setCountersStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(statsRef)
    return () => obs.disconnect()
  }, [statsRef])

  const modules = [
    { key: 'solver', icon: <Brain className="w-6 h-6" />, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'coach', icon: <MessageCircle className="w-6 h-6" />, gradient: 'from-purple-500 to-pink-600' },
    { key: 'microLessons', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { key: 'exercises', icon: <Layers className="w-6 h-6" />, gradient: 'from-orange-500 to-red-600' },
    { key: 'quiz', icon: <HelpCircle className="w-6 h-6" />, gradient: 'from-cyan-500 to-blue-600' },
    { key: 'flashcards', icon: <GraduationCap className="w-6 h-6" />, gradient: 'from-yellow-500 to-orange-600' },
    { key: 'challenge', icon: <Trophy className="w-6 h-6" />, gradient: 'from-pink-500 to-rose-600' },
    { key: 'duels', icon: <Swords className="w-6 h-6" />, gradient: 'from-red-500 to-pink-600' },
    { key: 'badges', icon: <Award className="w-6 h-6" />, gradient: 'from-amber-500 to-yellow-600' },
    { key: 'parent', icon: <Users className="w-6 h-6" />, gradient: 'from-teal-500 to-emerald-600' },
  ]

  const stats = [
    { value: '1800+', label: t('newHome.stats.exercises'), color: 'from-blue-400 to-blue-600' },
    { value: '450+', label: t('newHome.stats.microLessons'), color: 'from-purple-400 to-purple-600' },
    { value: '18', label: t('newHome.stats.chapters'), color: 'from-pink-400 to-pink-600' },
    { value: '3', label: t('newHome.stats.subjects'), color: 'from-emerald-400 to-emerald-600' },
  ]

  const subjects = [
    { key: 'math', emoji: '📐', gradient: 'from-blue-500 to-cyan-500' },
    { key: 'physics', emoji: '⚛️', gradient: 'from-purple-500 to-pink-500' },
    { key: 'chemistry', emoji: '🧪', gradient: 'from-pink-500 to-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* ════════ HERO ════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 pb-24 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold">{t('newHome.platformBadge')}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('newHome.title')}
            </span>
            <br />
            <span className="text-white">{t('newHome.titleWith')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('newHome.subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              <Zap className="w-5 h-5" />
              {t('newHome.startButton')}
            </Link>
            <a
              href="#modules"
              className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              {t('newHome.seeExercises')}
            </a>
          </div>

          {/* Stats */}
          <div ref={setStatsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="bg-gray-800/60 backdrop-blur rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 transition-all">
                <div className={`text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-1`}>
                  {countersStarted ? s.value : '0'}
                </div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 10 MODULES ════════ */}
      <section id="modules" className="py-20 px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('newHome.modules.title')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg">{t('newHome.modules.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {modules.map((m) => (
              <div
                key={m.key}
                className="group bg-gray-800/50 rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${m.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  {m.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-sm">{t(`newHome.modules.${m.key}.title`)}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  {t(`newHome.modules.${m.key}.desc`)}
                </p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  {t(`newHome.modules.${m.key}.badge`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SOLVER DEMO — 3 MATIERES ════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t('newHome.solverDemo.title')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg">{t('newHome.solverDemo.subtitle')}</p>
          </div>

          {/* Tab selector */}
          <div className="flex justify-center gap-2 mb-8">
            {SOLVER_SUBJECTS.map((sub) => {
              const c = SUBJECT_COLORS[sub]
              const active = solverTab === sub
              return (
                <button
                  key={sub}
                  onClick={() => setSolverTab(sub)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    active
                      ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg scale-105`
                      : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60'
                  }`}
                >
                  <span>{c.emoji}</span>
                  {t(`newHome.solverDemo.tab.${sub}`)}
                </button>
              )
            })}
          </div>

          {/* Demo card */}
          {(() => {
            const c = SUBJECT_COLORS[solverTab]
            return (
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Input side */}
                <div className={`bg-gray-800/60 rounded-2xl p-6 border ${c.border}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-gray-500">Solver</span>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                      {t(`newHome.solverDemo.${solverTab}.badge`)}
                    </span>
                  </div>
                  <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700 mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{t(`newHome.solverDemo.${solverTab}.input`)}</p>
                  </div>
                  <button className={`w-full py-3 bg-gradient-to-r ${c.gradient} rounded-xl font-bold flex items-center justify-center gap-2`}>
                    <Send className="w-4 h-4" />
                    Resoudre
                  </button>
                </div>

                {/* Output side */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-300">Solution Koundoul</span>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-300 mb-1">{t(`newHome.solverDemo.${solverTab}.step1`)}</p>
                      <div className="bg-gray-900/80 rounded-lg px-4 py-2 overflow-x-auto">
                        <span className={`${c.text} font-mono text-xs sm:text-sm whitespace-nowrap`}>
                          {t(`newHome.solverDemo.${solverTab}.step1math`)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-300 mb-1">{t(`newHome.solverDemo.${solverTab}.step2`)}</p>
                      <div className="bg-gray-900/80 rounded-lg px-4 py-2 overflow-x-auto">
                        <span className={`${c.text} font-mono text-xs sm:text-sm whitespace-nowrap`}>
                          {t(`newHome.solverDemo.${solverTab}.step2math`)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <p className="text-green-300 font-semibold text-sm">{t(`newHome.solverDemo.${solverTab}.step3`)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* CTA under demo */}
          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-purple-400 font-semibold hover:text-purple-300 transition-colors"
            >
              Essayer le Resolveur gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ COACH DEMO ════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('newHome.coachDemo.title')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg">{t('newHome.coachDemo.subtitle')}</p>
          </div>

          {/* Chat mockup */}
          <div className="bg-gray-800/60 rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Coach Koundoul</p>
                <p className="text-xs text-green-400">En ligne</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Q1 */}
              <div className="flex justify-end">
                <div className="bg-blue-600/30 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] border border-blue-500/20">
                  <p className="text-sm">{t('newHome.coachDemo.q1')}</p>
                </div>
              </div>
              {/* A1 */}
              <div className="flex justify-start">
                <div className="bg-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] border border-white/10">
                  <p className="text-sm text-gray-200">{t('newHome.coachDemo.a1')}</p>
                </div>
              </div>
              {/* Q2 */}
              <div className="flex justify-end">
                <div className="bg-blue-600/30 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] border border-blue-500/20">
                  <p className="text-sm">{t('newHome.coachDemo.q2')}</p>
                </div>
              </div>
              {/* A2 */}
              <div className="flex justify-start">
                <div className="bg-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] border border-white/10">
                  <p className="text-sm text-gray-200">{t('newHome.coachDemo.a2')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ MATIERES ════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('newHome.subjects.title')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg">{t('newHome.subjects.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((s) => (
              <Link
                key={s.key}
                to="/register"
                className="bg-gray-800/50 rounded-3xl p-8 border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-5xl mb-4">{s.emoji}</div>
                <h3 className="text-2xl font-black mb-2 group-hover:text-purple-400 transition-colors">
                  {t(`newHome.subjects.${s.key}.name`)}
                </h3>
                <p className="text-gray-400 mb-4">{t(`newHome.subjects.${s.key}.topics`)}</p>
                <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>{t('newHome.subjects.explore')}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ COMMENT CA MARCHE ════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('newHome.howItWorks.title')}
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                  {n}
                </div>
                <h3 className="text-lg font-bold mb-2">{t(`newHome.howItWorks.step${n}`)}</h3>
                <p className="text-gray-400 text-sm">{t(`newHome.howItWorks.step${n}desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA FINAL ════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-pink-500/20 animate-pulse" />
            <div className="relative z-10">
              <Flame className="w-14 h-14 mx-auto mb-5 text-yellow-400" />
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                {t('newHome.finalCta.title')}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                {t('newHome.finalCta.subtitle')}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-purple-600 rounded-2xl font-black text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <Zap className="w-6 h-6" />
                {t('newHome.finalCta.button')}
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">{t('newHome.footer')}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Confidentialite</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default NewHome
