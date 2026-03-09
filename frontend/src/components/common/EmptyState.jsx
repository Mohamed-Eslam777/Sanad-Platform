/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EmptyState — Reusable "No Data" Placeholder
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   icon      — Lucide icon component (e.g., Inbox, Search)
 *   title     — heading text
 *   subtitle  — optional description text
 *   action    — optional ReactNode (e.g., a Button) rendered below the text
 *   className — extra wrapper classes
 *
 * Features:
 *   - Framer Motion fadeInUp entrance
 *   - Centered layout with muted text colors for the dark theme
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({
    icon: Icon,
    title,
    subtitle,
    action,
    className = '',
}) {
    return (
        <motion.div
            className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Icon */}
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-royal-600/10 border border-royal-500/20 flex items-center justify-center mb-5">
                    <Icon className="w-8 h-8 text-royal-400" />
                </div>
            )}

            {/* Title */}
            {title && (
                <h3 className="text-lg font-bold text-gray-300 mb-1.5">{title}</h3>
            )}

            {/* Subtitle */}
            {subtitle && (
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-5">{subtitle}</p>
            )}

            {/* Action slot */}
            {action && (
                <div className="mt-1">{action}</div>
            )}
        </motion.div>
    );
}
