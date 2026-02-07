/**
 * 📱 Bottom Navigation - Navigation mobile en bas d'écran
 * Design mobile-first comme une vraie application mobile
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../hooks/useTranslation'
import { 
  Home, 
  BookOpen, 
  Calculator, 
  Brain, 
  Trophy,
  User
} from 'lucide-react'

const BottomNavigation = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  // Navigation principale pour mobile
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
      name: t('nav.solver'), 
      href: '/solver', 
      icon: Calculator,
      protected: true
    },
    { 
      name: t('nav.quiz'), 
      href: '/quiz', 
      icon: Brain,
      protected: true
    },
    { 
      name: isAuthenticated ? t('nav.profile') : t('nav.login'), 
      href: isAuthenticated ? '/profile' : '/login', 
      icon: User,
      protected: false
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {visibleItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex flex-col items-center justify-center 
                flex-1 h-full min-w-0
                transition-all duration-200
                ${active 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }
                active:scale-95
              `}
            >
              <div className={`
                relative p-2 rounded-full transition-all
                ${active ? 'bg-blue-50' : ''}
              `}>
                <item.icon className={`w-6 h-6 ${active ? 'scale-110' : ''}`} />
                {active && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>
              <span className={`
                text-xs font-medium mt-0.5 truncate w-full text-center
                ${active ? 'font-semibold' : ''}
              `}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation

