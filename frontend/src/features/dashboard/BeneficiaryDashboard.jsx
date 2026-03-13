/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BeneficiaryDashboard — Extracted & Restyled
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props:
 *   user — user object from AuthContext
 *
 * Features:
 *   - Phase 1 components (Card, StatCard, Button, Skeleton, EmptyState, Modal)
 *   - Dark glassmorphism theme — zero bg-white / text-gray-900 primitives
 *   - Skeleton loaders instead of spinner
 *   - EmptyState instead of inline text
 *   - Modal-based cancel confirmation (replaces window.confirm)
 *   - Staggered list animation via Framer Motion
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { List, Clock, CheckCircle, Plus, Inbox, X, Loader2 } from 'lucide-react';
import { requestService } from '../../services/requestService';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import CreateRequestModal from '../../components/CreateRequestModal';
import SOSButton from '../../components/SOSButton';
import RequestCard, {
    listContainerVariants,
    listItemVariants,
} from './components/RequestCard';

export default function BeneficiaryDashboard({ user }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cancel confirmation state
    const [cancelTarget, setCancelTarget] = useState(null); // request id to cancel
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelError, setCancelError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await requestService.getMyRequests();
            setRequests(res.data || []);
        } catch {
            /* handled silently */
        } finally {
            setLoading(false);
        }
    };

    const handleCancelConfirm = async () => {
        if (!cancelTarget) return;
        try {
            setCancellingId(cancelTarget);
            setCancelError(null);
            await requestService.cancelRequest(cancelTarget);
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === cancelTarget ? { ...r, status: 'cancelled' } : r
                )
            );
            setCancelTarget(null);
        } catch (err) {
            setCancelError(
                err.response?.data?.message || 'فشل في إلغاء الطلب. حاول مرة أخرى.'
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Stats computed from requests
    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const activeCount = requests.filter((r) =>
        ['in_progress', 'accepted'].includes(r.status)
    ).length;
    const completedCount = requests.filter(
        (r) => r.status === 'completed'
    ).length;

    return (
        <div dir="rtl">
            <SOSButton />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">
                        أهلاً، {user?.name?.split(' ')[0] || 'ضيف'}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        كيف يمكننا مساعدتك اليوم؟
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={<Plus className="w-5 h-5" />}
                >
                    طلب مساعدة جديد
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="طلبات قيد الانتظار"
                    value={pendingCount}
                    icon={<List />}
                    color="text-warning-400"
                    bg="bg-warning-500/15"
                />
                <StatCard
                    title="قيد التنفيذ"
                    value={activeCount}
                    icon={<Clock />}
                    color="text-royal-400"
                    bg="bg-royal-600/15"
                />
                <StatCard
                    title="مكتملة"
                    value={completedCount}
                    icon={<CheckCircle />}
                    color="text-success-400"
                    bg="bg-success-500/15"
                />
            </div>

            {/* Request list */}
            <Card variant="glass" padding="p-6">
                <h2 className="text-lg font-bold text-white mb-4">طلباتي الأخيرة</h2>

                {/* ── Loading state ── */}
                {loading && (
                    <div className="space-y-4">
                        <Skeleton variant="card" height="80px" />
                        <Skeleton variant="card" height="80px" />
                        <Skeleton variant="card" height="80px" />
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && requests.length === 0 && (
                    <EmptyState
                        icon={Inbox}
                        title="لا توجد طلبات سابقة"
                        subtitle="ابدأ بإضافة طلب جديد لتظهر هنا!"
                        action={
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                icon={<Plus className="w-4 h-4" />}
                                size="sm"
                            >
                                طلب مساعدة جديد
                            </Button>
                        }
                    />
                )}

                {/* ── Request list ── */}
                {!loading && requests.length > 0 && (
                    <motion.div
                        className="space-y-4"
                        variants={listContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {requests.slice(0, 8).map((req) => (
                            <motion.div key={req.id} variants={listItemVariants}>
                                <RequestCard
                                    request={req}
                                    actions={
                                        <>
                                            <Link to={`/requests/${req.id}`}>
                                                <Button variant="outline" size="sm">
                                                    التفاصيل
                                                </Button>
                                            </Link>
                                            {req.status === 'pending' && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setCancelTarget(req.id)}
                                                    icon={<X className="w-3.5 h-3.5" />}
                                                >
                                                    إلغاء
                                                </Button>
                                            )}
                                        </>
                                    }
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </Card>

            {/* Create request modal */}
            <CreateRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchRequests}
            />

            {/* Cancel confirmation modal (replaces window.confirm) */}
            <Modal
                isOpen={!!cancelTarget}
                onClose={() => {
                    setCancelTarget(null);
                    setCancelError(null);
                }}
                title="تأكيد إلغاء الطلب"
                size="sm"
            >
                <p className="text-gray-400 mb-4">
                    هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                {cancelError && (
                    <p className="text-danger-400 text-sm mb-4 bg-danger-500/10 p-3 rounded-xl">
                        {cancelError}
                    </p>
                )}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setCancelTarget(null);
                            setCancelError(null);
                        }}
                        className="flex-1"
                    >
                        تراجع
                    </Button>
                    <Button
                        variant="danger"
                        loading={!!cancellingId}
                        onClick={handleCancelConfirm}
                        className="flex-2"
                    >
                        تأكيد الإلغاء
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
