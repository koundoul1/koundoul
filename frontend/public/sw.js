// Service Worker pour Koundoul PWA
const CACHE_VERSION = 'koundoul-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const CONTENT_CACHE = `${CACHE_VERSION}-content`;

// Fichiers statiques à mettre en cache immédiatement
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
  
  // Force le nouveau SW à prendre le contrôle immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // Supprimer les anciens caches
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== CONTENT_CACHE) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle de toutes les pages immédiatement
  return self.clients.claim();
});

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First: Pour les assets statiques
  cacheFirst: async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    return cached || fetch(request);
  },
  
  // Network First: Pour les données dynamiques (API)
  networkFirst: async (request) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
      const response = await fetch(request);
      // Mettre en cache seulement si la réponse est OK
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Si offline, retourner depuis le cache
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      
      // Retourner une réponse offline par défaut
      return new Response(
        JSON.stringify({
          success: false,
          offline: true,
          message: 'Vous êtes hors ligne. Cette donnée n\'est pas disponible.'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },
  
  // Cache with Network Update: Pour le contenu pédagogique
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CONTENT_CACHE);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cached);
    
    // Retourner le cache immédiatement, mettre à jour en arrière-plan
    return cached || fetchPromise;
  }
};

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ignorer les requêtes Chrome extensions
  if (url.origin.includes('chrome-extension')) {
    return;
  }
  
  // Stratégie selon le type de requête
  if (request.url.includes('/api/')) {
    // API: Network First (avec fallback cache)
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
  } else if (request.url.includes('/content/') || request.url.includes('/lessons/')) {
    // Contenu pédagogique: Stale While Revalidate
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
  } else if (request.destination === 'image') {
    // Images: Cache First
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
  } else {
    // Par défaut: Network First
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
  
  if (event.tag === 'sync-attempts') {
    event.waitUntil(syncAttempts());
  }
});

// Fonction de synchronisation de progression
async function syncProgress() {
  console.log('[SW] Syncing progress...');
  
  try {
    // Récupérer les données en attente depuis IndexedDB
    const db = await openDB();
    const pendingProgress = await db.getAll('pendingProgress');
    
    // Envoyer chaque progression au serveur
    for (const progress of pendingProgress) {
      try {
        const response = await fetch('/api/content/lessons/' + progress.lessonId + '/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + progress.token
          },
          body: JSON.stringify({ timeSpent: progress.timeSpent })
        });
        
        if (response.ok) {
          // Supprimer de la file d'attente
          await db.delete('pendingProgress', progress.id);
        }
      } catch (error) {
        console.error('[SW] Sync error for progress:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Fonction de synchronisation des tentatives d'exercices
async function syncAttempts() {
  console.log('[SW] Syncing attempts...');
  
  try {
    const db = await openDB();
    const pendingAttempts = await db.getAll('pendingAttempts');
    
    for (const attempt of pendingAttempts) {
      try {
        const response = await fetch('/api/content/exercises/' + attempt.exerciseId + '/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + attempt.token
          },
          body: JSON.stringify({
            userAnswer: attempt.userAnswer,
            timeSpent: attempt.timeSpent,
            hintsUsed: attempt.hintsUsed
          })
        });
        
        if (response.ok) {
          await db.delete('pendingAttempts', attempt.id);
        }
      } catch (error) {
        console.error('[SW] Sync error for attempt:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Ouvrir IndexedDB
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

// Gestion des messages depuis l'app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_CHAPTER') {
    event.waitUntil(cacheChapter(event.data.chapterId));
  }
  
  if (event.data.type === 'REMOVE_CACHE_CHAPTER') {
    event.waitUntil(removeCachedChapter(event.data.chapterId));
  }
});

// Mettre en cache un chapitre complet
async function cacheChapter(chapterId) {
  console.log('[SW] Caching chapter:', chapterId);
  
  try {
    const cache = await caches.open(CONTENT_CACHE);
    
    // Récupérer les données du chapitre
    const chapterResponse = await fetch(`/api/content/chapters/${chapterId}`);
    const chapterData = await chapterResponse.json();
    
    // Mettre en cache le chapitre
    await cache.put(`/api/content/chapters/${chapterId}`, chapterResponse.clone());
    
    // Mettre en cache toutes les leçons
    if (chapterData.data.lessons) {
      for (const lesson of chapterData.data.lessons) {
        const lessonResponse = await fetch(`/api/content/lessons/${lesson.id}`);
        await cache.put(`/api/content/lessons/${lesson.id}`, lessonResponse);
      }
    }
    
    // Mettre en cache tous les exercices
    if (chapterData.data.exercises) {
      for (const exercise of chapterData.data.exercises) {
        const exerciseResponse = await fetch(`/api/content/exercises/${exercise.id}`);
        await cache.put(`/api/content/exercises/${exercise.id}`, exerciseResponse);
      }
    }
    
    // Enregistrer dans IndexedDB
    const db = await openDB();
    await db.put('downloadedChapters', {
      id: chapterId,
      downloadedAt: new Date().toISOString(),
      data: chapterData.data
    });
    
    console.log('[SW] Chapter cached successfully:', chapterId);
    
    // Notifier l'app
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CHAPTER_CACHED',
          chapterId: chapterId
        });
      });
    });
  } catch (error) {
    console.error('[SW] Error caching chapter:', error);
    
    // Notifier l'erreur
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CHAPTER_CACHE_ERROR',
          chapterId: chapterId,
          error: error.message
        });
      });
    });
  }
}

// Supprimer un chapitre du cache
async function removeCachedChapter(chapterId) {
  console.log('[SW] Removing cached chapter:', chapterId);
  
  try {
    const cache = await caches.open(CONTENT_CACHE);
    const db = await openDB();
    
    // Récupérer les données pour connaître les ressources à supprimer
    const chapter = await db.get('downloadedChapters', chapterId);
    
    if (chapter) {
      // Supprimer le chapitre
      await cache.delete(`/api/content/chapters/${chapterId}`);
      
      // Supprimer les leçons
      if (chapter.data.lessons) {
        for (const lesson of chapter.data.lessons) {
          await cache.delete(`/api/content/lessons/${lesson.id}`);
        }
      }
      
      // Supprimer les exercices
      if (chapter.data.exercises) {
        for (const exercise of chapter.data.exercises) {
          await cache.delete(`/api/content/exercises/${exercise.id}`);
        }
      }
      
      // Supprimer de IndexedDB
      await db.delete('downloadedChapters', chapterId);
    }
    
    console.log('[SW] Chapter removed from cache:', chapterId);
    
    // Notifier l'app
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CHAPTER_REMOVED',
          chapterId: chapterId
        });
      });
    });
  } catch (error) {
    console.error('[SW] Error removing cached chapter:', error);
  }
}

console.log('[SW] Service Worker loaded');


