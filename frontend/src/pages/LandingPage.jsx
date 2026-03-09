/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LandingPage — Premium Guest Welcome Screen
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Extracted from HomePage.jsx (L19–L33). Fully restyled with:
 *   - Dark theme (inherits AnimatedBackground orbs from App.jsx)
 *   - Gradient text for brand name
 *   - Phase 1 Button component for CTAs
 *   - Framer Motion staggered fadeInUp entrance
 *   - Logo image instead of generic Shield icon
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import logo from '../assets/logo.png';

/* ── Stagger animation variants ── */
const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
    return (
        <div
            dir="rtl"
            className="min-h-screen flex flex-col items-center justify-center text-center px-4"
        >
            <motion.div
                className="flex flex-col items-center max-w-xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo */}
                <motion.div
                    variants={itemVariants}
                    className="mb-8 flex items-center justify-center"
                >
                    <img
                        src={logo}
                        alt="سَنَد"
                        className="w-40 h-40 md:w-48 md:h-48 object-contain"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(29, 78, 216, 0.35))' }}
                    />
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
                >
                    منصة{' '}
                    <span className="text-gradient-royal">سَنَد</span>
                    {' '}للمساندة المجتمعية
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
                >
                    نصل بين من يحتاج المساعدة وبين المتطوعين المستعدين لتقديمها بكل حب وسلاسة.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md"
                >
                    <Link to="/register" className="flex-1">
                        <Button variant="primary" size="lg" fullWidth>
                            سجل معنا الآن
                        </Button>
                    </Link>
                    <Link to="/login" className="flex-1">
                        <Button variant="outline" size="lg" fullWidth>
                            تسجيل الدخول
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
