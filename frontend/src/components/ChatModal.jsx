/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ChatModal — Premium Dark Glassmorphism (Real-Time via Socket.io)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Loader2, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socketService';

/* ═══════════════════════════════════════════════════════════════════════════
   Chat Bubble
   ═══════════════════════════════════════════════════════════════════════════ */
function Bubble({ msg, isOwn }) {
    const timeStr = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`} // Swapped for correct RTL layout
        >
            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-soft
          ${isOwn
                        ? 'rounded-br-sm bg-royal-600/90 text-white border border-royal-500/50 glow-border-sm'
                        : 'rounded-bl-sm bg-glass-light border border-glass-border text-gray-200'
                    }`}
            >
                <p className="break-words font-medium">{msg.content}</p>
                <p className={`text-[10px] mt-1.5 font-bold ${isOwn ? 'text-royal-200/80 text-end' : 'text-gray-500 text-start'}`}>
                    {timeStr}
                </p>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Typing Indicator
   ═══════════════════════════════════════════════════════════════════════════ */
function TypingIndicator({ name }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex justify-start"
        >
            <div className="bg-glass-light border border-glass-border rounded-2xl rounded-br-sm px-4 py-3 shadow-soft">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">{name} يكتب</span>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <span key={i}
                                className="w-1.5 h-1.5 bg-royal-400 rounded-full animate-bounce glow-border-sm"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ChatModal 
   ═══════════════════════════════════════════════════════════════════════════ */
function ChatModal({ isOpen, onClose, requestId, requestType, otherPartyRole, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [typingUser, setTypingUser] = useState(null);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, []);

    // ── Load initial messages from REST API (history) ───────────────────────
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

    // ── Connect socket + join room on open ──────────────────────────────────
    useEffect(() => {
        if (!isOpen || !requestId) return;

        // Reset state
        setMessages([]);
        setInput('');
        setLoadError(false);
        setInitializing(true);
        setTypingUser(null);

        // 1. Load chat history from REST
        fetchHistory();

        // 2. Connect to Socket.io
        const socket = getSocket();
        socketRef.current = socket;

        if (!socket) {
            console.warn('[ChatModal] Socket not available.');
            return;
        }

        // 3. Join the room
        socket.emit('join_room', requestId);

        // 4. Listen for real-time messages
        const onReceiveMessage = (msg) => {
            setMessages((prev) => {
                // Avoid duplicates (optimistic messages get replaced)
                const exists = prev.some(m => m.id === msg.id);
                if (exists) return prev;
                // Replace optimistic message if sender matches
                const withoutOptimistic = prev.filter(m => !(m._optimistic && m.sender_id === msg.sender_id && m.content === msg.content));
                return [...withoutOptimistic, msg];
            });
        };

        // 5. Typing indicator
        const onTyping = ({ name }) => {
            setTypingUser(name);
        };
        const onStopTyping = () => {
            setTypingUser(null);
        };

        // 6. Error handler
        const onError = ({ message }) => {
            console.error('[Socket] Error:', message);
        };

        socket.on('receive_message', onReceiveMessage);
        socket.on('typing', onTyping);
        socket.on('stop_typing', onStopTyping);
        socket.on('error_message', onError);

        // Focus input
        setTimeout(() => inputRef.current?.focus(), 200);

        // Cleanup: leave room + remove listeners
        return () => {
            socket.emit('leave_room', requestId);
            socket.off('receive_message', onReceiveMessage);
            socket.off('typing', onTyping);
            socket.off('stop_typing', onStopTyping);
            socket.off('error_message', onError);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [isOpen, requestId, fetchHistory]);

    // Auto-scroll on new messages
    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // ── Typing indicator emission ────────────────────────────────────────────
    const emitTyping = () => {
        const socket = socketRef.current;
        if (!socket) return;
        socket.emit('typing', { requestId });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { requestId });
        }, 2000);
    };

    // ── Send message via Socket.io (with optimistic UI) ─────────────────────
    const handleSend = async (e) => {
        e?.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const socket = socketRef.current;

        // Optimistic message for instant feedback
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

        // Clear typing indicator
        if (socket) {
            socket.emit('stop_typing', { requestId });
        }

        if (socket && socket.connected) {
            // Send via WebSocket (server persists and broadcasts)
            socket.emit('send_message', { requestId, content: trimmed });
            setSending(false);
            inputRef.current?.focus();
        } else {
            // Fallback: send via REST API if socket disconnected
            try {
                const res = await api.post(`/messages/${requestId}`, { content: trimmed });
                setMessages((prev) =>
                    prev.map((m) => (m.id === optimistic.id ? res.data.data : m))
                );
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

    const partyLabel = otherPartyRole === 'volunteer' ? '🤝 المتطوع' : '🙋 المستفيد';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="chat-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        key="chat-modal"
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
                    >
                        <div
                            dir="rtl"
                            className="pointer-events-auto w-full sm:max-w-lg h-[80vh] sm:h-[600px] flex flex-col glass-heavy rounded-t-3xl sm:rounded-3xl shadow-glow-xl overflow-hidden border border-glass-border relative"
                        >
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-royal-500 via-royal-400 to-transparent opacity-80 z-10" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 glass-light border-b border-glass-border flex-shrink-0 z-0 pt-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-royal-600/20 border border-royal-500/30 flex items-center justify-center glow-border-sm">
                                        <MessageCircle className="w-5 h-5 text-royal-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight">غرفة المحادثة</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-400">{partyLabel}</p>
                                            {socketRef.current?.connected && (
                                                <span className="flex items-center gap-1.5 text-[10px] text-success-400 font-bold bg-success-500/10 px-2 py-0.5 rounded-full border border-success-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse glow-border-sm" />
                                                    متصل
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-8 h-8 rounded-full glass hover:bg-glass-heavy flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-transparent hover:border-glass-border">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-4">
                                {initializing ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-royal-400 animate-spin" /></div>
                                ) : loadError ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 text-danger-400 bg-danger-500/5 rounded-2xl mx-4 p-8 border border-danger-500/20">
                                        <AlertTriangle className="w-10 h-10" />
                                        <p className="text-sm font-bold">تعذّر تحميل المحادثة</p>
                                        <button onClick={fetchHistory} className="text-xs bg-danger-500/20 hover:bg-danger-500/30 text-white px-4 py-2 rounded-xl transition-colors font-bold mt-2">إعادة المحاولة</button>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
                                        <MessageCircle className="w-12 h-12 text-gray-500" />
                                        <p className="text-gray-400 text-sm font-bold">لا توجد رسائل. ابدأ التواصل بحرية وامان!</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <Bubble key={msg.id} msg={msg} isOwn={msg.sender_id === currentUserId} />
                                        ))}
                                        <AnimatePresence>
                                            {typingUser && <TypingIndicator name={typingUser} />}
                                        </AnimatePresence>
                                        <div ref={bottomRef} className="h-1" />
                                    </>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 glass-light border-t border-glass-border flex-shrink-0">
                                <form onSubmit={handleSend} className="flex gap-3">
                                    <textarea
                                        ref={inputRef}
                                        rows={1}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="اكتب رسالة هنا..."
                                        className="flex-1 bg-glass-heavy border border-glass-border text-white rounded-xl px-4 py-3 text-sm focus:border-royal-400 focus:ring-4 focus:ring-royal-500/20 outline-none resize-none transition-all placeholder-gray-500 custom-scrollbar"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || sending}
                                        className="w-12 flex-shrink-0 bg-royal-600 hover:bg-royal-500 disabled:bg-glass-border disabled:text-gray-500 disabled:border-transparent border border-royal-500/50 text-white rounded-xl flex items-center justify-center transition-colors shadow-glow-sm focus:outline-none"
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
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
