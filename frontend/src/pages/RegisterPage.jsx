/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RegisterPage — Premium Dark Glassmorphism Auth
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import logo from '../assets/logo.png';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function RegisterPage() {
    const [role, setRole] = useState('beneficiary');
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name || !form.email || !form.password) {
            setError('يرجى ملء جميع الحقول المطلوبة.'); return;
        }
        if (form.password.length < 8) {
            setError('كلمة المرور يجب أن لا تقل عن 8 أحرف.'); return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await authService.register({ ...form, role });
            const { token, user } = res.data || res;
            login(user, token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.');
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
                {/* Banner with Logo */}
                <motion.div
                    variants={itemVariants}
                    className="py-8 flex items-center justify-center mb-6"
                >
                    <img src={logo} alt="سَنَد" className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.25)]" />
                </motion.div>

                <motion.div variants={itemVariants} className="text-center mb-6">
                    <h1 className="text-2xl font-extrabold text-white">إنشاء حساب جديد</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        انضم إلى منصة سند للمساندة المجتمعية وكن جزءاً من التغيير
                    </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card variant="glass" padding="p-8">
                        {/* Role Toggle (glass styled) */}
                        <div className="flex glass rounded-xl p-1 mb-6">
                            {[
                                { val: 'beneficiary', label: 'أحتاج مساعدة' },
                                { val: 'volunteer', label: 'متطوع' },
                            ].map(({ val, label }) => (
                                <motion.button
                                    key={val}
                                    type="button"
                                    onClick={() => setRole(val)}
                                    whileTap={{ scale: 0.97 }}
                                    className={[
                                        'flex-1 py-2.5 text-sm font-bold rounded-lg transition-all',
                                        role === val
                                            ? 'glass-medium text-royal-400 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-300',
                                    ].join(' ')}
                                >
                                    {label}
                                </motion.button>
                            ))}
                        </div>

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
                                label="الاسم الكامل"
                                id="full_name"
                                placeholder="أدخل اسمك الثلاثي"
                                value={form.full_name}
                                onChange={handleChange}
                                icon={User}
                                required
                            />

                            <InputField
                                label="البريد الإلكتروني"
                                id="email"
                                type="email"
                                dir="ltr"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={handleChange}
                                icon={Mail}
                                required
                            />

                            <InputField
                                label="رقم الجوال"
                                id="phone"
                                dir="ltr"
                                placeholder="05XXXXXXXX"
                                value={form.phone}
                                onChange={handleChange}
                                icon={Phone}
                            />

                            <InputField
                                label="كلمة المرور"
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                dir="ltr"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
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

                            <Button
                                type="submit"
                                loading={loading}
                                fullWidth
                                size="lg"
                            >
                                {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" className="text-royal-400 font-bold hover:text-royal-300 transition-colors">تسجيل الدخول</Link>
                        </p>
                        <p className="text-center text-xs text-gray-600 mt-4">
                            بالتسجيل أنت توافق على شروط الخدمة وسياسة الخصوصية
                        </p>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
