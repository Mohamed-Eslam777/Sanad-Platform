/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CreateRequestModal — Premium Glassmorphism Help Request Form
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Car, BookOpen, ShoppingBag, Ellipsis,
    MapPin, Calendar, FileText, Loader2, CheckCircle,
    AlertCircle, Send, Sparkles
} from 'lucide-react';
import { requestService } from '../services/requestService';

/* ─── Request type config ──────────────────────────────────────────────────── */
const REQUEST_TYPES = [
    {
        value: 'transportation',
        label: 'نقل ومواصلات',
        subLabel: 'طلب توصيلة',
        icon: Car,
        gradient: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(79,70,229,0.18))',
        activeBorder: 'rgba(99,102,241,0.6)',
        glowColor: 'rgba(99,102,241,0.3)',
        iconColor: '#a5b4fc',
        iconBg: 'rgba(99,102,241,0.2)',
    },
    {
        value: 'reading',
        label: 'قراءة وتلاوة',
        subLabel: 'القرآن والكتب',
        icon: BookOpen,
        gradient: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(109,40,217,0.18))',
        activeBorder: 'rgba(139,92,246,0.6)',
        glowColor: 'rgba(139,92,246,0.3)',
        iconColor: '#c4b5fd',
        iconBg: 'rgba(124,58,237,0.2)',
    },
    {
        value: 'errand',
        label: 'قضاء مشاوير',
        subLabel: 'تسوق وبنك...',
        icon: ShoppingBag,
        gradient: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.15))',
        activeBorder: 'rgba(251,191,36,0.5)',
        glowColor: 'rgba(245,158,11,0.25)',
        iconColor: '#fcd34d',
        iconBg: 'rgba(245,158,11,0.15)',
    },
    {
        value: 'other',
        label: 'مساعدة أخرى',
        subLabel: 'اذكر تفاصيلها',
        icon: Ellipsis,
        gradient: 'linear-gradient(135deg, rgba(107,114,128,0.25), rgba(75,85,99,0.15))',
        activeBorder: 'rgba(156,163,175,0.4)',
        glowColor: 'rgba(107,114,128,0.2)',
        iconColor: '#9ca3af',
        iconBg: 'rgba(107,114,128,0.15)',
    },
];

