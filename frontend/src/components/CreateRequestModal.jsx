/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CreateRequestModal — Premium Dark Glassmorphism 
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, BookOpen, ShoppingBag, Ellipsis, MapPin, Clock, FileText, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { requestService } from '../services/requestService';
import Button from './common/Button';

const REQUEST_TYPES = [
    { value: 'transportation', label: 'نقل ومواصلات', icon: Car, activeBg: 'bg-royal-600/20', activeBorder: 'border-royal-500/50', iconColor: 'text-royal-400' },
    { value: 'reading', label: 'قراءة وتلاوة', icon: BookOpen, activeBg: 'bg-[#7C3AED]/20', activeBorder: 'border-[#7C3AED]/50', iconColor: 'text-[#A78BFA]' },
    { value: 'errand', label: 'قضاء مشاوير', icon: ShoppingBag, activeBg: 'bg-warning-500/20', activeBorder: 'border-warning-500/50', iconColor: 'text-warning-400' },
    { value: 'other', label: 'أخرى', icon: Ellipsis, activeBg: 'bg-glass-light', activeBorder: 'border-glass-border', iconColor: 'text-gray-400' },
];

const inputClass = 'w-full bg-glass-light border border-glass-border text-white rounded-xl px-4 py-3 text-sm focus:border-royal-400 focus:ring-4 focus:ring-royal-500/20 outline-none transition-all placeholder-gray-500';

function Alert({ type, message }) {
    if (!message) return null;
    const isErr = type === 'error';
    return (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 p-3 rounded-xl border text-sm mb-4 font-bold ${isErr ? 'bg-danger-500/10 border-danger-500/30 text-danger-400' : 'bg-success-500/10 border-success-500/30 text-success-400'}`}>
            {isErr ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span>{message}</span>
        </motion.div>
    );
}

const getCoords = () => new Promise((resolve) => {
    const FALLBACK = { lat: 30.0444, lng: 31.2357 };
    const timer = setTimeout(() => resolve(FALLBACK), 3000);
    if (!navigator.geolocation) { clearTimeout(timer); return resolve(FALLBACK); }
    navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        () => { clearTimeout(timer); resolve(FALLBACK); }
    );
});

export default function CreateRequestModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({ type: 'transportation', description: '', location_address: '', scheduled_time: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) { setForm({ type: 'transportation', description: '', location_address: '', scheduled_time: '' }); setError(''); setSuccess(''); }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.description || !form.location_address) { setError('يرجى تعبئة وصف الطلب والموقع.'); return; }
        setError(''); setLoading(true);
        try {
            const { lat, lng } = await getCoords();
            await requestService.createRequest({ ...form, location_lat: lat, location_lng: lng, scheduled_time: form.scheduled_time || null });
            setSuccess('✅ تم إرسال طلبك بنجاح! سيتواصل معك متطوع قريباً.');
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
                    <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md" />

                    <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

                        <div dir="rtl" className="pointer-events-auto w-full max-w-lg glass-heavy rounded-3xl shadow-glow-xl border border-glass-border overflow-hidden relative">
                            {/* Top accent */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-royal-500 via-royal-400 to-transparent opacity-80" />

                            <div className="p-7 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-white">طلب مساعدة جديد</h2>
                                        <p className="text-gray-400 text-xs mt-0.5">أخبرنا بما تحتاجه وسيصلك متطوع قريب</p>
                                    </div>
                                    <button onClick={onClose} className="w-9 h-9 glass-light hover:bg-glass-heavy border border-glass-border rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <Alert type="error" message={error} />
                                <Alert type="success" message={success} />

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Request Type */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">نوع المساعدة المطلوبة</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {REQUEST_TYPES.map((t) => {
                                                const Icon = t.icon;
                                                const active = form.type === t.value;
                                                return (
                                                    <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, type: t.value }))}
                                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-start ${active ? `${t.activeBg} ${t.activeBorder} shadow-glow-sm` : 'border-glass-border hover:border-royal-500/30 bg-glass-light/50'}`}>
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-glass-heavy shadow-soft border border-glass-border glow-border-sm' : 'bg-glass-light border border-transparent'}`}>
                                                            <Icon className={`w-4 h-4 ${active ? t.iconColor : 'text-gray-500'}`} />
                                                        </div>
                                                        <span className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-400'}`}>{t.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> وصف الطلب</label>
                                        <textarea required rows={3} placeholder="اشرح ما تحتاجه بشكل مختصر..."
                                            value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                            className={`${inputClass} resize-none`} />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> العنوان أو الموقع</label>
                                        <input required type="text" placeholder="مثال: شارع التحرير، القاهرة"
                                            value={form.location_address} onChange={(e) => setForm(p => ({ ...p, location_address: e.target.value }))}
                                            className={inputClass} />
                                    </div>

                                    {/* Scheduled Time */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> الوقت المقترح (اختياري)</label>
                                        <input type="datetime-local" value={form.scheduled_time}
                                            onChange={(e) => setForm(p => ({ ...p, scheduled_time: e.target.value }))}
                                            className={inputClass} style={{ colorScheme: 'dark' }} />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={onClose}
                                            className="flex-1 py-3 rounded-xl border border-glass-border bg-glass-light text-gray-300 hover:bg-glass-heavy hover:text-white text-sm font-bold transition-all shadow-sm focus:outline-none">
                                            إلغاء
                                        </button>
                                        <Button type="submit" disabled={loading} className="flex-1"
                                            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}>
                                            {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
                                        </Button>
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
