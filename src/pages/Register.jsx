/**
 * Page d'Inscription Koundoul
 * Dual auth: email+password OU email+telephone+PIN
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import api from '../services/api'
import PhoneInput from '../components/PhoneInput'
import PinInput from '../components/PinInput'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'

const Register = () => {
  const { t } = useTranslation()
  const [authMode, setAuthMode] = useState('password') // 'password' or 'phone'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('+221')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isChecking, setIsChecking] = useState({ email: false, username: false })

  const { register, isAuthenticated, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    if (error) clearError()
  }, [formData, password, pin, clearError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const checkEmailAvailability = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return
    setIsChecking(prev => ({ ...prev, email: true }))
    try {
      const response = await api.utils.checkEmail(email)
      if (!response.available) {
        setErrors(prev => ({ ...prev, email: t('auth.register.errors.emailTaken') }))
      }
    } catch (err) {
      console.error('Email check error:', err)
    } finally {
      setIsChecking(prev => ({ ...prev, email: false }))
    }
  }

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) return
    setIsChecking(prev => ({ ...prev, username: true }))
    try {
      const response = await api.utils.checkUsername(username)
      if (!response.available) {
        setErrors(prev => ({ ...prev, username: t('auth.register.errors.usernameTaken') }))
      }
    } catch (err) {
      console.error('Username check error:', err)
    } finally {
      setIsChecking(prev => ({ ...prev, username: false }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = t('auth.register.errors.firstNameRequired')
    if (!formData.lastName.trim()) newErrors.lastName = t('auth.register.errors.lastNameRequired')

    if (!formData.username.trim()) {
      newErrors.username = t('auth.register.errors.usernameRequired')
    } else if (formData.username.length < 3) {
      newErrors.username = t('auth.register.errors.usernameMinLength')
    }

    if (!formData.email) {
      newErrors.email = t('auth.register.errors.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.register.errors.emailInvalid')
    }

    if (authMode === 'password') {
      if (!password) {
        newErrors.password = t('auth.register.errors.passwordRequired')
      } else if (password.length < 8) {
        newErrors.password = t('auth.register.errors.passwordMinLength')
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('auth.register.errors.passwordsNotMatch')
      }
    } else {
      // phone mode
      if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 9) {
        newErrors.phone = 'Numero de telephone invalide'
      }
      if (!pin || pin.length !== 4) {
        newErrors.pin = 'PIN 4 chiffres requis'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    clearError()

    try {
      const data = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim()
      }

      if (authMode === 'password') {
        data.password = password
      } else {
        data.phoneNumber = phoneNumber
        data.pin = pin
      }

      const result = await register(data)
      if (result.success) {
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.error('Erreur inscription:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: '#0B0B18' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kprimary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ksecondary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-kprimary to-ksecondary rounded-2xl flex items-center justify-center shadow-lg shadow-kprimary/30 hover:scale-110 transition-transform">
              <span className="text-2xl font-black text-white">K</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('auth.register.title')}
          </h1>
          <p className="text-sm text-white/50">{t('auth.register.subtitle')}</p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.register.firstNameLabel')}</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.firstName ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder="Prenom"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.register.lastNameLabel')}</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.lastName ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder="Nom"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.register.usernameLabel')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-white/30" />
                </div>
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => checkUsernameAvailability(formData.username)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.username ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder={t('auth.register.usernamePlaceholder')}
                />
                {isChecking.username && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
            </div>

            {/* Email (always required) */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email (obligatoire)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-white/30" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => checkEmailAvailability(formData.email)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder={t('auth.register.emailPlaceholder')}
                />
                {isChecking.email && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Auth mode toggle */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Methode de connexion</label>
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    authMode === 'password' ? 'bg-kprimary text-white shadow' : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('phone')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    authMode === 'phone' ? 'bg-kprimary text-white shadow' : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Telephone + PIN
                </button>
              </div>
            </div>

            {/* Password fields */}
            {authMode === 'password' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.register.passwordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-white/30" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-12 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                      placeholder="Min. 8 caracteres"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.register.confirmPasswordLabel')}</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder="Confirmer le mot de passe"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Phone + PIN fields */}
            {authMode === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Numero de telephone</label>
                  <PhoneInput
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    error={errors.phone}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Code PIN (4 chiffres)</label>
                  <PinInput
                    value={pin}
                    onChange={setPin}
                    error={errors.pin}
                  />
                  <p className="mt-2 text-xs text-white/30 text-center">
                    Ce PIN te servira a te connecter rapidement
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-kprimary to-ksecondary text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-kprimary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm shadow-lg shadow-kprimary/25"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin h-4 w-4 mr-2" />{t('auth.register.submitting')}</>
              ) : (
                t('auth.register.submitButton')
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/30">ou</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <p className="text-center text-sm text-white/50">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-kprimary hover:text-kprimary/80 transition-colors">
              {t('auth.register.login')}
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-white/25">
            En t&apos;inscrivant, tu acceptes nos conditions d&apos;utilisation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
