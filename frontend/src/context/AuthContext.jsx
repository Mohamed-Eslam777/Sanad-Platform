import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSocket, disconnectSocket } from '../services/socketService';

/**
 * AuthContext — global authentication state for Sanad.
 *
 * Provides:
 *  - user       : the logged-in user object (or null)
 *  - token      : the JWT string (or null)
 *  - isLoading  : true while hydrating from localStorage (prevents premature redirects)
 *  - login()    : store token/user in state + localStorage
 *  - logout()   : clear everything
 *  - isLoggedIn : boolean shorthand
 */

const TOKEN_KEY = 'sanad_token';
const USER_KEY = 'sanad_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // We start with isLoading = true so ProtectedRoute waits before redirecting.
    const [isLoading, setIsLoading] = useState(true);

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // ── Hydrate once from localStorage on mount ──────────────────────────────
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedUser = localStorage.getItem(USER_KEY);
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch {
            // Corrupted storage – clear it
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } finally {
            // Done hydrating – allow ProtectedRoute to make redirect decisions
            setIsLoading(false);
        }
    }, []);

    // ── login: save token FIRST, then user state + ensure socket connection ─
    const login = useCallback((userData, jwtToken) => {
        // 1. Persist to storage so any new API call can pick up the token immediately
        localStorage.setItem(TOKEN_KEY, jwtToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        // 2. Update React state
        setToken(jwtToken);
        setUser(userData);

        // 3. Lazily establish a socket connection for real-time features
        try {
            getSocket();
        } catch {
            // Socket connection failures shouldn't block login
        }
    }, []);

    // ── logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        // Cleanly tear down any active socket connection before dropping auth
        try {
            disconnectSocket();
        } catch {
            // Ignore errors on disconnect
        }

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Convenience hook */
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
