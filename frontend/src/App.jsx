import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import GlobalWatermark from './components/layout/GlobalWatermark';
import AnimatedBackground from './components/AnimatedBackground';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import AdminDashboard from './pages/AdminDashboard';

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
              <ToastContainer position="bottom-right" theme="dark" />
            </NotificationProvider>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
