/**
 * 💳 Modal de Paiement
 * Supporte Stripe, Wave et Orange Money
 */

import React, { useState } from 'react'
import api from '../../services/api'
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const PaymentModal = ({ plan, subscription, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [clientSecret, setClientSecret] = useState(null) // Pour Stripe

  const formatPrice = (amount, currency = 'xof') => {
    if (currency === 'xof') {
      return `${(amount / 1).toLocaleString('fr-FR')} FCFA`
    }
    return `${(amount / 100).toFixed(2)} €`
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      if ((paymentMethod === 'wave' || paymentMethod === 'orange_money') && !phoneNumber) {
        setError('Veuillez saisir votre numéro de téléphone')
        return
      }

      let result

      if (paymentMethod === 'stripe') {
        // Créer l'intention de paiement Stripe
        const response = await api.payments.createStripeIntent({
          planId: plan.id,
          subscriptionId: subscription?.id
        })

        if (response.success) {
          setClientSecret(response.data.clientSecret)
          // Ici, vous devriez intégrer Stripe Elements pour compléter le paiement
          // Pour l'instant, on simule le succès
          setSuccess(true)
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          setError(response.error?.message || 'Erreur lors de la création du paiement')
        }
      } else if (paymentMethod === 'wave') {
        const response = await api.payments.createWavePayment({
          planId: plan.id,
          subscriptionId: subscription?.id,
          phoneNumber
        })

        if (response.success) {
          setSuccess(true)
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          setError(response.error?.message || 'Erreur lors de la création du paiement Wave')
        }
      } else if (paymentMethod === 'orange_money') {
        const response = await api.payments.createOrangeMoneyPayment({
          planId: plan.id,
          subscriptionId: subscription?.id,
          phoneNumber
        })

        if (response.success) {
          setSuccess(true)
          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          setError(response.error?.message || 'Erreur lors de la création du paiement Orange Money')
        }
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Paiement initié avec succès</h3>
            <p className="text-gray-600 mb-4">
              {paymentMethod === 'stripe' && 'Votre paiement est en cours de traitement.'}
              {paymentMethod === 'wave' && 'Veuillez confirmer le paiement sur votre application Wave.'}
              {paymentMethod === 'orange_money' && 'Veuillez confirmer le paiement via USSD ou l\'application Orange Money.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Paiement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plan sélectionné */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-semibold text-gray-900">{plan.name}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(plan.price, plan.currency)}
            </div>
            <div className="text-sm text-gray-500">par mois</div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Méthode de paiement
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`w-full flex items-center p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Carte bancaire (Stripe)</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('wave')}
                className={`w-full flex items-center p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'wave'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-5 w-5 mr-3 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
                  W
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Wave Sénégal</div>
                  <div className="text-sm text-gray-500">Paiement mobile</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('orange_money')}
                className={`w-full flex items-center p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'orange_money'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-5 w-5 mr-3 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  OM
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Orange Money</div>
                  <div className="text-sm text-gray-500">Paiement mobile</div>
                </div>
              </button>
            </div>
          </div>

          {/* Numéro de téléphone pour Wave/Orange Money */}
          {(paymentMethod === 'wave' || paymentMethod === 'orange_money') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+221 77 123 45 67"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payer {formatPrice(plan.price, plan.currency)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
