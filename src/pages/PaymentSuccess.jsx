/**
 * Page de succès de paiement Wave
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Download, Share2 } from 'lucide-react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | pending
  const [subscription, setSubscription] = useState(null);

  const ref = searchParams.get('ref');
  const method = searchParams.get('method');

  useEffect(() => {
    if (ref) {
      checkStatus();
    } else {
      setStatus('success');
    }
  }, [ref]);

  const checkStatus = async () => {
    try {
      let response;
      if (method === 'om') {
        response = await api.payments.getOmStatus(ref);
      } else {
        response = await api.payments.getWaveStatus(ref);
      }
      if (response.success) {
        if (response.data.status === 'completed') {
          setStatus('success');
          setSubscription(response.data.subscription);
        } else {
          // Le webhook n'a peut-être pas encore été reçu, réessayer
          setTimeout(async () => {
            try {
              let retry;
              if (method === 'om') {
                retry = await api.payments.getOmStatus(ref);
              } else {
                retry = await api.payments.getWaveStatus(ref);
              }
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
              Valide jusqu&apos;au {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        {/* Invoice actions */}
        {status === 'success' && ref && (
          <div className="flex gap-3 mb-6">
            <a
              href={`${API_URL}/api/payments/${method === 'om' ? ref : ''}/invoice`}
              onClick={(e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                fetch(`${API_URL}/api/payments/${ref}/invoice`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(r => r.blob())
                .then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `recu-koundoul-${ref.slice(-8).toUpperCase()}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                })
                .catch(() => {});
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              <Download size={18} /> Telecharger le recu
            </a>
            <button
              onClick={() => {
                const text = `Mon abonnement Koundoul ${subscription?.plan?.displayName || 'Premium'} est active ! Rejoins-moi sur https://koundoul.com`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-500 transition-all"
            >
              <Share2 size={18} /> WhatsApp
            </button>
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
        >
          Commencer a apprendre
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
