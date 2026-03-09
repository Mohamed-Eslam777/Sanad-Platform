/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * StatusBadge — Glowing Status Indicator with Pulsing Dot
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props (backward-compatible):
 *   status, type
 *
 * NEW props:
 *   size — 'sm' | 'md' (default)
 *
 * Enhancements:
 *   - Pulsing dot for active statuses (pending, accepted, in_progress)
 *   - Glassmorphism pill styling
 *   - Framer Motion scaleIn entrance
 */
import React from 'react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status, type = 'request', size = 'md' }) => {

    /* ── Request statuses ── */
    const requestStatuses = {
        pending: { label: 'قيد الانتظار', dot: 'bg-warning-400', classes: 'bg-warning-500/15 text-warning-400 border-warning-500/25' },
        accepted: { label: 'تم القبول', dot: 'bg-royal-400', classes: 'bg-royal-600/15 text-royal-400 border-royal-500/25' },
        in_progress: { label: 'قيد التنفيذ', dot: 'bg-royal-400', classes: 'bg-royal-600/15 text-royal-400 border-royal-500/25' },
        completed: { label: 'مكتمل', dot: null, classes: 'bg-success-500/15 text-success-400 border-success-500/25' },
        cancelled: { label: 'ملغي', dot: null, classes: 'bg-danger-500/15 text-danger-400 border-danger-500/25' },
    };

    /* ── User statuses ── */
    const userStatuses = {
        active: { label: 'نشط', dot: 'bg-success-400', classes: 'bg-success-500/15 text-success-400 border-success-500/25' },
        flagged: { label: 'مراقب', dot: 'bg-warning-400', classes: 'bg-warning-500/15 text-warning-400 border-warning-500/25' },
        suspended: { label: 'موقوف', dot: null, classes: 'bg-danger-500/15 text-danger-400 border-danger-500/25' },
    };

    const lookup = type === 'user' ? userStatuses : requestStatuses;
    const badge = lookup[status] || { label: status, dot: null, classes: 'bg-glass-light text-gray-400 border-glass-border' };

    /* ── Determine if this is an active/pulsing status ── */
    const isActive = ['pending', 'accepted', 'in_progress', 'active', 'flagged'].includes(status);

    /* ── Size classes ── */
    const sizeClasses = size === 'sm'
        ? 'px-2 py-0.5 text-[10px]'
        : 'px-2.5 py-1 text-xs';

    return (
        <motion.span
            className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${badge.classes} ${sizeClasses}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            {/* Pulsing dot for active statuses (hidden on 'sm' size) */}
            {isActive && badge.dot && size !== 'sm' && (
                <span className="relative flex h-2 w-2">
                    {/* Ping animation ring */}
                    <span className={`animate-pulseDot absolute inline-flex h-full w-full rounded-full ${badge.dot} opacity-75`} />
                    {/* Solid dot */}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.dot}`} />
                </span>
            )}

            {badge.label}
        </motion.span>
    );
};

export default StatusBadge;
