import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api'

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotification, setLatestNotification] = useState(null)
  const eventSourceRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const retryCountRef = useRef(0)

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.notifications.getAll()
      if (res.success) {
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unreadCount)
      }
    } catch {
      // silent fail
    }
  }, [isAuthenticated])

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const url = `${API_BASE}/notifications/stream`
    const es = new EventSource(url, {
      // EventSource doesn't support headers natively,
      // so we pass token as query param
    })

    // Since EventSource doesn't support auth headers,
    // we'll use fetch-based SSE instead
    const controller = new AbortController()

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(response => {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            // Connection closed, retry
            scheduleReconnect()
            return
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const chunk of lines) {
            const dataLine = chunk.split('\n').find(l => l.startsWith('data: '))
            if (!dataLine) continue

            try {
              const event = JSON.parse(dataLine.slice(6))
              if (event.type === 'notification') {
                setNotifications(prev => [event.notification, ...prev].slice(0, 20))
                setUnreadCount(prev => prev + 1)
                setLatestNotification(event.notification)
                // Play notification sound
                playNotificationSound()
              }
              // Reset retry count on successful message
              retryCountRef.current = 0
            } catch {
              // ignore parse errors (ping, etc)
            }
          }

          read()
        }).catch(() => {
          scheduleReconnect()
        })
      }

      read()
    }).catch(() => {
      scheduleReconnect()
    })

    // Store abort controller for cleanup
    eventSourceRef.current = { close: () => controller.abort() }
  }, [isAuthenticated])

  const scheduleReconnect = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
    retryCountRef.current++
    retryTimeoutRef.current = setTimeout(connectSSE, delay)
  }, [connectSSE])

  // Play a short notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gain.gain.value = 0.1
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch {
      // Audio not available
    }
  }

  // Mark notification as read
  const markRead = useCallback(async (id) => {
    try {
      await api.notifications.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }, [])

  // Mark all as read
  const markAllRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }, [])

  // Clear latest notification (for toast dismiss)
  const clearLatest = useCallback(() => {
    setLatestNotification(null)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      connectSSE()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [isAuthenticated, fetchNotifications, connectSSE])

  return {
    notifications,
    unreadCount,
    latestNotification,
    markRead,
    markAllRead,
    clearLatest,
    refresh: fetchNotifications
  }
}
