/**
 * 🌐 Service API Koundoul
 * Client API complet pour communiquer avec le backend
 */

// Configuration de l'URL de l'API
// En production, utilise VITE_API_URL depuis les variables d'environnement
// En développement, utilise localhost par défaut
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api'

// Helper pour les requêtes avec gestion d'erreurs
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    // Timeout augmenté pour les appels IA qui peuvent être longs
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
        const error = new Error(errorData.error?.message || errorData.message || 'Session expirée')
        error.status = 401
        throw error
      }
      
      const error = new Error(errorData.error?.message || errorData.message || 'Une erreur est survenue')
      error.status = response.status
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    
    // Gestion spécifique des erreurs
    if (error.name === 'AbortError') {
      throw new Error('⏱️ La requête a pris trop de temps. Veuillez réessayer avec un problème plus simple.');
    }
    
    if (error.message === 'Failed to fetch') {
      throw new Error('❌ Impossible de joindre le serveur. Vérifiez que le backend est démarré sur le port 5000.');
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
    solve: (data) => request('/solver/solve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    getHistory: () => request('/solver/history'),
    
    getProblems: (filters = {}) => {
      const params = new URLSearchParams(filters)
      return request(`/solver/problems?${params}`)
    },
    
    saveProblem: (data) => request('/solver/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    })
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
  users: {
    getProfile: () => request('/users/profile'),
    
    updateProfile: (data) => request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    getStats: () => request('/users/stats'),
    
    getBadges: () => request('/users/badges')
  },

  // 💳 PAIEMENTS
  payments: {
    createIntent: (data) => request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    confirmPayment: (data) => request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    getHistory: () => request('/payments/history')
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
    get: () => request('/dashboard')
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

  // 🤖 COACH VIRTUEL
  coach: {
    analyzeExercise: (payload) => {
      // payload peut être une string (image base64) ou un objet { imageData, text }
      let body = {};
      if (typeof payload === 'string') {
        body = { imageData: payload };
      } else if (payload && (payload.imageData || payload.text)) {
        body = payload;
      }
      return request('/coach/analyze', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    },
    generateNextQuestion: (sessionId, userAnswers, currentStep) => request('/coach/question', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userAnswers, currentStep })
    }),
    validateAnswer: (sessionId, question, userAnswer, helpLevel) => request('/coach/validate', {
      method: 'POST',
      body: JSON.stringify({ sessionId, question, userAnswer, helpLevel })
    }),
    completeSession: (sessionId) => request('/coach/complete', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    }),
    // Nouvelles méthodes pour le moteur d'étapes
    startStepSession: (equation, guidanceLevel) => request('/coach/steps/start', {
      method: 'POST',
      body: JSON.stringify({ equation, guidanceLevel })
    }),
    validateStepAnswer: (sessionId, inputs) => request('/coach/steps/validate', {
      method: 'POST',
      body: JSON.stringify({ sessionId, inputs })
    }),
    getStepHint: (sessionId, level) => request('/coach/steps/hint', {
      method: 'POST',
      body: JSON.stringify({ sessionId, level })
    }),
    adaptGuidance: (sessionId, trigger) => request('/coach/steps/adapt', {
      method: 'POST',
      body: JSON.stringify({ sessionId, trigger })
    }),
    completeStepSession: (sessionId) => request('/coach/steps/complete', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    }),
    getSessionHistory: () => request('/coach/history'),
    getCoachStats: () => request('/coach/stats')
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
    getHistory: () => request('/duels/history'),
    create: (data) => request('/duels', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    accept: (id) => request(`/duels/${id}/accept`, { method: 'POST' }),
    start: (id) => request(`/duels/${id}/start`, { method: 'POST' }),
    submit: (id, data) => request(`/duels/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
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
