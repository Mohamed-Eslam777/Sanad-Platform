/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Card — Glassmorphism Card with Framer Motion Hover Lift
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props (backward-compatible):
 *   children, className, padding
 *
 * NEW props:
 *   variant — 'glass' (default) | 'solid' | 'glow'
 *   accent  — boolean, adds a Royal Blue gradient strip at the top
 *   hover   — boolean (default true), enables hover lift animation
 */
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Card = forwardRef(({
    children,
    className = '',
    padding = 'p-6',
    variant = 'glass',
    accent = false,
    hover = true,
    ...props
}, ref) => {

    /* ── Variant styles ── */
    const variants = {
        glass: [
            'glass',           // from index.css — backdrop-blur + border
            'shadow-inner-glow',
        ].join(' '),

        solid: [
            'bg-navy-700 border border-navy-600/50',
            'shadow-soft',
        ].join(' '),

        glow: [
            'glass',
            'glow-border',     // from index.css — Royal Blue glow border
        ].join(' '),
    };

    const variantClass = variants[variant] || variants.glass;

    const classes = [
        'rounded-2xl overflow-hidden',
        variantClass,
        padding,
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.div
            ref={ref}
            className={classes}
            whileHover={
                hover
                    ? { y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }
                    : {}
            }
            {...props}
        >
            {/* Accent gradient strip */}
            {accent && (
                <div
                    className="h-[2px] w-full bg-gradient-to-r from-royal-600 to-royal-400 -mt-6 mb-6 -mx-6"
                    style={{ width: 'calc(100% + 3rem)' }}
                />
            )}
            {children}
        </motion.div>
    );
});

Card.displayName = 'Card';
export default Card;
