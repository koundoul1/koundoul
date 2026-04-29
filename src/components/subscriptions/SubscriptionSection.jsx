/**
 * 📦 Section Abonnements dans le Profil
 * Affiche l'abonnement actuel et l'historique des paiements
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Loader2, CheckCircle, Calendar, ExternalLink, CreditCard, Clock } from 'lucide-react'

const SubscriptionSection = () => {
  const navigate = useNavigate()
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [subscriptionRes, paymentsRes] = await Promise.all([
        api.subscriptions.getMySubscription().catch(() => ({ success: false })),
        api.payments.getHistory().catch(() => ({ success: false, data: [] }))
      ])

      if (subscriptionRes.success && subscriptionRes.data) {
        setCurrentSubscription(subscriptionRes.data)
      }

      if (paymentsRes.success && paymentsRes.data) {
        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
      }
    } catch (err) {
      console.error('Erreur chargement abonnement:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Actif', pending: 'En attente', completed: 'Complété',
      failed: 'Échoué', cancelled: 'Annulé', expired: 'Expiré'
    }
    return labels[status?.toLowerCase()] || status
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase()
    if (s === 'active' || s === 'completed') return 'text-green-400 bg-green-500/15'
    if (s === 'pending') return 'text-yellow-400 bg-yellow-500/15'
    if (s === 'failed' || s === 'cancelled' || s === 'expired') return 'text-red-400 bg-red-500/15'
    return 'text-gray-400 bg-gray-500/15'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-kprimary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Abonnement actuel */}
      {currentSubscription ? (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-400">Abonnement actif</span>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {currentSubscription.plan?.displayName || currentSubscription.plan?.name}
          </div>
          <div className="flex items-center text-sm text-gray-400 mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Valide jusqu'au {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <p className="text-gray-400 text-sm mb-3">Aucun abonnement actif</p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center mx-auto gap-2"
            style={{ backgroundColor: '#1DC8FF', color: '#000' }}
          >
            <ExternalLink className="h-4 w-4" />
            Voir les plans
          </button>
        </div>
      )}

      {/* Historique des paiements */}
      {payments.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            Historique des paiements
          </h4>
          <div className="space-y-2">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/8">
                <div>
                  <div className="text-sm font-medium text-white">
                    {Number(payment.amount).toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                    {payment.subscription?.plan?.displayName && ` • ${payment.subscription.plan.displayName}`}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {getStatusLabel(payment.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionSection
