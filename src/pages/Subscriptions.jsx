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
  Bot,
  X,
  Copy,
  Check,
  MessageCircle,
  Phone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

// Config paiement — QR codes et contact admin
const PAYMENT_CONFIG = {
  wave: {
    label: 'Wave',
    phone: '+221 77 123 45 67',  // REMPLACER par votre vrai numero Wave
    qrValue: 'wave://send?phone=221771234567', // REMPLACER
    color: '#1DC8FF',
    bgColor: '#0A1929',
    instructions: [
      'Ouvre ton appli Wave',
      'Scanne le QR code ou envoie au numero affiche',
      'Envoie le montant exact indique',
      'Clique sur "J\'ai paye" ci-dessous'
    ]
  },
  orange_money: {
    label: 'Orange Money',
    phone: '+221 77 987 65 43',  // REMPLACER par votre vrai numero OM
    qrValue: 'om://send?phone=221779876543', // REMPLACER
    color: '#FF6600',
    bgColor: '#1A0E00',
    instructions: [
      'Ouvre ton appli Orange Money',
      'Scanne le QR code ou envoie au numero affiche',
      'Envoie le montant exact indique',
      'Clique sur "J\'ai paye" ci-dessous'
    ]
  },
  whatsapp: '+221771234567' // REMPLACER — numero WhatsApp admin pour recevoir confirmations
};

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
  const { isAuthenticated, user } = useAuth();
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

  const [paymentMethod, setPaymentMethod] = useState('wave'); // 'wave' | 'orange_money'
  const [qrModal, setQrModal] = useState(null); // { plan, method }
  const [confirmStep, setConfirmStep] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setPaymentError('');
    setConfirmStep(false);
    setCopied(false);
    setQrModal({ plan, method: paymentMethod });
  };

  const handleConfirmPayment = async () => {
    if (!qrModal) return;
    setProcessingPlanId(qrModal.plan.id);
    try {
      const res = await api.payments.manualRequest({
        planId: qrModal.plan.id,
        paymentMethod: qrModal.method
      });
      if (res.success) {
        setConfirmStep(true);
      }
    } catch (error) {
      setPaymentError(error.message || 'Erreur');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const sendWhatsApp = () => {
    if (!qrModal) return;
    const { plan, method } = qrModal;
    const methodLabel = PAYMENT_CONFIG[method]?.label || method;
    const msg = [
      `Bonjour, je confirme mon paiement Koundoul :`,
      ``,
      `Plan : ${plan.displayName || plan.name}`,
      `Montant : ${plan.price?.toLocaleString('fr-FR')} FCFA`,
      `Methode : ${methodLabel}`,
      `Email : ${user?.email || ''}`,
      `Nom : ${user?.firstName || ''} ${user?.lastName || ''}`,
      ``,
      `Merci d'activer mon abonnement.`
    ].join('\n');
    window.open(`https://wa.me/${PAYMENT_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
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
          <div className="inline-flex items-center bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-white/20">
            <button
              onClick={() => setBillingPeriod('daily')}
              className={`px-5 py-2.5 sm:px-6 text-sm sm:text-base rounded-full font-bold transition-all ${
                billingPeriod === 'daily' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('subscriptions.toggleDaily')}
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2.5 sm:px-6 text-sm sm:text-base rounded-full font-bold transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('subscriptions.toggleMonthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-5 py-2.5 sm:px-6 text-sm sm:text-base rounded-full font-bold transition-all ${
                billingPeriod === 'yearly' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('subscriptions.toggleYearly')}
            </button>
          </div>

          {/* Payment method selector */}
          <div className="mt-6 inline-flex items-center bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/20">
            <button
              onClick={() => setPaymentMethod('wave')}
              className={`px-5 py-2 text-sm rounded-full font-bold transition-all flex items-center gap-2 ${
                paymentMethod === 'wave' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Wave
            </button>
            <button
              onClick={() => setPaymentMethod('orange_money')}
              className={`px-5 py-2 text-sm rounded-full font-bold transition-all flex items-center gap-2 ${
                paymentMethod === 'orange_money' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Orange Money
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

      {/* Promo Code */}
      {isAuthenticated && (
        <div className="max-w-md mx-auto px-4 py-8">
          <PromoCodeInput />
        </div>
      )}

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
          <span>Paiements via Wave et Orange Money</span>
        </div>
      </div>

      {/* QR Code Payment Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => { setQrModal(null); setConfirmStep(false); }}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {!confirmStep ? (
              <>
                {/* Step 1: QR Code + Instructions */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Payer via {PAYMENT_CONFIG[qrModal.method]?.label}</h3>
                    <button onClick={() => setQrModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                  </div>

                  {/* Plan recap */}
                  <div className="bg-white/5 rounded-xl p-4 mb-5">
                    <p className="text-sm text-gray-400">Plan choisi</p>
                    <p className="text-xl font-bold text-white">{qrModal.plan.displayName || qrModal.plan.name}</p>
                    <p className="text-2xl font-black mt-1" style={{ color: PAYMENT_CONFIG[qrModal.method]?.color }}>
                      {qrModal.plan.price?.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{qrModal.plan.duration} jours</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-5">
                    <div className="bg-white rounded-2xl p-4">
                      <QRCodeSVG
                        value={PAYMENT_CONFIG[qrModal.method]?.qrValue || PAYMENT_CONFIG[qrModal.method]?.phone}
                        size={180}
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                        level="H"
                      />
                    </div>
                  </div>

                  {/* Phone number */}
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-white font-mono font-bold text-lg">{PAYMENT_CONFIG[qrModal.method]?.phone}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(PAYMENT_CONFIG[qrModal.method]?.phone?.replace(/\s/g, '') || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1 text-gray-500 hover:text-white"
                    >
                      {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 mb-6">
                    {PAYMENT_CONFIG[qrModal.method]?.instructions?.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">{i + 1}</span>
                        <span className="text-sm text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Confirm button */}
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!!processingPlanId}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: PAYMENT_CONFIG[qrModal.method]?.color }}
                  >
                    {processingPlanId ? (
                      <><Loader2 size={18} className="animate-spin" /> Envoi...</>
                    ) : (
                      <><CheckCircle size={18} /> J&apos;ai paye</>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Ton abonnement sera active dans l&apos;heure suivant la confirmation
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Step 2: WhatsApp confirmation */}
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Demande enregistree !</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Envoie maintenant ta confirmation par WhatsApp pour qu&apos;on active ton abonnement rapidement.
                  </p>

                  <button
                    onClick={sendWhatsApp}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 mb-3 transition-all"
                  >
                    <MessageCircle size={20} /> Envoyer la confirmation WhatsApp
                  </button>

                  <p className="text-xs text-gray-500 mb-4">
                    Un message pre-rempli avec tes infos sera envoye
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 text-left">
                    <p className="text-xs text-gray-500 mb-2">Delai d&apos;activation :</p>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>Sous 1h en journee (8h-22h)</li>
                      <li>Notification envoyee des activation</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => { setQrModal(null); setConfirmStep(false); }}
                    className="w-full mt-4 py-2.5 bg-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/20"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function PromoCodeInput() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.promo.validate(code.trim());
      setResult(res.message || 'Code applique !');
      setCode('');
    } catch (err) {
      setError(err.message || 'Code invalide');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
      <h3 className="text-lg font-bold text-white mb-2">Code promo</h3>
      <p className="text-xs text-gray-500 mb-4">Tu as un code ? Entre-le ici pour activer ton plan.</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODE PROMO"
          maxLength={20}
          className="flex-1 px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-center font-mono text-lg tracking-widest uppercase placeholder-gray-600 focus:outline-none focus:border-kprimary"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !code.trim()}
          className="px-5 py-2.5 bg-kprimary text-white rounded-xl font-semibold hover:bg-kprimary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activer'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {result && <p className="text-xs text-green-400 mt-2">{result}</p>}
    </div>
  );
}

export default Subscriptions;
