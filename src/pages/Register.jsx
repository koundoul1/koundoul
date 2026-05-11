/**
 * Page d'Inscription Koundoul — 2 étapes
 * Étape 1: choix méthode auth + identifiants
 * Étape 2: infos profil
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import api from '../services/api'
import PhoneInput from '../components/PhoneInput'
import PinInput from '../components/PinInput'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

const Register = () => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1) // 1 = auth method, 2 = profile info
  const [authMode, setAuthMode] = useState(null) // null | 'password' | 'phone'

  // Auth fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('+221')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isChecking, setIsChecking] = useState({ email: false, username: false })

  const { register, isAuthenticated, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    if (error) clearError()
  }, [email, username]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkEmailAvailability = async (val) => {
    if (!val || !/\S+@\S+\.\S+/.test(val)) return
    setIsChecking(prev => ({ ...prev, email: true }))
    try {
      const res = await api.utils.checkEmail(val)
      if (!res.available) setErrors(prev => ({ ...prev, email: t('auth.register.errors.emailTaken') }))
    } catch (_e) { /* silent */ } finally { setIsChecking(prev => ({ ...prev, email: false })) }
  }

  const checkUsernameAvailability = async (val) => {
    if (!val || val.length < 3) return
    setIsChecking(prev => ({ ...prev, username: true }))
    try {
      const res = await api.utils.checkUsername(val)
      if (!res.available) setErrors(prev => ({ ...prev, username: t('auth.register.errors.usernameTaken') }))
    } catch (_e) { /* silent */ } finally { setIsChecking(prev => ({ ...prev, username: false })) }
  }

  // Validate step 1
  const validateStep1 = () => {
    const e = {}
    if (!authMode) { e.mode = t('auth.register.errors.chooseMethod'); setErrors(e); return false }

    if (authMode === 'password') {
      if (!email) e.email = t('auth.register.errors.emailRequired')
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.register.errors.emailInvalid')
      if (!password) e.password = t('auth.register.errors.passwordRequired')
      else if (password.length < 8) e.password = t('auth.register.errors.passwordMinLength')
      if (password !== confirmPassword) e.confirmPassword = t('auth.register.errors.passwordsNotMatch')
    } else {
      // phone mode
      if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 9) e.phone = t('auth.register.errors.phoneInvalid')
      if (!pin || pin.length !== 4) e.pin = t('auth.register.errors.pinRequired')
      if (!email) e.email = t('auth.register.errors.emailRequiredRecovery')
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.register.errors.emailInvalid')
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Validate step 2
  const validateStep2 = () => {
    const e = {}
    if (!firstName.trim()) e.firstName = t('auth.register.errors.firstNameRequired')
    if (!lastName.trim()) e.lastName = t('auth.register.errors.lastNameRequired')
    if (!username.trim()) e.username = t('auth.register.errors.usernameRequired')
    else if (username.length < 3) e.username = t('auth.register.errors.usernameMinLength')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goToStep2 = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) return

    setIsLoading(true)
    clearError()

    try {
      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim()
      }
      if (authMode === 'password') {
        data.password = password
      } else {
        data.phoneNumber = phoneNumber
        data.pin = pin
      }

      const result = await register(data)
      if (result.success) {
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
      }
    } catch (err) {
      if (!error) setErrors(prev => ({ ...prev, api: err.message || 'Erreur lors de l\'inscription' }))
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
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-kprimary to-ksecondary rounded-2xl flex items-center justify-center shadow-lg shadow-kprimary/30 hover:scale-110 transition-transform">
              <span className="text-2xl font-black text-white">K</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('auth.register.title')}
          </h1>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-8 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-kprimary' : 'bg-white/10'}`} />
            <div className={`w-8 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-kprimary' : 'bg-white/10'}`} />
          </div>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>

          {/* ═══ STEP 1: Auth method ═══ */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm text-white/50 text-center mb-2">{t('auth.register.step1Title')}</p>

              {/* Method choice — big cards */}
              {!authMode && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/10 hover:border-kprimary/50 bg-white/[0.02] hover:bg-kprimary/5 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t('auth.register.methodEmail')}</p>
                      <p className="text-xs text-white/40">{t('auth.register.methodEmailDesc')}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('phone')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/10 hover:border-blue-500/50 bg-white/[0.02] hover:bg-blue-500/5 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t('auth.register.methodPhone')}</p>
                      <p className="text-xs text-white/40">{t('auth.register.methodPhoneDesc')}</p>
                    </div>
                  </button>
                  {errors.mode && <p className="text-xs text-red-400 text-center">{errors.mode}</p>}
                </div>
              )}

              {/* Password mode fields */}
              {authMode === 'password' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-400 flex items-center gap-1.5">
                      <Mail className="h-4 w-4" /> Email + Mot de passe
                    </span>
                    <button type="button" onClick={() => { setAuthMode(null); setErrors({}) }} className="text-xs text-white/30 hover:text-white/60">Changer</button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })) }}
                      onBlur={() => checkEmailAvailability(email)}
                      className={`w-full px-4 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                      placeholder="ton@email.com"
                    />
                    {isChecking.email && <Loader2 className="inline h-3 w-3 animate-spin text-gray-400 mt-1" />}
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Mot de passe (min. 8 caract{'\u00e8'}res)</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 pr-12 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                        placeholder="Min. 8 caract\u00e8res"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Confirmer le mot de passe</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`}
                      placeholder="Confirmer"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              {/* Phone mode fields */}
              {authMode === 'phone' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400 flex items-center gap-1.5">
                      <Phone className="h-4 w-4" /> T{'\u00e9'}l{'\u00e9'}phone + Code PIN
                    </span>
                    <button type="button" onClick={() => { setAuthMode(null); setErrors({}) }} className="text-xs text-white/30 hover:text-white/60">Changer</button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Num{'\u00e9'}ro de t{'\u00e9'}l{'\u00e9'}phone</label>
                    <PhoneInput value={phoneNumber} onChange={setPhoneNumber} error={errors.phone} />
                    {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Code PIN (4 chiffres)</label>
                    <PinInput value={pin} onChange={setPin} error={errors.pin} />
                    <p className="mt-2 text-xs text-white/30 text-center">Ce PIN te servira {'\u00e0'} te connecter rapidement</p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Email (pour r{'\u00e9'}cup{'\u00e9'}ration de compte)</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })) }}
                      onBlur={() => checkEmailAvailability(email)}
                      className={`w-full px-4 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-white/25 ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                      placeholder="ton@email.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    <p className="mt-1 text-xs text-white/20">N{'\u00e9'}cessaire si tu oublies ton PIN</p>
                  </div>
                </div>
              )}

              {/* Next button */}
              {authMode && (
                <button
                  type="button"
                  onClick={goToStep2}
                  className="w-full bg-gradient-to-r from-kprimary to-ksecondary text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center text-sm shadow-lg shadow-kprimary/25"
                >
                  {t('auth.register.next')} <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          )}

          {/* ═══ STEP 2: Profile info ═══ */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/50">{t('auth.register.step2Title')}</p>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> {t('auth.register.back')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Pr{'\u00e9'}nom</label>
                  <input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.firstName ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder="Pr\u00e9nom"
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Nom</label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.lastName ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder="Nom"
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Nom d&apos;utilisateur</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-white/30" />
                  </div>
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => checkUsernameAvailability(username)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 placeholder-white/25 ${errors.username ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder={t('auth.register.usernamePlaceholder')}
                  />
                  {isChecking.username && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
              </div>

              {/* Summary of auth method chosen */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/40">
                {authMode === 'password' ? (
                  <span><Mail className="h-3 w-3 inline mr-1" /> Connexion par email : {email}</span>
                ) : (
                  <span><Phone className="h-3 w-3 inline mr-1" /> Connexion par t{'\u00e9'}l{'\u00e9'}phone : {phoneNumber}</span>
                )}
              </div>

              {(error || errors.api) && (
                <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error || errors.api}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-kprimary to-ksecondary text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-sm shadow-lg shadow-kprimary/25"
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin h-4 w-4 mr-2" />{t('auth.register.submitting')}</>
                ) : (
                  t('auth.register.submitButton')
                )}
              </button>
            </form>
          )}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/30">ou</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <p className="mt-4 text-center text-sm text-white/50">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-kprimary hover:text-kprimary/80 transition-colors">
              {t('auth.register.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
