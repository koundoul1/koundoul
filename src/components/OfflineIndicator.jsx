import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { WifiOff, Download, X } from 'lucide-react';

export default function OfflineIndicator() {
  const { isOnline, isInstallable, installPWA } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {/* Banniere Offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold">
          <WifiOff className="w-4 h-4" />
          <span>Mode Hors Ligne - Les modifications seront synchronisees a la reconnexion</span>
        </div>
      )}

      {/* Banniere Installation PWA — en haut, visible sur mobile */}
      {isInstallable && !dismissed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Download className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Installer Koundoul</p>
              <p className="text-xs opacity-80 hidden sm:block">Acces rapide a vos cours, meme hors ligne</p>
            </div>
            <button
              onClick={installPWA}
              className="bg-white text-blue-600 px-3 py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              Installer
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
