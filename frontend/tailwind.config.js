/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            /* ═══════════════════════════════════════════════════════════════
               1. BRAND COLOR PALETTE
            ═══════════════════════════════════════════════════════════════ */
            colors: {
                // ── Primary: Royal Blue ──
                royal: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',   // ★ HERO
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },

                // ── Secondary: Deep Navy / Off-Black ──
                navy: {
                    50: '#F0F4FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#1E293B',
                    600: '#0F172A',
                    700: '#0D1321',
                    800: '#0A0F1E',   // ★ HERO — main background
                    900: '#060A14',
                },

                // ── Glow tokens (opacity variants of Royal Blue) ──
                glow: {
                    blue: 'rgba(37, 99, 235, 0.35)',
                    blueLight: 'rgba(37, 99, 235, 0.12)',
                    blueSoft: 'rgba(37, 99, 235, 0.06)',
                    white: 'rgba(255, 255, 255, 0.08)',
                },

                // ── Glassmorphism surface tokens ──
                glass: {
                    light: 'rgba(255, 255, 255, 0.06)',
                    medium: 'rgba(255, 255, 255, 0.10)',
                    heavy: 'rgba(255, 255, 255, 0.15)',
                    border: 'rgba(255, 255, 255, 0.12)',
                },

                // ── Semantic ──
                success: { 400: '#34D399', 500: '#10B981', 600: '#059669' },
                warning: { 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
                danger: { 400: '#F87171', 500: '#EF4444', 600: '#DC2626' },

                // ── Surfaces ──
                surface: '#0A0F1E',
                card: '#111827',
            },

            /* ═══════════════════════════════════════════════════════════════
               2. TYPOGRAPHY
            ═══════════════════════════════════════════════════════════════ */
            fontFamily: {
                sans: ['Tajawal', 'Cairo', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },

            /* ═══════════════════════════════════════════════════════════════
               3. LAYERED GLOW SHADOW SYSTEM
            ═══════════════════════════════════════════════════════════════ */
            boxShadow: {
                'soft': '0 2px 12px rgba(0, 0, 0, 0.08)',
                'medium': '0 4px 24px rgba(0, 0, 0, 0.12)',
                'heavy': '0 8px 40px rgba(0, 0, 0, 0.18)',
                'glow-sm': '0 0 15px rgba(37, 99, 235, 0.15)',
                'glow-md': '0 0 30px rgba(37, 99, 235, 0.20)',
                'glow-lg': '0 0 60px rgba(37, 99, 235, 0.25)',
                'glow-green': '0 0 20px rgba(16, 185, 129, 0.20)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.20)',
                'inner-glow': 'inset 0 1px 1px rgba(255, 255, 255, 0.06)',
            },

            /* ═══════════════════════════════════════════════════════════════
               4. BORDER RADIUS TOKENS
            ═══════════════════════════════════════════════════════════════ */
            borderRadius: {
                'sm': '0.5rem',
                'md': '0.75rem',
                'lg': '1rem',
                'xl': '1.5rem',
                '2xl': '2rem',
                'full': '9999px',
            },

            /* ═══════════════════════════════════════════════════════════════
               5. KEYFRAME ANIMATIONS
            ═══════════════════════════════════════════════════════════════ */
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(16px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.92)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                pulseDot: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.3' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                orbMove: {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0, 0) scale(1)' },
                },
                logoPulse: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.6', transform: 'scale(1.08)' },
                },
            },
            animation: {
                'shimmer': 'shimmer 1.8s infinite linear',
                'fadeInUp': 'fadeInUp 0.5s ease-out both',
                'scaleIn': 'scaleIn 0.3s ease-out both',
                'pulseDot': 'pulseDot 1.5s infinite',
                'float': 'float 6s ease-in-out infinite',
                'orbMove': 'orbMove 20s ease-in-out infinite',
                'logoPulse': 'logoPulse 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
