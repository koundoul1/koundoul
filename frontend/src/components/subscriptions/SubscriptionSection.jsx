/**
 * 📦 Section Abonnements dans le Profil
 * Gestion des abonnements et paiements
 */

import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { CreditCard, Loader2, CheckCircle, XCircle, Calendar, Zap } from 'lucide-react'
import PaymentModal from './PaymentModal'

const SubscriptionSection = () => {
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [plansRes, subscriptionRes] = await Promise.all([
        api.subscriptions.getPlans(),
        api.subscriptions.getMySubscription()
      ])

      if (plansRes.success) {
        setPlans(plansRes.data)
      }

      if (subscriptionRes.success && subscriptionRes.data) {
        setCurrentSubscription(subscriptionRes.data)
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedPlan(null)
    loadData()
  }

  const formatPrice = (amount, currency = 'xof') => {
    if (currency === 'xof') {
      return `${(amount / 1).toLocaleString('fr-FR')} FCFA`
    }
    return `${(amount / 100).toFixed(2)} €`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50'
      case 'PENDING_PAYMENT':
        return 'text-yellow-600 bg-yellow-50'
      case 'EXPIRED':
        return 'text-red-600 bg-red-50'
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif'
      case 'PENDING_PAYMENT':
        return 'Paiement en attente'
      case 'EXPIRED':
        return 'Expiré'
      case 'CANCELLED':
        return 'Annulé'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Abonnement actuel */}
      {currentSubscription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mon Abonnement</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
              {getStatusLabel(currentSubscription.status)}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentSubscription.plan.name}</div>
              <div className="text-sm text-gray-500">{currentSubscription.plan.description}</div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Valable jusqu'au {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            {currentSubscription.plan.features && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités incluses :</div>
                <ul className="space-y-1">
                  {currentSubscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plans disponibles */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentSubscription ? 'Changer de plan' : 'Choisir un abonnement'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id && currentSubscription?.status === 'ACTIVE'
            const isPopular = plan.name === 'Premium'

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-sm border-2 ${
                  isPopular ? 'border-blue-500' : 'border-gray-200'
                } p-6 relative ${isCurrentPlan ? 'opacity-60' : ''}`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Populaire
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price, plan.currency)}</span>
                    <span className="text-gray-500 text-sm">/mois</span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                )}

                {plan.features && (
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                  >
                    Plan actuel
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Choisir ce plan
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          subscription={currentSubscription}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPlan(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default SubscriptionSection
