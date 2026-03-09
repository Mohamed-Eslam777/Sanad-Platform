/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * StatCard — Animated Statistic Card with Count-Up & Scroll Entrance
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props (backward-compatible):
 *   title, value, icon, color, bg
 *
 * Enhancements:
 *   - Framer Motion scroll-entrance (fadeInUp + whileInView)
 *   - Count-up animation for numeric values
 *   - Gradient icon background
 *   - Hover scale with spring easing
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ── Tiny count-up hook ── */
function useCountUp(target, duration = 1200, shouldRun = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!shouldRun) return;

        const num = typeof target === 'number' ? target : parseFloat(target);
        if (isNaN(num) || num === 0) { setCount(target); return; }

        let start = 0;
        const startTime = performance.now();
        const isFloat = String(target).includes('.');

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * num;

            setCount(isFloat ? current.toFixed(1) : Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setCount(target); // ensure exact final value (string or number)
            }
        }
        requestAnimationFrame(tick);
    }, [target, duration, shouldRun]);

    return count;
}

const StatCard = ({ title, value, icon, color = 'text-royal-400', bg = 'bg-royal-600/15' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });

    // Only count up for pure numbers or "X / Y" patterns
    const numericValue = typeof value === 'number' ? value : value;
    const displayValue = useCountUp(numericValue, 1200, isInView);

    return (
        <motion.div
            ref={ref}
            className="glass rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
        >
            {/* Subtle gradient surface overlay */}
            <div className="absolute inset-0 bg-gradient-surface pointer-events-none" />

            <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <p className="text-2xl font-black text-white">{displayValue}</p>
            </div>

            <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} shadow-inner-glow`}>
                {icon && React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
        </motion.div>
    );
};

export default StatCard;
