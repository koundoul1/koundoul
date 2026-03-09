/**
 * Page Abonnements - Plans et paiement Wave Checkout
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Users,
  Zap,
  CheckCircle,
  Sparkles,
  Shield,
  TrendingUp,
  Loader2,
  Star
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const Subscriptions = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, subscriptionRes] = await Promise.all([
        api.subscriptions.getPlans(),
        api.subscriptions.getMySubscription()
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (subscriptionRes.success && subscriptionRes.data) {
        setCurrentSubscription(subscriptionRes.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setProcessingPlanId(plan.id);

      const response = await api.payments.initiateWave({ planId: plan.id });

      if (response.success && response.data.wave_launch_url) {
        window.location.href = response.data.wave_launch_url;
      } else {
        alert('Erreur lors de l\'initiation du paiement.');
        setProcessingPlanId(null);
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      alert(error.message || 'Erreur lors du paiement.');
      setProcessingPlanId(null);
    }
  };

  const formatPrice = (amount) => {
    return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'FREE': return <Sparkles className="w-8 h-8" />;
      case 'PREMIUM':
      case 'PREMIUM_YEARLY': return <Crown className="w-8 h-8" />;
      case 'FAMILY': return <Users className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  const isRecommended = (planName) => {
    return planName === 'PREMIUM';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            {t('subscriptions.title')}
          </h1>
          <p className="text-xl text-white/90">
            {t('subscriptions.subtitle')}
          </p>
        </div>
      </div>

      {/* Abonnement actuel */}
      {currentSubscription && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {t('subscriptions.current.title')}
                </h2>
                <p className="text-lg">{currentSubscription.plan.displayName}</p>
                <p className="text-sm opacity-90 mt-2">
                  {t('subscriptions.current.validUntil')} {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <CheckCircle className="w-12 h-12" />
            </div>
          </div>
        </div>
      )}

      {/* Plans disponibles */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const isFree = plan.name === 'FREE';
            const recommended = isRecommended(plan.name);
            const isProcessing = processingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 transition-all duration-300 ${
                  isCurrentPlan
                    ? 'border-green-500 scale-105'
                    : recommended
                    ? 'border-[#1DC8FF] scale-105 shadow-lg shadow-[#1DC8FF]/20'
                    : 'border-white/10 hover:border-purple-500/50 hover:scale-105'
                }`}
              >
                {/* Badge Populaire */}
                {recommended && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1DC8FF] text-black text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Populaire
                    </span>
                  </div>
                )}

                {/* Header du plan */}
                <div className={`w-16 h-16 bg-gradient-to-br ${
                  isFree ? 'from-gray-500 to-gray-600' :
                  plan.name === 'FAMILY' ? 'from-blue-500 to-cyan-500' :
                  'from-purple-500 to-pink-500'
                } rounded-xl flex items-center justify-center mb-4 text-white`}>
                  {getPlanIcon(plan.name)}
                </div>

                <h3 className="text-2xl font-black mb-2">{plan.displayName}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>

                {/* Prix */}
                <div className="mb-6">
                  {isFree ? (
                    <div className="text-4xl font-black text-white">Gratuit</div>
                  ) : (
                    <>
                      <div className="text-4xl font-black text-white">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-gray-400">
                        / {plan.duration} jours
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Bouton */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 bg-green-500/20 text-green-400 rounded-xl font-bold border border-green-500/30"
                  >
                    {t('subscriptions.current.active')}
                  </button>
                ) : isFree ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-700 text-gray-400 rounded-xl font-bold"
                  >
                    Plan actuel
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!processingPlanId}
                    className="w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: '#1DC8FF', color: '#000' }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#1DC8FF"/>
                          <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">W</text>
                        </svg>
                        Payer avec Wave
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pourquoi s'abonner */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10">
          <h2 className="text-3xl font-black mb-6 text-center">
            {t('subscriptions.why.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('subscriptions.why.unlimited.title')}</h3>
              <p className="text-gray-400">{t('subscriptions.why.unlimited.desc')}</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('subscriptions.why.support.title')}</h3>
              <p className="text-gray-400">{t('subscriptions.why.support.desc')}</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('subscriptions.why.progress.title')}</h3>
              <p className="text-gray-400">{t('subscriptions.why.progress.desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité des paiements */}
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400 text-sm">
          Paiements sécurisés par Wave. Vos données sont protégées.
        </p>
      </div>
    </div>
  );
};

export default Subscriptions;
