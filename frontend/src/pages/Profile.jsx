/**
 * 👤 Page de Profil Koundoul
 * Gestion du profil utilisateur et des paramètres
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import api from '../services/api'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SubscriptionSection from '../components/subscriptions/SubscriptionSection'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Target, 
  Edit3,
  Save,
  X,
  Camera,
  Trophy,
  Star,
  TrendingUp,
  Globe,
  Shield,
  Loader2,
  CreditCard,
  Clock
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Profile = () => {
  const { user, updateProfile, changePassword, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userStats, setUserStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [invitationCode, setInvitationCode] = useState(null)
  const [profileData, setProfileData] = useState(null)

  // Initialiser les données du formulaire
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user])

  // Charger les statistiques utilisateur et le profil
  useEffect(() => {
    loadUserStats()
    loadProfileData()
  }, [])
  
  const loadProfileData = async () => {
    try {
      const response = await api.user.getProfile()
      if (response.data.success) {
        setProfileData(response.data.data)
        setInvitationCode(response.data.data.invitationCode)
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    }
  }
  

  const loadUserStats = async () => {
    try {
      setLoadingStats(true)
      const response = await api.user.getStats()
      
      if (response.success || response.data?.success) {
        setUserStats(response.data?.data || response.data)
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
      // Fallback sur stats par défaut
      setUserStats({
        totalXp: 0,
        level: 1,
        streak: 0,
        problemsSolved: 0,
        quizzesCompleted: 0,
        badgesEarned: 0,
        daysSinceJoined: 0
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setError('')
      
      const result = await updateProfile(formData)
      
      if (result.success) {
        setSuccess('Profil mis à jour avec succès')
        setIsEditing(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (result.success) {
        setSuccess('Mot de passe changé avec succès')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setIsChangingPassword(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      setError('Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    })
    setIsEditing(false)
    setError('')
  }

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setIsChangingPassword(false)
    setError('')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              Mon Profil
            </h1>
            <p className="text-gray-800 font-medium mt-1">
              Gérez vos informations personnelles et paramètres
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Messages */}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                {/* Formulaire */}
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm">
                        <Camera className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-gray-700 font-medium">{user.email}</p>
                    </div>
                  </div>

                  {/* Champs du formulaire */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 font-medium"
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  {isEditing && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Préférences de langue */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="h-5 w-5 text-koundoul-button-primary mr-2" />
                    Langue et Localisation
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                                      <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Choisissez votre langue préférée
                      </label>
                      <LanguageSwitcher />
                      <p className="text-sm text-gray-700 mt-2 font-medium">
                        Cette préférence sera sauvegardée et synchronisée sur tous vos appareils.
                      </p>
                    </div>
                </div>
              </div>
            </div>

            {/* Changement de mot de passe */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Changer le mot de passe
                    </button>
                  )}
                </div>
              </div>

              {isChangingPassword && (
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Changement...' : 'Changer le mot de passe'}
                      </button>
                      <button
                        onClick={cancelPasswordChange}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Statistiques */}
          <div className="lg:col-span-1">
            {/* Dashboard Parents */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 mb-6">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Espace Parents</h3>
                </div>
                <p className="text-sm text-gray-800 mb-4 font-medium">
                  Partagez votre code d'invitation avec vos parents pour qu'ils puissent suivre votre progression.
                </p>
                
                {/* Code d'invitation */}
                <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-300">
                  {invitationCode ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Code d'invitation pour les parents
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Partagez ce code avec vos parents. Ils pourront l'utiliser pour se connecter et suivre votre progression.
                      </p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded font-mono text-lg font-bold text-gray-900 text-center">
                          {invitationCode}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(invitationCode)
                            setSuccess('Code copié dans le presse-papiers !')
                            setTimeout(() => setSuccess(''), 2000)
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        Chargement du code...
                      </p>
                    </div>
                  )}
                </div>
                
                <Link
                  to="/parent-dashboard"
                  className="flex items-center justify-center px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Accéder au Dashboard Parents
                </Link>
              </div>
            </div>

            {/* Section Abonnements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Abonnements</h3>
                </div>
              </div>
              <div className="p-6">
                <SubscriptionSection />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
              </div>

              <div className="p-6 space-y-6">
                {loadingStats ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-3xl font-bold text-gray-900">
                        Niveau {userStats?.level || user.level || 1}
                      </h4>
                      <p className="text-gray-800 font-semibold">
                        {userStats?.totalXp || user.xp || 0} points d'expérience
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-gray-800 font-medium">Problèmes résolus</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {userStats?.problemsSolved || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="text-gray-800 font-medium">Quiz complétés</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {userStats?.quizzesCompleted || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="text-gray-800 font-medium">Badges obtenus</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {userStats?.badgesEarned || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-gray-800 font-medium">Série actuelle</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {userStats?.streak || user.streak || 0} jours
                        </span>
                      </div>

                      {userStats && (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                              <span className="text-gray-800 font-medium">Jours actifs (30j)</span>
                            </div>
                            <span className="font-bold text-gray-900 text-lg">
                              {userStats.daysActiveLast30Days || 0}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                              <span className="text-gray-800 font-medium">Temps d'étude</span>
                            </div>
                            <span className="font-bold text-gray-900 text-lg">
                              {userStats.estimatedStudyTimeHours || 0}h
                            </span>
                          </div>

                          {userStats.quizAverageScore > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Star className="h-5 w-5 text-yellow-600 mr-2" />
                                <span className="text-gray-800 font-medium">Score moyen quiz</span>
                              </div>
                              <span className="font-bold text-gray-900 text-lg">
                                {userStats.quizAverageScore}%
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

