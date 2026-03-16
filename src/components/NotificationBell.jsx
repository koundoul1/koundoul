import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'

const ICONS = {
  badge_earned: '🏅',
  duel_invite: '⚔️',
  streak_reminder: '🔥',
  challenge_start: '🏆',
  level_up: '⬆️',
  new_message: '💬',
  payment_confirmed: '💳'
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'à l\'instant'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function getNavPath(notif) {
  const d = notif.data || {}
  switch (notif.type) {
    case 'duel_invite': return '/challenge'
    case 'badge_earned': return '/badges'
    case 'challenge_start': return '/challenge'
    case 'level_up': return '/profile'
    case 'new_message': return d.discussionId ? `/forum/${d.discussionId}` : '/forum'
    case 'payment_confirmed': return '/subscriptions'
    case 'streak_reminder': return '/dashboard'
    default: return null
  }
}

const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead, latestNotification, clearLatest } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const [shake, setShake] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Shake animation when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 600)
      return () => clearTimeout(t)
    }
  }, [latestNotification])

  const handleClick = (notif) => {
    if (!notif.isRead) markRead(notif.id)
    const path = getNavPath(notif)
    if (path) navigate(path)
    setShowDropdown(false)
  }

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all ${shake ? 'animate-shake' : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowDropdown(false)} />
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-80 max-h-[70vh] bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-kprimary hover:text-kprimary/80 font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/30">
                  <Bell className="w-8 h-8 mb-2" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                      !notif.isRead ? 'bg-kprimary/5' : ''
                    }`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {ICONS[notif.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-white' : 'text-white/60'}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-kprimary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-white/25 mt-1 block">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast for new real-time notifications */}
      {latestNotification && (
        <NotificationToast notification={latestNotification} onDismiss={clearLatest} onNavigate={(notif) => {
          clearLatest()
          const path = getNavPath(notif)
          if (path) navigate(path)
        }} />
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(-12deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </>
  )
}

// Inline toast component
function NotificationToast({ notification, onDismiss, onNavigate }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [notification.id, onDismiss])

  return (
    <div
      className="fixed top-4 right-4 z-[10001] w-80 bg-[#1A1A2E] border border-kprimary/30 rounded-2xl shadow-2xl p-4 cursor-pointer"
      onClick={() => onNavigate(notification)}
      style={{ animation: 'toastSlideIn 0.3s ease-out' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{ICONS[notification.type] || '🔔'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{notification.title}</p>
          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{notification.message}</p>
        </div>
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default NotificationBell
