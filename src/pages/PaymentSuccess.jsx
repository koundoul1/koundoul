/**
 * Page de succès de paiement Wave
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | pending
  const [subscription, setSubscription] = useState(null);

  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref) {
      checkStatus();
    } else {
      setStatus('success');
    }
  }, [ref]);

  const checkStatus = async () => {
    try {
      const response = await api.payments.getWaveStatus(ref);
      if (response.success) {
        if (response.data.status === 'completed') {
          setStatus('success');
          setSubscription(response.data.subscription);
        } else {
          // Le webhook n'a peut-être pas encore été reçu, réessayer
          setTimeout(async () => {
            try {
              const retry = await api.payments.getWaveStatus(ref);
              if (retry.success && retry.data.status === 'completed') {
                setStatus('success');
                setSubscription(retry.data.subscription);
              } else {
                setStatus('pending');
              }
            } catch {
              setStatus('pending');
            }
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      setStatus('pending');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' ? (
          <Loader2 className="w-16 h-16 animate-spin text-[#1DC8FF] mx-auto mb-6" />
        ) : (
          <div className="animate-checkmark mb-6">
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto" />
          </div>
        )}

        <h1 className="text-3xl font-black text-white mb-4">
          {status === 'loading' ? 'Vérification...' :
           status === 'success' ? 'Paiement confirmé !' :
           'Paiement en cours de traitement'}
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          {status === 'loading' ? 'Nous vérifions votre paiement...' :
           status === 'success' ? 'Votre abonnement est maintenant activé.' :
           'Votre paiement est en cours de confirmation. Votre abonnement sera activé sous peu.'}
        </p>

        {subscription && (
          <div className="bg-gray-800 rounded-xl p-4 mb-8 border border-green-500/30">
            <p className="text-green-400 font-bold">{subscription.plan?.displayName}</p>
            <p className="text-gray-400 text-sm mt-1">
              Valide jusqu'au {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
        >
          Commencer à apprendre
        </button>

        <style>{`
          @keyframes checkmarkPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-checkmark {
            animation: checkmarkPop 0.6s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentSuccess;
