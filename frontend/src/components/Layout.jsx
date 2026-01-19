import { Outlet } from 'react-router-dom';
import { useBadgeNotifications } from '../hooks/useBadgeNotifications';
import BadgeToast from './BadgeToast';
import { createContext, useContext } from 'react';

// Créer un contexte pour les notifications
export const BadgeNotificationContext = createContext(null);

export function useBadgeContext() {
  return useContext(BadgeNotificationContext);
}

export default function Layout() {
  const badgeNotifications = useBadgeNotifications();

  return (
    <BadgeNotificationContext.Provider value={badgeNotifications}>
      <div className="min-h-screen bg-gray-50">
        <main>
          <Outlet />
        </main>

        {/* Notifications de badges */}
        {badgeNotifications.notifications.map((badge) => (
          <BadgeToast
            key={badge.id}
            badge={badge}
            onClose={() => badgeNotifications.removeBadgeNotification(badge.id)}
          />
        ))}
      </div>
    </BadgeNotificationContext.Provider>
  );
}


