/**
 * Page de Connexion Koundoul
 * Dark theme matching the rest of the app
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

const Login = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const hasNavigated = useRef(false)

  const { login, isAuthenticated, user, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated (e.g. user visits /login while logged in)
  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true
      const defaultRoute = user.is_admin ? '/admin' : '/dashboard'
      const from = location.state?.from?.pathname || defaultRoute
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, location])

  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [formData, clearError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = t('auth.login.errors.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.login.errors.emailInvalid')
    }
    if (!formData.password) {
      newErrors.password = t('auth.login.errors.passwordRequired')
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.login.errors.passwordMinLength')
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
      const result = await login(formData)
      if (result.success) {
        hasNavigated.current = true
        const defaultRoute = result.user?.is_admin ? '/admin' : '/dashboard'
        const from = location.state?.from?.pathname || defaultRoute
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: '#0B0B18' }}>
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kprimary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ksecondary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo + Header */}
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

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                {t('auth.login.emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-white/30" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 focus:border-kprimary/50 transition-all placeholder-white/25 ${
                    errors.email ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder={t('auth.login.emailPlaceholder')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                {t('auth.login.passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-white/30" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-12 py-3 text-sm text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 focus:border-kprimary/50 transition-all placeholder-white/25 ${
                    errors.password ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder={t('auth.login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-white/40 hover:text-kprimary transition-colors"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl p-3.5 bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-kprimary to-ksecondary text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-kprimary/50 focus:ring-offset-2 focus:ring-offset-[#0B0B18] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center active:scale-[0.98] text-sm shadow-lg shadow-kprimary/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4.5 w-4.5 mr-2" />
                  {t('auth.login.submitting')}
                </>
              ) : (
                <>
                  {t('auth.login.submitButton')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/30 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-white/50">
            {t('auth.login.noAccount')}{' '}
            <Link
              to="/register"
              className="font-semibold text-kprimary hover:text-kprimary/80 transition-colors"
            >
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-white/25 leading-relaxed">
            {t('auth.login.terms').split('{terms}')[0]}
            <Link to="/terms" className="text-white/40 hover:text-white/60 transition-colors">
              {t('auth.login.termsLink')}
            </Link>
            {' '}{t('auth.login.terms').split('{terms}')[1].split('{privacy}')[0]}
            <Link to="/privacy" className="text-white/40 hover:text-white/60 transition-colors">
              {t('auth.login.privacyLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
