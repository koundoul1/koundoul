/**
 * GuestRoute — accessible sans connexion.
 * Contrairement à ProtectedRoute, ne redirige pas vers /login.
 * Affiche un loader pendant l'initialisation de l'auth.
 */
import React from 'react'
import { useAuth } from '../context/AuthContext'
import PageLoader from './PageLoader'

const GuestRoute = ({ children }) => {
  const { loading } = useAuth()
  if (loading) return <PageLoader />
  return children
}

export default GuestRoute
