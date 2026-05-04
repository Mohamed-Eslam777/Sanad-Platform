import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socketService';
import { useAudioNotification } from '../hooks/useAudioNotification';
import NotificationBell from '../components/NotificationBell';
import NotificationToastStack from '../components/layout/NotificationToastStack';
import api from '../services/api';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NotificationContext — Persistent + Realtime
 *
 * On mount (when user is available):
 *   1. Fetches notification history from GET /api/notifications (last 50).
 *   2. Subscribes to 'new_notification' socket events — prepends to list.
 *
 * markAsRead / markAllAsRead now call the backend REST API and then update
 * local state to stay in sync with the DB.
 *
 * Exposes (via useNotifications):
 *   notifications   — full notification list (newest first, up to 50)
 *   markAsRead      — (id) => void
 *   markAllAsRead   — () => void
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, refreshProfile } = useAuth();
  const { playBeep } = useAudioNotification();

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  /* ── Initial fetch: load history from DB on login ── */
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setNotifications([]), 0); // clear on logout
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    api.get('/notifications')
      .then((res) => {
        if (!cancelled) {
          // API returns newest-first; map DB field names to frontend shape
          const loaded = (res.data?.data || []).map((n) => ({
            id:        n.id,
            type:      n.type,
            title:     n.title,
            body:      n.body,
            link:      n.link,
            requestId: n.request_id,
            is_read:   n.is_read,
            timestamp: n.created_at,
          }));
          setNotifications(loaded);
        }
      })
      .catch((err) => {
        // Non-fatal: user still gets realtime notifications from socket
        console.warn('[NotificationContext] Failed to load notification history:', err.message);
      });

    return () => { cancelled = true; };
  }, [user]);

  /* ── Add a new notification arriving via socket ── */
  const addNotification = useCallback(
    (notif) => {
      setNotifications((prev) => {
        // Dedup: skip if this notification id is already in the list
        if (notif.id && prev.some((n) => n.id === notif.id)) return prev;
        return [{ ...notif, is_read: false }, ...prev].slice(0, 50);
      });
      // Toast + sound only if not a duplicate (check current state)
      setToasts((prev) => [...prev, { ...notif, is_read: false }]);
      playBeep();
    },
    [playBeep],
  );

  /* ── Dismiss a single toast ── */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Mark a single notification as read (DB + local state) ── */
  const markAsRead = useCallback((id) => {
    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    // Persist to backend (fire-and-forget; failure doesn't revert UI)
    api.patch(`/notifications/${id}/read`).catch((err) => {
      console.warn('[NotificationContext] markAsRead failed:', err.message);
    });
  }, []);

  /* ── Mark all notifications as read (DB + local state) ── */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    api.patch('/notifications/read-all').catch((err) => {
      console.warn('[NotificationContext] markAllAsRead failed:', err.message);
    });
  }, []);

  /* ── Subscribe to socket when user is logged in ── */
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handler = (notif) => {
      addNotification(notif);
      // Auto-refresh profile stats on relevant notification types
      if (['request_completed', 'request_accepted', 'completion_requested'].includes(notif.type)) {
        refreshProfile?.();
      }
    };
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [user, addNotification, refreshProfile]);

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead }}>
      {/* Notification Bell icon — visible only when logged in */}
      {user && (
        <div
          dir="rtl"
          className="fixed top-4 left-4 z-[100] pointer-events-auto"
          style={{ isolation: 'isolate' }}
        >
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
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
