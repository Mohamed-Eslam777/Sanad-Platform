/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ForgotPasswordPage — Premium Dark Glassmorphism Auth
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { setError('يرجى إدخال البريد الإلكتروني.'); return; }
        setError('');
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ في الاتصال، يرجى المحاولة مجدداً.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="inline-flex glass glow-border-sm p-4 rounded-2xl mb-4">
                        {sent
                            ? <CheckCircle className="w-8 h-8 text-success-400" />
                            : <ShieldCheck className="w-8 h-8 text-royal-400" />
                        }
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">
                        {sent ? 'تم إرسال الرابط!' : 'استعادة كلمة المرور'}
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        {sent
                            ? ''
                            : 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة'
                        }
                    </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card variant="glass" padding="p-8">
                        {!sent ? (
                            <>
                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-5 bg-danger-500/10 border border-danger-500/30 text-danger-400 p-3.5 rounded-xl flex items-start gap-3 text-sm"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} noValidate>
                                    <InputField
                                        label="البريد الإلكتروني"
                                        id="email"
                                        type="email"
                                        dir="ltr"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        icon={Mail}
                                        required
                                    />

                                    <Button
                                        type="submit"
                                        loading={loading}
                                        fullWidth
                                        size="lg"
                                        className="mt-2"
                                    >
                                        {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex glass glow-border-sm p-4 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-success-400" />
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    إذا كان البريد <span className="font-bold text-white">{email}</span>{' '}
                                    مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة التعيين خلال دقائق.
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                    تحقق من مجلد البريد المزعج إذا لم تصلك الرسالة.
                                </p>
                                <button
                                    onClick={() => { setSent(false); setEmail(''); }}
                                    className="mt-4 text-sm text-royal-400 hover:text-royal-300 font-medium transition-colors"
                                >
                                    إرسال مرة أخرى
                                </button>
                            </motion.div>
                        )}

                        <div className="mt-6 pt-6 border-t border-glass-border text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white font-medium transition-colors"
                            >
                                <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
