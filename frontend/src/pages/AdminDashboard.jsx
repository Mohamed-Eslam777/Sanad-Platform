/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Admin Dashboard — Premium Dark Glassmorphism
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import api from '../services/api';

import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import InputField from '../components/common/InputField';
import logo from '../assets/logo.png';

import {
    ShieldAlert, Users, CheckCircle, Clock, Loader2, MapPin,
    Phone, AlertCircle, RefreshCw, LogOut, Search, ChevronDown,
    List, LayoutDashboard, TrendingUp, FileText, UserPlus, Activity, Menu, X, Filter,
    ShieldCheck, XCircle, FileImage, ExternalLink
} from 'lucide-react';

const POLL_INTERVAL = 10_000;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Status Dropdown (inline edit)
   ═══════════════════════════════════════════════════════════════════════════ */
function StatusMenu({ userId, currentStatus, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const statuses = [
        { value: 'active', label: 'نشط', dot: 'bg-success-500' },
        { value: 'flagged', label: 'مراقب', dot: 'bg-warning-500' },
        { value: 'suspended', label: 'موقوف', dot: 'bg-danger-500' },
    ];

    const handleSelect = async (status) => {
        if (status === currentStatus) { setOpen(false); return; }
        setLoading(true);
        try {
            await adminService.updateUserStatus(userId, status);
            onUpdate(userId, status, 'success');
        } catch (err) {
            onUpdate(userId, currentStatus, 'error', err.response?.data?.message || 'فشل في تحديث الحالة.');
        } finally { setLoading(false); setOpen(false); }
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} disabled={loading}
                className="flex items-center gap-2 bg-glass-light border border-glass-border hover:border-royal-500/50 px-3 py-1.5 rounded-lg transition-all text-sm font-bold shadow-sm text-white focus:outline-none">
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : (
                    <><StatusBadge status={currentStatus} type="user" /><ChevronDown className="w-3 h-3 text-gray-400" /></>
                )}
            </button>
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute left-0 mt-2 z-20 glass-heavy border border-glass-border rounded-xl shadow-glow-lg py-1.5 min-w-[130px]"
                        >
                            {statuses.map(s => (
                                <button key={s.value} onClick={() => handleSelect(s.value)}
                                    className={`w-full text-right px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 text-white
                                        ${s.value === currentStatus ? 'bg-glass-light' : 'hover:bg-glass-light'}
                                    `}>
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    {s.label}
                                    {s.value === currentStatus && <CheckCircle className="w-3 h-3 me-auto text-success-500" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Progress Bar (glassmorphism)
   ═══════════════════════════════════════════════════════════════════════════ */
function ProgressBar({ label, value, max, color = 'bg-royal-500' }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-400 w-20 text-start">{label}</span>
            <div className="flex-1 bg-glass-light/50 rounded-full h-3 overflow-hidden border border-glass-border">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
            <span className="text-sm font-black text-white w-12 text-start">{value}</span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Reusable Filter Dropdown (glassmorphism + framer-motion)
   ═══════════════════════════════════════════════════════════════════════════ */
function FilterDropdown({ value, onChange, options = [], placeholder, icon: Icon = Filter }) {
    const [open, setOpen] = useState(false);
    const activeLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className={`flex items-center gap-2 glass-medium border border-glass-border text-white text-xs font-bold rounded-full px-5 py-2 cursor-pointer outline-none transition-all shadow-glow-sm
                    ${open ? 'border-royal-400 ring-2 ring-royal-500/20' : 'hover:border-royal-400/50'}`}
            >
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span>{activeLabel}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* click-outside overlay */}
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="absolute start-0 mt-2 z-20 glass-heavy border border-glass-border rounded-xl shadow-glow-lg py-1.5 min-w-[150px]"
                        >
                            {options.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full text-right px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 text-white
                                        ${opt.value === value ? 'bg-royal-600/20 text-royal-300' : 'hover:bg-royal-600/20'}`}
                                >
                                    {opt.label}
                                    {opt.value === value && <CheckCircle className="w-3 h-3 ms-auto text-royal-400" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Navigation
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Toast setup using Phase 1 component
    const [toasts, setToasts] = useState([]);
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    // ── Stats (Overview)
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // ── Users
    const [users, setUsers] = useState([]);
    const [usersMeta, setUsersMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    // ── SOS
    const [alerts, setAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);

    // ── KYC Verification
    const [verifications, setVerifications] = useState([]);
    const [loadingVerifications, setLoadingVerifications] = useState(true);
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [reviewingId, setReviewingId] = useState(null);

    // ────────── DATA FETCHERS ──────────
    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true);
            const res = await adminService.getStats();
            setStats(res.data);
        } catch (e) { console.error('fetchStats error:', e); }
        finally { setLoadingStats(false); }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoadingUsers(true);
            const res = await adminService.getAllUsers({
                search: search.trim() || undefined,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
                page,
                limit: 15,
            });
            const d = res.data;
            setUsers(d.users || []);
            setUsersMeta({ total: d.total || 0, totalPages: d.totalPages || 1, page: d.page || 1 });
        } catch (e) {
            console.error('fetchUsers error:', e);
            setUsers([]);
        } finally { setLoadingUsers(false); }
    }, [search, roleFilter, statusFilter, page]);

    const fetchAlerts = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoadingAlerts(true);
            const res = await api.get('/sos');
            setAlerts(res.data.data || []);
        } catch { /* silent */ }
        finally { if (!silent) setLoadingAlerts(false); }
    }, []);

    const fetchVerifications = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoadingVerifications(true);
            const res = await adminService.getAllUsers({ status: 'active', limit: 100 });
            const pendingUsers = (res.data.users || []).filter(u => u.verification_status === 'pending');
            setVerifications(pendingUsers);
        } catch { /* silent */ }
        finally { if (!silent) setLoadingVerifications(false); }
    }, []);

    // ────────── EFFECTS ──────────
    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchAlerts(false);
        fetchVerifications(false);
        const interval = setInterval(() => {
            fetchAlerts(true);
            fetchVerifications(true);
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchStats, fetchUsers, fetchAlerts, fetchVerifications]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchStats();
        }
    }, [activeTab, fetchStats]);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 400);
        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter, page, fetchUsers]);

    // ────────── HANDLERS ──────────
    const handleResolve = async (id) => {
        try {
            setResolvingId(id);
            await api.patch(`/sos/${id}/resolve`);
            setAlerts(prev => prev.filter(a => a.id !== id));
            showToast('تم حل نداء الاستغاثة بنجاح.', 'success');
        } catch { showToast('فشل في حل النداء.', 'error'); }
        finally { setResolvingId(null); }
    };

    const handleStatusUpdate = (userId, newStatus, result, errMsg) => {
        if (result === 'error') { showToast(errMsg, 'error'); return; }
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast('تم تحديث حالة المستخدم بنجاح.', 'success');
    };

    const handleVerificationReview = async (userId, action) => {
        try {
            setReviewingId(userId);
            await api.patch(`/users/${userId}/verify`, { action });
            setVerifications(prev => prev.filter(v => v.id !== userId));
            setSelectedVerification(null);
            showToast(action === 'accept' ? 'تم توثيق الحساب بنجاح.' : 'تم رفض التوثيق.', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'فشل في تقييم الحساب.', 'error');
        } finally {
            setReviewingId(null);
        }
    };

    const activeAlerts = alerts.filter(a => a.status === 'active');

    // ────────── NAV ITEMS ──────────
    const navItems = [
        { key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { key: 'users', label: 'إدارة المستخدمين', icon: Users },
        { key: 'verification', label: 'طلبات التوثيق', icon: ShieldCheck, badge: verifications.length },
        { key: 'sos', label: 'نداءات الاستغاثة', icon: ShieldAlert, badge: activeAlerts.length },
    ];

    // shared glass input classes for tabular view
    const tabularInputClass = "bg-navy-900 border border-glass-border text-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-500/20 transition-all placeholder-gray-500 appearance-none cursor-pointer [&>option]:bg-navy-900 [&>option]:text-white";

    return (
        <div dir="rtl" className="min-h-screen flex font-sans text-gray-200">
            {/* Global Toasts */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden fixed top-4 right-4 z-50 glass-heavy p-2.5 text-royal-400 rounded-xl shadow-glow-sm border border-glass-border focus:outline-none"
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
            <aside className={`w-[260px] glass-heavy border-l border-glass-border flex flex-col fixed h-full right-0 z-40 transition-transform shadow-glow-lg
                ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>

                {/* Logo Section */}
                <div className="p-6 border-b border-glass-border">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="p-2">
                            <img src={logo} alt="سَنَد" className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_0_25px_rgba(37,99,235,0.3)]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white tracking-wide">لوحة تحكم سَنَد</h3>
                            <p className="text-[11px] text-royal-400 mt-1 font-bold">مدير النظام</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1.5 flex-1 mt-2">
                    {navItems.map(item => (
                        <button key={item.key}
                            onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all
                            ${activeTab === item.key
                                    ? 'bg-royal-600/20 text-royal-400 shadow-glow-sm border border-royal-500/30'
                                    : 'text-gray-400 hover:bg-glass-light hover:text-white border border-transparent'}`}>
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </div>
                            {item.badge > 0 && (
                                <span className="bg-danger-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-glow-sm">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-glass-border">
                    <p className="px-3 text-xs text-gray-500 truncate mb-3">{user?.email || 'admin@sanad.com'}</p>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-danger-400 hover:bg-danger-500/10 rounded-xl font-bold text-sm transition-colors">
                        <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

            {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
            <main className="flex-1 flex flex-col mr-0 md:mr-[260px] p-5 md:p-8 pt-20 md:pt-8 w-full min-h-screen">

                {/* ════════════ OVERVIEW TAB ═══════════════════════════════ */}
                {activeTab === 'overview' && (
                    <div className="flex-1 w-full max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white mb-1">نظرة عامة على المنصة</h2>
                            <p className="text-sm text-gray-400">إحصائيات حية ومباشرة من قاعدة البيانات.</p>
                        </div>

                        {(loadingStats || !stats) ? (
                            <div className="mt-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                                    {[1, 2, 3, 4].map(k => <Skeleton key={k} variant="card" height="140px" />)}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Skeleton variant="card" height="300px" />
                                    <Skeleton variant="card" height="300px" />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ── 4 Stat Cards ─────────────────────────── */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                                    {[
                                        { label: 'إجمالي المستخدمين', value: stats?.users?.total, icon: Users, bg: 'bg-royal-600/15', color: 'text-royal-400' },
                                        { label: 'طلبات نشطة', value: (stats?.requests?.pending || 0) + (stats?.requests?.accepted || 0) + (stats?.requests?.in_progress || 0), icon: FileText, bg: 'bg-warning-500/15', color: 'text-warning-400' },
                                        { label: 'طلبات مكتملة', value: stats?.requests?.completed, icon: CheckCircle, bg: 'bg-success-500/15', color: 'text-success-400' },
                                        { label: 'نداءات SOS مفتوحة', value: stats?.sos?.active, icon: ShieldAlert, bg: 'bg-danger-500/15', color: 'text-danger-400' },
                                    ].map((card, i) => (
                                        <Card key={i} variant="glass" padding="p-6" className="min-h-[140px]">
                                            <div className="relative z-10" style={{ position: 'relative', isolation: 'isolate' }}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center relative z-10`}>
                                                        <card.icon className="w-6 h-6" />
                                                    </div>
                                                    <TrendingUp className="w-4 h-4 text-gray-600 relative z-10" />
                                                </div>
                                                <p className="text-3xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] relative z-10">{card.value ?? 0}</p>
                                                <p className="text-sm font-bold text-gray-400 mt-1 relative z-10">{card.label}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* ── Charts Row ──────────────────────────── */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    <Card variant="glass" padding="p-6">
                                        <h3 className="font-black text-white mb-5 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-royal-400" /> توزيع المستخدمين
                                        </h3>
                                        <div className="space-y-4">
                                            <ProgressBar label="مستفيدين" value={stats?.users?.beneficiary || 0} max={stats?.users?.total || 1} color="bg-success-400" />
                                            <ProgressBar label="متطوعين" value={stats?.users?.volunteer || 0} max={stats?.users?.total || 1} color="bg-royal-400" />
                                            <ProgressBar label="مديرين" value={stats?.users?.admin || 0} max={stats?.users?.total || 1} color="bg-[#7C3AED]" />
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-glass-border flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400">الإجمالي</span>
                                            <span className="font-black text-white">{stats?.users?.total || 0} حساب</span>
                                        </div>
                                    </Card>

                                    <Card variant="glass" padding="p-6">
                                        <h3 className="font-black text-white mb-5 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-warning-400" /> حالة الطلبات
                                        </h3>
                                        <div className="space-y-4">
                                            <ProgressBar label="معلّقة" value={stats?.requests?.pending || 0} max={stats?.requests?.total || 1} color="bg-warning-400" />
                                            <ProgressBar label="مقبولة" value={stats?.requests?.accepted || 0} max={stats?.requests?.total || 1} color="bg-royal-400" />
                                            <ProgressBar label="قيد التنفيذ" value={stats?.requests?.in_progress || 0} max={stats?.requests?.total || 1} color="bg-[#A78BFA]" />
                                            <ProgressBar label="مكتملة" value={stats?.requests?.completed || 0} max={stats?.requests?.total || 1} color="bg-success-400" />
                                            <ProgressBar label="ملغاة" value={stats?.requests?.cancelled || 0} max={stats?.requests?.total || 1} color="bg-danger-400" />
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-glass-border flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400">الإجمالي</span>
                                            <span className="font-black text-white">{stats?.requests?.total || 0} طلب</span>
                                        </div>
                                    </Card>
                                </div>

                                {/* ── Recent Activity ─────────────────────── */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card variant="glass" padding="p-6" className="h-full">
                                        <h3 className="font-black text-white mb-4 flex items-center gap-2">
                                            <UserPlus className="w-5 h-5 text-royal-400" /> أحدث المستخدمين
                                        </h3>
                                        {stats?.recentUsers?.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-6">لا يوجد مستخدمون بعد.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {(stats?.recentUsers || []).map(u => (
                                                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-glass-light transition-colors">
                                                        <Avatar name={u.full_name} size="sm" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-white truncate">{u.full_name}</p>
                                                            <p className="text-[11px] text-gray-400">{u.email}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md border
                                                            ${u.role === 'volunteer' ? 'bg-royal-600/15 text-royal-400 border-royal-500/20' :
                                                                u.role === 'admin' ? 'bg-[#7C3AED]/15 text-[#A78BFA] border-[#7C3AED]/20' :
                                                                    'bg-success-500/15 text-success-400 border-success-500/20'}`}>
                                                            {u.role === 'volunteer' ? 'متطوع' : u.role === 'admin' ? 'مدير' : 'مستفيد'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>

                                    <Card variant="glass" padding="p-6" className="h-full">
                                        <h3 className="font-black text-white mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-warning-400" /> أحدث الطلبات
                                        </h3>
                                        {stats?.recentRequests?.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-6">لا توجد طلبات بعد.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {(stats?.recentRequests || []).map(r => (
                                                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-glass-light transition-colors">
                                                        <div className="w-9 h-9 rounded-full bg-warning-500/15 text-warning-400 border border-warning-500/30 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-white truncate">{r.description || 'طلب مساعدة'}</p>
                                                            <p className="text-[11px] text-gray-400">بواسطة: {r.beneficiary?.full_name || '—'}</p>
                                                        </div>
                                                        <StatusBadge status={r.status} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ════════════ USERS TAB ══════════════════════════════════ */}
                {activeTab === 'users' && (
                    <motion.div key="users" variants={containerVariants} initial="hidden" animate="visible" className="flex-1 w-full max-w-7xl mx-auto">
                        <motion.div variants={itemVariants} className="mb-6">
                            <h2 className="text-2xl font-black text-white mb-1">إدارة المستخدمين</h2>
                            <p className="text-sm text-gray-400">مراقبة وتعديل حالات جميع الحسابات.</p>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-0" className="overflow-hidden">
                                {/* Toolbar */}
                                <div className="px-6 py-4 border-b border-glass-border flex flex-col lg:flex-row lg:items-center gap-3">
                                    <div className="relative flex-[2]">
                                        <input type="text" placeholder="ابحث بالاسم أو البريد..." value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className={`${tabularInputClass} w-full pe-11 ps-4`} />
                                        <Search className="w-5 h-5 text-gray-500 absolute end-4 top-3" />
                                    </div>
                                    <FilterDropdown
                                        value={roleFilter}
                                        onChange={v => { setRoleFilter(v); setPage(1); }}
                                        placeholder="كل الأدوار"
                                        icon={Users}
                                        options={[
                                            { value: '', label: 'كل الأدوار' },
                                            { value: 'beneficiary', label: 'مستفيد' },
                                            { value: 'volunteer', label: 'متطوع' },
                                            { value: 'admin', label: 'مسؤول' },
                                        ]}
                                    />
                                    <FilterDropdown
                                        value={statusFilter}
                                        onChange={v => { setStatusFilter(v); setPage(1); }}
                                        placeholder="كل الحالات"
                                        icon={Activity}
                                        options={[
                                            { value: '', label: 'كل الحالات' },
                                            { value: 'active', label: 'نشط' },
                                            { value: 'flagged', label: 'مراقب' },
                                            { value: 'suspended', label: 'موقوف' },
                                        ]}
                                    />
                                </div>

                                {/* Table */}
                                {loadingUsers ? (
                                    <div className="p-6">
                                        <Skeleton variant="list" count={5} height="60px" />
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="py-20">
                                        <EmptyState icon={Users} title="لا توجد نتائج" subtitle="جرب تغيير كلمات البحث أو الفلاتر" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-start text-sm">
                                            <thead className="bg-glass-light border-b border-glass-border">
                                                <tr className="text-gray-400">
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-start">المستخدم</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-start">الدور</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-start">الحالة</th>
                                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-start">تاريخ التسجيل</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-glass-light/50">
                                                {users.map(u => (
                                                    <tr key={u.id} className="hover:bg-glass-light/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar name={u.full_name} size="sm" />
                                                                <div>
                                                                    <p className="font-bold text-white">{u.full_name}</p>
                                                                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border
                                                                ${u.role === 'volunteer' ? 'bg-royal-600/15 text-royal-400 border-royal-500/20' :
                                                                    u.role === 'admin' ? 'bg-[#7C3AED]/15 text-[#A78BFA] border-[#7C3AED]/20' :
                                                                        'bg-success-500/15 text-success-400 border-success-500/20'}`}>
                                                                {u.role === 'volunteer' ? 'متطوع' : u.role === 'admin' ? 'مدير' : 'مستفيد'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {u.role === 'admin'
                                                                ? <StatusBadge status={u.status} type="user" />
                                                                : <StatusMenu userId={u.id} currentStatus={u.status} onUpdate={handleStatusUpdate} />
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                                            {new Date(u.createdAt || u.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {!loadingUsers && usersMeta.total > 0 && (
                                    <div className="px-6 py-4 border-t border-glass-border bg-glass-light/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                                        <p className="text-gray-400 text-center sm:text-start">
                                            إجمالي <span className="font-black text-white">{usersMeta.total}</span> مستخدم
                                            {usersMeta.totalPages > 1 && <> | صفحة <span className="text-white font-bold">{page}</span> من <span className="text-white font-bold">{usersMeta.totalPages}</span></>}
                                        </p>
                                        {usersMeta.totalPages > 1 && (
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-glass-light border border-glass-border rounded-lg text-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-glass-heavy hover:text-white transition-all shadow-sm">السابق</button>
                                                <button disabled={page >= usersMeta.totalPages} onClick={() => setPage(p => p + 1)}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-glass-light border border-glass-border rounded-lg text-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-glass-heavy hover:text-white transition-all shadow-sm">التالي</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </motion.div>
                )}

                {/* ════════════ SOS TAB ════════════════════════════════════ */}
                {activeTab === 'sos' && (
                    <motion.div key="sos" variants={containerVariants} initial="hidden" animate="visible" className="flex-1 w-full max-w-4xl mx-auto">
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    نداءات الاستغاثة
                                    {activeAlerts.length > 0 && <span className="bg-danger-500 text-white text-sm px-3 py-1 rounded-full animate-bounce shadow-glow-sm">{activeAlerts.length}</span>}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">المتابعة الفورية والتدخل السريع.</p>
                            </div>
                            <Button onClick={() => fetchAlerts(false)} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>تحديث</Button>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-0" className="overflow-hidden">
                                {loadingAlerts ? (
                                    <div className="p-8">
                                        <Skeleton variant="card" height="150px" className="mb-4" />
                                        <Skeleton variant="card" height="150px" />
                                    </div>
                                ) : activeAlerts.length === 0 ? (
                                    <div className="py-24">
                                        <EmptyState
                                            icon={ShieldAlert}
                                            title="النظام مستقر وآمن"
                                            subtitle="لا توجد نداءات استغاثة نشطة حالياً."
                                            action={<p className="text-xs text-royal-400 bg-royal-600/10 border border-royal-500/20 px-3 py-1.5 rounded-full">تحديث تلقائي كل {POLL_INTERVAL / 1000} ثوانٍ</p>}
                                        />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-glass-light/50">
                                        {activeAlerts.map((alert, idx) => (
                                            <motion.div
                                                key={alert.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-danger-500/5 hover:bg-danger-500/10 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-danger-500/20 border border-danger-500/30 flex items-center justify-center text-danger-400 flex-shrink-0 relative glow-border-sm">
                                                        <span className="absolute -top-1 -end-1 flex h-3 w-3">
                                                            <span className="animate-ping absolute h-full w-full rounded-full bg-danger-400 opacity-75" />
                                                            <span className="relative rounded-full h-3 w-3 bg-danger-500" />
                                                        </span>
                                                        <ShieldAlert className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-white">{alert.User?.full_name || 'مستخدم غير معروف'}</h3>
                                                        <div className="flex flex-wrap gap-3 mt-2">
                                                            {alert.User?.phone && (
                                                                <span className="text-sm text-gray-300 flex items-center gap-1.5 bg-glass-light px-3 py-1 rounded-lg border border-glass-border">
                                                                    <Phone className="w-3.5 h-3.5" />{alert.User.phone}
                                                                </span>
                                                            )}
                                                            {alert.latitude && alert.longitude && (
                                                                <a href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`} target="_blank" rel="noreferrer"
                                                                    className="text-sm text-royal-400 flex items-center gap-1.5 bg-royal-600/15 hover:bg-royal-600/30 border border-royal-500/30 px-3 py-1 rounded-lg transition-colors">
                                                                    <MapPin className="w-3.5 h-3.5" />عرض الموقع
                                                                </a>
                                                            )}
                                                        </div>
                                                        {alert.message && (
                                                            <p className="text-sm text-danger-200 bg-danger-500/10 border border-danger-500/30 px-4 py-2.5 rounded-xl mt-3 font-medium">
                                                                {alert.message}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />{new Date(alert.createdAt || alert.created_at).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button onClick={() => handleResolve(alert.id)} disabled={resolvingId === alert.id}
                                                    className="md:w-auto w-full"
                                                    variant="primary"
                                                    icon={resolvingId === alert.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}>
                                                    {resolvingId === alert.id ? 'جاري التنفيذ...' : 'تأكيد الحل'}
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </motion.div>
                )}

                {/* ════════════ VERIFICATION TAB ════════════════════════════ */}
                {activeTab === 'verification' && (
                    <motion.div key="verification" variants={containerVariants} initial="hidden" animate="visible" className="flex-1 w-full max-w-5xl mx-auto">
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    طلبات التوثيق (KYC)
                                    {verifications.length > 0 && <span className="bg-warning-500 text-white text-sm px-3 py-1 rounded-full shadow-glow-sm">{verifications.length}</span>}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">مراجعة هويات المستخدمين للحفاظ على أمان المنصة.</p>
                            </div>
                            <Button onClick={() => fetchVerifications(false)} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>تحديث</Button>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card variant="glass" padding="p-0" className="overflow-hidden">
                                {loadingVerifications ? (
                                    <div className="p-8"><Skeleton variant="card" height="150px" /></div>
                                ) : verifications.length === 0 ? (
                                    <div className="py-24">
                                        <EmptyState
                                            icon={ShieldCheck}
                                            title="لا توجد طلبات معلقة"
                                            subtitle="جميع حسابات المستخدمين الحالية تمت مراجعتها."
                                        />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-glass-light/50">
                                        {verifications.map((v, idx) => (
                                            <motion.div
                                                key={v.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:bg-glass-light/50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedVerification(v)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar name={v.full_name} size="md" />
                                                    <div>
                                                        <h3 className="font-bold text-white flex items-center gap-2">
                                                            {v.full_name}
                                                            <span className="text-[10px] bg-warning-500/20 text-warning-400 px-2 py-0.5 rounded-full border border-warning-500/30">تحتاج للمراجعة</span>
                                                        </h3>
                                                        <p className="text-xs text-gray-400 mt-1">{v.email} • {v.role === 'volunteer' ? 'متطوع' : 'مستفيد'}</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedVerification(v); }}
                                                    variant="primary" 
                                                    className="md:w-auto w-full"
                                                >
                                                    مراجعة المستندات
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </main>

            {/* KYC Review Modal */}
            <AnimatePresence>
                {selectedVerification && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-navy-950/90 backdrop-blur-md z-[70] p-4 flex items-center justify-center overflow-y-auto"
                            onClick={() => setSelectedVerification(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                className="w-full max-w-4xl glass-heavy border border-glass-border rounded-2xl shadow-glow-xl overflow-hidden my-8"
                            >
                                <div className="p-6 border-b border-glass-border flex justify-between items-center bg-glass-light/30">
                                    <div className="flex items-center gap-4">
                                        <Avatar name={selectedVerification.full_name} size="md" />
                                        <div>
                                            <h2 className="text-xl font-black text-white">{selectedVerification.full_name}</h2>
                                            <p className="text-sm text-gray-400">طلب توثيق الهوية</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedVerification(null)} className="p-2 bg-glass-light hover:bg-glass-medium border border-glass-border rounded-xl text-gray-400 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-navy-900/50">
                                    {[
                                        { title: 'وجه البطاقة', url: selectedVerification.id_card_front },
                                        { title: 'ظهر البطاقة', url: selectedVerification.id_card_back },
                                        { title: 'سيلفي الهوية', url: selectedVerification.id_selfie }
                                    ].map((doc, i) => (
                                        <div key={i} className="flex flex-col gap-3">
                                            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                                <FileImage className="w-4 h-4 text-royal-400" /> {doc.title}
                                            </h4>
                                            <div className="aspect-[4/3] bg-glass-heavy border border-glass-border rounded-xl overflow-hidden relative group">
                                                <img src={process.env.REACT_APP_API_URL?.replace('/api', '') + doc.url} alt={doc.title} className="w-full h-full object-cover" />
                                                <a href={process.env.REACT_APP_API_URL?.replace('/api', '') + doc.url} target="_blank" rel="noreferrer" 
                                                   className="absolute inset-0 bg-navy-900/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
                                                    <ExternalLink className="w-8 h-8 text-white mb-2" />
                                                    <span className="text-white font-bold text-sm">عرض بالحجم الكامل</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 border-t border-glass-border flex flex-col sm:flex-row gap-4 justify-end bg-glass-light/30">
                                    <Button
                                        onClick={() => handleVerificationReview(selectedVerification.id, 'reject')}
                                        disabled={reviewingId === selectedVerification.id}
                                        loading={reviewingId === selectedVerification.id}
                                        variant="danger"
                                        icon={<XCircle className="w-5 h-5" />}
                                    >
                                        رفض التوثيق
                                    </Button>
                                    <Button
                                        onClick={() => handleVerificationReview(selectedVerification.id, 'accept')}
                                        disabled={reviewingId === selectedVerification.id}
                                        loading={reviewingId === selectedVerification.id}
                                        icon={<ShieldCheck className="w-5 h-5" />}
                                        className="bg-success-500 hover:bg-success-600 border-success-400 text-white"
                                    >
                                        تأكيد الحساب
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}