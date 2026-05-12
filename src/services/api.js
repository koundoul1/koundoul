/**
 * 🌐 Service API Koundoul
 * Client API complet pour communiquer avec le backend
 */

// Configuration de l'URL de l'API
// En production, utilise VITE_API_URL depuis les variables d'environnement
// En développement, utilise localhost par défaut
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api'

// Simple in-memory cache for GET requests (5-minute TTL)
const CACHE_TTL = 5 * 60 * 1000
const CACHED_PATHS = ['/subscriptions/plans', '/badges/all', '/content/subjects']
const cache = new Map()

const getCached = (url) => {
  const entry = cache.get(url)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data
  if (entry) cache.delete(url)
  return null
}

const setCache = (url, data) => {
  if (CACHED_PATHS.some(p => url.includes(p))) {
    cache.set(url, { data, ts: Date.now() })
  }
}

// Helper pour les requêtes avec gestion d'erreurs
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  // Return cached response for GET requests on cacheable paths
  const isGet = !options.method || options.method === 'GET'
  if (isGet) {
    const cached = getCached(url)
    if (cached) return cached
  }

  try {
    // Timeout augmenté pour les appels de résolution qui peuvent être longs
    const timeout = url.includes('/solver') || url.includes('/coach') ? 120000 : 30000; // 2 min pour solver, 30s pour autres
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Si la réponse n'est pas ok, gérer l'erreur
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: 'Erreur de communication avec le serveur' }
      }
      
      // Si token expiré, déconnecter l'utilisateur
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Ne pas rediriger automatiquement, laisser le composant gérer
        const errorMsg401 = (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) || errorData.message || 'Session expirée'
        const error = new Error(errorMsg401)
        error.status = 401
        throw error
      }
      
      const errorMsg = (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) || errorData.message || 'Une erreur est survenue'
      const error = new Error(errorMsg)
      error.status = response.status
      throw error
    }

    const data = await response.json()
    if (isGet) setCache(url, data)
    return data
  } catch (error) {
    console.error('API Error:', error)
    
    // Gestion spécifique des erreurs
    if (error.name === 'AbortError') {
      throw new Error('⏱️ La requête a pris trop de temps. Veuillez réessayer avec un problème plus simple.');
    }
    
    if (error.message === 'Failed to fetch') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      throw new Error(`❌ Impossible de joindre le serveur. Vérifiez que le backend est démarré sur ${apiUrl}`);
    }
    
    throw error
  }
}

