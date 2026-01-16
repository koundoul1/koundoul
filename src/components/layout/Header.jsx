/**
 * 🧭 Header Koundoul
 * Barre de navigation principale avec menu transversal
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../hooks/useTranslation'
import LanguageSwitcher from '../LanguageSwitcher'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Brain,
  BookOpen,
  Home,
  Award,
  MessageSquare,
  Repeat,
  Calculator,
  Globe,
  Target,
  Lightbulb,
  Sparkles,
  Trophy,
  ListChecks,
  Shield
} from 'lucide-react'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()

  const profileRef = useRef(null)
  const profileButtonRef = useRef(null)
  const profileMenuRef = useRef(null)

  // Fermer les menus quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Ajuster la position du menu profil pour qu'il reste visible
  useEffect(() => {
    if (isProfileOpen && profileButtonRef.current && profileMenuRef.current) {
      const buttonRect = profileButtonRef.current.getBoundingClientRect()
      const menuWidth = 224 // w-56 = 14rem = 224px
      const viewportWidth = window.innerWidth
      const spacing = 8 // mt-2 = 0.5rem = 8px
      
      // Positionner le menu en fixed pour un contrôle total
      let rightPosition = viewportWidth - buttonRect.right
      
      // S'assurer que le menu ne dépasse pas à droite (marge de 1rem)
      const minRightMargin = 16
      if (rightPosition < minRightMargin) {
        rightPosition = minRightMargin
      }
      
      // S'assurer que le menu ne dépasse pas à gauche
      const leftPosition = viewportWidth - rightPosition - menuWidth
      if (leftPosition < minRightMargin) {
        rightPosition = viewportWidth - menuWidth - minRightMargin
      }
      
      profileMenuRef.current.style.position = 'fixed'
      profileMenuRef.current.style.top = `${buttonRect.bottom + spacing}px`
      profileMenuRef.current.style.right = `${rightPosition}px`
      profileMenuRef.current.style.left = 'auto'
    }
  }, [isProfileOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen },
    { name: t('nav.solver'), href: '/solver', icon: Calculator },
    { name: t('nav.coach'), href: '/coach', icon: Brain },
    { name: t('nav.quiz'), href: '/quiz', icon: Brain },
    { name: t('nav.exercises'), href: '/exercices', icon: ListChecks },
    { name: t('nav.challenge'), href: '/challenge', icon: Trophy },
    { name: t('nav.revisions'), href: '/flashcards', icon: Repeat },
    { name: t('nav.forum'), href: '/forum', icon: MessageSquare },
    { name: t('nav.badges'), href: '/badges', icon: Award },
    { name: t('nav.resources'), href: '/resources', icon: BookOpen },
  ]

  // Nouvelles fonctionnalités révolutionnaires
  const advancedFeatures = [
    { name: t('nav.visualizations'), href: '/visualizations', icon: Globe },
    { name: t('nav.microLessons'), href: '/micro-lessons', icon: BookOpen },
    { name: t('nav.defi'), href: '/defi', icon: Target },
    { name: t('nav.whyItWorks'), href: '/why-it-works', icon: Lightbulb },
    { name: t('nav.advancedFeatures'), href: '/advanced-features', icon: Sparkles },
    { name: t('nav.myProfile'), href: '/profile', icon: User },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Premier menu - Navigation principale */}
        <div className="flex justify-between items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <img 
                src="/icons/icon.svg" 
                alt="Koundoul" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-transform group-hover:scale-110"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:inline">Koundoul</span>
            </Link>
          </div>

          {/* Navigation Desktop - Premier menu */}
          <nav className="hidden lg:flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-gray-800 hover:text-blue-600 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-2 sm:space-x-4 relative">
            {/* Notifications - Masqué sur très petit écran */}
            <button className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Menu Profil - Toujours visible */}
            <div className="relative" ref={profileRef}>
              {isAuthenticated ? (
                <button
                  ref={profileButtonRef}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Menu profil"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username || user?.email || 'Mon Profil'}
                    </span>
                    {user?.isAdmin && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 transition-colors active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {t('nav.login')}
                  </span>
                </Link>
              )}

              {/* Dropdown Profil - Positionné pour rester dans le viewport */}
              {isAuthenticated && isProfileOpen && (
                  <>
                    {/* Overlay pour fermer au clic extérieur */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div 
                      ref={profileMenuRef}
                      className="w-56 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 z-[60]"
                      style={{ maxWidth: 'calc(100vw - 2rem)' }}
                    >
                      {/* Nom d'utilisateur affiché dans le menu */}
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          {t('header.connectedAs')}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-white truncate">
                            {user?.username || user?.email || t('header.user')}
                          </div>
                          {user?.isAdmin && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500 text-yellow-900 rounded ml-2 flex-shrink-0">
                              {t('header.admin')}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {t('header.profile')}
                      </Link>
                      <Link
                        to="/parent-dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2 text-gray-400" />
                        {t('header.parentDashboard')}
                      </Link>
                      {user?.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-yellow-200 hover:bg-yellow-900/20 hover:text-yellow-100 transition-colors border-l-2 border-yellow-500/50"
                        >
                          <Shield className="h-4 w-4 mr-2 text-yellow-400" />
                          {t('header.administration')}
                        </Link>
                      )}
                      <div className="border-t border-gray-700 my-2"></div>
                      <div className="px-4 py-2">
                        <LanguageSwitcher dark={true} />
                      </div>
                      <div className="border-t border-gray-700 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 transition-colors rounded-md"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('header.logout')}
                      </button>
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Notifications mobile */}
            {isAuthenticated && (
              <button className="p-2 text-gray-600 hover:text-gray-900 relative transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-900 hover:text-blue-600 hover:bg-gray-100 transition-all active:scale-95"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Deuxième menu - Fonctionnalités avancées */}
        <div className="hidden lg:block border-t border-gray-200 bg-gray-50">
          <div className="flex justify-center items-center h-12 px-4">
            <nav className="flex space-x-6">
              {advancedFeatures.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-orange-400"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Menu mobile - Slide-in moderne */}
        {isMenuOpen && (
          <>
            {/* Overlay sombre */}
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Menu slide-in */}
            <div className="lg:hidden fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-3 pt-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.username || user?.email || t('header.user')}
                      </p>
                      {user?.isAdmin && (
                        <p className="text-xs text-yellow-700 font-medium">{t('header.admin')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <nav className="py-4 space-y-1 px-2">
              {/* Navigation principale */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider px-3 py-2">
                  {t('header.navigation')}
                </div>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all active:scale-95 active:bg-blue-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Séparateur */}
              <div className="border-t border-gray-200 my-2 mx-4"></div>
              
              {/* Nouvelles fonctionnalités */}
              <div>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider px-4 py-3 text-gray-500">
                  {t('header.features')}
                </div>
                {advancedFeatures.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-xl text-base font-medium transition-all active:scale-95 active:bg-orange-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </nav>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header