import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from './services/socketService';
import { Bell, CheckCircle, MessageCircle, Package, X } from 'lucide-react';
import NotificationBell from './components/NotificationBell';
import AnimatedBackground from './components/AnimatedBackground';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import logo from './assets/logo.png';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

/* ══════════════════════════════════════════════════════════════════════════════
   Toast  (auto-dismisses after 5s)
══════════════════════════════════════════════════════════════════════════════ */
function Toast({ notif, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const TYPE_COLORS = {
    request_accepted: 'border-green-400',
    request_completed: 'border-blue-400',
    new_message: 'border-purple-400',
  };
  const borderColor = TYPE_COLORS[notif.type] || 'border-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      className={`flex items-start gap-3 bg-white rounded-2xl shadow-2xl border-r-4 ${borderColor} px-4 py-3.5 max-w-[320px] w-full pointer-events-auto`}
    >
      <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-gray-900 leading-tight">{notif.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
      </div>
      <button onClick={onClose} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   NotificationProvider — socket listener + state management
   Wraps authenticated app content only (after login)
══════════════════════════════════════════════════════════════════════════════ */
function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 50)); // keep last 50
    setToasts(prev => [...prev, notif]);

    // Play a subtle beep using Web Audio API (no external files needed)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* AudioContext not supported */ }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  // Subscribe to socket notifications when user is logged in
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handler = (notif) => addNotification(notif);
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [user, addNotification]);

  return (
    <>
      {/* Inject notification state into children via context-like pattern
                We expose NotificationBell through a portal-like fixed element */}
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
      <div
        dir="rtl"
        className="fixed bottom-6 left-4 z-[101] flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: '340px' }}
      >
        <AnimatePresence>
          {toasts.map(t => (
            <Toast key={t.id} notif={t} onClose={() => dismissToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {children}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HomeRouter — smart landing: guests see LandingPage, users see Dashboard
══════════════════════════════════════════════════════════════════════════════ */
function HomeRouter() {
  const { isLoggedIn, isLoading } = useAuth();

  // Wait for auth hydration before deciding
  if (isLoading) return null;

  return isLoggedIn ? <HomePage /> : <LandingPage />;
}

/* ══════════════════════════════════════════════════════════════════════════════
   GlobalWatermark — subtle logo presence behind ALL pages
══════════════════════════════════════════════════════════════════════════════ */
function GlobalWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      style={{
        backgroundImage: `url(${logo})`,
        backgroundSize: '95vh',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: 0.08,
        mixBlendMode: 'screen',
        maskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   App — router + providers + loading screen + animated background
══════════════════════════════════════════════════════════════════════════════ */
const SESSION_KEY = 'sanad_splash_shown';

function App() {
  // Only show the loading screen once per browser session
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem(SESSION_KEY);
  });

  const handleSplashFinished = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setShowSplash(false);
  }, []);

  return (
    <>
      {/* ── Animated Loading Screen (once per session) ── */}
      {showSplash && <LoadingScreen onFinished={handleSplashFinished} />}

      {/* ── Animated Mesh-Gradient Background (always visible) ── */}
      <AnimatedBackground variant="full" />

      {/* ── Main Application ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          opacity: showSplash ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
          pointerEvents: showSplash ? 'none' : 'auto',
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <GlobalWatermark />
            <NotificationProvider>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Home — smart route: guests see LandingPage, logged-in see Dashboard */}
                <Route path="/" element={<HomeRouter />} />

                {/* Protected */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailsPage /></ProtectedRoute>} />

                {/* Admin only */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
