/**
 * TopBar — Desktop only (hidden on mobile <768px)
 * Shows for both authenticated and non-authenticated users.
 * Non-authenticated: shows login/register buttons instead of streak/XP.
 */

import React, { useState, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import {
  ChevronDown,
  Flame,
  Star,
  Search,
  LogOut,
  User,
  LogIn,
  UserPlus,
  Share2
} from 'lucide-react'
import ShareModal from './ShareModal'
import NotificationBell from './NotificationBell'
import AiQuotaBadge from './AiQuotaBadge'
import { useAiQuota } from '../hooks/useAiQuota'

const TopBar = () => {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language) || languages[0] || { code: 'fr', name: 'Français', flag: '🇫🇷' }
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [langMenuPos, setLangMenuPos] = useState({ top: 0, right: 0 })
  const langBtnRef = useRef(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userMenuPos, setUserMenuPos] = useState({ top: 0, right: 0 })
  const userBtnRef = useRef(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const aiQuota = useAiQuota()
  const quota = (!user?.isParent && isAuthenticated) ? aiQuota.quota : null

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Accueil'
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
      className="hidden md:flex fixed top-0 right-0 z-50 items-center justify-between px-6"
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
      <div className="flex items-center gap-1.5 lg:gap-3">
        {isAuthenticated ? (
          <>
            {/* Streak & XP badges — hidden between md and lg to prevent overflow */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 text-sm font-bold">
                <Flame className="w-4 h-4" />
                <span>{user?.streak || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 text-sm font-bold">
                <Star className="w-4 h-4" />
                <span>{user?.xp?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* AI Quota badge */}
            {quota && <AiQuotaBadge quota={quota} />}
          </>
        ) : (
          /* Auth buttons for non-authenticated */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-kprimary/40 text-kprimary hover:bg-kprimary/10 text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kprimary text-white hover:bg-kprimary/90 text-sm font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              S'inscrire
            </Link>
          </div>
        )}

        {/* Language selector */}
        <div className="relative">
          <button
            ref={langBtnRef}
            onClick={() => {
              if (!showLangMenu && langBtnRef.current) {
                const rect = langBtnRef.current.getBoundingClientRect()
                setLangMenuPos({ top: rect.bottom + 8, right: Math.max(16, window.innerWidth - rect.right) })
              }
              setShowLangMenu(!showLangMenu)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kprimary/10 hover:bg-kprimary/20 border border-kprimary/20 text-white text-sm font-medium transition-all"
          >
            <span>{currentLang.flag} {language.toUpperCase()}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 9998 }}
                onClick={() => setShowLangMenu(false)}
              ></div>
              <div className="fixed w-48 bg-[#1A1A2E] border border-kprimary/20 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 9999, top: `${langMenuPos.top}px`, right: `${langMenuPos.right}px` }}>
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

        {/* Search — hidden between md and lg to save space */}
        {isAuthenticated && (
          <button className="hidden lg:block p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Share button — hidden between md and lg */}
        <button
          onClick={() => setShowShareModal(true)}
          className="hidden lg:block p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all"
          title="Partager l'app"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* Notifications — only for authenticated */}
        {isAuthenticated && (
          <div className="relative">
            <NotificationBell />
          </div>
        )}

        {/* User avatar dropdown — only for authenticated */}
        {isAuthenticated && user && (
          <div className="relative">
            <button
              ref={userBtnRef}
              onClick={() => {
                if (!showUserMenu && userBtnRef.current) {
                  const rect = userBtnRef.current.getBoundingClientRect()
                  setUserMenuPos({ top: rect.bottom + 8, right: Math.max(16, window.innerWidth - rect.right) })
                }
                setShowUserMenu(!showUserMenu)
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kprimary to-ksecondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.firstName?.charAt(0) || 'U'}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowUserMenu(false)}></div>
                <div className="fixed w-64 max-w-[calc(100vw-1rem)] bg-[#1A1A2E] border border-white/10 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 9999, top: `${userMenuPos.top}px`, right: `${userMenuPos.right}px` }}>
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-white/40 mt-0.5">{user.email || user.phone || ''}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-orange-400 font-medium"><Flame className="w-3 h-3 inline mr-0.5" />{user.streak || 0}</span>
                      <span className="text-xs text-yellow-400 font-medium"><Star className="w-3 h-3 inline mr-0.5" />{user.xp?.toLocaleString() || 0} XP</span>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Mon Profil</span>
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">Administration</span>
                    </Link>
                  )}
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

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </header>
  )
}

export default TopBar
