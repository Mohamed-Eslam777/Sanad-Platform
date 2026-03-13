/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ChatModal — Premium Glassmorphism Chat Room (Real-Time via Socket.io)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Loader2, AlertTriangle, Paperclip, Smile, MoreVertical, CheckCheck, Check, Mic, FileText, Play, Square, Trash2, Download } from 'lucide-react';
import CustomAudioPlayer from './common/CustomAudioPlayer';
import api from '../services/api';
import { getSocket } from '../services/socketService';
import ConfirmCompletionModal from './requests/ConfirmCompletionModal';
import { requestCompletion, confirmCompletion } from '../services/requestService';
import { toast } from 'react-toastify';

// Helper to get absolute upload URL
const getUploadUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
};

/* ─── Role-based avatar initials & gradient ───────────────────────────────── */
function Avatar({ name, isOwn }) {
    const initials = name ? name.charAt(0) : '؟';
    return (
        <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-soft border
        ${isOwn
                    ? 'bg-gradient-to-br from-royal-500 to-royal-700 text-white border-royal-400/50'
                    : 'bg-gradient-to-br from-gray-600 to-gray-800 text-gray-200 border-glass-border'
                }`}
        >
            {initials}
        </div>
    );
}

/* ─── Chat Bubble ─────────────────────────────────────────────────────────── */
function Bubble({ msg, isOwn, senderName }) {
    const timeStr = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
            <Avatar name={senderName} isOwn={isOwn} />

            <div className={`flex flex-col gap-1 max-w-[68%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Sender name */}
                <span className="text-[10px] font-bold text-gray-500 px-1">{senderName}</span>

                {/* Bubble */}
                <div
                    className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-soft
            ${isOwn
                            ? 'bg-gradient-to-br from-royal-600 to-royal-700 text-white border border-royal-500/40 rounded-2xl rounded-ee-sm shadow-glow-sm'
                            : 'bg-white/5 border border-white/10 text-gray-100 backdrop-blur-sm rounded-2xl rounded-es-sm'
                        }`}
                >
                    {/* Micro-texture overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    
                    {/* Attachment Rendering */}
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

                {/* Timestamp + read tick (own messages only) */}
                <span className={`text-[10px] font-semibold px-1 flex items-center ${isOwn ? 'justify-end text-royal-300/60' : 'justify-start text-gray-600'}`}>
                    {timeStr}
                    {isOwn && <ReadTick msg={msg} />}
                </span>
            </div>
        </motion.div>
    );
}

/* ─── Read-receipt tick icon ──────────────────────────────────────────────── */
// isOwn=true messages only show ticks; other-party messages don't need them.
function ReadTick({ msg }) {
    if (msg._optimistic) {
        // Sending in progress — single grey clock-like tick
        return <Check className="w-3 h-3 inline-block ml-1" style={{ color: 'rgba(156,163,175,0.5)' }} />;
    }
    if (msg.is_read) {
        // Double blue tick — the other party has read this
        return <CheckCheck className="w-3.5 h-3.5 inline-block ml-1" style={{ color: '#60a5fa' }} />;
    }
    // Double grey tick — delivered, not yet read
    return <CheckCheck className="w-3.5 h-3.5 inline-block ml-1" style={{ color: 'rgba(156,163,175,0.55)' }} />;
}

function TypingIndicator({ name }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex items-end gap-2.5"
        >
            <div className="w-8 h-8 rounded-full bg-glass-light border border-glass-border flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-400">؟</span>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl rounded-es-sm px-4 py-3 shadow-soft">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold">{name} يكتب</span>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="w-1.5 h-1.5 bg-royal-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Divider with Date ─────────────────────────────────────────────────────── */
function DateDivider({ label }) {
    return (
        <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-glass-border" />
            <span className="text-[10px] font-bold text-gray-600 bg-glass-light px-3 py-1 rounded-full border border-glass-border">
                {label}
            </span>
            <div className="flex-1 h-px bg-glass-border" />
        </div>
    );
}

/* ─── ChatModal ────────────────────────────────────────────────────────────── */
function ChatModal({ isOpen, onClose, requestId, requestType, requestStatus, otherPartyRole, currentUserId, currentUserName, otherPartyName, onStatusChange }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [typingUser, setTypingUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Attachments & Audio state
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    // Keep requestId stable in callbacks without re-subscribing
    const requestIdRef = useRef(requestId);
    useEffect(() => { requestIdRef.current = requestId; }, [requestId]);

    // Two-Step Completion State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);

    const myName = currentUserName || 'أنا';
    const theirName = otherPartyName || (otherPartyRole === 'volunteer' ? 'المتطوع' : 'المستفيد');
    const partyLabel = otherPartyRole === 'volunteer' ? '🤝 المتطوع' : '🙋 المستفيد';

    const scrollToBottom = useCallback(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get(`/messages/${requestId}`);
            setMessages(res.data.data || []);
            setLoadError(false);
        } catch {
            setLoadError(true);
        } finally {
            setInitializing(false);
        }
    }, [requestId]);

    // Emits mark_messages_read so all unread messages from the other party get ticked blue
    const markRead = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || !socket.connected || !requestIdRef.current) return;
        socket.emit('mark_messages_read', { requestId: requestIdRef.current });
    }, []);

    useEffect(() => {
        if (!isOpen || !requestId) return;

        setMessages([]);
        setInput('');
        setSelectedFile(null);
        setAudioBlob(null);
        setIsRecording(false);
        setLoadError(false);
        setInitializing(true);
        setTypingUser(null);

        fetchHistory();

        const socket = getSocket();
        socketRef.current = socket;

        if (!socket) return;

        socket.emit('join_room', requestId);
        setIsConnected(socket.connected);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const onReceiveMessage = (msg) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m.id === msg.id);
                if (exists) return prev;
                const withoutOptimistic = prev.filter(
                    (m) => !(m._optimistic && m.sender_id === msg.sender_id && m.content === msg.content),
                );
                return [...withoutOptimistic, msg];
            });
            // If we are the recipient (other party sent this), mark it read immediately
            if (msg.sender_id !== currentUserId) {
                markRead();
            }
        };

        // When the other party reads our messages, flip is_read on our local copies
        const onMessagesRead = ({ senderIdOfReadMessages }) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.sender_id === senderIdOfReadMessages && !m.is_read
                        ? { ...m, is_read: true }
                        : m
                )
            );
        };

        const onTyping = ({ name }) => setTypingUser(name);
        const onStopTyping = () => setTypingUser(null);
        const onError = ({ message }) => console.error('[Socket] Error:', message);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_message', onReceiveMessage);
        socket.on('messages_read', onMessagesRead);
        socket.on('typing', onTyping);
        socket.on('stop_typing', onStopTyping);
        socket.on('error_message', onError);

        setTimeout(() => inputRef.current?.focus(), 200);

        return () => {
            socket.emit('leave_room', requestId);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receive_message', onReceiveMessage);
            socket.off('messages_read', onMessagesRead);
            socket.off('typing', onTyping);
            socket.off('stop_typing', onStopTyping);
            socket.off('error_message', onError);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [isOpen, requestId, fetchHistory, currentUserId, markRead]);

    // After history loads, mark any unread messages from the other party as read
    useEffect(() => {
        if (!initializing && messages.length > 0) {
            markRead();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initializing]);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const emitTyping = () => {
        const socket = socketRef.current;
        if (!socket) return;
        socket.emit('typing', { requestId });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { requestId });
        }, 2000);
    };

    // ── Two-Step Request Completion ──────────────────────────────────────────
    const handleRequestCompletion = async () => {
        if (isStatusUpdating) return;
        setIsStatusUpdating(true);
        try {
            await requestCompletion(requestId);
            if (onStatusChange) onStatusChange(requestId, 'completion_requested');
        } catch (error) {
            console.error('Error requesting completion', error);
            alert('حدث خطأ أثناء طلب إنهاء المهمة');
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const handleConfirmCompletion = async ({ rating, comment }) => {
        setIsStatusUpdating(true);
        try {
            await confirmCompletion(requestId, { rating, comment });
            setIsConfirmModalOpen(false);
            if (onStatusChange) onStatusChange(requestId, 'completed');
            // Close the chat modal as the task is finished
            setTimeout(onClose, 500); 
        } catch (error) {
            console.error('Error confirming completion', error);
            alert('حدث خطأ أثناء تأكيد الإتمام');
        } finally {
            setIsStatusUpdating(false);
        }
    };

    // ── Audio Recording Logic ───────────────────────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied or unsupported", err);
            alert("يرجى السماح بالوصول إلى الميكروفون لتسجيل الصوت.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setAudioBlob(null);
        clearInterval(recordingIntervalRef.current);
    };

    // ── File Selection ────────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.');
            return;
        }
        setSelectedFile(file);
        setAudioBlob(null); // Clear audio if file is selected
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // ── Sending Logic ─────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e?.preventDefault();
        const trimmed = input.trim();
        // Allow send if there is text, OR a file, OR an audio blob
        if ((!trimmed && !selectedFile && !audioBlob) || sending) return;

        setSending(true);
        const socket = socketRef.current;
        if (socket) socket.emit('stop_typing', { requestId });

        let attachment_url = null;
        let attachment_type = null;

        // 1. Upload attachment first if present
        if (selectedFile || audioBlob) {
            try {
                const formData = new FormData();
                if (selectedFile) {
                    formData.append('attachment', selectedFile);
                } else if (audioBlob) {
                    formData.append('attachment', audioBlob, 'voice-note.webm');
                }

                const uploadRes = await api.post(`/messages/upload/${requestId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                attachment_url = uploadRes.data.data.attachment_url;
                attachment_type = uploadRes.data.data.attachment_type;
            } catch (err) {
                console.error("Upload failed", err);
                alert("فشل رفع المرفق. يرجى المحاولة مرة أخرى.");
                setSending(false);
                return;
            }
        }

        // 2. Emit the message
        const optimistic = {
            id: `opt-${Date.now()}`,
            sender_id: currentUserId,
            content: trimmed,
            attachment_url,
            attachment_type,
            created_at: new Date().toISOString(),
            _optimistic: true,
        };
        
        setMessages((prev) => [...prev, optimistic]);
        setInput('');
        setSelectedFile(null);
        setAudioBlob(null);

        if (socket && socket.connected) {
            socket.emit('send_message', { 
                requestId, 
                content: trimmed,
                attachment_url,
                attachment_type
            });
            setSending(false);
            inputRef.current?.focus();
        } else {
            try {
                const res = await api.post(`/messages/${requestId}`, { 
                    content: trimmed,
                    attachment_url,
                    attachment_type
                });
                setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? res.data.data : m)));
            } catch {
                setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            } finally {
                setSending(false);
                inputRef.current?.focus();
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        emitTyping();
    };

    return (
        <>
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="chat-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-xl"
                    />

                    {/* ── Modal ── */}
                    <motion.div
                        key="chat-modal"
                        initial={{ opacity: 0, y: 60, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none"
                    >
                        <div
                            dir="rtl"
                            className="pointer-events-auto w-full sm:max-w-[520px] h-[85vh] sm:h-[620px] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden relative"
                            style={{
                                background: 'linear-gradient(145deg, rgba(15,18,40,0.97) 0%, rgba(10,14,36,0.99) 100%)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                            }}
                        >
                            {/* Top gradient edge light */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal-400/60 to-transparent" />
                            {/* Subtle inner glow */}
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-royal-600/5 to-transparent pointer-events-none" />

                            {/* ── Header ── */}
                            <div className="relative flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-white/5">
                                {/* Left: title + status */}
                                <div className="flex items-center gap-3.5">
                                    {/* Icon orb */}
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.15))',
                                            border: '1px solid rgba(99,102,241,0.35)',
                                            boxShadow: '0 0 16px rgba(99,102,241,0.2)',
                                        }}
                                    >
                                        <MessageCircle className="w-5 h-5 text-royal-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-white tracking-wide">غرفة المحادثة</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500">{partyLabel}</span>
                                            {isConnected ? (
                                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    متصل
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-600 font-semibold">غير متصل</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: action buttons */}
                                <div className="flex items-center gap-2">
                                    {/* ── Dynamic Completion Verification Flow ── */}
                                    {requestStatus === 'accepted' || requestStatus === 'in_progress' ? (
                                        otherPartyRole === 'beneficiary' ? (
                                            // Volunteer Action
                                            <button
                                                onClick={handleRequestCompletion}
                                                disabled={isStatusUpdating}
                                                title="طلب إتمام الواجب"
                                                className="h-8 px-3 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors shadow-glow-sm disabled:opacity-50"
                                            >
                                                {isStatusUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 ml-1" />}
                                                <span className="text-xs font-bold">طلب إتمام المهمة</span>
                                            </button>
                                        ) : (
                                            // Beneficiary View (if no completion requested yet)
                                            <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-md">في انتظار أداء المتطوع...</span>
                                        )
                                    ) : requestStatus === 'completion_requested' ? (
                                        otherPartyRole === 'volunteer' ? (
                                            // Beneficiary Action (Needs to Confirm)
                                            <button
                                                onClick={() => setIsConfirmModalOpen(true)}
                                                className="h-8 px-3 rounded-lg flex items-center justify-center text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse"
                                            >
                                                <ShieldCheck className="w-4 h-4 ml-1" />
                                                <span className="text-xs font-black">تأكيد الإتمام والتقييم</span>
                                            </button>
                                        ) : (
                                            // Volunteer View (Waiting for beneficiary)
                                            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md shadow-glow-sm flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                في انتظار تأكيد المستفيد...
                                            </span>
                                        )
                                    ) : requestStatus === 'completed' ? (
                                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md shadow-glow-sm flex items-center gap-1">
                                            <CheckCheck className="w-3 h-3" />
                                            تم الإتمام المسبق
                                        </span>
                                    ) : null}

                                    <button
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-all group"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        aria-label="إغلاق"
                                    >
                                        <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Messages Area ── */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-5">
                                {initializing ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3">
                                        <Loader2 className="w-8 h-8 text-royal-400 animate-spin" />
                                        <p className="text-xs text-gray-600 font-semibold">جارٍ تحميل المحادثة...</p>
                                    </div>
                                ) : loadError ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center">
                                            <AlertTriangle className="w-7 h-7 text-danger-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-danger-400">تعذّر تحميل المحادثة</p>
                                            <p className="text-xs text-gray-600 mt-1">تحقق من اتصالك بالإنترنت</p>
                                        </div>
                                        <button
                                            onClick={fetchHistory}
                                            className="text-xs font-bold text-white bg-royal-600/30 hover:bg-royal-600/50 border border-royal-500/30 px-5 py-2 rounded-xl transition-all"
                                        >
                                            إعادة المحاولة
                                        </button>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
                                                border: '1px solid rgba(99,102,241,0.2)',
                                            }}
                                        >
                                            <MessageCircle className="w-8 h-8 text-royal-400/70" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-gray-400">لا توجد رسائل بعد</p>
                                            <p className="text-xs text-gray-600 mt-1">ابدأ المحادثة الآن بكل أمان وثقة</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <DateDivider label="اليوم" />
                                        {messages.map((msg) => {
                                            const isOwn = msg.sender_id === currentUserId;
                                            return (
                                                <Bubble
                                                    key={msg.id}
                                                    msg={msg}
                                                    isOwn={isOwn}
                                                    senderName={isOwn ? myName : theirName}
                                                />
                                            );
                                        })}
                                        <AnimatePresence>
                                            {typingUser && <TypingIndicator name={typingUser} />}
                                        </AnimatePresence>
                                        <div ref={bottomRef} className="h-2" />
                                    </>
                                )}
                            </div>

                            {/* ── Input Area ── */}
                            <div
                                className="px-4 py-4 flex-shrink-0 border-t border-white/5"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                                <form onSubmit={handleSend}>
                                    {/* Selected Attachment Preview */}
                                    <AnimatePresence>
                                        {(selectedFile || audioBlob) && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: 10, height: 0 }}
                                                className="mb-3 px-2 flex"
                                            >
                                                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-3 backdrop-blur-md">
                                                    {selectedFile ? (
                                                        <>
                                                            {selectedFile.type.startsWith('image/') ? (
                                                                <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-8 h-8 rounded object-cover" />
                                                            ) : (
                                                                <FileText className="w-5 h-5 text-royal-300" />
                                                            )}
                                                            <span className="text-xs text-white max-w-[120px] truncate" dir="ltr">{selectedFile.name}</span>
                                                        </>
                                                    ) : audioBlob ? (
                                                        <>
                                                            <Mic className="w-5 h-5 text-emerald-400" />
                                                            <span className="text-xs text-white">تسجيل صوتي ({Math.round(audioBlob.size / 1024)} KB)</span>
                                                        </>
                                                    ) : null}
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setSelectedFile(null); setAudioBlob(null); }}
                                                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-danger-500/20 text-gray-300 hover:text-danger-400 flex items-center justify-center transition-colors mr-2"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div
                                        className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all relative overflow-hidden"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {/* Attachments icon */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*,application/pdf,.doc,.docx"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isRecording || sending}
                                            className="text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors flex-shrink-0 p-1 mt-1"
                                            aria-label="إرفاق ملف"
                                        >
                                            <Paperclip className="w-4.5 h-4.5" />
                                        </button>

                                        {/* Text input */}
                                        {/* Input Box OR Recording UI */}
                                        {isRecording ? (
                                            <div className="flex-1 flex items-center justify-between bg-error-500/10 rounded-xl px-4 py-2 my-1 border border-danger-500/20">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-danger-500 animate-pulse" />
                                                    <span className="text-danger-400 text-sm font-semibold tracking-widest" dir="ltr">
                                                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-danger-300 font-medium">جارٍ التسجيل...</span>
                                                <button type="button" onClick={cancelRecording} className="text-danger-400 hover:text-danger-300 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <textarea
                                                ref={inputRef}
                                                rows={1}
                                                value={input}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                disabled={audioBlob !== null || sending}
                                                placeholder={audioBlob ? "أضف نصاً (اختياري)..." : "اكتب رسالتك هنا..."}
                                                className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-600 leading-relaxed py-1.5 mt-0.5 custom-scrollbar max-h-28 disabled:opacity-50"
                                                style={{ fontFamily: 'inherit' }}
                                            />
                                        )}

                                        {/* Emoji icon */}
                                        {/* Mic Icon */}
                                        {!input.trim() && !selectedFile && !isRecording && !audioBlob && (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className="text-gray-600 hover:text-emerald-400 transition-colors flex-shrink-0 p-1 mt-1"
                                                aria-label="تسجيل صوتي"
                                            >
                                                <Mic className="w-4.5 h-4.5" />
                                            </button>
                                        )}

                                        {/* Send button */}
                                        {/* Send/Stop Button */}
                                        {isRecording ? (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                className="flex-shrink-0 w-9 h-9 mt-0.5 rounded-xl flex items-center justify-center bg-danger-500 hover:bg-danger-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all"
                                            >
                                                <Square className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={(!input.trim() && !selectedFile && !audioBlob) || sending}
                                                className="flex-shrink-0 w-9 h-9 mt-0.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                                style={{
                                                    background: (input.trim() || selectedFile || audioBlob) && !sending
                                                        ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                                        : 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(99,102,241,0.4)',
                                                    boxShadow: (input.trim() || selectedFile || audioBlob) && !sending ? '0 0 16px rgba(99,102,241,0.35)' : 'none',
                                                }}
                                                aria-label="إرسال"
                                            >
                                                {sending
                                                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                    : <Send className="w-4 h-4 text-white -mt-0.5 ml-0.5" />
                                                }
                                            </button>
                                        )}
                                    </div>

                                    {/* Hint */}
                                    <p className="text-center text-[10px] text-gray-700 mt-2 font-medium">
                                        اضغط Enter للإرسال · Shift+Enter لسطر جديد
                                    </p>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        <ConfirmCompletionModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmCompletion}
            volunteerName={theirName}
            isSubmitting={isStatusUpdating}
        />
        </>
    );
};

export default ChatModal;
