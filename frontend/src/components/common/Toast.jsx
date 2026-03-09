/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Toast — Premium Standalone Toast Notification
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   id          — unique identifier
 *   type        — 'success' | 'error' | 'warning' | 'info'
 *   title       — main heading text
 *   body        — optional description text
 *   duration    — auto-dismiss time in ms (default 5000, 0 = no auto-dismiss)
 *   onClose     — called when toast is dismissed
 *
 * Features:
 *   - Glassmorphism background with semantic border glow
 *   - Framer Motion slide-in / slide-out
 *   - Animated countdown progress bar
 *   - Type-specific icon and color theming
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ── Type configurations ── */
const TYPE_CONFIG = {
    success: {
        icon: CheckCircle,
        border: 'border-success-500/40',
        glow: 'shadow-glow-green',
        dot: 'bg-success-400',
        bar: 'bg-success-500',
        iconColor: 'text-success-400',
        bg: 'bg-success-500/5',
    },
    error: {
        icon: AlertCircle,
        border: 'border-danger-500/40',
        glow: 'shadow-glow-red',
        dot: 'bg-danger-400',
        bar: 'bg-danger-500',
        iconColor: 'text-danger-400',
        bg: 'bg-danger-500/5',
    },
    warning: {
        icon: AlertTriangle,
        border: 'border-warning-500/40',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
        dot: 'bg-warning-400',
        bar: 'bg-warning-500',
        iconColor: 'text-warning-400',
        bg: 'bg-warning-500/5',
    },
    info: {
        icon: Info,
        border: 'border-royal-500/40',
        glow: 'shadow-glow-sm',
        dot: 'bg-royal-400',
        bar: 'bg-royal-500',
        iconColor: 'text-royal-400',
        bg: 'bg-royal-500/5',
    },
};

export default function Toast({ id, type = 'info', title, body, duration = 5000, onClose }) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const Icon = config.icon;

    const [progress, setProgress] = useState(100);

    /* ── Auto-dismiss countdown ── */
    useEffect(() => {
        if (duration <= 0) return;

        const startTime = Date.now();
        let raf;

        function tick() {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining > 0) {
                raf = requestAnimationFrame(tick);
            } else {
                onClose?.();
            }
        }
        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [duration, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`relative glass-heavy rounded-2xl border ${config.border} ${config.glow} max-w-[340px] w-full pointer-events-auto overflow-hidden`}
        >
            {/* Semantic tint overlay */}
            <div className={`absolute inset-0 ${config.bg} pointer-events-none rounded-2xl`} />

            {/* Content */}
            <div className="relative z-10 flex items-start gap-3 px-4 py-3.5">
                {/* Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">{title}</p>
                    {body && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{body}</p>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-0.5 rounded-lg hover:bg-glass-light"
                    aria-label="إغلاق الإشعار"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Countdown progress bar */}
            {duration > 0 && (
                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-glass-light overflow-hidden">
                    <div
                        className={`h-full ${config.bar} transition-none`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
}
