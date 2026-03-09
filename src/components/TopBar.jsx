/**
 * TopBar — Desktop only (hidden on mobile <768px)
 * Only shown for authenticated users (controlled by App.jsx)
 */

import React, { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import {
  Bell,
  ChevronDown,
  Flame,
  Star,
  Search,
  LogOut,
  User
} from 'lucide-react'

const TopBar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language) || languages[0] || { code: 'fr', name: 'Français', flag: '🇫🇷' }
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return 'Dashboard'
    if (path.startsWith('/courses')) return t('nav.courses')
    if (path.startsWith('/micro-lessons')) return t('dashboard.actions.microLessons') || 'Micro-Leçons'
    if (path.startsWith('/solver')) return t('dashboard.actions.solver') || 'Résolveur'
    if (path.startsWith('/quiz')) return 'Quiz'
    if (path.startsWith('/challenge')) return t('nav.defi')
    if (path.startsWith('/profile')) return t('nav.profile')
    if (path.startsWith('/badges')) return t('dashboard.badges') || 'Badges'
    if (path.startsWith('/flashcards')) return 'Flashcards'
    if (path.startsWith('/forum')) return 'Forum'
    if (path.startsWith('/coach')) return 'Coach'
    return ''
  }

  return (
    <header
      className="hidden md:flex fixed top-0 right-0 z-30 items-center justify-between px-6"
      style={{
        left: '240px',
        height: '64px',
        background: 'rgba(15,15,30,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Streak & XP badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 text-sm font-bold">
            <Flame className="w-4 h-4" />
            <span>{user?.streak || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 text-sm font-bold">
            <Star className="w-4 h-4" />
            <span>{user?.xp?.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kprimary/10 hover:bg-kprimary/20 border border-kprimary/20 text-white text-sm font-medium transition-all"
          >
            <span>{currentLang.flag} {language.toUpperCase()}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowLangMenu(false)}
              ></div>
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A2E] border border-kprimary/20 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                      lang.code === language ? 'bg-kprimary/20 text-white' : 'text-gray-200'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium flex-1">{lang.name}</span>
                    {lang.code === language && <span className="text-kprimary">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-kaccent rounded-full"></span>
        </button>

        {/* User avatar dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kprimary to-ksecondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.firstName?.charAt(0) || 'U'}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Mon Profil</span>
                  </Link>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Se déconnecter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default TopBar
