import { useState, useEffect } from 'react';

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    // Détecter si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré:', registration);
          setSwRegistration(registration);

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 Nouvelle version du Service Worker détectée');

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                console.log('📦 Nouvelle version disponible !');
                
                // Notifier l'utilisateur
                if (window.confirm('Une nouvelle version est disponible. Recharger ?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Erreur Service Worker:', error);
        });
    }

    // Écouter les événements online/offline
    const handleOnline = () => {
      console.log('🌐 Connexion rétablie');
      setIsOnline(true);
      
      // Déclencher la synchronisation
      if ('serviceWorker' in navigator && 'sync' in swRegistration) {
        swRegistration.sync.register('sync-progress');
        swRegistration.sync.register('sync-attempts');
      }
    };

    const handleOffline = () => {
      console.log('📴 Hors ligne');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Événement d'installation PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Événement après installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installée !');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    // Écouter les messages du Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message du SW:', event.data);
        
        if (event.data.type === 'CHAPTER_CACHED') {
          // Notifier que le chapitre est téléchargé
          const customEvent = new CustomEvent('chapter-cached', {
            detail: { chapterId: event.data.chapterId }
          });
          window.dispatchEvent(customEvent);
        }
        
        if (event.data.type === 'CHAPTER_CACHE_ERROR') {
          const customEvent = new CustomEvent('chapter-cache-error', {
            detail: { 
              chapterId: event.data.chapterId,
              error: event.data.error
            }
          });
          window.dispatchEvent(customEvent);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [swRegistration]);

  // Installer la PWA
  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('❌ Prompt d\'installation non disponible');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`👤 Choix utilisateur: ${outcome}`);
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }
    
    return false;
  };

  // Télécharger un chapitre pour l'offline
  const downloadChapter = async (chapterId) => {
    if (!swRegistration) {
      console.error('❌ Service Worker non disponible');
      return false;
    }

    try {
      // Envoyer un message au Service Worker
      swRegistration.active.postMessage({
        type: 'CACHE_CHAPTER',
        chapterId: chapterId
      });

      console.log('📥 Téléchargement du chapitre:', chapterId);
      return true;
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      return false;
    }
  };

  // Supprimer un chapitre téléchargé
  const removeDownloadedChapter = async (chapterId) => {
    if (!swRegistration) {
      console.error('❌ Service Worker non disponible');
      return false;
    }

    try {
      swRegistration.active.postMessage({
        type: 'REMOVE_CACHE_CHAPTER',
        chapterId: chapterId
      });

      console.log('🗑️ Suppression du chapitre:', chapterId);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      return false;
    }
  };

  // Sauvegarder une progression en attente (offline)
  const savePendingProgress = async (lessonId, timeSpent, token) => {
    try {
      const db = await openDB();
      const tx = db.transaction('pendingProgress', 'readwrite');
      const store = tx.objectStore('pendingProgress');
      
      await store.add({
        lessonId,
        timeSpent,
        token,
        timestamp: new Date().toISOString()
      });

      console.log('💾 Progression sauvegardée pour sync:', lessonId);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde progression:', error);
      return false;
    }
  };

  // Sauvegarder une tentative d'exercice en attente
  const savePendingAttempt = async (exerciseId, userAnswer, timeSpent, hintsUsed, token) => {
    try {
      const db = await openDB();
      const tx = db.transaction('pendingAttempts', 'readwrite');
      const store = tx.objectStore('pendingAttempts');
      
      await store.add({
        exerciseId,
        userAnswer,
        timeSpent,
        hintsUsed,
        token,
        timestamp: new Date().toISOString()
      });

      console.log('💾 Tentative sauvegardée pour sync:', exerciseId);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde tentative:', error);
      return false;
    }
  };

  // Obtenir les chapitres téléchargés
  const getDownloadedChapters = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('downloadedChapters', 'readonly');
      const store = tx.objectStore('downloadedChapters');
      const chapters = await store.getAll();
      return chapters || [];
    } catch (error) {
      console.error('❌ Erreur récupération chapitres:', error);
      return [];
    }
  };

  return {
    isOnline,
    isInstallable,
    isInstalled,
    installPWA,
    downloadChapter,
    removeDownloadedChapter,
    savePendingProgress,
    savePendingAttempt,
    getDownloadedChapters
  };
}

// Helper pour ouvrir IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KoundoulOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingProgress')) {
        db.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingAttempts')) {
        db.createObjectStore('pendingAttempts', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('downloadedChapters')) {
        db.createObjectStore('downloadedChapters', { keyPath: 'id' });
      }
    };
  });
}


