/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Button — Premium Glowing Button with Framer Motion
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props (backward-compatible):
 *   children, onClick, type, variant, size, className, disabled, fullWidth, icon
 *
 * NEW props:
 *   loading  — shows spinner, disables click, sets aria-busy
 *
 * Variants: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
 * Sizes:    'sm' | 'md' | 'lg'
 */
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    fullWidth = false,
    icon = null,
    loading = false,
    ...props
}, ref) => {

    const isDisabled = disabled || loading;

    /* ── Base styles ── */
    const base = [
        'inline-flex items-center justify-center font-bold rounded-xl',
        'transition-all duration-200 ease-out outline-none',
        'focus-visible:ring-2 focus-visible:ring-royal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800',
    ].join(' ');

    /* ── Variant styles ── */
    const variants = {
        primary: [
            'bg-royal-600 hover:bg-royal-700 text-white',
            'shadow-glow-sm hover:shadow-glow-md',
            'disabled:bg-royal-600/40 disabled:shadow-none',
        ].join(' '),

        secondary: [
            'bg-royal-600/10 hover:bg-royal-600/20 text-royal-400',
            'border border-royal-500/20 hover:border-royal-500/30',
            'disabled:bg-glass-light disabled:text-gray-500 disabled:border-glass-border',
        ].join(' '),

        danger: [
            'bg-danger-500 hover:bg-danger-600 text-white',
            'shadow-glow-red hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]',
            'disabled:bg-danger-500/40 disabled:shadow-none',
        ].join(' '),

        outline: [
            'bg-transparent border border-glass-border text-gray-300',
            'hover:bg-glass-light hover:border-royal-500/30 hover:text-white',
            'disabled:border-glass-border/50 disabled:text-gray-600',
        ].join(' '),

        ghost: [
            'bg-transparent text-royal-400 hover:text-royal-300',
            'hover:bg-royal-600/10',
            'disabled:text-gray-600 disabled:bg-transparent',
        ].join(' '),
    };

    /* ── Size styles ── */
    const sizes = {
        sm: 'px-4 py-2 text-xs gap-1.5',
        md: 'px-6 py-3 text-sm gap-2',
        lg: 'px-8 py-3.5 text-base gap-2.5',
    };

    const classes = [
        base,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            ref={ref}
            type={type}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            className={classes}
            whileHover={isDisabled ? {} : { scale: 1.03 }}
            whileTap={isDisabled ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            aria-busy={loading || undefined}
            {...props}
        >
            {/* Icon / Loading spinner */}
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : icon ? (
                <span className="flex-shrink-0 me-1">{icon}</span>
            ) : null}

            {/* Label */}
            {!loading && children}
            {loading && <span>جارٍ التحميل...</span>}
        </motion.button>
    );
});

Button.displayName = 'Button';
export default Button;
