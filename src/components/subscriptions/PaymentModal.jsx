/**
 * 💳 Modal de Paiement — Wave Checkout
 * Redirige vers la page Wave pour le paiement
 */

import React, { useState } from 'react'
import api from '../../services/api'
import { X, Loader2, AlertCircle } from 'lucide-react'

const PaymentModal = ({ plan, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (amount) => {
    return `${Number(amount).toLocaleString('fr-FR')} FCFA`
  }

  const handleWavePayment = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.payments.initiateWave({ planId: plan.id })

      if (response.success && response.data.wave_launch_url) {
        window.location.href = response.data.wave_launch_url
      } else {
        setError('Erreur lors de l\'initiation du paiement.')
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du paiement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl max-w-md w-full border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Paiement Wave</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Plan summary */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="font-semibold text-white">{plan.displayName || plan.name}</div>
            <div className="text-2xl font-black text-white mt-1">
              {formatPrice(plan.price)}
            </div>
            <div className="text-sm text-gray-400">/ {plan.duration} jours</div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleWavePayment}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50"
              style={{ backgroundColor: '#1DC8FF', color: '#000' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Redirection...
                </>
              ) : (
                'Payer avec Wave'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
