/**
 * 📱 Mobile Header - Header optimisé pour mobile
 * Design mobile-first avec menu hamburger moderne
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  Home,
  BookOpen,
  Calculator,
  Brain,
  Trophy,
  Award,
  MessageSquare,
  Repeat,
  Target,
  Sparkles,
  Shield,
  ChevronRight
} from 'lucide-react'

const MobileHeader = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)

  // Fermer le menu quand on change de route
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen },
    { name: t('nav.solver'), href: '/solver', icon: Calculator },
    { name: t('nav.coach'), href: '/coach', icon: Brain },
    { name: t('nav.quiz'), href: '/quiz', icon: Brain },
    { name: t('nav.exercises'), href: '/exercices', icon: Target },
    { name: t('nav.challenge'), href: '/challenge', icon: Trophy },
    { name: t('nav.revisions'), href: '/flashcards', icon: Repeat },
    { name: t('nav.forum'), href: '/forum', icon: MessageSquare },
    { name: t('nav.badges'), href: '/badges', icon: Award },
  ]

  const advancedFeatures = [
    { name: t('nav.visualizations'), href: '/visualizations', icon: Sparkles },
    { name: t('nav.microLessons'), href: '/micro-lessons', icon: BookOpen },
    { name: t('nav.defi'), href: '/defi', icon: Target },
    { name: t('nav.whyItWorks'), href: '/why-it-works', icon: Brain },
    { name: t('nav.advancedFeatures'), href: '/advanced-features', icon: Sparkles },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 safe-top md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="/icons/icon.svg" 
              alt="Koundoul" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-lg font-bold text-gray-900">Koundoul</span>
          </Link>

          {/* Actions droite */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            )}

            {/* Menu hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu slide-in mobile */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div 
            ref={menuRef}
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right"
          >
            {/* Header du menu */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 border-b border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Profil utilisateur */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {user?.username || user?.email || t('header.user')}
                    </p>
                    {user?.isAdmin && (
                      <p className="text-xs text-blue-100 font-medium">{t('header.admin')}</p>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold">{t('nav.login')}</span>
                </Link>
              )}
            </div>

            {/* Navigation principale */}
            <nav className="py-4">
              <div className="px-2 mb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  {t('header.navigation')}
                </div>
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-xl mb-1
                        transition-all active:scale-95
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                    </Link>
                  )
                })}
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-2 mx-4"></div>

              {/* Fonctionnalités avancées */}
              <div className="px-2 mb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  {t('header.features')}
                </div>
                {advancedFeatures.map((item) => {
                  const isActive = location.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-xl mb-1
                        transition-all active:scale-95
                        ${isActive 
                          ? 'bg-purple-50 text-purple-600 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className="flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-purple-600" />}
                    </Link>
                  )
                })}
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-2 mx-4"></div>

              {/* Actions profil */}
              {isAuthenticated && (
                <div className="px-2 mb-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="flex-1">{t('header.profile')}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                  <Link
                    to="/parent-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span className="flex-1">{t('header.parentDashboard')}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 text-yellow-700 hover:bg-yellow-50 transition-all active:scale-95"
                    >
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <span className="flex-1">{t('header.administration')}</span>
                      <ChevronRight className="h-4 w-4 text-yellow-600" />
                    </Link>
                  )}
                </div>
              )}

              {/* Langue */}
              <div className="px-2 mb-4">
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-2">
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Déconnexion */}
              {isAuthenticated && (
                <div className="px-4 pb-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all active:scale-95"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

export default MobileHeader

