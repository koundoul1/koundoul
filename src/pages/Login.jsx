/**
 * Page de Connexion Koundoul
 * Unified login: email+password OR phone+PIN
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { Eye, EyeOff, Mail, Lock, Phone, Loader2, ArrowRight } from 'lucide-react'

function isPhoneInput(value) {
  return value && value.trim().startsWith('+')
}

const Login = () => {
  const { t } = useTranslation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const hasNavigated = useRef(false)

  const { login, isAuthenticated, user, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isPhone = isPhoneInput(identifier)

  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true
      const defaultRoute = user.is_admin ? '/admin' : '/dashboard'
      const from = location.state?.from?.pathname || defaultRoute
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, location])

  useEffect(() => {
    if (error) clearError()
  }, [identifier, password, pin, clearError])

  const validateForm = () => {
    const newErrors = {}
    if (!identifier.trim()) {
      newErrors.identifier = 'Email ou numero de telephone requis'
    }
    if (isPhone) {
      if (!pin || pin.length !== 4) {
        newErrors.credential = 'PIN 4 chiffres requis'
      }
    } else {
      if (!password) {
        newErrors.credential = t('auth.login.errors.passwordRequired')
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
      const credentials = isPhone
        ? { identifier: identifier.trim(), pin }
        : { email: identifier.trim(), password }

      const result = await login(credentials)
      if (result.success) {
        hasNavigated.current = true
        const defaultRoute = result.user?.is_admin ? '/admin' : '/dashboard'
        const from = location.state?.from?.pathname || defaultRoute
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-kprimary to-ksecondary rounded-2xl flex items-center justify-center shadow-lg shadow-kprimary/30 hover:scale-110 transition-transform">
              <span className="text-2xl font-black text-white">K</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('auth.login.title')}
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier: email or phone */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-white/70 mb-2">
                Email ou telephone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {isPhone ? <Phone className="h-4 w-4 text-white/30" /> : <Mail className="h-4 w-4 text-white/30" />}
                </div>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setPin(''); }}
                  className={`block w-full pl-11 pr-4 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 transition-all placeholder-white/25 ${
                    errors.identifier ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder="email@exemple.com ou +221..."
                />
              </div>
              {errors.identifier && <p className="mt-1.5 text-xs text-red-400">{errors.identifier}</p>}
              {isPhone && (
                <p className="mt-1 text-xs text-white/30">Connexion par telephone detectee</p>
              )}
            </div>

            {/* Credential: password or PIN */}
            {isPhone ? (
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-white/70 mb-2">
                  Code PIN (4 chiffres)
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={pin[i] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        const newPin = pin.split('')
                        newPin[i] = val
                        setPin(newPin.join('').slice(0, 4))
                        if (val && i < 3) {
                          const next = e.target.parentElement?.nextElementSibling?.querySelector('input')
                          || e.target.nextElementSibling
                          if (next) next.focus()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !pin[i] && i > 0) {
                          const prev = e.target.parentElement?.previousElementSibling?.querySelector('input')
                          if (prev) prev.focus()
                        }
                      }}
                      className="w-14 h-14 text-center text-2xl font-bold text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 focus:border-kprimary/50"
                    />
                  ))}
                </div>
                {errors.credential && <p className="mt-2 text-xs text-red-400 text-center">{errors.credential}</p>}
                <p className="mt-2 text-xs text-white/30 text-center">
                  PIN oublie ? Connecte-toi par email pour le reinitialiser.
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  {t('auth.login.passwordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-white/30" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-11 pr-12 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 transition-all placeholder-white/25 ${
                      errors.credential ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                    }`}
                    placeholder={t('auth.login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.credential && <p className="mt-1.5 text-xs text-red-400">{errors.credential}</p>}
              </div>
            )}

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-white/40 hover:text-kprimary transition-colors">
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            {error && (
              <div className="rounded-xl p-3.5 bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-kprimary to-ksecondary text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-kprimary/50 focus:ring-offset-2 focus:ring-offset-[#0B0B18] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center active:scale-[0.98] text-sm shadow-lg shadow-kprimary/25"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin h-4 w-4 mr-2" />{t('auth.login.submitting')}</>
              ) : (
                <>{t('auth.login.submitButton')}<ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/30 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <p className="text-center text-sm text-white/50">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-kprimary hover:text-kprimary/80 transition-colors">
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-white/25 leading-relaxed">
            En te connectant, tu acceptes nos conditions d&apos;utilisation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
