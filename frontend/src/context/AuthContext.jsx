/**
 * 🔐 Contexte d'Authentification Koundoul
 * Gestion globale de l'état d'authentification
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api, { saveAuthData, clearAuthData, getCurrentUser } from '../services/api'

// État initial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

// Types d'actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer pour gérer l'état
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Créer le contexte
const AuthContext = createContext()

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = getCurrentUser()

        if (token && user) {
          // Vérifier si le token est encore valide
          try {
            const response = await api.auth.getProfile()
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.data,
                token
              }
            })
          } catch (error) {
            // Token invalide, nettoyer le localStorage
            clearAuthData()
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    checkAuth()
  }, [])

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await api.auth.login(credentials)
      
      if (response.success) {
        const { user, token } = response.data
        
        // Sauvegarder dans le localStorage
        saveAuthData(user, token)
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        })

        return { success: true, user }
      } else {
        throw new Error(response.message || 'Erreur de connexion')
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur de connexion'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })

      const response = await api.auth.register(userData)
      
      if (response.success) {
        const { user, token } = response.data
        
        // Sauvegarder dans le localStorage
        saveAuthData(user, token)
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: { user, token }
        })

        return { success: true, user }
      } else {
        throw new Error(response.message || 'Erreur d\'inscription')
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur d\'inscription'
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Fonction de déconnexion
  const logout = () => {
    api.auth.logout()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Fonction de mise à jour du profil
  const updateProfile = async (userData) => {
    try {
      const response = await api.auth.updateProfile(userData)
      
      if (response.success) {
        const updatedUser = response.data
        
        // Mettre à jour le localStorage
        saveAuthData(updatedUser, state.token)
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser
        })

        return { success: true, user: updatedUser }
      } else {
        throw new Error(response.message || 'Erreur de mise à jour')
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur de mise à jour du profil'
      return { success: false, error: errorMessage }
    }
  }

  // Fonction de changement de mot de passe
  const changePassword = async (passwordData) => {
    try {
      const response = await api.auth.changePassword(passwordData)
      
      if (response.success) {
        return { success: true, message: response.message }
      } else {
        throw new Error(response.message || 'Erreur de changement de mot de passe')
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur de changement de mot de passe'
      return { success: false, error: errorMessage }
    }
  }

  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Valeur du contexte
  const value = {
    // État
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  
  return context
}

export default AuthContext

