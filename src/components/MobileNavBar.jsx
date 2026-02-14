/**
 * 📱 MobileNavBar - Navigation moderne mobile-first
 * Bottom bar pour mobile, top nav pour desktop
 * Design inspiré de Duolingo, TikTok, Headspace
 */

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { 
  Home, 
  BookOpen, 
  Brain, 
  Trophy, 
  User, 
  Sparkles, 
  Search, 
  Bell,
  Globe,
  ChevronDown
} from 'lucide-react'

const MobileNavBar = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { language, changeLanguage, getAvailableLanguages } = useTranslation()
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const navItems = [
    { 
      name: 'Accueil', 
      href: '/', 
      icon: Home,
      color: 'blue',
      protected: false
    },
    { 
      name: 'Cours', 
      href: '/courses', 
      icon: BookOpen,
      color: 'purple',
      protected: true
    },
    { 
      name: 'IA', 
      href: '/solver', 
      icon: Brain,
      color: 'pink',
      protected: true,
      special: true // Bouton central spécial
    },
    { 
      name: 'Défi', 
      href: '/challenge', 
      icon: Trophy,
      color: 'amber',
      protected: true
    }
  ]

  // Filtrer les items selon l'authentification
  const visibleItems = navItems.filter(item => !item.protected || isAuthenticated)

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 safe-bottom">
          <div className="flex justify-around items-center relative">
            {/* Sélecteur de langue mobile - à gauche */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold">{currentLang?.flag}</span>
              </button>

              {showLangMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[9998] bg-black/50" 
                    onClick={() => setShowLangMenu(false)}
                  ></div>
                  <div className="fixed bottom-20 left-2 right-2 bg-gray-800 border border-purple-500 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-2">
                      <div className="text-xs text-gray-400 mb-2 px-2">Choisir la langue</div>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors ${
                            lang.code === language ? 'bg-purple-600 text-white' : 'text-gray-200'
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

            {visibleItems.map((item, index) => {
              const active = isActive(item.href)
              const isSpecial = item.special
              
              // Position spéciale pour le bouton IA (centré, surélevé)
              if (isSpecial) {
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`
                      relative z-10 flex flex-col items-center justify-center
                      w-16 h-16 -mt-6 rounded-2xl
                      bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500
                      shadow-2xl shadow-pink-500/50
                      transition-all duration-300
                      ${active ? 'scale-110' : 'scale-100'}
                      active:scale-95
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                    <item.icon className="w-7 h-7 text-white relative z-10" />
                    <span className="absolute -bottom-6 text-[10px] font-semibold text-white/80">
                      {item.name}
                    </span>
                    {active && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                    )}
                  </Link>
                )
              }

              // Mapping des couleurs pour les classes Tailwind complètes
              const getColorClasses = (color, isActive) => {
                if (!isActive) {
                  return { text: 'text-gray-400 hover:text-gray-300', bg: '', dot: '' }
                }
                const colors = {
                  blue: { text: 'text-blue-400', bg: 'bg-blue-500/20', dot: 'bg-blue-500' },
                  purple: { text: 'text-purple-400', bg: 'bg-purple-500/20', dot: 'bg-purple-500' },
                  amber: { text: 'text-amber-400', bg: 'bg-amber-500/20', dot: 'bg-amber-500' },
                  green: { text: 'text-green-400', bg: 'bg-green-500/20', dot: 'bg-green-500' }
                }
                return colors[color] || colors.blue
              }

              const colorClasses = getColorClasses(item.color, active)

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex flex-col items-center justify-center
                    flex-1 min-w-0 h-14
                    transition-all duration-200
                    ${colorClasses.text}
                    active:scale-95
                  `}
                >
                  <div className={`
                    relative p-2 rounded-xl transition-all
                    ${colorClasses.bg}
                  `}>
                    <item.icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                    {active && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 ${colorClasses.dot} rounded-full`}></span>
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
        <div className="bg-gray-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Koundoul
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center space-x-1">
                {visibleItems.filter(item => !item.special).map((item) => {
                  const active = isActive(item.href)
                  const desktopColorClasses = {
                    blue: active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5',
                    purple: active ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5',
                    amber: active ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5',
                    green: active ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                  }
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-xl
                        transition-all duration-200
                        ${desktopColorClasses[item.color] || 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
                
                {/* Bouton IA spécial */}
                {visibleItems.find(item => item.special) && (
                  <Link
                    to="/solver"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl
                      bg-gradient-to-r from-pink-500 to-purple-500
                      text-white font-bold
                      shadow-lg shadow-pink-500/50
                      hover:scale-105 transition-all
                      ${isActive('/solver') ? 'ring-2 ring-pink-400' : ''}
                    `}
                  >
                    <Brain className="w-5 h-5" />
                    <span>IA</span>
                    <Sparkles className="w-4 h-4" />
                  </Link>
                )}

                {/* Sélecteur de langue - À la place du Profil en double */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 text-white font-semibold shadow-lg transition-all duration-200"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">{currentLang?.flag} {currentLang?.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showLangMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-[9998]" 
                        onClick={() => setShowLangMenu(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setShowLangMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                              lang.code === language ? 'bg-gray-700 text-white' : 'text-gray-200'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="font-medium flex-1">{lang.name}</span>
                            {lang.code === language && <span className="text-white">✓</span>}
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
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <Link
                  to={isAuthenticated ? '/profile' : '/login'}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  title={isAuthenticated ? 'Profil' : 'Connexion'}
                >
                  <User className="w-5 h-5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacers pour éviter le chevauchement */}
      <div className="h-16 lg:h-20"></div>
      <div className="h-20 lg:hidden"></div>
    </>
  )
}

export default MobileNavBar

