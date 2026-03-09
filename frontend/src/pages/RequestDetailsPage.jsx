/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RequestDetailsPage — Premium Dark Glassmorphism
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import ChatModal from '../components/ChatModal';
import {
    MapPin, Clock, FileText, CheckCircle, MessageCircle,
    ArrowRight, AlertCircle, ShoppingBag, Car, BookOpen, User, ShieldAlert
} from 'lucide-react';

const TYPE_META = {
    transportation: { label: 'نقل ومواصلات', icon: Car, bg: 'bg-royal-600/15', color: 'text-royal-400' },
    reading: { label: 'قراءة وتلاوة', icon: BookOpen, bg: 'bg-[#7C3AED]/15', color: 'text-[#A78BFA]' },
    errand: { label: 'قضاء مشاوير', icon: ShoppingBag, bg: 'bg-warning-500/15', color: 'text-warning-400' },
    other: { label: 'أخرى', icon: FileText, bg: 'bg-glass-light', color: 'text-gray-400' },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function RequestDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Complete Action State
    const [completing, setCompleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionError, setActionError] = useState('');

    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => { loadRequest(); }, [id]);

    const loadRequest = async () => {
        try {
            setLoading(true);
            const res = await requestService.getRequestById(id);
            setRequest(res.data);
        } catch {
            setError('تعذّر جلب تفاصيل الطلب. قد يكون الطلب غير موجود أو لا تملك صلاحية الوصول إليه.');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        try {
            setCompleting(true);
            setActionError('');
            await requestService.completeRequest(id);
            setRequest(prev => ({ ...prev, status: 'completed' }));
            setShowConfirmModal(false);
        } catch (err) {
            setActionError(err.response?.data?.message || 'فشل في إكمال الطلب، حاول مرة أخرى.');
        } finally {
            setCompleting(false);
        }
    };

    // ── Loading State ────────────────────────────────────────────────────────
    if (loading) return (
        <div dir="rtl" className="min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Skeleton variant="card" height="80px" className="mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton variant="card" height="250px" />
                        <Skeleton variant="card" height="150px" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton variant="card" height="200px" />
                        <Skeleton variant="card" height="100px" />
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Error State ──────────────────────────────────────────────────────────
    if (error) return (
        <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
            <EmptyState
                icon={ShieldAlert}
                title="طلب غير متوفر"
                subtitle={error}
                action={
                    <Button onClick={() => navigate(-1)} variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                        العودة للصفحة السابقة
                    </Button>
                }
            />
        </div>
    );

    // ── Derived values ───────────────────────────────────────────────────────
    const typeMeta = TYPE_META[request?.type] || TYPE_META.other;
    const TypeIcon = typeMeta.icon;

    const volunteer = request?.volunteer || request?.Volunteer;
    const beneficiary = request?.beneficiary || request?.Beneficiary;

    const isParticipant = user?.id === request?.beneficiary_id || user?.id === request?.volunteer_id;
    const isActive = ['accepted', 'in_progress'].includes(request?.status);

    const canChat = isActive && isParticipant;
    const canComplete = isActive && isParticipant;
    const otherRole = user?.id === request?.beneficiary_id ? 'volunteer' : 'beneficiary';

    return (
        <div dir="rtl" className="min-h-screen">

            {/* ── Sticky Header ── */}
            <div className="glass-heavy border-b border-glass-border sticky top-0 z-10 transition-all">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white glass rounded-full transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">تفاصيل الطلب #{request?.id}</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {request?.createdAt
                                ? new Date(request.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                                : ''}
                        </p>
                    </div>
                    <div className="me-auto">
                        <StatusBadge status={request?.status} />
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants}>
                        <Card variant="glass" padding="p-7">
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${typeMeta.bg} ${typeMeta.color} flex items-center justify-center flex-shrink-0 glow-border-sm`}>
                                    <TypeIcon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-white mb-1">
                                        {request?.description || 'طلب مساعدة'}
                                    </h2>
                                    <span className="inline-block bg-glass-light border border-glass-border text-gray-300 text-xs px-2.5 py-1 rounded-md font-semibold">
                                        {typeMeta.label}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {request?.location_address && (
                                    <div className="flex gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-0.5">الموقع</h4>
                                            <p className="text-sm text-gray-300">{request.location_address}</p>
                                        </div>
                                    </div>
                                )}
                                {request?.scheduled_time && (
                                    <div className="flex gap-3">
                                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-0.5">الوقت المقترح</h4>
                                            <p className="text-sm text-gray-300">
                                                {new Date(request.scheduled_time).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Beneficiary info (visible to volunteer) */}
                    {beneficiary && user?.role === 'volunteer' && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-glass-border pb-2">المستفيد</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar name={beneficiary.full_name} size="md" />
                                    <p className="font-bold text-white text-lg">{beneficiary.full_name}</p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* ── Actions Column ── */}
                <div className="space-y-6">

                    {/* Volunteer card (always show if volunteer assigned) */}
                    {volunteer && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-glass-border pb-2">المتطوع المستلم</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar name={volunteer.full_name} size="md" />
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{volunteer.full_name}</h4>
                                        {(volunteer.VolunteerProfile?.average_rating || volunteer.volunteerProfile?.average_rating) && (
                                            <p className="text-xs text-warning-400 font-bold mt-0.5 flex items-center gap-1">
                                                ★ {parseFloat(volunteer.VolunteerProfile?.average_rating || volunteer.volunteerProfile?.average_rating).toFixed(1)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Chat Button */}
                    {canChat && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-4">
                                <Button
                                    onClick={() => setChatOpen(true)}
                                    size="lg"
                                    fullWidth
                                    icon={<MessageCircle className="w-5 h-5" />}
                                >
                                    فتح المحادثة 💬
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-3 font-medium">محادثة مباشرة مع الطرف الآخر</p>
                            </Card>
                        </motion.div>
                    )}

                    {/* Complete Button */}
                    {canComplete && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-4">
                                <Button
                                    onClick={() => setShowConfirmModal(true)}
                                    variant="outline"
                                    fullWidth
                                    icon={<CheckCircle className="w-5 h-5" />}
                                >
                                    تأكيد إكمال المهمة
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {/* Pending State */}
                    {request?.status === 'pending' && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-6">
                                <div className="text-center">
                                    <Clock className="w-8 h-8 mx-auto mb-3 text-warning-400" />
                                    <p className="text-sm font-bold text-gray-300">في انتظار قبول المتطوع</p>
                                    <p className="text-xs text-gray-500 mt-2">ستتمكن من بدء المحادثة بعد قبول الطلب</p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* ── Modals ── */}

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => !completing && setShowConfirmModal(false)}
                title="تأكيد إكمال الطلب"
                size="sm"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-royal-600/20 text-royal-400 flex items-center justify-center flex-shrink-0 glow-border-sm">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">هل اكتملت هذه المهمة؟</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                بتأكيدك لهذا الإجراء، سيتم تحديث حالة الطلب إلى "مكتمل" ولن يعود نشطاً.
                            </p>
                        </div>
                    </div>

                    {actionError && (
                        <div className="mt-6 bg-danger-500/10 border border-danger-500/30 text-danger-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
                        </div>
                    )}

                    <div className="mt-8 flex gap-3">
                        <Button
                            onClick={handleComplete}
                            loading={completing}
                            className="flex-1"
                        >
                            نعم، أؤكد الإكمال
                        </Button>
                        <Button
                            onClick={() => setShowConfirmModal(false)}
                            variant="outline"
                            disabled={completing}
                            className="flex-1"
                        >
                            تراجع
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Chat Modal */}
            <ChatModal
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                requestId={id}
                requestType={request?.type}
                otherPartyRole={otherRole}
                currentUserId={user?.id}
            />
        </div>
    );
}
