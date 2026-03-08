/**
 * Sidebar — Desktop only (hidden on mobile <768px)
 * Fixed 240px sidebar with logo, nav items, user card
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Brain,
  Zap,
  MessageSquare,
  BookMarked,
  Award,
  BarChart3,
  Settings
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { t } = useTranslation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const mainNav = [
    { name: t('nav.home'), href: '/', icon: Home, protected: false },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen, protected: true },
    { name: t('dashboard.actions.microLessons') || 'Leçons', href: '/micro-lessons', icon: BookMarked, protected: true },
    { name: t('dashboard.actions.solver') || 'Résolveur', href: '/solver', icon: Brain, protected: true },
    { name: 'Quiz', href: '/quiz', icon: Zap, protected: true },
    { name: t('nav.defi'), href: '/challenge', icon: Trophy, protected: true },
  ]

  const secondaryNav = [
    { name: t('dashboard.badges') || 'Badges', href: '/badges', icon: Award, protected: true },
    { name: 'Flashcards', href: '/flashcards', icon: BarChart3, protected: true },
    { name: 'Forum', href: '/forum', icon: MessageSquare, protected: false },
  ]

  const visibleMain = mainNav.filter(item => !item.protected || isAuthenticated)
  const visibleSecondary = secondaryNav.filter(item => !item.protected || isAuthenticated)

  return (
    <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-60 flex-col z-40"
      style={{ background: '#0F0F1E' }}
    >
      {/* Logo */}
      <div className="p-5 pb-3">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-kprimary to-ksecondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-kprimary/30">
            <span className="text-white font-black text-lg">K</span>
          </div>
          <span className="text-xl font-black gradient-text">
            Koundoul
          </span>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {visibleMain.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? 'text-kprimary'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={active ? { background: 'rgba(108,99,255,0.15)' } : {}}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-kprimary"></div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 border-t border-white/5"></div>

        {/* Secondary nav */}
        <div className="space-y-1">
          {visibleSecondary.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? 'text-kprimary'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={active ? { background: 'rgba(108,99,255,0.15)' } : {}}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User card at bottom */}
      {isAuthenticated && user && (
        <div className="p-3 border-t border-white/5">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-kprimary to-ksecondary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {user.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {user.firstName || user.email}
              </div>
              <div className="text-xs text-white/40 truncate">
                {t('dashboard.level')} {user.level || 1}
              </div>
            </div>
            <Settings className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
          </Link>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
