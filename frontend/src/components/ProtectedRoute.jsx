import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Flow:
 *  1. While AuthContext is still hydrating from localStorage → show spinner (never redirect yet)
 *  2. Hydration done, no user         → redirect to /login
 *  3. Hydration done, wrong role      → redirect to /
 *  4. Hydration done, correct session → render children
 */
function ProtectedRoute({ children, allowedRoles }) {
    const { isLoggedIn, isLoading, user } = useAuth();

    // ── Step 1: wait for localStorage hydration ──────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">جارٍ التحقق من الجلسة...</p>
                </div>
            </div>
        );
    }

    // ── Step 2: not logged in ─────────────────────────────────────────────────
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // ── Step 3: role guard ────────────────────────────────────────────────────
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    // ── Step 4: all good ──────────────────────────────────────────────────────
    return children;
}

export default ProtectedRoute;
