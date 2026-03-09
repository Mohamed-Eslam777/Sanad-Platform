import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, CheckCircle, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Icon by notification type ─────────────────────────────── */
const TYPE_ICONS = {
    request_accepted: { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
    request_completed: { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600' },
    new_message: { icon: MessageCircle, bg: 'bg-purple-100', color: 'text-purple-600' },
};

function NotifIcon({ type }) {
    const cfg = TYPE_ICONS[type] || { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-500' };
    const Icon = cfg.icon;
    return (
        <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
    );
}

/* ─── Single notification row ────────────────────────────────── */
function NotifRow({ notif, onDismiss, onNavigate }) {
    const timeStr = new Date(notif.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            onClick={() => notif.link && onNavigate(notif.link)}
            className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${notif.link ? 'cursor-pointer' : ''}`}
        >
            <NotifIcon type={notif.type} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">{notif.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">{timeStr}</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
                className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-500 rounded flex-shrink-0 mt-0.5"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

/* ─── Main NotificationBell component ─────────────────────────── */
export default function NotificationBell({ notifications = [], onDismiss, onClearAll }) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

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
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                aria-label="الإشعارات"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        style={{ top: '100%' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-black text-gray-900">الإشعارات</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{unreadCount}</span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button onClick={onClearAll} className="text-xs text-blue-600 font-bold hover:underline">
                                    مسح الكل
                                </button>
                            )}
                        </div>

                        {/* Notification list */}
                        <div className="max-h-[360px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Bell className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-bold text-gray-500">لا توجد إشعارات</p>
                                    <p className="text-xs text-gray-400 mt-1">ستظهر إشعاراتك هنا</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <NotifRow
                                        key={n.id}
                                        notif={n}
                                        onDismiss={onDismiss}
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
