/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RequestDetailsPage — Premium Dark Glassmorphism
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { requestService } from '../services/requestService';
import ConfirmCompletionModal from '../components/requests/ConfirmCompletionModal';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import ChatModal from '../components/ChatModal';
import LiveTrackingMap from '../components/common/LiveTrackingMap';
import { getSocket } from '../services/socketService';
import {
    MapPin, Clock, FileText, CheckCircle, MessageCircle,
    ArrowRight, AlertCircle, ShoppingBag, Car, BookOpen, User, ShieldAlert, Play
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

    const [completing, setCompleting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionError, setActionError] = useState('');

    const [chatOpen, setChatOpen] = useState(false);

    const isVolunteer = user?.role === 'volunteer';
    const isBeneficiary = user?.role === 'beneficiary';
    const isParticipant = user?.id === request?.beneficiary_id || user?.id === request?.volunteer_id;
    const isActive = ['accepted', 'in_progress'].includes(request?.status);
    const isTrackingActive = request?.status === 'in_progress';

    // Live Tracking State
    const [volunteerLocation, setVolunteerLocation] = useState(null);
    const [beneficiaryLocation, setBeneficiaryLocation] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);

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

    // ── Volunteer: simple "request completion" ────────────────────────────
    const handleVolunteerComplete = async () => {
        try {
            setCompleting(true);
            setActionError('');
            await requestService.requestCompletion(id);
            setRequest(prev => ({ ...prev, status: 'completion_requested' }));
            setShowConfirmModal(false);
        } catch (err) {
            console.error('Completion Error:', err);
            setActionError(err.response?.data?.message || 'فشل في إكمال الطلب، حاول مرة أخرى.');
        } finally {
            setCompleting(false);
        }
    };

    // ── Volunteer: Start Task ────────────────────────────────────────────────
    const handleStartTask = async () => {
        try {
            setCompleting(true);
            setActionError('');
            await requestService.startRequest(id);
            setRequest(prev => ({ ...prev, status: 'in_progress' }));
        } catch (err) {
            console.error('Start Task Error:', err);
            setActionError(err.response?.data?.message || 'فشل في بدء التنفيذ، حاول مرة أخرى.');
        } finally {
            setCompleting(false);
        }
    };

    // ── Beneficiary: cancel request ──────────────────────────────────────────
    const handleCancel = async () => {
        if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب نهائياً؟')) return;
        try {
            setCompleting(true);
            setActionError('');
            await requestService.cancelRequest(id);
            await loadRequest();
        } catch (err) {
            console.error('Cancel Error:', err);
            setActionError(err.response?.data?.message || 'فشل في إلغاء الطلب.');
        } finally {
            setCompleting(false);
        }
    };

    // ── Volunteer: abort request ─────────────────────────────────────────────
    const handleAbort = async () => {
        if (!window.confirm('هل أنت متأكد من رغبتك في الانسحاب من هذه المهمة؟ الإكثار من الانسحابات قد يؤثر على تقييمك.')) return;
        try {
            setCompleting(true);
            setActionError('');
            await requestService.abortRequest(id);
            navigate('/volunteer/dashboard', { replace: true });
        } catch (err) {
            console.error('Abort Error:', err);
            setActionError(err.response?.data?.message || 'فشل في الانسحاب من الطلب.');
        } finally {
            setCompleting(false);
        }
    };

    // ── Beneficiary: confirm with rating + comment ───────────────────────
    const handleBeneficiaryConfirm = async ({ rating, comment }) => {
        try {
            setCompleting(true);
            setActionError('');
            await requestService.confirmCompletion(id, { rating, comment });
            setRequest(prev => ({ ...prev, status: 'completed' }));
            setShowConfirmModal(false);
        } catch (err) {
            console.error('Completion Error:', err);
            setActionError(err.response?.data?.message || 'فشل في إكمال الطلب، حاول مرة أخرى.');
        } finally {
            setCompleting(false);
        }
    };

    // Default fallback coordinates (Cairo)
    const FALLBACK_LOCATION = [30.0444, 31.2357];

    // ── Live Tracking Effect ─────────────────────────────────────────────────
    useEffect(() => {
        if (!request || !isActive || !isParticipant) return;

        const socket = getSocket();
        socket.emit('join_room', id);

        let localWatchId = null;

        if (isTrackingActive) {
            // Sets beneficiary static location; fallback to Cairo if not available
            if (request.location_lat != null && request.location_lng != null) {
                setBeneficiaryLocation([parseFloat(request.location_lat), parseFloat(request.location_lng)]);
                setUsingFallback(false);
            } else {
                setBeneficiaryLocation(FALLBACK_LOCATION);
                setUsingFallback(true);
            }

            if (isVolunteer) {
                // Watch volunteer position and emit
                if (navigator.geolocation) {
                    localWatchId = navigator.geolocation.watchPosition(
                        (pos) => {
                            const { latitude, longitude } = pos.coords;
                            setVolunteerLocation([latitude, longitude]);
                            socket.emit('update_location', { requestId: id, lat: latitude, lng: longitude });
                        },
                        (err) => {
                            console.warn('Geolocation error, using fallback:', err.message);
                            // Fallback to Cairo so the map still renders
                            setVolunteerLocation(FALLBACK_LOCATION);
                        },
                        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                    );
                } else {
                    // Geolocation API not available — use fallback
                    setVolunteerLocation(FALLBACK_LOCATION);
                }
            } else if (isBeneficiary) {
                // Listen to volunteer updates
                socket.on('volunteer_location_updated', (coords) => {
                    setVolunteerLocation([coords.lat, coords.lng]);
                });
            }
        }

        return () => {
            if (localWatchId !== null) navigator.geolocation.clearWatch(localWatchId);
            socket.off('volunteer_location_updated');
            socket.emit('leave_room', id);
        };
    }, [request, isActive, isTrackingActive, isParticipant, id, isVolunteer, isBeneficiary]);

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



    const canChat = isActive && isParticipant;
    
    // Volunteer can start execution when task is accepted
    const canStart = isParticipant && isVolunteer && request?.status === 'accepted';
    
    // Volunteer can request completion when task is in_progress
    // Beneficiary can confirm completion when task is completion_requested
    const canComplete = isParticipant && (
        (isVolunteer && request?.status === 'in_progress') ||
        (isBeneficiary && request?.status === 'completion_requested')
    );
    const canCancel = isParticipant && isBeneficiary && ['pending', 'accepted', 'in_progress'].includes(request?.status);
    const canAbort = isParticipant && isVolunteer && ['accepted', 'in_progress'].includes(request?.status);
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

                    {/* Map (if active) */}
                    {isTrackingActive && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-0" className="overflow-hidden">
                                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-glass-light/30">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-royal-400" /> 
                                        تتبع مباشر
                                    </h3>
                                    {isVolunteer && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">يتم بث موقعك للمستفيد</span>}
                                    {isBeneficiary && volunteerLocation && <span className="text-[10px] bg-royal-600/20 text-royal-400 border border-royal-500/30 px-2 py-0.5 rounded-full animate-pulse">المتطوع في الطريق</span>}
                                </div>
                                <div className="relative">
                                    {usingFallback && (
                                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-warning-500/15 backdrop-blur-md border border-warning-500/30 text-warning-400 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                            <span>⚠️</span> إحداثيات غير متوفرة: يتم عرض موقع افتراضي
                                        </div>
                                    )}
                                    <LiveTrackingMap beneficiaryLocation={beneficiaryLocation} volunteerLocation={volunteerLocation} />
                                </div>
                            </Card>
                        </motion.div>
                    )}

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

                    {/* Start Task Button */}
                    {canStart && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-4">
                                <Button
                                    onClick={handleStartTask}
                                    disabled={completing}
                                    fullWidth
                                    className="bg-royal-600 hover:bg-royal-500 text-white border-0 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                    icon={<Play className="w-5 h-5 fill-current" />}
                                >
                                    بدء التنفيذ الآن 🚀
                                </Button>
                                <p className="text-center text-xs text-royal-400 mt-2 font-medium">
                                    اضغط هنا عند بدء توجهك أو تنفيذك الفعلي للمهمة
                                </p>
                            </Card>
                        </motion.div>
                    )}

                    {/* Complete / Confirm Button */}
                    {canComplete && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-4">
                                <Button
                                    onClick={() => setShowConfirmModal(true)}
                                    variant="outline"
                                    fullWidth
                                    icon={<CheckCircle className="w-5 h-5" />}
                                >
                                    {isBeneficiary ? 'تأكيد الإنهاء وتقييم المتطوع ⭐' : 'تأكيد إكمال المهمة'}
                                </Button>
                                {isBeneficiary && (
                                    <p className="text-center text-xs text-emerald-400/70 mt-2 font-medium">
                                        المتطوع أتم المهمة وطلب التأكيد منك
                                    </p>
                                )}
                            </Card>
                        </motion.div>
                    )}

                    {/* Waiting for beneficiary confirmation (volunteer view) */}
                    {isVolunteer && request?.status === 'completion_requested' && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-6">
                                <div className="text-center">
                                    <Clock className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                                    <p className="text-sm font-bold text-gray-300">في انتظار تأكيد المستفيد</p>
                                    <p className="text-xs text-gray-500 mt-2">لقد طلبت إنهاء الطلب. بانتظار المستفيد لتأكيد ذلك وتقييمك.</p>
                                </div>
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

                    {/* Abort / Cancel Buttons */}
                    {(canAbort || canCancel) && (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-4" className="border-danger-500/30">
                                {canAbort && (
                                    <Button
                                        onClick={handleAbort}
                                        disabled={completing}
                                        fullWidth
                                        className="bg-danger-600/20 hover:bg-danger-500 text-danger-300 hover:text-white border border-danger-500/50"
                                    >
                                        الانسحاب من المهمة 🛑
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button
                                        onClick={handleCancel}
                                        disabled={completing}
                                        fullWidth
                                        className="bg-danger-600/20 hover:bg-danger-500 text-danger-300 hover:text-white border border-danger-500/50"
                                    >
                                        إلغاء الطلب نهائياً 🗑️
                                    </Button>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* ── Modals ── */}

            {/* ── Volunteer: Simple Confirmation Modal ── */}
            {isVolunteer && (
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
                                    سيتم إرسال طلب تأكيد الإنهاء للمستفيد. لن يُغلق الطلب حتى يؤكد المستفيد ذلك.
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
                                onClick={handleVolunteerComplete}
                                loading={completing}
                                className="flex-1"
                            >
                                نعم، أطلب تأكيد الإنهاء
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
            )}

            {/* ── Beneficiary: Star Rating Completion Modal ── */}
            {isBeneficiary && (
                <ConfirmCompletionModal
                    isOpen={showConfirmModal}
                    onClose={() => !completing && setShowConfirmModal(false)}
                    onConfirm={handleBeneficiaryConfirm}
                    volunteerName={volunteer?.full_name || 'المتطوع'}
                    isSubmitting={completing}
                />
            )}

            {/* Chat Modal */}
            <ChatModal
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                requestId={id}
                requestType={request?.type}
                otherPartyRole={otherRole}
                currentUserId={user?.id}
                manageRoomState={false}
            />
        </div>
    );
}
