import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import api from '../services/api';

// ─── Interactive Star Row ─────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div
            className="flex gap-2 justify-center"
            onMouseLeave={() => setHovered(0)}
            role="radiogroup"
            aria-label="التقييم بالنجوم"
        >
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= (hovered || value);
                return (
                    <motion.button
                        key={n}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHovered(n)}
                        onClick={() => onChange(n)}
                        aria-label={`${n} نجوم`}
                        className="focus:outline-none"
                        style={filled ? { filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))' } : {}}
                    >
                        <Star
                            className="w-10 h-10 transition-colors duration-150"
                            fill={filled ? '#fbbf24' : 'transparent'}
                            stroke={filled ? '#fbbf24' : '#475569'}
                            strokeWidth={1.5}
                        />
                    </motion.button>
                );
            })}
        </div>
    );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
function Alert({ type, message }) {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${isError
                    ? 'bg-red-500/10 border-red-500/25 text-red-300'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                }`}
        >
            {isError
                ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{message}</span>
        </motion.div>
    );
}

// ─── Rating label ─────────────────────────────────────────────────────────────
const RATING_LABELS = {
    0: '',
    1: 'سيء جداً',
    2: 'سيء',
    3: 'مقبول',
    4: 'جيد جداً',
    5: 'ممتاز! 🌟',
};

// ─── ReviewModal ──────────────────────────────────────────────────────────────
function ReviewModal({ isOpen, onClose, requestId, volunteerName, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // reset on reopen
    const handleClose = () => {
        setRating(0); setComment(''); setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setError('يرجى اختيار تقييم (نجمة أو أكثر).'); return; }
        setError(''); setLoading(true);
        try {
            await api.post('/reviews', {
                request_id: requestId,
                rating,
                comment: comment.trim() || null,
            });
            onSuccess?.();   // parent: close modal + show toast + update local state
            handleClose();
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
                    {/* Backdrop */}
                    <motion.div
                        key="review-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/70"
                        style={{ backdropFilter: 'blur(6px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        key="review-modal"
                        initial={{ opacity: 0, scale: 0.93, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            dir="rtl"
                            className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 shadow-2xl shadow-black/70 overflow-hidden"
                            style={{ background: 'rgba(10,16,28,0.93)', backdropFilter: 'blur(28px)' }}
                        >
                            {/* Amber accent bar */}
                            <div className="h-0.5 w-full bg-gradient-to-l from-amber-400 via-yellow-300 to-transparent" />

                            <div className="p-7">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-7">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-white">تقييم المتطوع</h2>
                                        {volunteerName && (
                                            <p className="text-slate-500 text-xs mt-0.5">
                                                كيف كانت تجربتك مع <span className="text-amber-400 font-semibold">{volunteerName}</span>؟
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Alert */}
                                {error && (
                                    <div className="mb-5">
                                        <Alert type="error" message={error} />
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    {/* Stars */}
                                    <div className="flex flex-col items-center gap-3">
                                        <StarRating value={rating} onChange={setRating} />
                                        <motion.p
                                            key={rating}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`text-sm font-semibold h-5 ${rating >= 5 ? 'text-amber-300' : rating > 0 ? 'text-slate-300' : 'text-slate-600'}`}
                                        >
                                            {RATING_LABELS[rating]}
                                        </motion.p>
                                    </div>

                                    {/* Comment */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                            تعليق (اختياري)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="شارك تجربتك مع هذا المتطوع..."
                                            className="
                        w-full px-4 py-3 rounded-xl text-sm text-slate-100 resize-none
                        placeholder:text-slate-600 border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30
                        transition-all duration-200
                      "
                                            style={{ background: 'rgba(255,255,255,0.05)' }}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-semibold transition-all"
                                        >
                                            إلغاء
                                        </button>
                                        <motion.button
                                            type="submit"
                                            disabled={loading || rating === 0}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="
                        flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                        bg-amber-500 hover:bg-amber-400
                        disabled:opacity-40 disabled:cursor-not-allowed
                        text-black font-bold text-sm transition-all
                        hover:shadow-lg hover:shadow-amber-500/30
                      "
                                        >
                                            {loading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الإرسال...</>
                                                : <><Send className="w-4 h-4" /> إرسال التقييم</>
                                            }
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

export default ReviewModal;
