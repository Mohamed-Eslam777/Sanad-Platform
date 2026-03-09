/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DashboardTabs — Glassmorphism Tab Switcher
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   tabs        — [{ key, label, count }]
 *   activeTab   — current selected key
 *   onTabChange — (key) => void
 */
import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardTabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="glass rounded-xl p-1 w-fit mb-6 flex gap-1">
            {tabs.map(({ key, label, count }) => {
                const isActive = activeTab === key;
                return (
                    <motion.button
                        key={key}
                        onClick={() => onTabChange(key)}
                        whileTap={{ scale: 0.97 }}
                        className={[
                            'relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors',
                            isActive
                                ? 'glass-medium text-royal-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-300',
                        ].join(' ')}
                    >
                        {/* Active indicator backdrop via layoutId for smooth sliding */}
                        {isActive && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 glass-medium rounded-lg shadow-glow-sm"
                                style={{ zIndex: -1 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                        )}

                        {label}

                        {count > 0 && (
                            <span
                                className={[
                                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                                    isActive
                                        ? 'bg-royal-600/20 text-royal-400'
                                        : 'bg-glass-light text-gray-400',
                                ].join(' ')}
                            >
                                {count}
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
