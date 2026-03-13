/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AdminChatModal — Read-Only Chat Oversight for Admins
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FileText, Download, ShieldAlert } from 'lucide-react';
import CustomAudioPlayer from '../common/CustomAudioPlayer';
import { adminService } from '../../services/adminService';

const getUploadUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
};

function Avatar({ name, role }) {
    const initials = name ? name.charAt(0) : '؟';
    const isVolunteer = role === 'volunteer';
    return (
        <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-soft border
        ${isVolunteer
                    ? 'bg-gradient-to-br from-royal-500 to-royal-700 text-white border-royal-400/50'
                    : 'bg-gradient-to-br from-gray-600 to-gray-800 text-gray-200 border-glass-border'
                }`}
        >
            {initials}
        </div>
    );
}

function Bubble({ msg }) {
    const timeStr = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : '';

    const isVolunteer = msg.senderRole === 'volunteer';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`flex items-end gap-2.5 ${isVolunteer ? 'flex-row-reverse' : 'flex-row'}`}
        >
            <Avatar name={msg.senderName} role={msg.senderRole} />

            <div className={`flex flex-col gap-1 max-w-[68%] ${isVolunteer ? 'items-end' : 'items-start'}`}>
                {/* Sender name */}
                <span className="text-[10px] font-bold text-gray-500 px-1">{msg.senderName} ({isVolunteer ? 'متطوع' : 'مستفيد'})</span>

                {/* Bubble */}
                <div
                    className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-soft
            ${isVolunteer
                            ? 'bg-gradient-to-br from-royal-600 to-royal-700 text-white border border-royal-500/40 rounded-2xl rounded-ee-sm shadow-glow-sm'
                            : 'bg-white/5 border border-white/10 text-gray-100 backdrop-blur-sm rounded-2xl rounded-es-sm'
                        }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    
                    {msg.attachment_url && (
                        <div className="relative z-10 mb-2 mt-1">
                            {msg.attachment_type === 'image' && (
                                <a href={getUploadUrl(msg.attachment_url)} target="_blank" rel="noreferrer" className="block outline-none">
                                    <img 
                                        src={getUploadUrl(msg.attachment_url)} 
                                        alt="مرفق" 
                                        className="max-w-[200px] max-h-[200px] rounded-xl object-cover hover:opacity-90 transition-opacity border border-white/10" 
                                    />
                                </a>
                            )}
                            {msg.attachment_type === 'document' && (
                                <a 
                                    href={getUploadUrl(msg.attachment_url)} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 p-2.5 rounded-xl transition-colors min-w-[160px]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-royal-500/20 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-royal-200" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs font-semibold truncate text-white" dir="ltr">ملف مرفق</p>
                                    </div>
                                    <Download className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                </a>
                            )}
                            {msg.attachment_type === 'audio' && (
                                <CustomAudioPlayer src={getUploadUrl(msg.attachment_url)} />
                            )}
                        </div>
                    )}
                    
                    {msg.content && <p className="break-words font-medium relative z-10">{msg.content}</p>}
                </div>
                <span className="text-[10px] font-semibold px-1 text-gray-600">{timeStr}</span>
            </div>
        </motion.div>
    );
}

export default function AdminChatModal({ isOpen, onClose, request }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !request?.id) return;
        
        let mounted = true;
        setLoading(true);

        const fetchMessages = async () => {
            try {
                const res = await adminService.getRequestMessages(request.id);
                if (mounted) {
                    setMessages(res.data || []);
                }
            } catch (error) {
                console.error("Error fetching chat for admin:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchMessages();

        return () => { mounted = false; };
    }, [isOpen, request?.id]);

    useEffect(() => {
        if (!loading) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [messages, loading]);

    if (!isOpen) return null;

    const requestTitle = `مراقبة المحادثة: ${request.volunteer?.full_name || '؟'} & ${request.beneficiary?.full_name || '؟'}`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center sm:p-4 bg-[#0f1228]/95 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full sm:max-w-2xl h-[90vh] sm:h-[85vh] bg-[#1a1e36] border-t sm:border border-white/20 sm:rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <header className="px-5 py-4 border-b border-glass-border bg-glass-medium/30 flex items-center justify-between shadow-sm relative z-20 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-danger-500/20 border border-danger-500/30 flex items-center justify-center shadow-glow-sm">
                                <ShieldAlert className="w-6 h-6 text-danger-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">{requestTitle}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
                                    </span>
                                    <p className="text-xs font-bold text-danger-400">وضع القراءة فقط (للمديرين)</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-full text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </header>

                    {/* Chat Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-navy-900/50 custom-scrollbar relative z-10" dir="rtl">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-royal-400" />
                                <p className="text-sm font-semibold animate-pulse">جاري جلب سجل المحادثة...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="w-16 h-16 mb-4 bg-glass-border rounded-full flex items-center justify-center opacity-50">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <p className="font-semibold px-4 text-center leading-relaxed">
                                    لا توجد رسائل مسجلة في هذه المحادثة حتى الآن.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const showDate = index === 0; // Simple fallback
                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDate && (
                                            <div className="flex items-center gap-3 my-4">
                                                <div className="flex-1 h-px bg-glass-border" />
                                                <span className="text-[10px] font-bold text-gray-500 bg-glass-light px-3 py-1 rounded-full border border-glass-border">
                                                    بنية المحادثة
                                                </span>
                                                <div className="flex-1 h-px bg-glass-border" />
                                            </div>
                                        )}
                                        <Bubble msg={msg} />
                                    </React.Fragment>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Read-Only Footer Overlay */}
                    <div className="p-4 border-t border-glass-border bg-glass-heavy shrink-0 relative z-20 flex justify-center items-center h-16">
                        <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-gray-500" />
                            لا يمكنك إرسال رسائل. هذه المحادثة للمراقبة فقط.
                        </p>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
