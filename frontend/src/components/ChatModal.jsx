/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ChatModal — Premium Glassmorphism Chat Room (Real-Time via Socket.io)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Loader2, AlertTriangle, Paperclip, Smile, MoreVertical, CheckCheck, Check } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socketService';

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
                    <p className="break-words font-medium relative z-10">{msg.content}</p>
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
function ChatModal({ isOpen, onClose, requestId, requestType, otherPartyRole, currentUserId, currentUserName, otherPartyName }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [typingUser, setTypingUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    // Keep requestId stable in callbacks without re-subscribing
    const requestIdRef = useRef(requestId);
    useEffect(() => { requestIdRef.current = requestId; }, [requestId]);

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

    const handleSend = async (e) => {
        e?.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const socket = socketRef.current;

        const optimistic = {
            id: `opt-${Date.now()}`,
            sender_id: currentUserId,
            content: trimmed,
            created_at: new Date().toISOString(),
            _optimistic: true,
        };
        setMessages((prev) => [...prev, optimistic]);
        setInput('');
        setSending(true);

        if (socket) socket.emit('stop_typing', { requestId });

        if (socket && socket.connected) {
            socket.emit('send_message', { requestId, content: trimmed });
            setSending(false);
            inputRef.current?.focus();
        } else {
            try {
                const res = await api.post(`/messages/${requestId}`, { content: trimmed });
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
                                    <div
                                        className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {/* Attachments icon */}
                                        <button
                                            type="button"
                                            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 p-1"
                                            aria-label="إرفاق ملف"
                                        >
                                            <Paperclip className="w-4.5 h-4.5" />
                                        </button>

                                        {/* Text input */}
                                        <textarea
                                            ref={inputRef}
                                            rows={1}
                                            value={input}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="اكتب رسالتك هنا..."
                                            className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-600 leading-relaxed py-1.5 custom-scrollbar max-h-28"
                                            style={{ fontFamily: 'inherit' }}
                                        />

                                        {/* Emoji icon */}
                                        <button
                                            type="button"
                                            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 p-1"
                                            aria-label="إيموجي"
                                        >
                                            <Smile className="w-4.5 h-4.5" />
                                        </button>

                                        {/* Send button */}
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || sending}
                                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                            style={{
                                                background: input.trim() && !sending
                                                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                                    : 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(99,102,241,0.4)',
                                                boxShadow: input.trim() && !sending ? '0 0 16px rgba(99,102,241,0.35)' : 'none',
                                            }}
                                            aria-label="إرسال"
                                        >
                                            {sending
                                                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                : <Send className="w-4 h-4 text-white" />
                                            }
                                        </button>
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
    );
}

export default ChatModal;
