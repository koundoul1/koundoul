import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Clock } from 'lucide-react';

/**
 * Modal displayed when AI quota is exhausted (429).
 * Shows upsell for FREE/PREMIUM, countdown for MAX plans.
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
  const isMaxPlan = plan === 'PREMIUM_MAX' || plan === 'PREMIUM_MAX_YEARLY'
    || plan === 'FAMILY' || plan === 'FAMILY_YEARLY';

  const getMessage = () => {
    if (plan === 'FREE') {
      return `Tu as fait ${limit} appels IA aujourd'hui. Passe Premium pour en avoir 50 par jour, à seulement 5 000 FCFA/mois.`;
    }
    if (plan === 'PREMIUM' || plan === 'PREMIUM_YEARLY') {
      return `Tu as fait tes ${limit} appels IA aujourd'hui. Passe Premium Max pour 300 appels/jour, à 10 000 FCFA/mois.`;
    }
    return `Tu as fait tes ${limit} appels IA aujourd'hui. Reviens demain pour de nouveaux appels !`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-3">
          Tu as utilisé tous tes appels IA aujourd&apos;hui !
        </h2>

        <p className="text-gray-400 text-sm text-center mb-5">
          {getMessage()}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Reset dans {countdown}</span>
        </div>

        <div className="flex flex-col gap-3">
          {!isMaxPlan && (
            <button
              onClick={() => { onClose(); navigate('/subscriptions'); }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Voir les plans
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
          >
            {isMaxPlan ? 'Compris' : 'Revenir demain'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaReachedModal;
