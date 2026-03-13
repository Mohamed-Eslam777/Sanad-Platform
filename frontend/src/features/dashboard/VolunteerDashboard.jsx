/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VolunteerDashboard — Extracted & Restyled
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   user — user object from AuthContext
 *
 * Features:
 *   - Glass profile card with Avatar component + glow ring
 *   - DashboardTabs with layoutId sliding indicator
 *   - Phase 1 components throughout (StatCard, Skeleton, EmptyState, Button)
 *   - Dark theme — zero bg-white / text-gray-800 primitives
 *   - Staggered list animation on request cards
 *   - Inline error state instead of alert()
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock,
    Star,
    CheckCircle,
    MapPinOff,
    Loader2,
    Inbox,
} from 'lucide-react';
import { requestService } from '../../services/requestService';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import DashboardTabs from './components/DashboardTabs';
import RequestCard, {
    listContainerVariants,
    listItemVariants,
} from './components/RequestCard';

export default function VolunteerDashboard({ user }) {
    const [tab, setTab] = useState('nearby');
    const [nearbyRequests, setNearby] = useState([]);
    const [acceptedRequests, setAccepted] = useState([]);
    const [loadingNearby, setLoadNearby] = useState(true);
    const [loadingAccepted, setLoadAcc] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [acceptError, setAcceptError] = useState(null);

    useEffect(() => {
        fetchNearby();
        fetchAccepted();
    }, []);

    const fetchNearby = async () => {
        try {
            setLoadNearby(true);

            // Try to use browser geolocation to enable real radius-based matching.
            const getPosition = () =>
                new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error('Geolocation not supported'));
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 8000,
                        maximumAge: 60_000,
                    });
                });

            let res;
            try {
                const pos = await getPosition();
                const { latitude, longitude } = pos.coords;
                res = await requestService.getNearbyRequests(latitude, longitude, 5);
            } catch {
                // If user denies or geolocation fails, fall back to server-side default
                res = await requestService.getNearbyRequests();
            }

            setNearby(res.data || []);
        } catch {
            /* silence */
        } finally {
            setLoadNearby(false);
        }
    };

    const fetchAccepted = async () => {
        try {
            setLoadAcc(true);
            const res = await requestService.getMyAcceptedRequests();
            setAccepted(res.data || []);
        } catch {
            /* silence */
        } finally {
            setLoadAcc(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            setProcessingId(id);
            setAcceptError(null);
            await requestService.acceptRequest(id);
            setNearby((prev) => prev.filter((r) => r.id !== id));
            fetchAccepted();
        } catch (err) {
            setAcceptError(
                err.response?.data?.message || 'فشل في قبول الطلب. حاول مرة أخرى.'
            );
            // Auto-clear error after 5s
            setTimeout(() => setAcceptError(null), 5000);
        } finally {
            setProcessingId(null);
        }
    };

    const ratingDisplay = user?.profile?.average_rating
        ? `${parseFloat(user.profile.average_rating).toFixed(1)} / 5`
        : 'جديد';

    return (
        <div dir="rtl">
            {/* ── Profile Card ── */}
            <Card variant="glow" padding="p-6" className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Avatar name={user?.name} size="lg" ring status="online" />
                    <div>
                        <h1 className="text-xl font-bold text-white">{user?.name}</h1>
                        <p className="text-sm text-success-400 flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3.5 h-3.5" /> هوية موثقة
                        </p>
                    </div>
                </div>
            </Card>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="قيد التنفيذ حالياً"
                    value={acceptedRequests.length}
                    icon={<Clock />}
                    color="text-royal-400"
                    bg="bg-royal-600/15"
                />
                <StatCard
                    title="التقييم العام"
                    value={ratingDisplay}
                    icon={<Star />}
                    color="text-warning-400"
                    bg="bg-warning-500/15"
                />
                <StatCard
                    title="مهام منجزة"
                    value={user?.profile?.completed_requests || 0}
                    icon={<CheckCircle />}
                    color="text-success-400"
                    bg="bg-success-500/15"
                />
            </div>

            {/* ── Tabs ── */}
            <DashboardTabs
                tabs={[
                    { key: 'nearby', label: 'الطلبات القريبة', count: nearbyRequests.length },
                    { key: 'accepted', label: 'مهماتي الحالية', count: acceptedRequests.length },
                ]}
                activeTab={tab}
                onTabChange={setTab}
            />

            {/* ── Accept Error Banner ── */}
            {acceptError && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm font-medium"
                >
                    {acceptError}
                </motion.div>
            )}

            {/* ═══════════════════════════════ NEARBY TAB ═══════════════════════════════ */}
            {tab === 'nearby' && (
                <>
                    {/* Loading */}
                    {loadingNearby && (
                        <div className="space-y-4">
                            <Skeleton variant="card" height="90px" />
                            <Skeleton variant="card" height="90px" />
                            <Skeleton variant="card" height="90px" />
                        </div>
                    )}

                    {/* Empty */}
                    {!loadingNearby && nearbyRequests.length === 0 && (
                        <EmptyState
                            icon={MapPinOff}
                            title="لا توجد طلبات متاحة"
                            subtitle="لا توجد طلبات بالقرب منك حالياً."
                            action={
                                <Button variant="outline" onClick={fetchNearby} size="sm">
                                    تحديث القائمة
                                </Button>
                            }
                        />
                    )}

                    {/* List */}
                    {!loadingNearby && nearbyRequests.length > 0 && (
                        <motion.div
                            className="space-y-4"
                            variants={listContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {nearbyRequests.map((req) => (
                                <motion.div key={req.id} variants={listItemVariants}>
                                    <RequestCard
                                        request={req}
                                        showDistance
                                        actions={
                                            <>
                                                <Link to={`/requests/${req.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        التفاصيل
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onClick={() => handleAccept(req.id)}
                                                    loading={processingId === req.id}
                                                    size="sm"
                                                >
                                                    قبول
                                                </Button>
                                            </>
                                        }
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}

            {/* ═══════════════════════════════ ACCEPTED TAB ═══════════════════════════════ */}
            {tab === 'accepted' && (
                <>
                    {/* Loading */}
                    {loadingAccepted && (
                        <div className="space-y-4">
                            <Skeleton variant="card" height="90px" />
                            <Skeleton variant="card" height="90px" />
                        </div>
                    )}

                    {/* Empty */}
                    {!loadingAccepted && acceptedRequests.length === 0 && (
                        <EmptyState
                            icon={Inbox}
                            title="لا توجد مهمات نشطة"
                            subtitle="اقبل طلباً من القائمة لتظهر هنا!"
                        />
                    )}

                    {/* List */}
                    {!loadingAccepted && acceptedRequests.length > 0 && (
                        <motion.div
                            className="space-y-4"
                            variants={listContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {acceptedRequests.map((req) => (
                                <motion.div key={req.id} variants={listItemVariants}>
                                    <RequestCard
                                        request={req}
                                        showBeneficiary
                                        actions={
                                            <Link to={`/requests/${req.id}`}>
                                                <Button variant="outline" size="sm">
                                                    فتح المهمة
                                                </Button>
                                            </Link>
                                        }
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
