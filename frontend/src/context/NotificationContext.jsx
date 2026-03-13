import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socketService';
import { useAudioNotification } from '../hooks/useAudioNotification';
import NotificationBell from '../components/NotificationBell';
import NotificationToastStack from '../components/layout/NotificationToastStack';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NotificationContext
 *
 * Provides global notification state and socket subscription for the Sanad app.
 *
 * Exposes (via useNotifications):
 *   notifications       — full notification list (up to 50, newest first)
 *   dismissNotification — (id) => void
 *   clearAll            — () => void
 *
 * Side effects rendered inside this provider:
 *   - NotificationBell overlay (fixed, top-left, only when logged in)
 *   - NotificationToastStack (fixed, bottom-left, RTL)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { playBeep } = useAudioNotification();

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  /* ── Add a new notification (called by socket handler) ── */
  const addNotification = useCallback(
    (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50)); // keep last 50
      setToasts((prev) => [...prev, notif]);
      playBeep();
    },
    [playBeep],
  );

  /* ── Dismiss a single toast ── */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Dismiss a notification from the bell list ── */
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /* ── Clear all notifications ── */
  const clearAll = useCallback(() => setNotifications([]), []);

  /* ── Subscribe to socket when user is logged in ── */
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handler = (notif) => addNotification(notif);
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [user, addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, dismissNotification, clearAll }}>
      {/* Notification Bell icon — visible only when logged in */}
      {user && (
        <div
          dir="rtl"
          className="fixed top-4 left-4 z-[100] pointer-events-auto"
          style={{ isolation: 'isolate' }}
        >
          <NotificationBell
            notifications={notifications}
            onDismiss={dismissNotification}
            onClearAll={clearAll}
          />
        </div>
      )}

      {/* Toast stack — bottom-left corner */}
      <NotificationToastStack toasts={toasts} onDismiss={dismissToast} />

      {children}
    </NotificationContext.Provider>
  );
}

/** Convenience hook — throws if used outside of NotificationProvider */
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
