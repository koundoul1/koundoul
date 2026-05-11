/**
 * Page Notifications — liste verticale avec mark-as-read et navigation.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Award,
  Swords,
  TrendingUp,
  CreditCard,
  Flame,
  MessageSquare,
  CheckCheck,
  BellOff,
  Megaphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from '../hooks/useTranslation';

const TYPE_CONFIG = {
  badge_earned: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  duel_invite: { icon: Swords, color: 'text-red-400', bg: 'bg-red-400/10' },
  level_up: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
  payment_confirmed: { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  streak_reminder: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  challenge_start: { icon: Swords, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  new_message: { icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  admin_broadcast: { icon: Megaphone, color: 'text-pink-400', bg: 'bg-pink-400/10' }
};

const NAV_PATHS = {
  duel_invite: '/challenge',
  badge_earned: '/badges',
  challenge_start: '/challenge',
  level_up: '/profile',
  payment_confirmed: '/subscriptions',
  streak_reminder: '/dashboard',
  new_message: '/forum'
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const handleClick = (notif) => {
    if (!notif.isRead) markRead(notif.id);
    // Toggle expand to read full message
    if (expandedId === notif.id) {
      setExpandedId(null);
      // Navigate on second click if path exists
      const path = notif.type === 'admin_broadcast' ? (notif.data?.link || null) : NAV_PATHS[notif.type];
      if (path) navigate(path);
    } else {
      setExpandedId(notif.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 lg:pb-0">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold">{t('notif.title')}</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              {t('notif.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto px-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellOff className="h-16 w-16 text-gray-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-400 mb-2">
              {t('notif.empty')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('notif.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(notif => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.badge_earned;
              const Icon = config.icon;

              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors ${
                    notif.isRead
                      ? 'bg-gray-800/30 hover:bg-gray-800/50'
                      : 'bg-gray-800 hover:bg-gray-700/80'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${notif.isRead ? 'text-gray-400' : 'text-white font-semibold'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className={`text-xs text-gray-500 mt-0.5 ${expandedId === notif.id ? '' : 'line-clamp-2'}`}>{notif.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-600">{timeAgo(notif.createdAt)}</p>
                      {notif.message && notif.message.length > 80 && (
                        <span className="text-[10px] text-gray-600">{expandedId === notif.id ? '▲ reduire' : '▼ lire plus'}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
