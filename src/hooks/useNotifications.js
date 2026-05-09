import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api'

const MAX_RETRIES = 10

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotification, setLatestNotification] = useState(null)
  const controllerRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const retryCountRef = useRef(0)
  const stoppedRef = useRef(false)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.notifications.getAll()
      if (res.success) {
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unreadCount)
      }
    } catch {
      // silent
    }
  }, [isAuthenticated])

  const connectSSE = useCallback(() => {
    if (!isAuthenticated || stoppedRef.current) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Close existing connection
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    const controller = new AbortController()
    controllerRef.current = controller

    const url = `${API_BASE}/notifications/stream`

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(response => {
      // Check HTTP status before reading stream
      if (response.status === 401 || response.status === 403) {
        console.warn('[Notifications] Auth expired (', response.status, '), SSE stopped.')
        stoppedRef.current = true
        return // Do NOT reconnect
      }
      if (!response.ok) {
        console.warn('[Notifications] SSE error', response.status)
        scheduleReconnect()
        return
      }

      // Connection successful — reset retry counter
      retryCountRef.current = 0

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            // Server closed connection — reconnect
            scheduleReconnect()
            return
          }

          buffer += decoder.decode(value, { stream: true })
          const segments = buffer.split('\n\n')
          buffer = segments.pop() || ''

          for (const chunk of segments) {
            const dataLine = chunk.split('\n').find(l => l.startsWith('data: '))
            if (!dataLine) continue

            try {
              const event = JSON.parse(dataLine.slice(6))
              if (event.type === 'notification') {
                setNotifications(prev => [event.notification, ...prev].slice(0, 20))
                setUnreadCount(prev => prev + 1)
                setLatestNotification(event.notification)
                playNotificationSound()
              }
            } catch {
              // ignore parse errors (ping, connected, etc.)
            }
          }

          read()
        }).catch(() => {
          scheduleReconnect()
        })
      }

      read()
    }).catch(err => {
      if (err.name === 'AbortError') return // intentional cleanup
      scheduleReconnect()
    })
  }, [isAuthenticated])

  const scheduleReconnect = useCallback(() => {
    if (stoppedRef.current) return
    if (retryCountRef.current >= MAX_RETRIES) {
      console.warn('[Notifications] Max retries reached, SSE stopped.')
      stoppedRef.current = true
      return
    }
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
    retryCountRef.current++
    retryTimeoutRef.current = setTimeout(connectSSE, delay)
  }, [connectSSE])

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

  const markRead = useCallback(async (id) => {
    try {
      await api.notifications.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }, [])

  const clearLatest = useCallback(() => {
    setLatestNotification(null)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      stoppedRef.current = false
      retryCountRef.current = 0
      fetchNotifications()
      connectSSE()
    } else {
      stoppedRef.current = true
      setNotifications([])
      setUnreadCount(0)
    }

    return () => {
      if (controllerRef.current) controllerRef.current.abort()
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