// Service API principal
const api = {
  // 🔐 AUTHENTIFICATION
  auth: {
    register: (data) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    login: (data) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    getProfile: () => request('/auth/profile'),
    
    updateProfile: (data) => request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    changePassword: (data) => request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    setPin: (data) => request('/auth/set-pin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    deleteAccount: (data) => request('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),

    refreshToken: (token) => request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
    
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  // 🧠 RÉSOLUTION DE PROBLÈMES
  solver: {
    // Legacy non-stream solve (kept for backward compat)
    solve: (data) => request('/solver/solve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    /**
     * SSE streaming solve via fetch + ReadableStream.
     * EventSource doesn't support POST, so we parse SSE manually.
     */
    solveStream: ({ problem, domain, level, onMeta, onChunk, onStructured, onDone, onError }) => {
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      let finished = false;

      const finish = (data) => {
        if (finished) return;
        finished = true;
        onDone?.(data || {});
      };

      // Safety timeout: if stream hangs, force-finish after 90s
      const timeout = setTimeout(() => {
        if (!finished) {
          finish({});
          controller.abort();
        }
      }, 90000);

      const run = async () => {
        try {
          const res = await fetch(`${API_BASE}/solver/solve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ problem, domain, level }),
            signal: controller.signal
          });

          if (!res.ok) {
            clearTimeout(timeout);
            const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
            onError?.(err.error || `Erreur ${res.status}`, err.quotaReached ? err : null);
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const processLine = (part) => {
            const lines = part.split('\n');
            const eventLine = lines.find(l => l.startsWith('event: '));
            const dataLine = lines.find(l => l.startsWith('data: '));
            if (!eventLine || !dataLine) return;
            const event = eventLine.slice(7).trim();
            try {
              const data = JSON.parse(dataLine.slice(6));
              if (event === 'meta') onMeta?.(data);
              else if (event === 'chunk') onChunk?.(data);
              else if (event === 'structured') onStructured?.(data);
              else if (event === 'done') { clearTimeout(timeout); finish(data); }
              else if (event === 'error') { clearTimeout(timeout); onError?.(data.message); }
            } catch (_e) { /* malformed SSE event */ }
          };

          let reading = true;
          while (reading) {
            const { done, value } = await reader.read();
            if (done) { reading = false; break; }
            buffer += decoder.decode(value, { stream: true });
            const segments = buffer.split('\n\n');
            buffer = segments.pop() || '';
            for (const seg of segments) {
              if (seg.trim()) processLine(seg);
            }
          }

          // Flush leftover buffer
          if (buffer.trim()) processLine(buffer);

          // Stream closed — ensure we always finish
          clearTimeout(timeout);
          finish({});
        } catch (err) {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') {
            onError?.(err.message || 'Erreur de connexion');
          }
          finish({});
        }
      };

      run();
      return { abort: () => { clearTimeout(timeout); controller.abort(); finish({}); } };
    },

    getHistory: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/solver/history?${qs}`);
    },

    getHistoryEntry: (id) => request(`/solver/history/${id}`),

    deleteHistory: (id) => request(`/solver/history/${id}`, { method: 'DELETE' })
  },

  // 📝 QUIZ
  quiz: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return request(`/quiz?${params}`);
    },
    getById: (id) => request(`/quiz/${id}`),
    start: (id) => request(`/quiz/${id}/start`, { method: 'POST' }),
    submit: (attemptId, answers) => 
      request(`/quiz/attempt/${attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      }),
    getAttempts: () => request('/quiz/attempts/history'),
    getQuizAttempts: (quizId) => request(`/quiz/${quizId}/attempts`),
    getStats: () => request('/quiz/stats/user')
  },

  // 👤 UTILISATEURS
  user: {
    getProfile: () => request('/users/profile'),
    getStats: () => request('/users/stats'),
    generateInvitationCode: () => request('/users/generate-invitation-code', {
      method: 'POST'
    })
  },
  users: {
    getProfile: () => request('/users/profile'),
    
    updateProfile: (data) => request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    getStats: () => request('/users/stats'),
    
    getBadges: () => request('/users/badges'),

    updateLocation: (data) => request('/users/location', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 💳 PAIEMENTS
  payments: {
    initiateWave: (data) => request('/payments/wave/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    getWaveStatus: (checkoutId) => request(`/payments/wave/status/${checkoutId}`),

    getHistory: () => request('/payments/history'),

    getMyPayments: () => request('/payments/my-payments'),

    getStatus: (paymentId) => request(`/payments/${paymentId}/status`)
  },

  // 📦 ABONNEMENTS
  subscriptions: {
    getPlans: () => request('/subscriptions/plans'),
    
    getMySubscription: () => request('/subscriptions/my-subscription'),
    
    getHistory: () => request('/subscriptions/history'),
    
    create: (data) => request('/subscriptions/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    cancel: (id) => request(`/subscriptions/${id}/cancel`, {
      method: 'POST',
    })
  },

  // 👨‍💼 ADMIN
  admin: {
    getDashboard: () => request('/admin/stats'),
    
    getUsers: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString()
      return request(`/admin/users${queryParams ? `?${queryParams}` : ''}`)
    },
    
    updateUser: (id, data) => request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
    getSubscriptions: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString()
      return request(`/admin/subscriptions${queryParams ? `?${queryParams}` : ''}`)
    },
    
    getPayments: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString()
      return request(`/admin/payments${queryParams ? `?${queryParams}` : ''}`)
    },
    
    // Plans d'abonnement
    getPlans: () => request('/admin/plans'),
    
    createPlan: (data) => request('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    updatePlan: (id, data) => request(`/admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
    deletePlan: (id) => request(`/admin/plans/${id}`, {
      method: 'DELETE',
    }),
    
    // Comptes élèves
    createStudent: (data) => request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    getStudentStats: (id) => request(`/admin/students/${id}/stats`),

    deleteUser: (id) => request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

    getContentStats: () => request('/admin/content/stats'),

    updateSubscription: (id, data) => request(`/admin/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

    broadcast: (data) => request('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // Logs
    getLogs: (params = {}) => {
      const q = new URLSearchParams(params).toString()
      return request(`/admin/logs${q ? `?${q}` : ''}`)
    },

    // Forum moderation
    getForumDiscussions: (params = {}) => {
      const q = new URLSearchParams(params).toString()
      return request(`/admin/forum/discussions${q ? `?${q}` : ''}`)
    },
    deleteDiscussion: (id) => request(`/admin/forum/discussions/${id}`, { method: 'DELETE' }),
    deleteReply: (id) => request(`/admin/forum/replies/${id}`, { method: 'DELETE' }),

    // Coach sessions
    getCoachConversations: (params = {}) => {
      const q = new URLSearchParams(params).toString()
      return request(`/admin/coach/conversations${q ? `?${q}` : ''}`)
    },
    getCoachConversation: (id) => request(`/admin/coach/conversations/${id}`),
  },

  // 🏆 GAMIFICATION
  gamification: {
    getStats: () => request('/gamification/stats'),
    
    getBadges: () => request('/gamification/badges'),
    
    getLeaderboard: () => request('/gamification/leaderboard'),
    
    claimBadge: (badgeId) => request(`/gamification/badges/${badgeId}/claim`, {
      method: 'POST',
    })
  },

  // 🔧 UTILITAIRES
  utils: {
    checkEmail: (email) => request(`/auth/check-email?email=${encodeURIComponent(email)}`),
    
    checkUsername: (username) => request(`/auth/check-username?username=${encodeURIComponent(username)}`),
    
    uploadAvatar: (file) => {
      const formData = new FormData()
      formData.append('avatar', file)
      
      return request('/users/avatar', {
        method: 'POST',
        headers: {
          // Ne pas définir Content-Type, laissez le navigateur le faire
        },
        body: formData,
      })
    }
  },

  // 📚 CONTENU PÉDAGOGIQUE
  content: {
    // Matières
    getSubjects: () => request('/content/subjects'),
    getSubject: (slug) => request(`/content/subjects/${slug}`),
    
    // Chapitres
    getChapters: (subjectSlug, level) => 
      request(`/content/subjects/${subjectSlug}/chapters?level=${level || ''}`),
    getChapter: (subjectSlug, chapterSlug) => 
      request(`/content/subjects/${subjectSlug}/chapters/${chapterSlug}`),
    
    // Leçons
    getLessons: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return request(`/content/lessons?${params}`);
    },
    getLesson: (lessonId, chapterId) => 
      request(`/content/lessons/${lessonId}?chapterId=${chapterId}`),
    completeLesson: (lessonId, timeSpent) => 
      request(`/content/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ timeSpent })
      }),
    
    // Exercices
    getExercise: (exerciseId) => request(`/content/exercises/${exerciseId}`),
    submitExercise: (exerciseId, data) => 
      request(`/content/exercises/${exerciseId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    // Progression
    getChapterProgress: (chapterId) => 
      request(`/content/progress/chapter/${chapterId}`)
  },

  // 📘 MICRO-LEÇONS (Supabase)
  microlessons: {
    list: (params = {}) => {
      const defaulted = { limit: params.limit ?? 1000, offset: params.offset ?? 0, ...params }
      return request(`/microlessons?${new URLSearchParams(defaulted).toString()}`)
    },
    get: (id) => request(`/microlessons/${id}`),
    chapterPath: (chapter, level) => request(`/microlessons/chapters/path?chapter=${encodeURIComponent(chapter)}&level=${encodeURIComponent(level)}`),
    // Tracking
    complete: (id, data) => request(`/microlessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getCompletion: (id) => request(`/microlessons/${id}/completion`),
    getNext: (id) => request(`/microlessons/${id}/next`),
    getStats: () => request('/microlessons/stats/me'),
    getToReview: (limit = 10) => request(`/microlessons/reviews/to-review?limit=${limit}`)
  },

  // 🎯 EXERCISES (from Micro-lessons)
  exercises: {
    getFromMicrolessons: (params = {}) => {
      const paramsStr = new URLSearchParams(params).toString();
      return request(`/exercises/from-microlessons?${paramsStr}`)
    }
  },

  // 📚 QUESTION BANKS (QCM + Exercices)
  questionBanks: {
    list: (params = {}) => {
      const paramsStr = new URLSearchParams(params).toString();
      return request(`/question-banks?${paramsStr}`)
    },
    get: (id) => request(`/question-banks/${id}`),
    getQCM: (bankId, params = {}) => {
      const paramsStr = new URLSearchParams(params).toString();
      return request(`/question-banks/${bankId}/qcm?${paramsStr}`)
    },
    getExercises: (bankId, params = {}) => {
      const paramsStr = new URLSearchParams(params).toString();
      return request(`/question-banks/${bankId}/exercises?${paramsStr}`)
    },
    getRandomQCM: (bankId, params = {}) => {
      const paramsStr = new URLSearchParams(params).toString();
      return request(`/question-banks/${bankId}/qcm/random?${paramsStr}`)
    },
    getRandomExercises: (bankId, params = {}) => {
      const paramsStr = new URLSearchParams(params).toString();
      return request(`/question-banks/${bankId}/exercises/random?${paramsStr}`)
    }
  },

  // 📊 DASHBOARD
  dashboard: {
    get: () => request('/dashboard'),
    getActivity: (days = 7) => request(`/dashboard/activity?days=${days}`),
    getAdvancedStats: () => request('/dashboard/advanced-stats')
  },

  // 🏆 BADGES
  badges: {
    getAll: () => request('/badges/all'),
    getUserBadges: () => request('/badges'),
    check: () => request('/badges/check', { method: 'POST' }),
    getStats: () => request('/badges/stats')
  },

  // 🗂️ FLASHCARDS (Révision Espacée)
  flashcards: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return request(`/flashcards?${params}`);
    },
    getDue: (limit = 20) => request(`/flashcards/due?limit=${limit}`),
    create: (data) => request('/flashcards', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitReview: (flashcardId, quality, timeSpent = 0) => request(`/flashcards/${flashcardId}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality, timeSpent })
    }),
    generateFromLesson: (lessonId) => request(`/flashcards/generate/${lessonId}`, {
      method: 'POST'
    }),
    getStats: () => request('/flashcards/stats')
  },

  // 💬 FORUM
  forum: {
    getDiscussions: (filters = {}, page = 1, limit = 20) => {
      const params = new URLSearchParams({ ...filters, page, limit }).toString();
      return request(`/forum?${params}`);
    },
    getDiscussion: (discussionId) => request(`/forum/${discussionId}`),
    create: (data) => request('/forum', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    reply: (discussionId, content) => request(`/forum/${discussionId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),
    voteDiscussion: (discussionId, value) => request(`/forum/${discussionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value })
    }),
    voteReply: (replyId, value) => request(`/forum/reply/${replyId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value })
    }),
    markBestAnswer: (discussionId, replyId) => request(`/forum/${discussionId}/best-answer/${replyId}`, {
      method: 'POST'
    }),
    getUserDiscussions: () => request('/forum/user/discussions'),
    getUserReplies: () => request('/forum/user/replies')
  },

  // 🤖 COACH VIRTUEL (chat conversationnel)
  coach: {
    /**
     * SSE streaming chat — same pattern as solver.solveStream.
     * Returns an object with an abort() method.
     */
    chatStream: ({ message, conversationId, onMeta, onChunk, onDone, onError }) => {
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      let finished = false;

      const finish = (data) => {
        if (finished) return;
        finished = true;
        onDone?.(data || {});
      };

      const timeout = setTimeout(() => {
        if (!finished) { finish({}); controller.abort(); }
      }, 120000);

      const run = async () => {
        try {
          const res = await fetch(`${API_BASE}/coach/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ message, conversationId }),
            signal: controller.signal
          });

          if (!res.ok) {
            clearTimeout(timeout);
            const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
            onError?.(err.error || `Erreur ${res.status}`, err.quotaReached ? err : null);
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const processLine = (part) => {
            const lines = part.split('\n');
            const eventLine = lines.find(l => l.startsWith('event: '));
            const dataLine = lines.find(l => l.startsWith('data: '));
            if (!eventLine || !dataLine) return;
            const event = eventLine.slice(7).trim();
            try {
              const data = JSON.parse(dataLine.slice(6));
              if (event === 'meta') onMeta?.(data);
              else if (event === 'chunk') onChunk?.(data);
              else if (event === 'done') { clearTimeout(timeout); finish(data); }
              else if (event === 'error') { clearTimeout(timeout); onError?.(data.message); }
            } catch (_e) { /* malformed SSE event */ }
          };

          let reading = true;
          while (reading) {
            const { done, value } = await reader.read();
            if (done) { reading = false; break; }
            buffer += decoder.decode(value, { stream: true });
            const segments = buffer.split('\n\n');
            buffer = segments.pop() || '';
            for (const seg of segments) {
              if (seg.trim()) processLine(seg);
            }
          }
          // Process remaining buffer
          if (buffer.trim()) processLine(buffer);
          clearTimeout(timeout);
          if (!finished) finish({});
        } catch (err) {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') {
            onError?.(err.message || 'Erreur de connexion');
          }
        }
      };

      run();
      return { abort: () => { clearTimeout(timeout); controller.abort(); } };
    },
    getConversations: (limit = 20) => request(`/coach/conversations?limit=${limit}`),
    getConversation: (id) => request(`/coach/conversations/${id}`),
    deleteConversation: (id) => request(`/coach/conversations/${id}`, { method: 'DELETE' })
  },

  // 📊 AI QUOTA
  aiQuota: {
    get: () => request('/ai-quota')
  },

  // 🏆 CHALLENGES
  challenges: {
    getAll: () => request('/challenges'),
    getWeekly: () => request('/challenges/weekly'),
    getById: (id) => request(`/challenges/${id}`),
    start: (id) => request(`/challenges/${id}/start`, { method: 'POST' }),
    submit: (id, data) => request(`/challenges/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getLeaderboard: (id, scope = 'international') => 
      request(`/challenges/${id}/leaderboard?scope=${scope}`),
    getUserRank: (id, scope = 'international') => 
      request(`/challenges/${id}/rank?scope=${scope}`)
  },

  // ⚔️ DUELS
  duels: {
    getAll: (isPublic = false) => request(`/duels${isPublic ? '?public=true' : ''}`),
    getMy: () => request('/duels/my'),
    getById: (id) => request(`/duels/${id}`),
    getHistory: () => request('/duels/history'),
    create: (data) => request('/duels', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    joinByCode: (inviteCode) => request(`/duels/join/${inviteCode}`, { method: 'POST' }),
    accept: (id) => request(`/duels/${id}/accept`, { method: 'POST' }),
    start: (id) => request(`/duels/${id}/start`, { method: 'POST' }),
    submit: (id, data) => request(`/duels/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 📊 LEADERBOARD
  leaderboard: {
    get: (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return request(`/leaderboard?${queryStr}`);
    },
    getMyRank: () => request('/leaderboard/my-rank')
  },

  // 👨‍👩‍👧‍👦 PARENT DASHBOARD
  parent: {
    generateInvite: () => request('/parent/invite', { method: 'POST' }),
    linkToParent: (code) => request('/parent/link', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
    unlinkChild: (childId) => request(`/parent/unlink/${childId}`, { method: 'DELETE' }),
    unlinkSelf: () => request('/parent/unlink-self', { method: 'DELETE' }),
    getChildren: () => request('/parent/children'),
    getChildStats: (childId, timeRange = 'week') => request(`/parent/child/${childId}/stats?timeRange=${timeRange}`),
    getDashboard: (childId, timeRange = 'week') => request(`/parent/dashboard/${childId}?timeRange=${timeRange}`),
    getNotifications: (childId) => request(`/parent/notifications/${childId}`),
    updateNotificationLevel: (childId, level) => request(`/parent/notifications/${childId}`, {
      method: 'PUT',
      body: JSON.stringify({ level }),
    }),
    linkByPhone: (data) => request('/parent/link-by-phone', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    unlinkByPhone: () => request('/parent/link-by-phone', { method: 'DELETE' }),
    getFamilyStatus: () => request('/parent/family-status'),
    getTimeline: (childId) => request('/parent/children/' + childId + '/timeline'),
    linkDirect: (contact) => request('/parent/link-direct', {
      method: 'POST',
      body: JSON.stringify({ contact }),
    }),
  },

  // 👨‍👩‍👧 PARENT COACH
  parentCoach: {
    getConversations: (limit) => request('/parent-coach/conversations?limit=' + (limit || 20)),
    deleteConversation: (id) => request('/parent-coach/conversations/' + id, { method: 'DELETE' }),
    chatStream: async function(message, mode, childId, conversationId, onChunk, onDone, onError) {
      var token = localStorage.getItem('token');
      var base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : 'http://localhost:5000/api';
      var body = { message: message, mode: mode || 'general' };
      if (childId) body.childId = childId;
      if (conversationId) body.conversationId = conversationId;
      try {
        var response = await fetch(base + '/parent-coach/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          if (onError) onError(err.error || 'Erreur');
          return;
        }
        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';
        var reading = true;
        while (reading) {
          var result = await reader.read();
          if (result.done) { reading = false; break; }
          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.startsWith('data: ')) {
              try {
                var data = JSON.parse(line.slice(6));
                if (data.text && onChunk) onChunk(data.text);
                if (data.status === 'completed' && onDone) onDone(data);
                if (data.message && !data.text && !data.status && onError) onError(data.message);
              } catch (_e) { /* parse error, skip */ }
            }
          }
        }
      } catch (e) {
        if (onError) onError(e.message || 'Erreur reseau');
      }
    }
  },

  // 🔔 NOTIFICATIONS
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' })
  }
}

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  return !!(token && user)
}

// Fonction pour obtenir l'utilisateur actuel
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// Fonction pour sauvegarder les données d'authentification
export const saveAuthData = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('token', token)
}

// Fonction pour nettoyer les données d'authentification
export const clearAuthData = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

export default api
