/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LoginPage — Premium Dark Glassmorphism Auth
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import logo from '../assets/logo.png';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError('يرجى ملء جميع الحقول.'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await authService.login(email, password);
            const { token, user } = res.data || res;
            login(user, token);
            if (user.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
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
                {/* Logo */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="inline-flex mb-4">
                        <img src={logo} alt="سَنَد" className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.25)]" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white">مرحباً بك</h1>
                    <p className="text-gray-400 mt-2 text-sm">سجّل دخولك لمتابعة طلباتك ومهامك</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card variant="glass" padding="p-8">
                        {/* Error Banner */}
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

                            <InputField
                                label="كلمة المرور"
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                dir="ltr"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={Lock}
                                required
                                endAdornment={
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="text-gray-500 hover:text-gray-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />

                            <div className="mb-6 text-start">
                                <Link to="/forgot-password" className="text-xs text-royal-400 hover:text-royal-300 font-medium transition-colors">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                loading={loading}
                                fullWidth
                                size="lg"
                            >
                                {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            ليس لديك حساب؟{' '}
                            <Link to="/register" className="text-royal-400 font-bold hover:text-royal-300 transition-colors">أنشئ حساباً الآن</Link>
                        </p>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
