/**
 * Page d'erreur de paiement Wave
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Mail } from 'lucide-react';

const PaymentError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="animate-errorShake mb-6">
          <XCircle className="w-24 h-24 text-red-400 mx-auto" />
        </div>

        <h1 className="text-3xl font-black text-white mb-4">
          Paiement échoué
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Le paiement n'a pas abouti. Veuillez réessayer ou contacter le support.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/subscriptions')}
            className="w-full py-3.5 text-black rounded-xl font-bold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1DC8FF' }}
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>

          <a
            href="mailto:contact@peak-performance-partner.com"
            className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
          >
            <Mail className="w-5 h-5" />
            Contacter le support
          </a>
        </div>

        <style>{`
          @keyframes errorShake {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            60% { transform: scale(1) rotate(-5deg); }
            70% { transform: rotate(5deg); }
            80% { transform: rotate(-3deg); }
            90% { transform: rotate(2deg); }
            100% { transform: rotate(0deg); opacity: 1; }
          }
          .animate-errorShake {
            animation: errorShake 0.7s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentError;
