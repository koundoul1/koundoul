/**
 * ProtectedRoute — affiche un écran "connexion requise" contextualisé
 * au lieu de rediriger silencieusement vers /login.
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

// Infos par module — fallback sur le générique si route inconnue
const MODULE_INFO = {
  '/dashboard': {
    icon: '📊',
    title: 'Tableau de bord',
    desc: 'Consulte ta progression, ton XP, tes streaks et toutes tes statistiques personnelles.'
  },
  '/profile': {
    icon: '👤',
    title: 'Profil',
    desc: 'Gère tes informations, ton mot de passe et les paramètres de ton compte.'
  },
  '/notifications': {
    icon: '🔔',
    title: 'Notifications',
    desc: 'Tes alertes de streak, badges débloqués et messages de la communauté.'
  },
  '/flashcards': {
    icon: '🃏',
    title: 'Flashcards',
    desc: 'Révise avec ton système de mémorisation espacée — progression sauvegardée sur ton compte.'
  },
  '/flashcards/review': {
    icon: '🃏',
    title: 'Révision Flashcards',
    desc: 'Révise avec ton système de mémorisation espacée — progression sauvegardée sur ton compte.'
  },
  '/forum/new': {
    icon: '✍️',
    title: 'Créer une discussion',
    desc: 'Un compte est requis pour publier dans le forum et interagir avec la communauté.'
  },
  '/parent-dashboard': {
    icon: '👨‍👧',
    title: 'Espace Parent',
    desc: 'Suis la progression de tes enfants, leur utilisation de l\'IA et leurs résultats.'
  },
  '/parent-coach': {
    icon: '🤝',
    title: 'Coach Parent',
    desc: 'Obtiens des conseils personnalisés pour accompagner tes enfants dans leurs révisions.'
  },
  '/payment/success': {
    icon: '💳',
    title: 'Confirmation de paiement',
    desc: 'Connecte-toi pour accéder à la confirmation de ton abonnement.'
  },
  '/quiz': {
    icon: '📝',
    title: 'Résultats du Quiz',
    desc: 'Connecte-toi pour sauvegarder tes scores et suivre ta progression.'
  },
  '/admin': {
    icon: '🛡️',
    title: 'Administration',
    desc: 'Cet espace est réservé aux administrateurs de la plateforme.',
    adminOnly: true
  }
}

function getModuleInfo(pathname) {
  // Exact match first
  if (MODULE_INFO[pathname]) return MODULE_INFO[pathname]
  // Prefix match
  for (const key of Object.keys(MODULE_INFO)) {
    if (pathname.startsWith(key + '/') || pathname.startsWith(key)) {
      return MODULE_INFO[key]
    }
  }
  // Generic fallback
  return {
    icon: '🔒',
    title: 'Connexion requise',
    desc: 'Ce module nécessite un compte pour accéder à tes données personnelles.'
  }
}

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-kprimary mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    const info = getModuleInfo(location.pathname)

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          {/* Icon */}
          <div className="text-5xl mb-5">{info.icon}</div>

          {/* Title */}
          <h1 className="text-xl font-bold text-white mb-2">{info.title}</h1>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{info.desc}</p>

          {/* CTAs */}
          <Link
            to="/register"
            state={{ from: location }}
            className="block w-full py-3 rounded-xl bg-kprimary hover:bg-kprimary/90 text-white font-bold text-sm mb-3 transition-colors"
          >
            S'inscrire gratuitement →
          </Link>
          <Link
            to="/login"
            state={{ from: location }}
            className="block w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium mb-6 transition-colors"
          >
            Déjà un compte ? Se connecter
          </Link>

          {/* Back link */}
          <Link
            to="/"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
