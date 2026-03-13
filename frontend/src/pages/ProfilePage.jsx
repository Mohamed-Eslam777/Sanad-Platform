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
import StatusBadge from '../components/common/StatusBadge';
import { User, Phone, Mail, Save, Loader2, AlertCircle, CheckCircle, UploadCloud, ShieldCheck } from 'lucide-react';

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

    // KYC Verification States
    const [kycFiles, setKycFiles] = useState({
        id_card_front: null,
        id_card_back: null,
        id_selfie: null
    });
    const [kycUploading, setKycUploading] = useState(false);

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

    const handleKycFileChange = (e, fieldName) => {
        if (e.target.files && e.target.files[0]) {
            setKycFiles(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
        }
    };

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        if (!kycFiles.id_card_front || !kycFiles.id_card_back || !kycFiles.id_selfie) {
            setError('الرجاء رفع جميع الصور الثلاثة للتوثيق.');
            return;
        }

        setKycUploading(true);
        setError('');
        setMessage('');

        try {
            const fd = new FormData();
            fd.append('id_card_front', kycFiles.id_card_front);
            fd.append('id_card_back', kycFiles.id_card_back);
            fd.append('id_selfie', kycFiles.id_selfie);

            const res = await api.post('/users/verify-identity', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setMessage(res.data.message);
            // Refresh profile to get updated status
            loadProfile(); 
        } catch (err) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء رفع ملفات التوثيق.');
        } finally {
            setKycUploading(false);
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
                                        <h2 className="text-xl font-bold text-white mt-4 flex items-center gap-2">
                                            {formData.name || 'مستخدم'}
                                            {profile?.verification_status === 'verified' && <ShieldCheck className="w-5 h-5 text-success-500" title="حساب موثق" />}
                                        </h2>
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

                                    {/* KYC Verification Section */}
                                    <div className="pt-6 border-t border-glass-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white">توثيق الحساب (KYC)</h3>
                                            <StatusBadge status={profile?.verification_status || 'unverified'} />
                                        </div>

                                        {profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected' ? (
                                            <div className="bg-glass-light/30 border border-glass-border rounded-xl p-5 mb-4 space-y-4">
                                                <p className="text-sm text-gray-300">
                                                    لزيادة موثوقية حسابك وتمكينك من استخدام جميع ميزات المنصة، يرجى رفع المستندات التالية:
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {Object.entries({
                                                        id_card_front: 'صورة الهوية (الوجه الأمامي)',
                                                        id_card_back: 'صورة الهوية (الوجه الخلفي)',
                                                        id_selfie: 'صورة سيلفي مع الهوية'
                                                    }).map(([key, label]) => (
                                                        <div key={key} className="relative group">
                                                            <div className={`h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                                                                ${kycFiles[key] ? 'border-success-500 bg-success-500/10' : 'border-glass-border bg-glass-medium hover:border-royal-500 hover:bg-glass-light'}`}>
                                                                
                                                                <input type="file" accept="image/*" onChange={(e) => handleKycFileChange(e, key)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                                
                                                                {kycFiles[key] ? (
                                                                    <>
                                                                        <CheckCircle className="w-6 h-6 text-success-500 mb-2" />
                                                                        <span className="text-xs font-bold text-success-300 truncate px-2 w-full text-center">{kycFiles[key].name}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-royal-400 mb-2 transition-colors" />
                                                                        <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300">{label}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button 
                                                    type="button" 
                                                    onClick={handleKycSubmit} 
                                                    loading={kycUploading} 
                                                    disabled={!kycFiles.id_card_front || !kycFiles.id_card_back || !kycFiles.id_selfie}
                                                    variant="secondary"
                                                    fullWidth
                                                >
                                                    {kycUploading ? 'جاري الرفع...' : 'رفع مستندات التوثيق'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="bg-glass-light border border-glass-border rounded-xl p-5 mb-4 text-center">
                                                {profile?.verification_status === 'pending' ? (
                                                    <p className="text-sm font-bold text-warning-400">حسابك قيد المراجعة حالياً من قبل الإدارة. سيتم إشعارك فور الانتهاء.</p>
                                                ) : (
                                                    <p className="text-sm font-bold text-success-400 flex items-center justify-center gap-2">
                                                        <ShieldCheck className="w-5 h-5" /> لقد تم توثيق حسابك بنجاح. شكراً لتعاونك!
                                                    </p>
                                                )}
                                            </div>
                                        )}
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
