import { Outlet } from 'react-router-dom';

// Badge notification context removed — replaced by useGamification hook
// + GamificationToast (Phase 2A). Kept as no-op for backward compat
// with Exercise.jsx, Lesson.jsx, QuizResults.jsx that import useBadgeContext.
import { createContext, useContext } from 'react';

export const BadgeNotificationContext = createContext(null);

export function useBadgeContext() {
  return useContext(BadgeNotificationContext);
}

export default function Layout() {
  return (
    <BadgeNotificationContext.Provider value={{ showBadges: () => {}, notifications: [], removeBadgeNotification: () => {} }}>
      <div className="min-h-screen bg-gray-50">
        <main>
          <Outlet />
        </main>
      </div>
    </BadgeNotificationContext.Provider>
  );
}
