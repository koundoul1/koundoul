import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Hook for AI quota state — fetches on mount, exposes refreshQuota().
 * Shows a proactive toast when usage >= 80% (once per session).
 */
export default function useAiQuota() {
  const [quota, setQuota] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toastShownRef = useRef(false);
  const [warningToast, setWarningToast] = useState(null);

  const fetchQuota = useCallback(async () => {
    try {
      const res = await api.aiQuota.get();
      if (res.success !== false) {
        const q = {
          plan: res.plan,
          used: res.used,
          limit: res.limit,
          remaining: res.remaining,
          resetAt: res.resetAt,
          isChild: res.isChild
        };
        setQuota(q);

        // Proactive toast at 80%+ usage (once per session)
        if (!toastShownRef.current && q.limit > 0 && q.used / q.limit >= 0.8 && q.remaining > 0) {
          toastShownRef.current = true;
          setWarningToast(`Plus que ${q.remaining} appel${q.remaining > 1 ? 's' : ''} IA disponible${q.remaining > 1 ? 's' : ''} aujourd'hui`);
          setTimeout(() => setWarningToast(null), 5000);
        }
      }
    } catch (err) {
      console.warn('[useAiQuota] fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuota, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchQuota]);

  return { quota, refreshQuota: fetchQuota, isLoading, warningToast };
}
