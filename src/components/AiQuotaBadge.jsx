import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Crown } from 'lucide-react';

/**
 * AI quota badge — prominent display with upsell for free users.
 * Shows "X/Y appels IA" with color + progress bar + upgrade CTA.
 */
const AiQuotaBadge = ({ quota }) => {
  const navigate = useNavigate();

  if (!quota) return null;

  const { used, limit, plan } = quota;
  const remaining = Math.max(0, limit - used);
  const pct = limit > 0 ? remaining / limit : 0;
  const isFree = !plan || plan.name === 'FREE';

  const colorClass = pct > 0.5
    ? 'text-green-400 border-green-500/30 bg-green-500/10'
    : pct > 0.2
    ? 'text-orange-400 border-orange-500/30 bg-orange-500/10'
    : 'text-red-400 border-red-500/30 bg-red-500/10';

  const barColor = pct > 0.5 ? 'bg-green-500' : pct > 0.2 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate('/subscriptions')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 ${colorClass}`}
        title={'Plan : ' + (plan?.displayName || 'Gratuit') + ' · Reset a minuit'}
      >
        <Zap className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>{remaining}/{limit} restants</span>
          <div className="w-16 h-1 bg-white/10 rounded-full mt-0.5">
            <div className={barColor + ' h-1 rounded-full transition-all'} style={{ width: (pct * 100) + '%' }} />
          </div>
        </div>
      </button>
      {isFree && (
        <button
          onClick={() => navigate('/subscriptions')}
          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Crown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Premium</span>
        </button>
      )}
    </div>
  );
};

export default AiQuotaBadge;
