import { useState, useCallback } from 'react';

export function useBadgeNotifications() {
  const [notifications, setNotifications] = useState([]);

  const showBadgeNotification = useCallback((badge) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...badge, id }]);
  }, []);

  const removeBadgeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showBadges = useCallback((badges) => {
    badges.forEach((badge, index) => {
      setTimeout(() => {
        showBadgeNotification(badge);
      }, index * 1000); // Décalage de 1 seconde entre chaque
    });
  }, [showBadgeNotification]);

  return {
    notifications,
    showBadgeNotification,
    showBadges,
    removeBadgeNotification
  };
}


