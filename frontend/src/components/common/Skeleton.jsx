/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Skeleton — Shimmer Loading Placeholders
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Variants:
 *   text   — single-line shimmer bar (configurable width)
 *   circle — round avatar placeholder (configurable size)
 *   card   — full card-shaped rectangle
 *   list   — repeating n lines with staggered widths
 *
 * Props:
 *   variant    — 'text' | 'circle' | 'card' | 'list'
 *   width      — CSS width string (for text variant, default '100%')
 *   height     — CSS height string (for text/card, default '16px' for text)
 *   size       — pixel number for circle diameter (default 40)
 *   lines      — number of lines for list variant (default 4)
 *   className  — extra classes
 */
import React from 'react';

const STAGGER_WIDTHS = ['92%', '65%', '80%', '45%', '75%', '58%', '88%', '50%'];

function SkeletonBar({ width = '100%', height = '16px', className = '', rounded = 'rounded-md' }) {
    return (
        <div
            className={`shimmer ${rounded} ${className}`}
            style={{ width, height, minHeight: height }}
            aria-hidden="true"
        />
    );
}

export default function Skeleton({
    variant = 'text',
    width,
    height,
    size = 40,
    lines = 4,
    className = '',
}) {
    switch (variant) {
        /* ── Single line ── */
        case 'text':
            return (
                <SkeletonBar
                    width={width || '100%'}
                    height={height || '14px'}
                    className={className}
                />
            );

        /* ── Circle (avatar) ── */
        case 'circle':
            return (
                <div
                    className={`shimmer rounded-full flex-shrink-0 ${className}`}
                    style={{ width: size, height: size }}
                    aria-hidden="true"
                />
            );

        /* ── Full card ── */
        case 'card':
            return (
                <div
                    className={`shimmer rounded-2xl ${className}`}
                    style={{ width: width || '100%', height: height || '160px' }}
                    aria-hidden="true"
                />
            );

        /* ── Multiple staggered lines ── */
        case 'list':
            return (
                <div className={`space-y-3 ${className}`} aria-hidden="true">
                    {Array.from({ length: lines }).map((_, i) => (
                        <SkeletonBar
                            key={i}
                            width={STAGGER_WIDTHS[i % STAGGER_WIDTHS.length]}
                            height={height || '14px'}
                        />
                    ))}
                </div>
            );

        default:
            return <SkeletonBar width={width} height={height} className={className} />;
    }
}
