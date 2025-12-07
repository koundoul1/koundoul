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
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-40 bg-blue-600 text-white rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <Download className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold mb-1">Installer Koundoul</h3>
              <p className="text-sm opacity-90 mb-3">
                Accédez rapidement à vos cours, même hors ligne !
              </p>
              <div className="flex gap-2">
                <button
                  onClick={installPWA}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Installer
                </button>
                <button
                  onClick={() => {
                    const banner = document.querySelector('.fixed.bottom-4');
                    if (banner) banner.style.display = 'none';
                  }}
                  className="text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
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