/* ─── Inline alert ─────────────────────────────────────────────────────────── */
function Alert({ type, message }) {
    if (!message) return null;
    const isErr = type === 'error';
    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border text-sm mb-5 font-semibold ${isErr
                ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                }`}
        >
            {isErr
                ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                : <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            }
            <span>{message}</span>
        </motion.div>
    );
}

/* ─── Form input wrapper ────────────────────────────────────────────────────── */
function FieldWrapper({ label, icon: Icon, children }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                {Icon && <Icon className="w-3.5 h-3.5 text-royal-400/70" />}
                {label}
            </label>
            {children}
        </div>
    );
}

const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
};

/* ─── Geolocation helper ───────────────────────────────────────────────────── */
const getCoords = () =>
    new Promise((resolve) => {
        const FALLBACK = { lat: 30.0444, lng: 31.2357 };
        const timer = setTimeout(() => resolve(FALLBACK), 3000);
        if (!navigator.geolocation) { clearTimeout(timer); return resolve(FALLBACK); }
        navigator.geolocation.getCurrentPosition(
            (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
            () => { clearTimeout(timer); resolve(FALLBACK); },
        );
    });

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function CreateRequestModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({
        type: 'transportation',
        description: '',
        location_address: '',
        scheduled_time: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({ type: 'transportation', description: '', location_address: '', scheduled_time: '' });
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.description || !form.location_address) {
            setError('يرجى تعبئة وصف الطلب والموقع.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { lat, lng } = await getCoords();
            await requestService.createRequest({
                ...form,
                location_lat: lat,
                location_lng: lng,
                scheduled_time: form.scheduled_time || null,
            });
            setSuccess('تم إرسال طلبك بنجاح! سيتواصل معك متطوع قريباً.');
            setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="cr-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-xl"
                    />

                    {/* ── Modal ── */}
                    <motion.div
                        key="cr-modal"
                        initial={{ opacity: 0, scale: 0.94, y: 28 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 14 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            dir="rtl"
                            className="pointer-events-auto w-full max-w-lg overflow-hidden relative"
                            style={{
                                background: 'linear-gradient(145deg, rgba(15,18,40,0.97) 0%, rgba(10,14,36,0.99) 100%)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '28px',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                            }}
                        >
                            {/* Top gradient edge light */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal-400/50 to-transparent" />
                            {/* Inner top glow */}
                            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-royal-600/6 to-transparent pointer-events-none" />

                            <div className="p-7 max-h-[88vh] overflow-y-auto custom-scrollbar">

                                {/* ── Header ── */}
                                <div className="flex items-start justify-between mb-7">
                                    <div className="flex items-center gap-4">
                                        {/* Icon orb */}
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.15))',
                                                border: '1px solid rgba(99,102,241,0.35)',
                                                boxShadow: '0 0 20px rgba(99,102,241,0.2)',
                                            }}
                                        >
                                            <Sparkles className="w-5 h-5 text-royal-300" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-extrabold text-white tracking-tight">طلب مساعدة جديد</h2>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium">أخبرنا بما تحتاجه وسيصلك متطوع قريباً</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all group flex-shrink-0 mt-0.5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                        aria-label="إغلاق"
                                    >
                                        <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {(error || success) && <Alert type={error ? 'error' : 'success'} message={error || success} />}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* ── Category Tiles ── */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3.5">نوع المساعدة المطلوبة</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {REQUEST_TYPES.map((t) => {
                                                const Icon = t.icon;
                                                const active = form.type === t.value;
                                                return (
                                                    <motion.button
                                                        key={t.value}
                                                        type="button"
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                                                        className="relative flex flex-col items-start gap-3 p-4 rounded-2xl transition-all text-start overflow-hidden"
                                                        style={{
                                                            background: active ? t.gradient : 'rgba(255,255,255,0.03)',
                                                            border: `1.5px solid ${active ? t.activeBorder : 'rgba(255,255,255,0.06)'}`,
                                                            boxShadow: active ? `0 0 24px ${t.glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
                                                        }}
                                                    >
                                                        {/* Micro sheen overlay when active */}
                                                        {active && (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                                        )}

                                                        {/* Icon */}
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                            style={{
                                                                background: active ? t.iconBg : 'rgba(255,255,255,0.04)',
                                                                border: `1px solid ${active ? t.activeBorder : 'rgba(255,255,255,0.06)'}`,
                                                            }}
                                                        >
                                                            <Icon
                                                                className="w-5 h-5"
                                                                style={{ color: active ? t.iconColor : 'rgba(156,163,175,0.6)' }}
                                                            />
                                                        </div>

                                                        {/* Labels */}
                                                        <div>
                                                            <p
                                                                className="text-sm font-bold leading-tight"
                                                                style={{ color: active ? '#f5f5ff' : 'rgba(156,163,175,0.8)' }}
                                                            >
                                                                {t.label}
                                                            </p>
                                                            <p
                                                                className="text-[10px] mt-0.5 font-medium"
                                                                style={{ color: active ? 'rgba(200,200,255,0.55)' : 'rgba(107,114,128,0.7)' }}
                                                            >
                                                                {t.subLabel}
                                                            </p>
                                                        </div>

                                                        {/* Active indicator dot */}
                                                        {active && (
                                                            <div
                                                                className="absolute top-3 left-3 w-2 h-2 rounded-full"
                                                                style={{ background: t.iconColor, boxShadow: `0 0 6px ${t.glowColor}` }}
                                                            />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── Description ── */}
                                    <FieldWrapper label="وصف الطلب" icon={FileText}>
                                        <div className="relative">
                                            <textarea
                                                required
                                                rows={3}
                                                placeholder="اشرح ما تحتاجه بشكل مختصر ووافٍ..."
                                                value={form.description}
                                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                                className="w-full text-white text-sm rounded-2xl px-4 py-3.5 resize-none outline-none transition-all placeholder-gray-600 custom-scrollbar focus:border-royal-500/50 focus:ring-2 focus:ring-royal-500/15"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </FieldWrapper>

                                    {/* ── Location ── */}
                                    <FieldWrapper label="الموقع أو العنوان" icon={MapPin}>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                placeholder="مثال: شارع التحرير، القاهرة"
                                                value={form.location_address}
                                                onChange={(e) => setForm((p) => ({ ...p, location_address: e.target.value }))}
                                                className="w-full text-white text-sm rounded-2xl px-4 py-3.5 outline-none transition-all placeholder-gray-600 focus:border-royal-500/50 focus:ring-2 focus:ring-royal-500/15"
                                                style={inputStyle}
                                            />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                                        </div>
                                    </FieldWrapper>

                                    {/* ── Scheduled Time ── */}
                                    <FieldWrapper label="الوقت المقترح (اختياري)" icon={Calendar}>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                value={form.scheduled_time}
                                                onChange={(e) => setForm((p) => ({ ...p, scheduled_time: e.target.value }))}
                                                className="w-full text-white text-sm rounded-2xl px-4 py-3.5 outline-none transition-all placeholder-gray-600 focus:border-royal-500/50 focus:ring-2 focus:ring-royal-500/15"
                                                style={{ ...inputStyle, colorScheme: 'dark' }}
                                            />
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                                        </div>
                                    </FieldWrapper>

                                    {/* ── Actions ── */}
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-200 transition-all"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.07)',
                                            }}
                                        >
                                            إلغاء
                                        </button>

                                        <motion.button
                                            type="submit"
                                            disabled={loading}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-[2] py-3.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
                                            style={{
                                                background: loading
                                                    ? 'rgba(99,102,241,0.4)'
                                                    : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                                border: '1px solid rgba(99,102,241,0.5)',
                                                boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    جارٍ الإرسال...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    إرسال الطلب
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
