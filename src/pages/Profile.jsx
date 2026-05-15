/**
 * Page de Profil Koundoul — Premium dark theme
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
  Clock,
  Settings,
  UserPlus,
  Link2,
  Unlink,
  Copy,
  Users,
  MapPin,
  Bell,
  Trash2,
  AlertTriangle,
  Phone
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

// ── Direct Link Form (email or phone) ──────────────────────────────

function DirectLinkForm({ isParent, onSuccess }) {
  const [contact, setContact] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  const handleLink = async () => {
    if (!contact.trim()) return
    setLinking(true)
    setLinkError('')
    setLinkSuccess('')
    try {
      const res = await api.parent.linkDirect(contact.trim())
      setLinkSuccess(res.message || 'Liaison etablie !')
      setContact('')
      if (onSuccess) onSuccess()
    } catch (err) {
      setLinkError(err.message || 'Erreur de liaison')
    }
    setLinking(false)
  }

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <p className="text-sm text-gray-400 mb-3">
        {isParent
          ? 'Entrez l\'email ou le numero de telephone de votre enfant pour le lier.'
          : 'Entrez l\'email ou le numero de telephone de votre parent pour le lier.'}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={isParent ? 'Email ou +221... de l\'enfant' : 'Email ou +221... du parent'}
          className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-kprimary/50"
        />
        <button
          onClick={handleLink}
          disabled={linking || !contact.trim()}
          className="px-4 py-2.5 bg-kprimary text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
        >
          {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lier'}
        </button>
      </div>
      {linkError && <p className="text-xs text-red-400 mt-2">{linkError}</p>}
      {linkSuccess && <p className="text-xs text-green-400 mt-2">{linkSuccess}</p>}
    </div>
  )
}

const Profile = () => {
  const { user, updateProfile, changePassword, isAuthenticated, logout } = useAuth()
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
  const [generatingCode, setGeneratingCode] = useState(false)
  const [parentCode, setParentCode] = useState('')
  const [linkingToParent, setLinkingToParent] = useState(false)
  const [linkedParent, setLinkedParent] = useState(null)
  const [parentChildren, setParentChildren] = useState([])
  const [unlinkingChild, setUnlinkingChild] = useState(null)

  // Location state
  const [locationData, setLocationData] = useState({
    country: 'SN',
    region: '',
    department: '',
    school: ''
  })
  const [savingLocation, setSavingLocation] = useState(false)

  // Notifications + delete account
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Phone-based family linking
  const [parentPhoneInput, setParentPhoneInput] = useState('+221')
  const [linkingByPhone, setLinkingByPhone] = useState(false)
  const [familyPhoneStatus, setFamilyPhoneStatus] = useState(null) // null | { pending, parentPhone } | { linked, parentName }
  const [locationSuccess, setLocationSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user])

  useEffect(() => {
    loadUserStats()
    loadProfileData()
    loadParentData()
  }, [])

  const loadProfileData = async () => {
    try {
      const response = await api.user.getProfile()
      const data = response.data?.data || response.data || response
      if (data) {
        setProfileData(data)
        setInvitationCode(data.invitationCode)
        if (data.parentId) setLinkedParent(data.parentId)
        if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled !== false)
        setLocationData({
          country: data.country || 'SN',
          region: data.region || '',
          department: data.department || '',
          school: data.school || ''
        })
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    }
  }

  const loadParentData = async () => {
    try {
      const childrenRes = await api.parent.getChildren()
      if (childrenRes.success || childrenRes.data?.success) {
        setParentChildren(childrenRes.data?.data || childrenRes.data || [])
      }
    } catch (err) {
      // Not a parent or no children
    }
  }

  const handleLinkToParent = async () => {
    if (!parentCode || parentCode.length !== 8) {
      setError('Le code doit contenir 8 caractères')
      setTimeout(() => setError(''), 3000)
      return
    }
    setLinkingToParent(true)
    setError('')
    try {
      const res = await api.parent.linkToParent(parentCode.toUpperCase())
      if (res.success || res.data?.success) {
        const data = res.data?.data || res.data || res
        setLinkedParent(data.parentName || 'Parent')
        setSuccess('Lien parent-enfant établi avec succès !')
        setParentCode('')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Code invalide ou expiré')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLinkingToParent(false)
    }
  }

  const handleUnlinkSelf = async () => {
    try {
      await api.parent.unlinkSelf()
      setLinkedParent(null)
      setSuccess('Vous avez été délié de votre parent')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du lien')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleUnlinkChild = async (childId) => {
    setUnlinkingChild(childId)
    try {
      await api.parent.unlinkChild(childId)
      setParentChildren(prev => prev.filter(c => c.id !== childId))
      setSuccess('Enfant délié avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du lien')
      setTimeout(() => setError(''), 3000)
    } finally {
      setUnlinkingChild(null)
    }
  }

  const handleGenerateParentCode = async () => {
    setGeneratingCode(true)
    setError('')
    try {
      const res = await api.parent.generateInvite()
      const data = res.data?.data || res.data || res
      setInvitationCode(data.invitationCode)
      setSuccess('Code d\'invitation généré !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération du code')
      setTimeout(() => setError(''), 3000)
    } finally {
      setGeneratingCode(false)
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
      setUserStats({
        totalXp: 0, level: 1, streak: 0, problemsSolved: 0,
        quizzesCompleted: 0, badgesEarned: 0, daysSinceJoined: 0
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
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
        setSuccess(t('profile.passwordChanged'))
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
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
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setIsChangingPassword(false)
    setError('')
  }

  const AFRICAN_COUNTRIES = [
    { code: 'SN', name: 'Sénégal' }, { code: 'CI', name: "Côte d'Ivoire" },
    { code: 'CM', name: 'Cameroun' }, { code: 'ML', name: 'Mali' },
    { code: 'BF', name: 'Burkina Faso' }, { code: 'GN', name: 'Guinée' },
    { code: 'TG', name: 'Togo' }, { code: 'BJ', name: 'Bénin' },
    { code: 'NE', name: 'Niger' }, { code: 'TD', name: 'Tchad' },
    { code: 'GA', name: 'Gabon' }, { code: 'CG', name: 'Congo' },
    { code: 'MR', name: 'Mauritanie' }, { code: 'DZ', name: 'Algérie' },
    { code: 'MA', name: 'Maroc' }, { code: 'TN', name: 'Tunisie' },
    { code: 'EG', name: 'Égypte' }, { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' }, { code: 'KE', name: 'Kenya' },
    { code: 'ZA', name: 'Afrique du Sud' }, { code: 'ET', name: 'Éthiopie' },
    { code: 'TZ', name: 'Tanzanie' }, { code: 'UG', name: 'Ouganda' },
    { code: 'RW', name: 'Rwanda' }, { code: 'MG', name: 'Madagascar' },
    { code: 'CD', name: 'RD Congo' }, { code: 'AO', name: 'Angola' },
    { code: 'MZ', name: 'Mozambique' }, { code: 'ZM', name: 'Zambie' },
    { code: 'ZW', name: 'Zimbabwe' }, { code: 'BW', name: 'Botswana' },
    { code: 'NA', name: 'Namibie' }, { code: 'MW', name: 'Malawi' },
    { code: 'BI', name: 'Burundi' }, { code: 'DJ', name: 'Djibouti' },
    { code: 'ER', name: 'Érythrée' }, { code: 'GM', name: 'Gambie' },
    { code: 'GW', name: 'Guinée-Bissau' }, { code: 'GQ', name: 'Guinée équatoriale' },
    { code: 'KM', name: 'Comores' }, { code: 'CV', name: 'Cabo Verde' },
    { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Libéria' },
    { code: 'LY', name: 'Libye' }, { code: 'MU', name: 'Maurice' },
    { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' },
    { code: 'SO', name: 'Somalie' }, { code: 'SD', name: 'Soudan' },
    { code: 'SS', name: 'Soudan du Sud' }, { code: 'SZ', name: 'Éswatini' },
    { code: 'CF', name: 'Centrafrique' }, { code: 'ST', name: 'São Tomé-et-Príncipe' }
  ].sort((a, b) => a.name.localeCompare(b.name))

  const SENEGAL_REGIONS_DEPS = {
    'Dakar': ['Dakar', 'Guédiawaye', 'Pikine', 'Rufisque'],
    'Thiès': ['Thiès', 'Mbour', 'Tivaouane'],
    'Saint-Louis': ['Saint-Louis', 'Dagana', 'Podor'],
    'Ziguinchor': ['Ziguinchor', 'Bignona', 'Oussouye'],
    'Diourbel': ['Diourbel', 'Bambey', 'Mbacké'],
    'Louga': ['Louga', 'Kébémer', 'Linguère'],
    'Fatick': ['Fatick', 'Foundiougne', 'Gossas'],
    'Kaolack': ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
    'Kolda': ['Kolda', 'Médina Yoro Foulah', 'Vélingara'],
    'Tambacounda': ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
    'Kaffrine': ['Kaffrine', 'Birkilane', 'Koungheul', 'Malem Hodar'],
    'Kédougou': ['Kédougou', 'Salémata', 'Saraya'],
    'Matam': ['Matam', 'Kanel', 'Ranérou'],
    'Sédhiou': ['Sédhiou', 'Bounkiling', 'Goudomp']
  }

  const regionsForCountry = locationData.country === 'SN' ? Object.keys(SENEGAL_REGIONS_DEPS) : []
  const departmentsForRegion = locationData.country === 'SN' && locationData.region
    ? (SENEGAL_REGIONS_DEPS[locationData.region] || [])
    : []

  const handleSaveLocation = async () => {
    setSavingLocation(true)
    setError('')
    try {
      await api.users.updateLocation(locationData)
      setLocationSuccess('Localisation mise à jour !')
      setTimeout(() => setLocationSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSavingLocation(false)
    }
  }

  // Load phone-based family status
  useEffect(() => {
    if (isAuthenticated) {
      api.parent.getFamilyStatus?.()?.then(res => {
        if (res?.success && res.data) {
          if (res.data.status === 'pending') {
            setFamilyPhoneStatus({ pending: true, parentPhone: res.data.pendingPhone })
          } else if (res.data.status === 'linked') {
            setFamilyPhoneStatus({ linked: true, parentName: res.data.parentName })
          }
        }
      }).catch(() => {})
    }
  }, [isAuthenticated])

  const handleLinkByPhone = async () => {
    if (!parentPhoneInput || parentPhoneInput.replace(/\D/g, '').length < 9) {
      setError('Numero de telephone invalide')
      return
    }
    setLinkingByPhone(true)
    try {
      const res = await api.parent.linkByPhone({ parentPhoneNumber: parentPhoneInput })
      if (res.success) {
        if (res.data?.pending) {
          setFamilyPhoneStatus({ pending: true, parentPhone: res.data.parentPhone })
          setSuccess('Lien en attente. Demande a ton parent de creer son compte.')
        } else {
          setFamilyPhoneStatus({ linked: true, parentName: res.data?.parentName })
          setSuccess('Lie a ton parent !')
        }
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Erreur de liaison')
    } finally {
      setLinkingByPhone(false)
    }
  }

  const handleUnlinkByPhone = async () => {
    try {
      await api.parent.unlinkByPhone()
      setFamilyPhoneStatus(null)
      setSuccess('Lien retire')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Erreur')
    }
  }

  const handleToggleNotifications = async () => {
    const newVal = !notificationsEnabled
    setNotificationsEnabled(newVal)
    try {
      await api.auth.updateProfile({ notificationsEnabled: newVal })
    } catch (err) {
      setNotificationsEnabled(!newVal) // revert on error
      console.error('Erreur toggle notifications:', err)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirmation) {
      setError('Mot de passe ou PIN requis pour confirmer')
      return
    }
    setDeleting(true)
    try {
      await api.auth.deleteAccount({ confirmation: deleteConfirmation })
      logout()
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-kprimary mx-auto mb-4" />
          <p className="text-gray-400 font-medium">{t('profile.loading') || 'Chargement du profil...'}</p>
        </div>
      </div>
    )
  }

  const inputClasses = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kprimary focus:border-transparent disabled:opacity-50 disabled:bg-white/[0.02] font-medium [&>option]:bg-gray-800 [&>option]:text-white"

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      {/* Header */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <User className="h-7 w-7 text-kprimary mr-3" />
              {t('profile.title')}
            </h1>
            <p className="text-gray-400 mt-1">
              {t('profile.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{t('profile.personalInfo')}</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-2 text-kprimary hover:text-kprimary-300 transition-colors text-sm"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    {t('profile.editProfile')}
                  </button>
                )}
              </div>

              <div className="p-5">
                {/* Messages */}
                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-sm text-emerald-400">{success}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Avatar with gradient ring */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="p-1 rounded-full bg-gradient-to-br from-kprimary to-ksecondary">
                        <div className="w-20 h-20 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user.firstName?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-kprimary rounded-full flex items-center justify-center hover:bg-kprimary-500 shadow-lg transition-colors">
                        <Camera className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('profile.firstName')}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('profile.lastName')}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('profile.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-kprimary text-white rounded-xl hover:bg-kprimary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? t('common.saving') : t('actions.save')}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t('actions.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Globe className="h-5 w-5 text-kprimary mr-2" />
                  Langue et Localisation
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Choisissez votre langue préférée
                    </label>
                    <LanguageSwitcher />
                    <p className="text-sm text-gray-500 mt-2">
                      Cette préférence sera sauvegardée et synchronisée sur tous vos appareils.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ma localisation */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="h-5 w-5 text-kprimary mr-2" />
                  Ma localisation
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ta position dans les classements dépend de ces infos
                </p>
              </div>
              <div className="p-5 space-y-4">
                {locationSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                    <p className="text-sm text-emerald-400">{locationSuccess}</p>
                  </div>
                )}

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Pays</label>
                  <select
                    value={locationData.country}
                    onChange={(e) => setLocationData(prev => ({ ...prev, country: e.target.value, region: '', department: '' }))}
                    className={inputClasses}
                  >
                    <option value="">Sélectionner un pays</option>
                    {AFRICAN_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Région</label>
                  {regionsForCountry.length > 0 ? (
                    <select
                      value={locationData.region}
                      onChange={(e) => setLocationData(prev => ({ ...prev, region: e.target.value, department: '' }))}
                      className={inputClasses}
                    >
                      <option value="">Sélectionner une région</option>
                      {regionsForCountry.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={locationData.region}
                      onChange={(e) => setLocationData(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="Votre région..."
                      className={inputClasses}
                    />
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Département</label>
                  {departmentsForRegion.length > 0 ? (
                    <select
                      value={locationData.department}
                      onChange={(e) => setLocationData(prev => ({ ...prev, department: e.target.value }))}
                      className={inputClasses}
                    >
                      <option value="">Sélectionner un département</option>
                      {departmentsForRegion.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={locationData.department}
                      onChange={(e) => setLocationData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Votre département..."
                      className={inputClasses}
                    />
                  )}
                </div>

                {/* School */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">École / Établissement</label>
                  <input
                    type="text"
                    value={locationData.school}
                    onChange={(e) => setLocationData(prev => ({ ...prev, school: e.target.value }))}
                    placeholder="Nom de votre établissement..."
                    className={inputClasses}
                  />
                </div>

                <button
                  onClick={handleSaveLocation}
                  disabled={savingLocation}
                  className="flex items-center px-4 py-2.5 bg-kprimary text-white rounded-xl hover:bg-kprimary-500 disabled:opacity-50 font-medium"
                >
                  {savingLocation ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sauvegarde...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Sauvegarder la localisation</>
                  )}
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Sécurité</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center px-3 py-2 text-kprimary hover:text-kprimary-300 transition-colors text-sm"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Changer le mot de passe
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <div className="p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('profile.currentPassword')}
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={inputClasses}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-kprimary text-white rounded-xl hover:bg-kprimary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Changement...' : 'Changer le mot de passe'}
                      </button>
                      <button
                        onClick={cancelPasswordChange}
                        className="flex items-center px-4 py-2 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t('actions.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Family Linking — simple: enter email or phone */}
            <div className="k-card overflow-hidden" style={{ background: profileData?.isParent ? 'rgba(108,99,255,0.08)' : 'rgba(0,217,163,0.06)', borderColor: profileData?.isParent ? 'rgba(108,99,255,0.2)' : 'rgba(0,217,163,0.2)' }}>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <Shield className="h-6 w-6 text-kprimary mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    {profileData?.isParent ? 'Liaison enfant' : 'Liaison parent'}
                  </h3>
                </div>

                {/* Simple linking form */}
                <DirectLinkForm
                  isParent={profileData?.isParent}
                  onSuccess={() => { fetchProfile(); setSuccess('Liaison etablie !'); setTimeout(() => setSuccess(''), 3000); }}
                />

                {/* Linked children (parent only) */}
                {profileData?.isParent && parentChildren.length > 0 ? (
                  <div className="mb-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1" /> Mes enfants ({parentChildren.length}/5)
                    </h4>
                    <div className="space-y-2">
                      {parentChildren.map(child => (
                        <div key={child.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/8">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {child.firstName || ''} {child.lastName || child.email}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{child.xp || 0} XP</span>
                              <span>Lv. {child.level || 1}</span>
                              <span>{child.streak || 0}j streak</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkChild(child.id)}
                            disabled={unlinkingChild === child.id}
                            className="ml-2 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          >
                            {unlinkingChild === child.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unlink className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">Aucun enfant li&eacute; pour le moment.</p>
                )}

                <Link
                  to="/parent-dashboard"
                  className="flex items-center justify-center px-4 py-2 bg-white/5 text-kprimary border border-kprimary/30 rounded-xl hover:bg-kprimary/10 transition-colors font-medium text-sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Dashboard Parents
                </Link>
              </div>
            </div>

            )}

            {/* Linked parent info (child only) */}
            {!profileData?.isParent && linkedParent && (
            <div className="k-card overflow-hidden" style={{ background: 'rgba(0,217,163,0.06)', borderColor: 'rgba(0,217,163,0.2)' }}>
              <div className="p-5">
                <p className="text-sm text-gray-300 mb-2">
                  Lie a : <strong className="text-ksecondary">{linkedParent}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-3">Ton parent peut suivre ta progression.</p>
                <button
                  onClick={handleUnlinkSelf}
                  className="px-3 py-1.5 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors text-xs font-medium flex items-center"
                >
                  <Unlink className="h-3 w-3 mr-1" /> Se delier
                </button>
              </div>
            </div>
            )}

            {/* Old phone linking section removed — replaced by DirectLinkForm above */}

            {/* Subscriptions */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-kprimary mr-2" />
                  <h3 className="text-lg font-semibold text-white">Abonnements</h3>
                </div>
              </div>
              <div className="p-5">
                <SubscriptionSection />
              </div>
            </div>

            {/* Preferences */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-kprimary mr-2" />
                  <h3 className="text-lg font-semibold text-white">Pr&eacute;f&eacute;rences</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Notifications</p>
                    <p className="text-xs text-gray-400">Recevoir les notifications de badges, duels et challenges</p>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-kprimary' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Delete account */}
            <div className="k-card overflow-hidden border-red-500/20">
              <div className="p-5 border-b border-red-500/10">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <h3 className="text-lg font-semibold text-red-400">Zone dangereuse</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-400 mb-4">
                  La suppression de ton compte est irr&eacute;versible. Toutes tes donn&eacute;es seront perdues.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 inline mr-1.5" />
                  Supprimer mon compte
                </button>
              </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
                  <h3 className="text-lg font-bold text-red-400 mb-3">Supprimer mon compte</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Cette action est irr&eacute;versible. Entre ton mot de passe ou PIN pour confirmer.
                  </p>
                  <input
                    type="password"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Mot de passe ou PIN"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                  {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
                      className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || !deleteConfirmation}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      {deleting ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats — 2x2 grid */}
            <div className="k-card overflow-hidden">
              <div className="p-5 border-b border-white/8">
                <h3 className="text-lg font-semibold text-white">Statistiques</h3>
              </div>

              <div className="p-5">
                {loadingStats ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-white/5 rounded-xl"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 bg-white/5 rounded-xl"></div>
                      <div className="h-20 bg-white/5 rounded-xl"></div>
                      <div className="h-20 bg-white/5 rounded-xl"></div>
                      <div className="h-20 bg-white/5 rounded-xl"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-5">
                      <div className="p-1 rounded-full bg-gradient-to-br from-kprimary to-ksecondary inline-block mb-3">
                        <div className="w-16 h-16 bg-[#1A1A2E] rounded-full flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-yellow-400" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-black text-white">
                        Niveau {userStats?.level || user.level || 1}
                      </h4>
                      <p className="text-gray-400 font-medium text-sm">
                        {userStats?.totalXp || user.xp || 0} points d'expérience
                      </p>
                    </div>

                    {/* 2x2 stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <Target className="h-5 w-5" />, label: 'Problèmes résolus', value: userStats?.problemsSolved || 0, color: 'text-kprimary', bg: 'bg-kprimary/15' },
                        { icon: <Star className="h-5 w-5" />, label: 'Quiz complétés', value: userStats?.quizzesCompleted || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
                        { icon: <Award className="h-5 w-5" />, label: 'Badges obtenus', value: userStats?.badgesEarned || 0, color: 'text-ksecondary', bg: 'bg-ksecondary/15' },
                        { icon: <TrendingUp className="h-5 w-5" />, label: 'Série actuelle', value: `${userStats?.streak || user.streak || 0}j`, color: 'text-orange-400', bg: 'bg-orange-500/15' }
                      ].map((stat, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                          <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                            {stat.icon}
                          </div>
                          <div className="text-lg font-black text-white">{stat.value}</div>
                          <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {userStats && (
                      <div className="mt-4 space-y-2">
                        {userStats.daysActiveLast30Days > 0 && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                            <div className="flex items-center text-gray-400 text-xs">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              Jours actifs (30j)
                            </div>
                            <span className="font-bold text-white text-sm">{userStats.daysActiveLast30Days}</span>
                          </div>
                        )}
                        {userStats.estimatedStudyTimeHours > 0 && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                            <div className="flex items-center text-gray-400 text-xs">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              Temps d'étude
                            </div>
                            <span className="font-bold text-white text-sm">{userStats.estimatedStudyTimeHours}h</span>
                          </div>
                        )}
                        {userStats.quizAverageScore > 0 && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                            <div className="flex items-center text-gray-400 text-xs">
                              <Star className="h-3.5 w-3.5 mr-1.5" />
                              Score moyen quiz
                            </div>
                            <span className="font-bold text-white text-sm">{userStats.quizAverageScore}%</span>
                          </div>
                        )}
                      </div>
                    )}
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
