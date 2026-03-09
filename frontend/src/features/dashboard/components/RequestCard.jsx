/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RequestCard — Shared Request List Item Card
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Used by both BeneficiaryDashboard and VolunteerDashboard to render a single
 * request in a list. Glass card with hover lift, status badge, location, date.
 *
 * Props:
 *   request          — request object ({ id, description, status, type,
 *                       location_address, distance_km, createdAt, beneficiary })
 *   actions          — ReactNode slot for action buttons (details, accept, cancel)
 *   showBeneficiary  — boolean, show beneficiary name (volunteer accepted tab)
 *   showDistance      — boolean, show distance info (volunteer nearby tab)
 *   showType         — boolean, show type emoji (default true)
 */
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import Card from '../../../components/common/Card';
import StatusBadge from '../../../components/common/StatusBadge';

const TYPE_EMOJI = {
    transportation: '🚗',
    reading: '📖',
    errand: '🛒',
};

export default function RequestCard({
    request,
    actions,
    showBeneficiary = false,
    showDistance = false,
    showType = true,
}) {
    const req = request;
    const emoji = TYPE_EMOJI[req.type] || '🤝';
    const date = new Date(req.createdAt || req.created_at).toLocaleDateString('ar-EG');

    return (
        <Card
            variant="glass"
            padding="p-5"
            hover={true}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Type emoji icon */}
                {showType && (
                    <div className="w-12 h-12 rounded-xl bg-royal-600/10 border border-royal-500/15 flex items-center justify-center flex-shrink-0 text-xl">
                        {emoji}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    {/* Title + Badge row */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white truncate">
                            {req.description || 'طلب مساعدة'}
                        </h3>
                        <StatusBadge status={req.status} />
                    </div>

                    {/* Meta line */}
                    <div className="text-xs text-gray-500 flex gap-4 flex-wrap">
                        {/* Distance (volunteer nearby tab) */}
                        {showDistance && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {req.distance_km
                                    ? `${parseFloat(req.distance_km).toFixed(1)} كم`
                                    : 'قريب'}
                                {req.location_address ? ` — ${req.location_address}` : ''}
                            </span>
                        )}

                        {/* Location (beneficiary tab) */}
                        {!showDistance && req.location_address && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {req.location_address}
                            </span>
                        )}

                        {/* Date */}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {date}
                        </span>
                    </div>

                    {/* Beneficiary name (volunteer accepted tab) */}
                    {showBeneficiary && req.beneficiary && (
                        <p className="text-sm text-gray-400 mt-1">
                            المستفيد:{' '}
                            <span className="font-semibold text-gray-300">
                                {req.beneficiary.full_name}
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {/* Actions slot */}
            {actions && (
                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                    {actions}
                </div>
            )}
        </Card>
    );
}

/* ── Stagger animation variants for parent lists ── */
export const listContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

export const listItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
