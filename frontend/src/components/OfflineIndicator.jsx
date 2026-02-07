import { usePWA } from '../hooks/usePWA';
import { WifiOff, Wifi, Download } from 'lucide-react';

export default function OfflineIndicator() {
  const { isOnline, isInstallable, installPWA } = usePWA();

  return (
    <>
      {/* Bannière Offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold">
          <WifiOff className="w-4 h-4" />
          <span>Mode Hors Ligne - Les modifications seront synchronisées à la reconnexion</span>
        </div>
      )}

      {/* Bannière Online supprimée - masquait le menu */}

      {/* Bannière Installation PWA */}
      {isInstallable && (
        <div 
          data-pwa-banner
          className="fixed top-4 left-2 right-2 lg:top-auto lg:bottom-4 lg:left-auto lg:right-4 lg:w-96 z-[60] bg-blue-600 text-white rounded-xl shadow-2xl p-3 sm:p-4 max-w-md mx-auto lg:mx-0"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <Download className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold mb-1 text-sm sm:text-base">Installer Koundoul</h3>
              <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3 leading-tight">
                Accédez rapidement à vos cours, même hors ligne !
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={installPWA}
                  className="bg-white text-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors flex-shrink-0"
                >
                  Installer
                </button>
                <button
                  onClick={() => {
                    const banner = document.querySelector('[data-pwa-banner]');
                    if (banner) banner.style.display = 'none';
                  }}
                  className="text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


