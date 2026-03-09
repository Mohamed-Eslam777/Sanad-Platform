/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * HomePage — Slim Orchestrator
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Responsibilities:
 *   1. Render the app layout shell (Sidebar + main content area)
 *   2. Switch on user.role to render the correct dashboard
 *   3. Wrap content in Framer Motion page transition
 *
 * Previously 357 lines. Now ~40 lines.
 * All dashboard logic lives in src/features/dashboard/.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import BeneficiaryDashboard from '../features/dashboard/BeneficiaryDashboard';
import VolunteerDashboard from '../features/dashboard/VolunteerDashboard';

export default function HomePage() {
    const { user, logout } = useAuth();

    return (
        <div dir="rtl" className="min-h-screen flex">
            {/* Sidebar Navigation */}
            <Sidebar user={user} onLogout={logout} currentPath="/" />

            {/* Main Content */}
            <main className="flex-1 mr-0 md:mr-64 p-4 md:p-8 pt-20 md:pt-8 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    {user?.role === 'volunteer' ? (
                        <VolunteerDashboard user={user} />
                    ) : (
                        <BeneficiaryDashboard user={user} />
                    )}
                </motion.div>
            </main>
        </div>
    );
}
