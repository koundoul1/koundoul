/**
 * MobileNavBar - Premium navigation mobile-first
 * Bottom bar for mobile, top nav for desktop
 * 4 tabs: Home, Cours, Défi, Profil — no special IA button
 */

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Search,
  Bell,
  Globe,
  ChevronDown,
  Flame,
  Star
} from 'lucide-react'

const MobileNavBar = () => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language) || languages[0] || { code: 'fr', name: 'Français', flag: '🇫🇷' }
  const [showLangMenu, setShowLangMenu] = useState(false)

  const navItems = [
    {
      name: t('nav.home'),
      href: '/',
      icon: Home,
      protected: false
    },
    {
      name: t('nav.courses'),
      href: '/courses',
      icon: BookOpen,
      protected: true
    },
    {
      name: t('nav.defi'),
      href: '/challenge',
      icon: Trophy,
      protected: true
    },
    {
      name: t('nav.profile'),
      href: '/profile',
      icon: User,
      protected: true
    }
  ]

  const visibleItems = navItems.filter(item => !item.protected || isAuthenticated)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Bottom Navigation — 4 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-[#0F0F1E]/95 backdrop-blur-xl border-t border-white/8 px-2 py-2 safe-bottom">
          <div className="flex justify-around items-center">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-2 bg-kprimary/20 hover:bg-kprimary/30 rounded-xl text-white transition-all"
              >
                <Globe className="w-4 h-4 text-kprimary" />
                <span className="text-xs font-bold">{currentLang?.flag}</span>
              </button>

              {showLangMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[9998] bg-black/50"
                    onClick={() => setShowLangMenu(false)}
                  ></div>
                  <div className="fixed bottom-20 left-2 right-2 bg-[#1A1A2E] border border-kprimary/30 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-2">
                      <div className="text-xs text-gray-400 mb-2 px-2">{t('common.chooseLanguage')}</div>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors ${
                            lang.code === language ? 'bg-kprimary text-white' : 'text-gray-200'
                          }`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium flex-1">{lang.name}</span>
                          {lang.code === language && <span className="text-white">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {visibleItems.map((item) => {
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
          </div>
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#0F0F1E]/95 backdrop-blur-xl border-b border-white/8">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo — gradient violet→turquoise */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-kprimary to-ksecondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-kprimary/30">
                  <span className="text-white font-black text-lg">K</span>
                </div>
                <span className="text-xl font-black gradient-text">
                  Koundoul
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center space-x-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-xl
                        transition-all duration-200
                        ${active
                          ? 'bg-kprimary/20 text-kprimary'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}

                {/* Streak & XP badges */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 ml-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 text-sm font-bold">
                      <Flame className="w-4 h-4" />
                      <span>{user?.streak || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 text-sm font-bold">
                      <Star className="w-4 h-4" />
                      <span>{user?.xp?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                )}

                {/* Language selector */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-kprimary/15 hover:bg-kprimary/25 border border-kprimary/30 text-white font-medium transition-all duration-200"
                  >
                    <span className="text-sm">{currentLang.flag} {language.toUpperCase()}</span>
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
              </nav>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                  <Search className="w-5 h-5" />
                </button>
                <button className="relative p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-kaccent rounded-full"></span>
                </button>
                <Link
                  to={isAuthenticated ? '/profile' : '/login'}
                  className="w-10 h-10 bg-gradient-to-br from-kprimary to-ksecondary rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  title={isAuthenticated ? t('nav.profile') : t('nav.login')}
                >
                  <User className="w-5 h-5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacers */}
      <div className="h-16 lg:h-20"></div>
      <div className="h-20 lg:hidden"></div>
    </>
  )
}

export default MobileNavBar
