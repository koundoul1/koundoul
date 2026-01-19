/**
 * 🔗 Composant de Statut de Connexion - KOUNDOUL
 * Indicateur discret de l'état de connexion
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      // Masquer le statut après 3 secondes
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ne montrer que si offline ou si on vient de se reconnecter
  if (!showStatus) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-yellow-500 text-white'
    }`}>
      <div className="flex items-center space-x-2 text-sm">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connecté</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Hors ligne</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
