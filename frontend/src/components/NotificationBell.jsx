import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, CheckCircle, Package, CheckCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Icon by notification type ─────────────────────────────── */
const TYPE_ICONS = {
    request_accepted: { icon: CheckCircle, bg: 'bg-emerald-500/20', color: 'text-emerald-400', border: 'border-emerald-500/30' },
    request_completed: { icon: Package, bg: 'bg-blue-500/20', color: 'text-blue-400', border: 'border-blue-500/30' },
    new_message: { icon: MessageCircle, bg: 'bg-purple-500/20', color: 'text-purple-400', border: 'border-purple-500/30' },
};

function NotifIcon({ type }) {
    const cfg = TYPE_ICONS[type] || { icon: Bell, bg: 'bg-white/10', color: 'text-white/70', border: 'border-white/10' };
    const Icon = cfg.icon;
    return (
        <div className={`w-10 h-10 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
    );
}

/* ─── Single notification row ────────────────────────────────── */
function NotifRow({ notif, onMarkAsRead, onNavigate }) {
    const timeStr = new Date(notif.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const handleClick = () => {
        if (!notif.is_read) onMarkAsRead(notif.id);
        if (notif.link) onNavigate(notif.link);
    };

    return (
        <div
            onClick={handleClick}
            className={`flex items-start gap-4 px-5 py-4 transition-all duration-200 cursor-pointer border-b border-white/5 last:border-0 relative ${
                !notif.is_read
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-transparent hover:bg-white/[0.02] opacity-70'
            }`}
        >
            {!notif.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
            
            <NotifIcon type={notif.type} />
            <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold leading-tight ${!notif.is_read ? 'text-white' : 'text-white/80'}`}>
                        {notif.title}
                    </p>
                    {notif.is_read ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] mt-1 shrink-0" />
                    )}
                </div>
                <p className={`text-xs mt-1 line-clamp-2 ${!notif.is_read ? 'text-blue-100/90' : 'text-white/50'}`}>
                    {notif.body}
                </p>
                <p className="text-[10px] text-white/40 mt-1.5 font-medium tracking-wider">{timeStr}</p>
            </div>
        </div>
    );
}

/* ─── Main NotificationBell component ─────────────────────────── */
export default function NotificationBell({ notifications = [], onMarkAsRead, onMarkAllAsRead }) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNavigate = useCallback((link) => {
        setOpen(false);
        navigate(link);
    }, [navigate]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="relative w-11 h-11 flex items-center justify-center rounded-full bg-[#1A1F3D]/80 backdrop-blur-md border border-white/10 hover:bg-[#23294E]/90 transition-all text-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                aria-label="الإشعارات"
            >
                <Bell className="w-[22px] h-[22px] transition-transform duration-300 hover:scale-110" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 min-w-[20px] h-[20px] bg-gradient-to-tr from-pink-500 to-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1.5 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse border border-white/20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute left-0 mt-3 w-[360px] rounded-3xl z-50 overflow-hidden"
                        style={{ top: '100%', isolation: 'isolate' }}
                    >
                        {/* Premium Glassmorphism Background Container */}
                        <div className="absolute inset-0 bg-[#0f1228]/95 backdrop-blur-2xl -z-10" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />
                        <div className="absolute inset-0 rounded-3xl border border-white/10 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] pointer-events-none -z-10" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                                    <Bell className="w-4 h-4 text-blue-400" />
                                </div>
                                <h3 className="text-base font-black text-white tracking-wide">الإشعارات</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-black ml-1 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                                        {unreadCount} جديد
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors group"
                                >
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                                    <span className="text-[11px] text-blue-400 font-bold group-hover:text-blue-300 whitespace-nowrap">
                                        تحديد كمقروء
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Notification list */}
                        <div className="max-h-[380px] overflow-y-auto no-scrollbar scroll-smooth">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-white/50">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                        <Bell className="w-8 h-8 opacity-40 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-white/70">لا توجد إشعارات</p>
                                    <p className="text-xs text-white/40 mt-1.5 max-w-[200px] text-center leading-relaxed font-medium tracking-wide">
                                        ستظهر إشعاراتك الجديدة وتنبيهات الرسائل هنا
                                    </p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <NotifRow
                                        key={n.id}
                                        notif={n}
                                        onMarkAsRead={onMarkAsRead}
                                        onNavigate={handleNavigate}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
