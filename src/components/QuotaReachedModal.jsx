import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Clock, Zap, Crown } from 'lucide-react';

/**
 * Modal displayed when AI quota is exhausted (429).
 * Shows Premium 24h upsell for FREE, upgrade for PREMIUM, countdown for MAX.
 */
const QuotaReachedModal = ({ quotaData, onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!quotaData?.resetAt) return;
    const update = () => {
      const diff = new Date(quotaData.resetAt).getTime() - Date.now();
      if (diff <= 0) { setCountdown('maintenant'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${h}h ${String(m).padStart(2, '0')}min`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [quotaData?.resetAt]);

  if (!quotaData) return null;

  const plan = quotaData.plan || 'FREE';
  const limit = quotaData.limit || 6;
  const isFree = plan === 'FREE';
  const isMaxPlan = plan === 'PREMIUM_MAX' || plan === 'PREMIUM_MAX_YEARLY'
    || plan === 'FAMILY' || plan === 'FAMILY_YEARLY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isFree ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
            {isFree ? <Crown className="h-8 w-8 text-purple-400" /> : <Rocket className="h-8 w-8 text-blue-400" />}
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-3">
          {limit} appels IA utilises aujourd&apos;hui !
        </h2>

        {/* Premium 24h promo — for FREE users */}
        {isFree && (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-bold">Premium 24h — 125 FCFA</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Debloque <strong className="text-purple-300">20 appels IA</strong> pendant 24h. Ideal pour reviser avant un examen !
            </p>
            <button
              onClick={() => { onClose(); navigate('/subscriptions?period=daily'); }}
              className="w-full py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
            >
              Activer Premium 24h — 125 FCFA
            </button>
          </div>
        )}

        {!isFree && !isMaxPlan && (
          <p className="text-gray-400 text-sm text-center mb-4">
            Tu as fait tes {limit} appels IA. Passe Premium Max pour 300 appels/jour.
          </p>
        )}

        {isMaxPlan && (
          <p className="text-gray-400 text-sm text-center mb-4">
            Tu as fait tes {limit} appels IA aujourd&apos;hui. Reviens demain !
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mb-5 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Reset dans {countdown}</span>
        </div>

        <div className="flex flex-col gap-2">
          {isFree && (
            <button
              onClick={() => { onClose(); navigate('/subscriptions'); }}
              className="w-full py-2.5 rounded-xl font-medium text-sm bg-white/10 hover:bg-white/15 text-gray-300 transition-colors"
            >
              Voir tous les plans
            </button>
          )}
          {!isFree && !isMaxPlan && (
            <button
              onClick={() => { onClose(); navigate('/subscriptions'); }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Passer Premium Max
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaReachedModal;
