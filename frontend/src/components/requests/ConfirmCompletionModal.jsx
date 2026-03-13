import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, X, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

const ConfirmCompletionModal = ({ isOpen, onClose, onConfirm, volunteerName, isSubmitting }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ rating, comment });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 relative z-10">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                تأكيد إنهاء الطلب
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 relative z-10 space-y-6">
                            <div className="text-center">
                                <p className="text-gray-300 font-medium mb-4">
                                    كيف كانت تجربتك مع المتطوع <span className="text-white font-bold">{volunteerName}</span>؟
                                </p>

                                {/* Interactive Star Rating */}
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const filled = star <= (hover || rating);
                                        return (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(rating)}
                                                className="focus:outline-none p-1"
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-colors drop-shadow-md ${filled
                                                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                                        : 'text-gray-600'
                                                        }`}
                                                />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-gray-500 min-h-[20px]">
                                    {rating === 1 && "سيء جداً"}
                                    {rating === 2 && "سيء"}
                                    {rating === 3 && "جيد"}
                                    {rating === 4 && "جيد جداً"}
                                    {rating === 5 && "ممتاز!"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-300">
                                    كلمة شكر أو ملاحظات <span className="text-gray-500 font-normal">(اختياري)</span>
                                </label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-royal-500/50 focus:ring-1 focus:ring-royal-500/50 transition-all shadow-inner focus:bg-black/60 min-h-[100px] resize-y"
                                    placeholder="اكتب تقييمك للمتطوع هنا..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Footer actions */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={rating === 0 || isSubmitting}
                                    variant="primary"
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 border-none shadow-[0_0_15px_rgba(52,211,153,0.4)] hover:shadow-[0_0_20px_rgba(52,211,153,0.6)] text-black"
                                    icon={<CheckCircle className="w-5 h-5" />}
                                >
                                    {isSubmitting ? 'جاري التأكيد...' : 'تأكيد وإنهاء'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    variant="secondary"
                                    className="px-6 bg-glass-light border-glass-border hover:bg-glass-heavy text-gray-300"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmCompletionModal;
