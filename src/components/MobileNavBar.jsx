/**
 * MobileNavBar — Bottom navigation for mobile only (<768px)
 * Desktop navigation is handled by Sidebar + TopBar
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
  Globe
} from 'lucide-react'

const MobileNavBar = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { t, language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language) || languages[0] || { code: 'fr', name: 'Français', flag: '🇫🇷' }
  const [showLangMenu, setShowLangMenu] = useState(false)

  const navItems = [
    { name: t('nav.home'), href: '/', icon: Home, protected: false },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen, protected: true },
    { name: t('nav.defi'), href: '/challenge', icon: Trophy, protected: true },
    { name: t('nav.profile'), href: '/profile', icon: User, protected: true }
  ]

  const visibleItems = navItems.filter(item => !item.protected || isAuthenticated)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Bottom Navigation — hidden on desktop (md+) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
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

      {/* Mobile top spacer — only on mobile */}
      <div className="h-0 md:hidden"></div>
      {/* Mobile bottom spacer — only on mobile */}
      <div className="h-20 md:hidden"></div>
    </>
  )
}

export default MobileNavBar
