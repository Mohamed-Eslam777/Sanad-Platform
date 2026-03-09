/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LoadingScreen — Cinematic "Logo Galaxy" Splash Experience
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * High-end splash with:
 *   ● Logo Galaxy: 25 scattered ghost logos of varying sizes floating organically
 *   ● Hero Logo:   400px center-stage with intense blue glow
 *   ● Brand Text:  Animated gradient Arabic brand name + cascading dots
 *
 * 3-phase timing:
 *   Phase 1 (0 → 1s):    Hero logo springs in; galaxy starts drifting
 *   Phase 2 (1 → 2.5s):  Logo pulsates, glow ring expands, brand text appears
 *   Phase 3 (2.5 → 3.2s): Everything fades out, calls onFinished()
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

/* ── Programmatic Logo Galaxy Particle Generator ─────────────────────────────
   25 particles distributed across the viewport with wide variance in
   size (40–220px), opacity (0.04–0.10), drift, speed, and rotation.         */
const GALAXY = Array.from({ length: 25 }, (_, i) => {
    // Deterministic "random" via index-based spread for consistent renders
    const seed = (i * 7 + 13) % 25;
    const col = i % 5;           // 5 columns
    const row = Math.floor(i / 5); // 5 rows
    // Spread across viewport with jitter
    const left = col * 20 + (seed % 12) - 2;         // 0–100%
    const top = row * 20 + ((seed * 3) % 14) - 3;   // 0–100%
    // Size buckets: small (40–70), medium (80–130), large (140–220)
    const sizeBucket = i % 3;
    const size = sizeBucket === 0
        ? 40 + (seed % 35)          // 40–74
        : sizeBucket === 1
            ? 80 + (seed % 55)      // 80–134
            : 140 + (seed % 85);    // 140–224
    // Opacity scales with size — larger = slightly more visible
    const opacity = 0.04 + (size / 220) * 0.06; // 0.04 → 0.10
    // Animation properties
    const drift = -(10 + (seed % 22));       // -10 to -31px vertical
    const sway = (seed % 2 === 0 ? 1 : -1) * (5 + (seed % 10)); // horizontal sway
    const duration = 6 + (seed % 8);         // 6–13s
    const delay = (i * 0.15) % 3;            // stagger 0–3s
    const rotate = (seed % 2 === 0 ? 1 : -1) * (2 + (seed % 6)); // subtle rotation

    return { id: i, top: `${Math.max(0, Math.min(95, top))}%`, left: `${Math.max(0, Math.min(95, left))}%`, size, opacity: Math.min(opacity, 0.10), drift, sway, duration, delay, rotate };
});

export default function LoadingScreen({ onFinished }) {
    const [phase, setPhase] = useState(1);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(2), 1000);
        const t2 = setTimeout(() => setPhase(3), 2500);
        const t3 = setTimeout(() => {
            setVisible(false);
            onFinished?.();
        }, 3200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onFinished]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="loading-screen"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase === 3 ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                    style={{ backgroundColor: '#060A14' }}
                    aria-label="جاري تحميل التطبيق"
                    role="status"
                >
                    {/* ═══════════════════════════════════════════════════════
                        Layer 1: Logo Galaxy — 25 Ghost Particles
                    ═══════════════════════════════════════════════════════ */}
                    {GALAXY.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute pointer-events-none"
                            style={{
                                top: p.top,
                                left: p.left,
                                width: p.size,
                                height: p.size,
                                opacity: p.opacity,
                                mixBlendMode: 'screen',
                                maskImage: 'radial-gradient(circle, black 20%, transparent 80%)',
                                WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 80%)',
                            }}
                            initial={{ y: 0, x: 0, rotate: 0 }}
                            animate={{
                                y: [0, p.drift, 0],
                                x: [0, p.sway, 0],
                                rotate: [0, p.rotate, 0],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'easeInOut',
                                delay: p.delay,
                            }}
                        >
                            <img
                                src={logo}
                                alt=""
                                className="w-full h-full object-contain"
                                draggable={false}
                            />
                        </motion.div>
                    ))}

                    {/* ═══════════════════════════════════════════════════════
                        Layer 2: Pulsating Glow Ring
                    ═══════════════════════════════════════════════════════ */}
                    <motion.div
                        className="absolute rounded-full z-[1]"
                        initial={{ width: 200, height: 200, opacity: 0 }}
                        animate={
                            phase >= 2
                                ? {
                                    width: [200, 450, 340],
                                    height: [200, 450, 340],
                                    opacity: [0, 0.6, 0.3],
                                }
                                : { opacity: 0 }
                        }
                        transition={{
                            duration: 1.8,
                            repeat: phase === 2 ? Infinity : 0,
                            repeatType: 'reverse',
                            ease: 'easeInOut',
                        }}
                        style={{
                            background:
                                'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0.1) 45%, transparent 70%)',
                            filter: 'blur(35px)',
                        }}
                    />

                    {/* ═══════════════════════════════════════════════════════
                        Layer 3: Hero Logo (The Giant — 400px)
                    ═══════════════════════════════════════════════════════ */}
                    <motion.img
                        src={logo}
                        alt="سَنَد"
                        className="relative z-10"
                        style={{
                            width: 400,
                            height: 400,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 50px rgba(29, 78, 216, 0.5)) drop-shadow(0 0 120px rgba(37, 99, 235, 0.2))',
                        }}
                        initial={{ opacity: 0, scale: 0.55, y: 40 }}
                        animate={
                            phase === 1
                                ? { opacity: 1, scale: 1, y: 0 }
                                : phase === 2
                                    ? {
                                        opacity: [1, 0.8, 1],
                                        scale: [1, 1.04, 1],
                                        y: 0,
                                    }
                                    : { opacity: 0.6, scale: 0.9, y: -10 }
                        }
                        transition={
                            phase === 1
                                ? { type: 'spring', stiffness: 170, damping: 15, duration: 0.9 }
                                : phase === 2
                                    ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: 'reverse',
                                        ease: 'easeInOut',
                                    }
                                    : { duration: 0.4, ease: 'easeOut' }
                        }
                    />

                    {/* ═══════════════════════════════════════════════════════
                        Layer 4: Brand Name (Animated Gradient)
                    ═══════════════════════════════════════════════════════ */}
                    <motion.p
                        className="relative z-10 mt-8 text-xl font-black tracking-[0.35em]"
                        style={{
                            backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={
                            phase >= 2
                                ? { opacity: 1, y: 0, backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
                                : { opacity: 0, y: 16 }
                        }
                        transition={{
                            opacity: { duration: 0.5, delay: 0.15 },
                            y: { duration: 0.5, delay: 0.15 },
                            backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' },
                        }}
                    >
                        سَـنَـد
                    </motion.p>

                    {/* Loading dots */}
                    <motion.div
                        className="relative z-10 flex gap-1.5 mt-5"
                        initial={{ opacity: 0 }}
                        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="block w-2 h-2 rounded-full"
                                style={{ backgroundColor: 'rgba(96, 165, 250, 0.6)' }}
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
