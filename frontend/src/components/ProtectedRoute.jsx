/**
 * 🔓 Route Publique Koundoul
 * Composant permettant l'accès sans authentification requise
 * L'authentification est optionnelle pour améliorer l'expérience utilisateur
 */

import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth()

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Permettre l'accès même sans authentification
  // Les composants enfants peuvent vérifier l'authentification si nécessaire
  return children
}

export default ProtectedRoute


