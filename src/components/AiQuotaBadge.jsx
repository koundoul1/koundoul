import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

/**
 * Pill badge showing AI quota usage: "12 / 50 appels IA"
 * Color shifts green → orange → red based on remaining %.
 */
const AiQuotaBadge = ({ quota }) => {
  const navigate = useNavigate();

  if (!quota) return null;

  const { used, limit, plan } = quota;
  const pct = limit > 0 ? (limit - used) / limit : 0;

  const colorClass = pct > 0.5
    ? 'text-green-400 border-green-400/30 bg-green-400/10'
    : pct > 0.2
    ? 'text-orange-400 border-orange-400/30 bg-orange-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate('/subscriptions')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-colors hover:opacity-80 ${colorClass}`}
        title={`Reset à minuit UTC · Plan : ${plan?.displayName || 'Gratuit'}`}
      >
        <Zap className="h-3.5 w-3.5" />
        <span>{used}/{limit}</span>
        <span className="hidden sm:inline">appels IA</span>
      </button>
      {plan?.name === 'FREE' && (
        <button
          onClick={() => navigate('/subscriptions')}
          className="hidden sm:flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Passer Premium
        </button>
      )}
    </div>
  );
};

export default AiQuotaBadge;
