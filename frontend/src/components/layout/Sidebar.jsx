/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sidebar — Glassmorphism App Navigation Shell
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Extracted from HomePage.jsx. Premium frosted sidebar with:
 *   - Logo image from assets
 *   - Framer Motion hover slide on nav links
 *   - Role-aware portal label
 *   - RTL-safe logical properties throughout
 *   - Glass mobile overlay
 *
 * Props:
 *   user        — user object from AuthContext
 *   onLogout    — logout callback
 *   currentPath — current route path (for active link highlighting)
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Settings, LogOut, List } from 'lucide-react';
import logo from '../../assets/logo.png';

const NAV_LINKS = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/profile', label: 'الملف الشخصي', icon: Settings },
];

export default function Sidebar({ user, onLogout, currentPath = '/' }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const roleLabel = user?.role === 'volunteer' ? 'بوابة المتطوع' : 'بوابة المستفيد';

    return (
        <>
            {/* ── Mobile Toggle Button ── */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden fixed top-4 end-4 z-50 glass p-2.5 text-royal-400 rounded-xl shadow-glow-sm"
                aria-label="فتح القائمة"
            >
                <List className="w-6 h-6" />
            </button>

            {/* ── Sidebar Panel ── */}
            <aside
                className={[
                    'w-64 glass-heavy border-l border-glass-border flex flex-col justify-between fixed h-full right-0 z-40',
                    'transition-transform duration-300 ease-out',
                    mobileOpen ? 'translate-x-0' : 'translate-x-full',
                    'md:translate-x-0',
                ].join(' ')}
            >
                {/* Logo & Brand */}
                <div>
                    <div className="p-6 border-b border-glass-border flex flex-col items-center text-center gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] overflow-hidden shadow-glow-sm flex-shrink-0 bg-transparent">
                            <img src={logo} alt="سَنَد" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-white">منصة سَنَد</h3>
                            <p className="text-xs text-royal-400 mt-1">{roleLabel}</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-4 space-y-1">
                        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                            const isActive = currentPath === to;
                            return (
                                <motion.div
                                    key={to}
                                    whileHover={{ x: -4 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <Link
                                        to={to}
                                        onClick={() => setMobileOpen(false)}
                                        className={[
                                            'flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors',
                                            isActive
                                                ? 'bg-royal-600/15 text-royal-400 shadow-glow-sm'
                                                : 'text-gray-400 hover:bg-glass-light hover:text-white',
                                        ].join(' ')}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="me-auto">{label}</span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>
                </div>

                {/* User Info & Logout */}
                <div className="p-4">
                    <div className="px-4 py-3 mb-2 text-sm text-gray-500 border-t border-glass-border pt-4 truncate">
                        {user?.email}
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-danger-400 hover:bg-danger-500/10 rounded-xl font-bold text-sm transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* ── Mobile Backdrop ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="sidebar-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
