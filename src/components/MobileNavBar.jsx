/**
 * MobileNavBar — Bottom navigation for mobile only (<768px)
 * 4 main tabs + "Plus" hamburger that opens a drawer with all modules
 * Desktop navigation is handled by Sidebar + TopBar
 */

import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Menu,
  X,
  BarChart3,
  BookMarked,
  Dumbbell,
  Zap,
  Brain,
  BookOpenCheck,
  MessageSquare,
  Award,
  Bot,
  Lightbulb,
  Eye,
  Shield,
  CreditCard,
  Settings,
  Globe,
  Sparkles
} from 'lucide-react'

const MobileNavBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language) || languages[0] || { code: 'fr', name: 'Français', flag: '🇫🇷' }
  const [showDrawer, setShowDrawer] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setShowDrawer(false)
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // 4 main bottom tabs
  const mainTabs = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen, auth: true },
    { name: t('nav.defi') || 'Défi', href: '/challenge', icon: Trophy, auth: true },
    { name: t('nav.profile') || 'Profil', href: '/profile', icon: User, auth: true },
  ]

  const visibleTabs = mainTabs.filter(item => !item.auth || isAuthenticated)

  // All other modules for the drawer
  const drawerItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, emoji: '📊', auth: true },
    { name: t('dashboard.actions.microLessons') || 'Micro-Leçons', href: '/micro-lessons', icon: BookMarked, emoji: '🎯', auth: true },
    { name: 'Exercices', href: '/exercices', icon: Dumbbell, emoji: '🧩', auth: true },
    { name: 'Quiz', href: '/quiz', icon: Zap, emoji: '📝', auth: true },
    { name: t('dashboard.actions.solver') || 'Résolveur', href: '/solver', icon: Brain, emoji: '🤖', auth: true },
    { name: 'Défi Smart', href: '/defi', icon: Sparkles, emoji: '⚡', auth: true },
    { name: 'Flashcards', href: '/flashcards', icon: BookOpenCheck, emoji: '🃏', auth: true },
    { name: 'Forum', href: '/forum', icon: MessageSquare, emoji: '💬', auth: false },
    { name: t('dashboard.badges') || 'Badges', href: '/badges', icon: Award, emoji: '🏅', auth: true },
    { name: 'Coach Virtuel', href: '/coach', icon: Bot, emoji: '🎓', auth: true },
    { name: 'Ressources', href: '/resources', icon: Lightbulb, emoji: '📚', auth: true },
    { name: 'Visualisations', href: '/visualizations', icon: Eye, emoji: '📊', auth: true },
    { name: 'Espace Parent', href: '/parent-dashboard', icon: Shield, emoji: '👨‍👩‍👧', auth: true },
    { name: 'Abonnements', href: '/subscriptions', icon: CreditCard, emoji: '💳', auth: true },
  ]

  const visibleDrawerItems = drawerItems.filter(item => !item.auth || isAuthenticated)

  // Check if any drawer item is active (to highlight the "Plus" button)
  const isDrawerItemActive = visibleDrawerItems.some(item => isActive(item.href))

  return (
    <>
      {/* Mobile Bottom Navigation — hidden on desktop (md+) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-[#0F0F1E]/95 backdrop-blur-xl border-t border-white/8 px-1 py-2 safe-bottom">
          <div className="flex justify-around items-center">
            {visibleTabs.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex flex-col items-center justify-center
                    flex-1 min-w-0 h-14
                    transition-all duration-200
                    ${active ? 'text-kprimary' : 'text-gray-500 hover:text-gray-300'}
                    active:scale-95
                  `}
                >
                  <div className={`
                    relative p-2 rounded-xl transition-all
                    ${active ? 'bg-kprimary/15' : ''}
                  `}>
                    <item.icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                    {active && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-kprimary rounded-full"></span>
                    )}
                  </div>
                  <span className={`
                    text-[10px] font-medium mt-0.5 truncate w-full text-center
                    ${active ? 'font-semibold' : ''}
                  `}>
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {/* "Plus" button */}
            <button
              onClick={() => setShowDrawer(true)}
              className={`
                flex flex-col items-center justify-center
                flex-1 min-w-0 h-14
                transition-all duration-200
                ${isDrawerItemActive ? 'text-kprimary' : 'text-gray-500 hover:text-gray-300'}
                active:scale-95
              `}
            >
              <div className={`
                relative p-2 rounded-xl transition-all
                ${isDrawerItemActive ? 'bg-kprimary/15' : ''}
              `}>
                <Menu className={`w-5 h-5 ${isDrawerItemActive ? 'scale-110' : ''}`} />
                {isDrawerItemActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-kprimary rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 ${isDrawerItemActive ? 'font-semibold' : ''}`}>
                Plus
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer overlay + panel */}
      {showDrawer && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          ></div>

          {/* Drawer panel — slides up from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto scrollbar-hide"
            style={{
              background: '#0F0F1E',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold text-white">Tous les modules</h2>
              <div className="flex items-center gap-2">
                {/* Language selector */}
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-kprimary/15 rounded-lg text-white text-xs font-medium"
                >
                  <Globe className="w-3.5 h-3.5 text-kprimary" />
                  <span>{currentLang?.flag} {language.toUpperCase()}</span>
                </button>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language dropdown inside drawer */}
            {showLangMenu && (
              <div className="mx-5 mb-3 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code)
                      setShowLangMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                      lang.code === language ? 'bg-kprimary/20 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium flex-1 text-sm">{lang.name}</span>
                    {lang.code === language && <span className="text-kprimary text-sm">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Grid of modules — 3 columns */}
            <div className="px-4 pb-2 grid grid-cols-3 gap-3">
              {visibleDrawerItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href)
                      setShowDrawer(false)
                    }}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-2xl
                      transition-all duration-200 active:scale-95
                      ${active
                        ? 'bg-kprimary/15 border border-kprimary/30'
                        : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                      }
                    `}
                  >
                    <div className={`
                      w-11 h-11 rounded-xl flex items-center justify-center text-xl
                      ${active
                        ? 'bg-kprimary/20'
                        : 'bg-white/5'
                      }
                    `}>
                      {item.emoji}
                    </div>
                    <span className={`
                      text-[11px] font-medium text-center leading-tight
                      ${active ? 'text-kprimary' : 'text-white/60'}
                    `}>
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Logout button */}
            {isAuthenticated && (
              <div className="px-4 pb-8 pt-2">
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                    setShowDrawer(false)
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold transition-colors hover:bg-red-500/20"
                >
                  <span>🚪</span>
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyframe styles for drawer animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Mobile bottom spacer — only on mobile */}
      <div className="h-20 md:hidden"></div>
    </>
  )
}

export default MobileNavBar
