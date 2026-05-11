/**
 * Page Abonnements — 4 plans avec toggle Mensuel/Annuel.
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
  Star,
  Bot
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

// Plan card configuration (static — maps DB plan names to UI details)
const PLAN_UI = {
  FREE: { icon: Sparkles, gradient: 'from-gray-500 to-gray-600', order: 0 },
  PREMIUM: { icon: Crown, gradient: 'from-purple-500 to-pink-500', badge: 'Le plus populaire', order: 1 },
  PREMIUM_MAX: { icon: Zap, gradient: 'from-orange-500 to-red-500', order: 2 },
  FAMILY: { icon: Users, gradient: 'from-blue-500 to-cyan-500', badge: 'Pour les parents', order: 3 },
  PREMIUM_DAILY: { icon: Crown, gradient: 'from-purple-500 to-pink-500', badge: 'Pass 24h', order: 1 },
  PREMIUM_MAX_DAILY: { icon: Zap, gradient: 'from-orange-500 to-red-500', badge: 'Intensif 24h', order: 2 },
};

// Map yearly/daily plan names to their monthly counterparts for UI lookup
const YEARLY_TO_MONTHLY = {
  PREMIUM_YEARLY: 'PREMIUM',
  PREMIUM_MAX_YEARLY: 'PREMIUM_MAX',
  FAMILY_YEARLY: 'FAMILY'
};

const Subscriptions = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [allPlans, setAllPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'

  useEffect(() => {
    loadData();
  }, []);

  const [loadError, setLoadError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const plansRes = await api.subscriptions.getPlans();
      setAllPlans(plansRes?.data || plansRes || []);
    } catch (error) {
      console.error('Erreur plans:', error);
      setLoadError(error.message || 'Erreur de chargement des plans');
    }
    try {
      const subscriptionRes = await api.subscriptions.getMySubscription();
      if (subscriptionRes?.data) setCurrentSubscription(subscriptionRes.data);
      else if (subscriptionRes?.planId) setCurrentSubscription(subscriptionRes);
    } catch (error) {
      // Subscription fetch may fail for non-authenticated — OK
    }
    setLoading(false);
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setProcessingPlanId(plan.id);
      setPaymentError('');
      const response = await api.payments.initiateWave({ planId: plan.id });
      if (response.success && response.data.wave_launch_url) {
        window.location.href = response.data.wave_launch_url;
      } else {
        setPaymentError('Erreur lors de l\'initiation du paiement');
        setProcessingPlanId(null);
      }
    } catch (error) {
      setPaymentError(error.message || 'Erreur lors du paiement');
      setProcessingPlanId(null);
    }
  };

  // Get display plans based on billing period
  const getDisplayPlans = () => {
    const freePlan = allPlans.find(p => p.name === 'FREE');
    const plansByPeriod = {
      daily: ['PREMIUM_DAILY', 'PREMIUM_MAX_DAILY'],
      monthly: ['PREMIUM', 'PREMIUM_MAX', 'FAMILY'],
      yearly: ['PREMIUM_YEARLY', 'PREMIUM_MAX_YEARLY', 'FAMILY_YEARLY'],
    };
    const targetNames = plansByPeriod[billingPeriod] || plansByPeriod.monthly;

    const paidPlans = targetNames
      .map(name => allPlans.find(p => p.name === name))
      .filter(Boolean);

    return [freePlan, ...paidPlans].filter(Boolean);
  };

  const displayPlans = getDisplayPlans();

  // Get UI config for a plan
  const getUI = (planName) => {
    const baseName = YEARLY_TO_MONTHLY[planName] || planName;
    return PLAN_UI[baseName] || PLAN_UI.FREE;
  };

  const formatPrice = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;

  // Savings for yearly plans
  const getYearlySavings = (plan) => {
    if (!plan || plan.interval !== 'yearly') return null;
    const monthlyName = YEARLY_TO_MONTHLY[plan.name];
    const monthlyPlan = allPlans.find(p => p.name === monthlyName);
    if (!monthlyPlan) return null;
    const yearlyIfMonthly = monthlyPlan.price * 12;
    const savings = yearlyIfMonthly - plan.price;
    return savings > 0 ? savings : null;
  };

  const isCurrentPlan = (plan) => currentSubscription?.planId === plan.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 lg:pb-0">
      {/* Error banner */}
      {loadError && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-sm text-red-400">{loadError}</p>
            <button onClick={loadData} className="mt-2 text-xs text-red-300 underline hover:text-white">Reessayer</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4">
            {t('subscriptions.chooseYourPlan')}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {t('subscriptions.allFreeDesc')}
          </p>

          {/* Toggle 24h / Mensuel / Annuel */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('daily')}
              className={`px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-full font-semibold transition-all ${
                billingPeriod === 'daily' ? 'bg-white text-purple-700 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              {t('subscriptions.toggleDaily')}
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-full font-semibold transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-purple-700 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              {t('subscriptions.toggleMonthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-full font-semibold transition-all ${
                billingPeriod === 'yearly' ? 'bg-white text-purple-700 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              {t('subscriptions.toggleYearly')}
            </button>
          </div>
        </div>
      </div>

      {/* Current subscription banner */}
      {currentSubscription && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-green-400 font-semibold">
                Abonné {currentSubscription.plan?.displayName || 'Premium'}
              </p>
              <p className="text-sm text-gray-400">
                Valide jusqu&apos;au {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      )}

      {/* Error banner */}
      {paymentError && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-400">{paymentError}</p>
            <button onClick={() => setPaymentError('')} className="text-red-400 hover:text-red-300 ml-4">&#10005;</button>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`grid sm:grid-cols-2 ${displayPlans.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 max-w-4xl mx-auto'} gap-5`}>
          {displayPlans.map((plan) => {
            const ui = getUI(plan.name);
            const Icon = ui.icon;
            const isCurrent = isCurrentPlan(plan);
            const isFree = plan.name === 'FREE';
            const isProcessing = processingPlanId === plan.id;
            const savings = getYearlySavings(plan);
            const recommended = (ui.order === 1); // PREMIUM

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 flex flex-col ${
                  isCurrent
                    ? 'border-green-500'
                    : recommended
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Badge */}
                {ui.badge && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                      <Star className="w-3 h-3" /> {ui.badge}
                    </span>
                  </div>
                )}

                {/* Icon + name */}
                <div className={`w-12 h-12 bg-gradient-to-br ${ui.gradient} rounded-xl flex items-center justify-center mb-4 text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-1">{plan.displayName}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-4">
                  {isFree ? (
                    <div className="text-3xl font-black">Gratuit</div>
                  ) : (
                    <>
                      <div className="text-3xl font-black">{formatPrice(plan.price)}</div>
                      <div className="text-sm text-gray-400">/ {plan.interval === 'yearly' ? t('subscriptions.yearly') : plan.interval === 'daily' ? t('subscriptions.daily') : t('subscriptions.monthly')}</div>
                      {savings && (
                        <div className="text-xs text-green-400 mt-1">
                          Économise {formatPrice(savings)}/an
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* AI quota highlight */}
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Bot className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-blue-300">
                    {plan.aiCallsPerDay || 6} {(plan.name === 'FAMILY' || plan.name === 'FAMILY_YEARLY') ? t('subscriptions.aiCallsPerChild') : t('subscriptions.aiCallsPerDay')}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <button disabled className="w-full py-3 bg-green-500/20 text-green-400 rounded-xl font-bold border border-green-500/30">
                    {t('subscriptions.currentPlan')}
                  </button>
                ) : isFree ? (
                  <button disabled className="w-full py-3 bg-gray-700 text-gray-500 rounded-xl font-bold">
                    {t('subscriptions.included')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!processingPlanId}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      recommended
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t('subscriptions.redirecting')}</>
                    ) : (
                      t('subscriptions.choosePlan')
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">{t('subscriptions.faq.title')}</h2>
        <div className="space-y-4">
          {[
            { q: t('subscriptions.faq.whatIsAiCall'), a: t('subscriptions.faq.whatIsAiCallAnswer') },
            { q: t('subscriptions.faq.whenReset'), a: t('subscriptions.faq.whenResetAnswer') },
            { q: t('subscriptions.faq.canCancel'), a: t('subscriptions.faq.canCancelAnswer') },
            { q: t('subscriptions.faq.howDaily'), a: t('subscriptions.faq.howDailyAnswer') },
            { q: t('subscriptions.faq.whatIsFamily'), a: t('subscriptions.faq.whatIsFamilyAnswer') }
          ].map((faq, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security notice */}
      <div className="max-w-3xl mx-auto px-4 pb-12 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Shield className="w-4 h-4" />
          <span>Paiements sécurisés via Wave Mobile Money</span>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
