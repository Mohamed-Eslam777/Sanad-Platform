/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Avatar — Glowing Initials Avatar with Status Dot
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   name     — full name string (initials are extracted automatically)
 *   size     — 'sm' (32px) | 'md' (40px, default) | 'lg' (56px)
 *   color    — optional override for background color
 *   ring     — boolean, adds a Royal Blue glow ring
 *   status   — 'online' | 'offline' | 'busy' | null
 *   className — extra wrapper classes
 *
 * Features:
 *   - Deterministic color generation from name hash (consistent per user)
 *   - Auto-extracted 1–2 character initials
 *   - Size variants
 *   - Optional pulsing glow ring
 *   - Status dot indicator (bottom-right corner)
 */
import React from 'react';

/* ── Curated palette for auto-generated avatar backgrounds ── */
const AVATAR_COLORS = [
    'bg-royal-600',
    'bg-[#7C3AED]',   // violet
    'bg-[#059669]',   // emerald
    'bg-[#D97706]',   // amber
    'bg-[#DC2626]',   // red
    'bg-[#2563EB]',   // blue
    'bg-[#0891B2]',   // cyan
    'bg-[#9333EA]',   // purple
    'bg-[#E11D48]',   // rose
    'bg-[#0D9488]',   // teal
];

/* ── Simple deterministic hash from a string ── */
function hashName(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/* ── Extract 1–2 initials from a name ── */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

/* ── Size config ── */
const SIZES = {
    sm: {
        container: 'w-8 h-8',
        text: 'text-xs',
        dotSize: 'w-2 h-2',
        dotOffset: '-bottom-0 -right-0',
        ringSize: 'ring-[2px]',
    },
    md: {
        container: 'w-10 h-10',
        text: 'text-sm',
        dotSize: 'w-2.5 h-2.5',
        dotOffset: '-bottom-0.5 -right-0.5',
        ringSize: 'ring-2',
    },
    lg: {
        container: 'w-14 h-14',
        text: 'text-lg',
        dotSize: 'w-3 h-3',
        dotOffset: 'bottom-0 right-0',
        ringSize: 'ring-2',
    },
};

/* ── Status dot colors ── */
const STATUS_COLORS = {
    online: 'bg-success-400',
    offline: 'bg-gray-500',
    busy: 'bg-warning-400',
};

export default function Avatar({
    name = '',
    size = 'md',
    color,
    ring = false,
    status,
    className = '',
}) {
    const initials = getInitials(name);
    const bgColor = color || AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
    const sizeConfig = SIZES[size] || SIZES.md;

    return (
        <div className={`relative inline-flex flex-shrink-0 ${className}`}>
            {/* Avatar circle */}
            <div
                className={[
                    sizeConfig.container,
                    bgColor,
                    'rounded-full flex items-center justify-center text-white font-bold',
                    ring ? `${sizeConfig.ringSize} ring-royal-500/40 ring-offset-2 ring-offset-navy-800` : '',
                    'select-none',
                ].join(' ')}
                aria-label={name || 'مستخدم'}
                role="img"
            >
                <span className={sizeConfig.text}>{initials}</span>
            </div>

            {/* Status dot */}
            {status && STATUS_COLORS[status] && (
                <span
                    className={`absolute ${sizeConfig.dotOffset} ${sizeConfig.dotSize} ${STATUS_COLORS[status]} rounded-full border-2 border-navy-800`}
                    aria-label={status === 'online' ? 'متصل' : status === 'busy' ? 'مشغول' : 'غير متصل'}
                />
            )}
        </div>
    );
}
