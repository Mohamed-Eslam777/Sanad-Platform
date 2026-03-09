import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Loader2, MapPin } from 'lucide-react';
import api from '../services/api';

function getPosition() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 6000 }
        );
    });
}

export default function SOSButton({ onToast }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const coords = await getPosition();
            await api.post('/sos', {
                latitude: coords?.latitude ?? null,
                longitude: coords?.longitude ?? null,
                message: 'SOS triggered by beneficiary via app.',
            });
            setSent(true);
            setOpen(false);
            onToast?.('🚨 تم إرسال الاستغاثة بنجاح. نحن معك!', 'success');
            setTimeout(() => setSent(false), 30_000);
        } catch {
            onToast?.('حدث خطأ أثناء إرسال الاستغاثة. حاول مرة أخرى.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating SOS Button */}
            <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center">
                {/* Pulse ring */}
                {!sent && (
                    <span className="absolute inset-0 rounded-full bg-red-400/30 animate-ping pointer-events-none" />
                )}
                <button
                    onClick={() => setOpen(true)}
                    disabled={sent}
                    title="إرسال نداء استغاثة"
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg transition-all
            ${sent
                            ? 'bg-green-50 border-green-400 text-green-600 cursor-default'
                            : 'bg-white border-red-400 text-red-500 hover:bg-red-50 hover:shadow-red-200'}`}
                >
                    <ShieldAlert className="w-6 h-6" />
                </button>
                <p className={`mt-1.5 text-[9px] font-extrabold tracking-widest uppercase ${sent ? 'text-green-500' : 'text-red-400'}`}>
                    {sent ? 'أُرسل' : 'SOS'}
                </p>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div key="sos-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !loading && setOpen(false)}
                            className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm" />

                        <motion.div key="sos-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

                            <div dir="rtl" className="pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                                <div className="h-1 w-full bg-gradient-to-l from-red-500 via-rose-400 to-transparent" />
                                <div className="p-7">
                                    <button onClick={() => setOpen(false)} disabled={loading}
                                        className="absolute top-5 left-5 w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                                            <ShieldAlert className="w-8 h-8 text-red-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-gray-900">إرسال نداء استغاثة؟</h2>
                                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                                سيتم تسجيل موقعك الحالي وإخطار المسؤولين فوراً.
                                                <br />
                                                <span className="text-red-500 font-semibold">لا تستخدم هذا إلا في حالات الطوارئ الحقيقية.</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <p className="text-xs text-gray-500">سنطلب موقعك لتحديد مكانك. إذا رفضت، سيُرسل النداء بدون إحداثيات.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setOpen(false)} disabled={loading}
                                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold transition-colors disabled:opacity-50">
                                            إلغاء
                                        </button>
                                        <button onClick={handleConfirm} disabled={loading}
                                            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-md disabled:opacity-70">
                                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الإرسال...</> : <><ShieldAlert className="w-4 h-4" /> تأكيد وإرسال</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
