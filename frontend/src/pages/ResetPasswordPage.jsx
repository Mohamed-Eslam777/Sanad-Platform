/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ResetPasswordPage — Premium Dark Glassmorphism Auth
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { authService } from '../services/authService';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const missingToken = !token;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!password || !confirmPass) { setError('يرجى ملء جميع الحقول.'); return; }
        if (password.length < 8) { setError('كلمة المرور يجب أن لا تقل عن 8 أحرف.'); return; }
        if (password !== confirmPass) { setError('كلمتا المرور غير متطابقتين.'); return; }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'الرابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Password strength indicator ── */
    const strengthBar = password.length > 0 && (
        <div className="mt-1.5 h-1 rounded-full bg-glass-light overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${password.length < 8 ? 'bg-danger-400' :
                        password.length < 12 ? 'bg-warning-400' : 'bg-success-400'
                    }`}
                initial={{ width: 0 }}
                animate={{
                    width: password.length < 8 ? '25%' :
                        password.length < 12 ? '50%' : '100%',
                }}
                transition={{ duration: 0.3 }}
            />
        </div>
    );

    /* ── Password eye toggle adornment ── */
    const eyeToggle = (
        <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            tabIndex={-1}
        >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
    );

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
                        <KeyRound className="w-8 h-8 text-royal-400" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">تعيين كلمة مرور جديدة</h1>
                    <p className="text-gray-400 text-sm mt-2">اختر كلمة مرور قوية لا تقل عن 8 أحرف</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card variant="glass" padding="p-8">
                        {/* ── Missing token error ── */}
                        {missingToken && (
                            <div className="text-center py-4">
                                <AlertCircle className="w-14 h-14 text-danger-400 mx-auto mb-4" />
                                <h3 className="font-extrabold text-white text-lg mb-2">رابط غير صالح</h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    الرابط الذي وصلت منه غير مكتمل أو منتهي الصلاحية. يرجى الطلب مجدداً.
                                </p>
                                <Link to="/forgot-password">
                                    <Button fullWidth>طلب رابط جديد</Button>
                                </Link>
                            </div>
                        )}

                        {/* ── Success state ── */}
                        {!missingToken && success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex glass glow-border-sm p-4 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-success-400" />
                                </div>
                                <h3 className="text-lg font-extrabold text-white mb-2">تم تحديث كلمة المرور!</h3>
                                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                    تم تعيين كلمة مرورك الجديدة بنجاح. سيتم تحويلك لصفحة تسجيل الدخول خلال ثوانٍ...
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-royal-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جارٍ التحويل...</span>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Reset form ── */}
                        {!missingToken && !success && (
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

                                <form onSubmit={handleSubmit} noValidate className="space-y-1">
                                    {/* New password */}
                                    <div>
                                        <InputField
                                            label="كلمة المرور الجديدة"
                                            id="new-password"
                                            type={showPass ? 'text' : 'password'}
                                            dir="ltr"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            icon={Lock}
                                            required
                                            endAdornment={eyeToggle}
                                        />
                                        {strengthBar}
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <InputField
                                            label="تأكيد كلمة المرور"
                                            id="confirm-password"
                                            type="password"
                                            dir="ltr"
                                            placeholder="••••••••"
                                            value={confirmPass}
                                            onChange={(e) => setConfirmPass(e.target.value)}
                                            icon={Lock}
                                            required
                                            error={confirmPass && confirmPass !== password ? 'كلمتا المرور غير متطابقتين' : undefined}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        loading={loading}
                                        fullWidth
                                        size="lg"
                                        icon={!loading ? <CheckCircle className="w-5 h-5" /> : undefined}
                                        className="mt-3"
                                    >
                                        {loading ? 'جارٍ التحديث...' : 'حفظ كلمة المرور الجديدة'}
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* Back to login */}
                        {!success && (
                            <div className="mt-6 pt-6 border-t border-glass-border text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white font-medium transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
                                </Link>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
