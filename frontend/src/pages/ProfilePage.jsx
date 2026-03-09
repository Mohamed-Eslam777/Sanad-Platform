/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ProfilePage — Premium Dark Glassmorphism 
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Skeleton from '../components/common/Skeleton';
import Avatar from '../components/common/Avatar';
import Sidebar from '../components/layout/Sidebar';
import { User, Phone, Mail, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        disability_type: '',
        medical_notes: '',
        emergency_contact: '',
        bio: '',
        skills: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await userService.getProfile();
            const data = res.data;
            setProfile(data);
            setFormData({
                name: data.full_name || '',
                phone: data.phone || '',
                disability_type: data.profile?.disability_type || '',
                medical_notes: data.profile?.medical_notes || '',
                emergency_contact: data.profile?.emergency_contact || '',
                bio: data.profile?.bio || '',
                skills: data.profile?.skills || ''
            });
        } catch (err) {
            setError('فشل في تحميل بيانات الملف الشخصي.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await userService.updateProfile(formData);
            setMessage('تم حفظ الملف الشخصي بنجاح!');
        } catch (err) {
            setError('حدث خطأ أثناء حفظ التعديلات.');
        } finally {
            setSaving(false);
        }
    };

    const isVolunteer = user?.role === 'volunteer';

    // Textarea glass classes
    const textareaClass = "w-full bg-glass-light border border-glass-border text-white rounded-xl px-4 py-3 text-sm focus:border-royal-400 focus:ring-2 focus:ring-royal-500/20 placeholder-gray-500 outline-none transition-all resize-none";

    return (
        <div dir="rtl" className="min-h-screen flex">
            <Sidebar user={user} onLogout={logout} currentPath="/profile" />

            <main className="flex-1 mr-0 md:mr-64 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-4xl mx-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h1 className="text-3xl font-extrabold text-white mb-2">الملف الشخصي</h1>
                        <p className="text-gray-400">إدارة بيانات حسابك وتفضيلاتك</p>
                    </motion.div>

                    {/* Alerts */}
                    <motion.div variants={itemVariants}>
                        {error && (
                            <div className="mb-6 bg-danger-500/10 border border-danger-500/30 text-danger-400 p-4 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-6 bg-success-500/10 border border-success-500/30 text-success-400 p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" /> {message}
                            </div>
                        )}
                    </motion.div>

                    {/* Content */}
                    {loading ? (
                        <motion.div variants={itemVariants} className="space-y-4">
                            <Skeleton variant="card" height="150px" />
                            <Skeleton variant="card" height="300px" />
                            <Skeleton variant="card" height="200px" />
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-8">
                                <div className="flex flex-col items-center mb-8 pb-8 border-b border-glass-border">
                                    <Avatar name={formData.name || user?.full_name} size="lg" ring />
                                    <h2 className="text-xl font-bold text-white mt-4">{formData.name || 'مستخدم'}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{isVolunteer ? 'متطوع' : 'مستفيد'}</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Basic Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">المعلومات الأساسية</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="الاسم الكامل"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                icon={User}
                                                required
                                            />
                                            <InputField
                                                label="رقم الجوال"
                                                id="phone"
                                                dir="ltr"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                icon={Phone}
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <InputField
                                                label="البريد الإلكتروني"
                                                id="email"
                                                type="email"
                                                dir="ltr"
                                                value={profile?.email || ''}
                                                icon={Mail}
                                                disabled
                                                className="opacity-60"
                                            />
                                            <p className="text-xs text-gray-500 ms-1 -mt-2">لا يمكن تغيير البريد الإلكتروني حالياً.</p>
                                        </div>
                                    </div>

                                    {/* Role Specific Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 border-t border-glass-border pt-6">
                                            {isVolunteer ? 'معلومات المتطوع' : 'معلومات المستفيد'}
                                        </h3>

                                        {isVolunteer ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="bio" className="block text-xs font-bold text-gray-400 mb-1.5 ms-1">نبذة عنك</label>
                                                    <textarea
                                                        id="bio"
                                                        rows="3"
                                                        value={formData.bio}
                                                        onChange={handleChange}
                                                        placeholder="تحدث عن نفسك قليلاً..."
                                                        className={textareaClass}
                                                    ></textarea>
                                                </div>
                                                <InputField
                                                    label="المهارات (مفصولة بفاصلة)"
                                                    id="skills"
                                                    value={formData.skills}
                                                    onChange={handleChange}
                                                    placeholder="مثال: قيادة السيارة, الإسعافات الأولية"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <InputField
                                                    label="نوع الإعاقة (إن وجد)"
                                                    id="disability_type"
                                                    value={formData.disability_type}
                                                    onChange={handleChange}
                                                    placeholder="مثال: حركية، بصرية..."
                                                />
                                                <div>
                                                    <label htmlFor="medical_notes" className="block text-xs font-bold text-gray-400 mb-1.5 ms-1">ملاحظات طبية</label>
                                                    <textarea
                                                        id="medical_notes"
                                                        rows="3"
                                                        value={formData.medical_notes}
                                                        onChange={handleChange}
                                                        placeholder="أي ملاحظات يجب أن يعرفها المتطوع..."
                                                        className={textareaClass}
                                                    ></textarea>
                                                </div>
                                                <InputField
                                                    label="رقم للتواصل في حالات الطوارئ"
                                                    id="emergency_contact"
                                                    dir="ltr"
                                                    value={formData.emergency_contact}
                                                    onChange={handleChange}
                                                    icon={Phone}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-glass-border">
                                        <Button
                                            type="submit"
                                            loading={saving}
                                            icon={!saving ? <Save className="w-5 h-5" /> : undefined}
                                            fullWidth
                                            size="lg"
                                        >
                                            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
