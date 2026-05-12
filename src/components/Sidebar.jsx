/**
 * Sidebar — Desktop only (hidden on mobile <768px)
 * Shows for both authenticated and non-authenticated users.
 * Non-authenticated: all modules visible but locked (redirect to /login on click).
 */

import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  Settings,
  Dumbbell,
  Lightbulb,
  Eye,
  Bot,
  BookOpenCheck,
  CreditCard,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Lock,
  LogIn,
  UserPlus,
  Share2,
  Medal,
  Bell
} from 'lucide-react'
import ShareModal from './ShareModal'

const Sidebar = () => {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showShareModal, setShowShareModal] = useState(false)

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/') return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // ── Section: Principal ──
  const mainNav = user?.isParent ? [
    { name: 'Accueil', href: '/', icon: Home, public: true },
  ] : [
    { name: 'Accueil', href: '/', icon: Home, public: true },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen },
    { name: t('dashboard.actions.microLessons') || 'Micro-Lecons', href: '/micro-lessons', icon: BookMarked },
  ]

  // ── Section: Outils ──
  const toolsNav = [
    { name: t('dashboard.actions.solver') || 'Résolveur', href: '/solver', icon: Brain },
    { name: 'Quiz', href: '/quiz', icon: Zap },
    { name: t('nav.defi') || 'Défi', href: '/challenge', icon: Trophy },
    { name: 'Exercices', href: '/exercices', icon: Dumbbell },
    { name: 'Défi Smart', href: '/defi', icon: Sparkles },
  ]

  // ── Section: Apprentissage ──
  const learnNav = [
    { name: 'Coach Virtuel', href: '/coach', icon: Bot },
    { name: 'Flashcards', href: '/flashcards', icon: BookOpenCheck },
    { name: 'Ressources', href: '/resources', icon: Lightbulb },
    { name: 'Visualisations', href: '/visualizations', icon: Eye },
  ]

  // ── Section: Communauté ──
  const communityNav = [
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: t('dashboard.badges') || 'Badges', href: '/badges', icon: Award },
    { name: 'Classement', href: '/leaderboard', icon: Medal },
  ]

  // ── Section: Compte ──
  const accountNav = [
    { name: t('nav.profile') || 'Profil', href: '/profile', icon: User },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Abonnements', href: '/subscriptions', icon: CreditCard },
    ...(user?.isParent ? [
      { name: 'Espace Parent', href: '/parent-dashboard', icon: Shield },
      { name: 'Coach Parent', href: '/parent-coach', icon: Bot },
    ] : []),
  ]

  // ── Section: Admin (visible only to admin) ──
  const adminNav = [
    { name: 'Admin', href: '/admin', icon: ShieldCheck, adminOnly: true },
  ]

  const filterItems = (items) =>
    items.filter(item => {
      if (item.adminOnly && !user?.is_admin) return false
      return true
    })

  const handleNavClick = (e, item) => {
    if (!isAuthenticated && !item.public) {
      e.preventDefault()
      navigate('/login', { state: { message: 'Connecte-toi pour accéder à ce module' } })
    }
  }

  const renderSection = (label, items) => {
    const visible = filterItems(items)
    if (visible.length === 0) return null
    return (
      <div>
        <div className="px-3 mb-1 mt-4 first:mt-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">{label}</span>
        </div>
        <div className="space-y-0.5">
          {visible.map((item) => {
            const active = isActive(item.href)
            const locked = !isAuthenticated && !item.public
            return (
              <Link
                key={item.href}
                to={locked ? '#' : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium
                  transition-all duration-200
                  ${active
                    ? 'text-kprimary'
                    : locked
                      ? 'text-white/30 hover:text-white/40 hover:bg-white/[0.02]'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={active ? { background: 'rgba(108,99,255,0.15)' } : {}}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-kprimary flex-shrink-0"></div>
                )}
                {locked && (
                  <Lock className="ml-auto w-3 h-3 text-white/20 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-60 flex-col z-40"
      style={{ background: '#0F0F1E' }}
    >
      {/* Logo */}
      <div className="p-5 pb-2">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-kprimary to-ksecondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-kprimary/30">
            <span className="text-white font-black text-lg">K</span>
          </div>
          <span className="text-xl font-black gradient-text">
            Koundoul
          </span>
        </Link>
      </div>

      {/* Navigation sections — parent sees only parent modules */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto scrollbar-hide">
        {renderSection('Navigation', mainNav)}
        {!user?.isParent && renderSection('Outils', toolsNav)}
        {!user?.isParent && renderSection('Apprentissage', learnNav)}
        {!user?.isParent && renderSection('Communaute', communityNav)}
        {isAuthenticated && renderSection('Compte', accountNav)}
        {isAuthenticated && renderSection('Administration', adminNav)}
      </nav>

      {/* Bottom section */}
      {isAuthenticated ? (
        /* User card at bottom */
        <div className="p-3 border-t border-white/5">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
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
              <div className="text-[11px] text-white/40 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                {user.xp?.toLocaleString() || 0} XP
              </div>
            </div>
            <Settings className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
          </Link>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 w-full mt-2 px-3 py-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 text-[13px] font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager l'app</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full mt-1 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-[13px] font-medium transition-colors"
          >
            <span>🚪</span>
            <span>Se déconnecter</span>
          </button>
        </div>
      ) : (
        /* Auth buttons for non-authenticated */
        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 text-[13px] font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Partager l'app
          </button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-kprimary/40 text-kprimary hover:bg-kprimary/10 text-[13px] font-semibold transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-kprimary text-white hover:bg-kprimary/90 text-[13px] font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            S'inscrire
          </Link>
        </div>
      )}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </aside>
  )
}

export default Sidebar
