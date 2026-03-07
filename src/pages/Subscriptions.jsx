/**
 * 💳 Page Abonnements - Gestion complète des abonnements et paiements
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Crown, 
  Users, 
  Zap, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const Subscriptions = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadData();
  }, [isAuthenticated]);

  // Vérifier le statut du paiement depuis l'URL
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const paymentId = searchParams.get('paymentId');

    if (paymentStatus === 'success' && paymentId) {
      checkPaymentStatus(paymentId);
    } else if (paymentStatus === 'error') {
      alert(t('subscriptions.payment.error'));
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, subscriptionRes] = await Promise.all([
        api.subscriptions.getPlans(),
        api.subscriptions.getMySubscription()
      ]);

      if (plansRes.success) {
        setPlans(plansRes.data);
      }

      if (subscriptionRes.success && subscriptionRes.data) {
        setCurrentSubscription(subscriptionRes.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await api.payments.getStatus(paymentId);
      if (response.success && response.data.status === 'completed') {
        await loadData();
        alert(t('subscriptions.payment.success'));
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      alert(t('subscriptions.loginRequired'));
      return;
    }

    try {
      setProcessingPayment(true);
      setSelectedPlan(plan);

      // Créer le paiement Wave
      const paymentResponse = await api.payments.createWavePayment({
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency
      });

      if (paymentResponse.success && paymentResponse.data.checkoutUrl) {
        // Rediriger vers Wave Checkout
        window.location.href = paymentResponse.data.checkoutUrl;
      } else {
        alert(t('subscriptions.payment.createError'));
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(t('subscriptions.payment.createError'));
      setProcessingPayment(false);
    }
  };

  const formatPrice = (amount, currency = 'XOF') => {
    if (currency === 'XOF') {
      return `${amount.toLocaleString('fr-FR')} FCFA`;
    }
    return `${(amount / 100).toFixed(2)} €`;
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'FREE':
        return <Sparkles className="w-8 h-8" />;
      case 'PREMIUM':
      case 'PREMIUM_YEARLY':
        return <Crown className="w-8 h-8" />;
      case 'FAMILY':
        return <Users className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const getPlanGradient = (planName) => {
    switch (planName) {
      case 'FREE':
        return 'from-gray-500 to-gray-600';
      case 'PREMIUM':
      case 'PREMIUM_YEARLY':
        return 'from-purple-500 to-pink-500';
      case 'FAMILY':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
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
                <p className="text-lg">
                  {currentSubscription.plan.displayName}
                </p>
                <p className="text-sm opacity-90 mt-2">
                  {t('subscriptions.current.validUntil')} {new Date(currentSubscription.endDate).toLocaleDateString()}
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

            return (
              <div
                key={plan.id}
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 transition-all duration-300 ${
                  isCurrentPlan
                    ? 'border-green-500 scale-105'
                    : 'border-white/10 hover:border-purple-500/50 hover:scale-105'
                }`}
              >
                {/* Header du plan */}
                <div className={`w-16 h-16 bg-gradient-to-br ${getPlanGradient(plan.name)} rounded-xl flex items-center justify-center mb-4 text-white`}>
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
                        {formatPrice(plan.price, plan.currency)}
                      </div>
                      <div className="text-sm text-gray-400">
                        / {plan.interval === 'monthly' ? t('subscriptions.monthly') : t('subscriptions.yearly')}
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
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
                    {t('subscriptions.current.active')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={processingPayment}
                    className={`w-full py-3 bg-gradient-to-r ${getPlanGradient(plan.name)} rounded-xl font-bold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
                  >
                    {processingPayment && selectedPlan?.id === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('subscriptions.processing')}
                      </>
                    ) : (
                      <>
                        {t('subscriptions.subscribe')}
                        <ArrowRight className="w-5 h-5" />
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
          {t('subscriptions.security')}
        </p>
      </div>
    </div>
  );
};

export default Subscriptions;


