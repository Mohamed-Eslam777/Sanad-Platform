/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Modal — Generic Glassmorphism Modal Shell
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   isOpen   — boolean, controls visibility
 *   onClose  — callback on dismiss (Escape key, backdrop click, close button)
 *   title    — optional heading string
 *   size     — 'sm' | 'md' (default) | 'lg' | 'full'
 *   children — modal body content
 *
 * Features:
 *   - Backdrop blur overlay
 *   - .glass-heavy frosted panel with spring entrance
 *   - Escape key listener
 *   - Simple focus trap (cycles between first and last focusable elements)
 *   - Gradient accent strip at top
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    full: 'max-w-[95vw] w-full max-h-[95vh]',
};

export default function Modal({ isOpen, onClose, title, size = 'md', children }) {
    const panelRef = useRef(null);

    /* ── Escape key listener ── */
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    /* ── Simple focus trap ── */
    const trapFocus = useCallback((e) => {
        if (!panelRef.current || e.key !== 'Tab') return;

        const focusable = panelRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', trapFocus);
        return () => document.removeEventListener('keydown', trapFocus);
    }, [isOpen, trapFocus]);

    /* ── Auto-focus panel on open ── */
    useEffect(() => {
        if (isOpen && panelRef.current) {
            const firstFocusable = panelRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }
    }, [isOpen]);

    /* ── Lock body scroll when open ── */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                        aria-hidden="true"
                    />

                    {/* ── Panel ── */}
                    <motion.div
                        key="modal-container"
                        initial={{ opacity: 0, scale: 0.95, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            ref={panelRef}
                            dir="rtl"
                            role="dialog"
                            aria-modal="true"
                            aria-label={title || 'نافذة حوار'}
                            className={`pointer-events-auto w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.md} glass-heavy rounded-3xl overflow-hidden`}
                        >
                            {/* Accent gradient strip */}
                            <div className="h-[2px] w-full bg-gradient-to-l from-royal-600 via-royal-400 to-transparent" />

                            {/* Header (only if title is provided) */}
                            {title && (
                                <div className="flex items-center justify-between px-7 pt-6 pb-0">
                                    <h2 className="text-xl font-extrabold text-white">{title}</h2>
                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-glass-light hover:bg-glass-medium text-gray-400 hover:text-white transition-colors"
                                        aria-label="إغلاق"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Close button (when no title) */}
                            {!title && (
                                <div className="absolute top-4 left-4 z-10">
                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-glass-light hover:bg-glass-medium text-gray-400 hover:text-white transition-colors"
                                        aria-label="إغلاق"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Body */}
                            <div className="px-7 py-6 max-h-[80vh] overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
