import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, MessageSquare, Mic, Cpu, FolderKanban, Brain, Terminal, Settings,
  Sparkles, Paperclip, ArrowUp, ChevronDown, Clock, X, Bell,
  Download, Cpu as CpuIcon, HardDrive, Wifi, Plus, Crown, ArrowRight,
  FileText, Lightbulb, Briefcase, Bot, User, Menu, ChevronLeft, ChevronRight,
  Search, Trash2, LogOut, RotateCcw, History
} from 'lucide-react';
import { aiAPI, chatAPI } from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../utils/cn';
import {
  AI_PROVIDERS, GROQ_MODELS, GEMINI_MODELS, getModelsByProvider,
} from '../../config/aiModels';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatErrorBoundary from '../../components/chat/ChatErrorBoundary';
import { saveAs } from 'file-saver';

// ============================================================
// 🔧 PARTICLE BACKGROUND
// ============================================================
const ParticleBackground = () => {
  const chars = ['0', '1', '<', '>', '{', '}', '[', ']', '+', '_', '/', '\\'];
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id:    i,
    char:  chars[Math.floor(Math.random() * chars.length)],
    size:  Math.random() * 8 + 8,
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    delay: Math.random() * 5,
    dur:   Math.random() * 15 + 15,
    opacity: Math.random() * 0.15 + 0.05
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none font-mono">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-neon-blue/30 animate-pulse"
          style={{
            fontSize:         `${p.size}px`,
            left:             `${p.x}%`,
            top:              `${p.y}%`,
            opacity:          p.opacity,
            animationDelay:   `${p.delay}s`,
            animationDuration:`${p.dur}s`,
          }}
        >
          {p.char}
        </div>
      ))}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-neon-blue/5 rounded-full blur-3xl" />
    </div>
  );
};

// ============================================================
// 🔮 DYNAMIC PURPLE GLASS ORB
// ============================================================
const PurpleGlassOrb = ({ isCompact }) => {
  return (
    <div className={`absolute pointer-events-none transition-all duration-[1200ms] ease-expo ${
      isCompact
        ? 'top-4 right-28 w-36 h-36 opacity-20 blur-2xl scale-50'
        : 'top-[10%] left-1/2 -translate-x-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] opacity-75 z-0'
    }`}>
      {/* Background Glow Layer */}
      <motion.div
        animate={{
          borderRadius: [
            "45% 55% 70% 30% / 45% 45% 55% 55%",
            "70% 30% 55% 45% / 60% 40% 60% 40%",
            "45% 55% 70% 30% / 45% 45% 55% 55%"
          ],
          rotate: [0, 180, 360],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-tr from-neon-purple/20 via-neon-blue/15 to-transparent blur-3xl"
      />

      {/* Glass Body with Specular Highlights */}
      {!isCompact && (
        <motion.div
          animate={{
            borderRadius: [
              "50% 50% 48% 52% / 52% 48% 52% 48%",
              "48% 52% 50% 50% / 50% 50% 48% 52%",
              "50% 50% 48% 52% / 52% 48% 52% 48%"
            ],
            rotate: [360, 180, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-8 bg-gradient-to-br from-white/5 via-neon-purple/10 to-neon-blue/5 rounded-full border border-neon-purple/20 backdrop-blur-[6px] shadow-[inset_0_4px_20px_rgba(255,255,255,0.1),0_20px_60px_rgba(138,43,226,0.15)] flex items-center justify-center overflow-hidden"
        >
          {/* Specular glass reflection streak */}
          <div className="absolute top-6 left-12 w-64 h-32 bg-gradient-to-b from-white/10 to-transparent rounded-full transform -rotate-12 blur-[2px]" />
          
          {/* Internal Energy core */}
          <div className="absolute w-40 h-40 bg-gradient-to-tr from-neon-purple/20 to-neon-blue/20 rounded-full filter blur-2xl animate-pulse" />
        </motion.div>
      )}
    </div>
  );
};

// ============================================================
// 🔧 SYSTEM STATUS PANEL
// ============================================================
const SystemStatusPanel = ({ provider, model, messageCount }) => {
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const t = setInterval(() => {
      setLatency(Math.round(Math.min(200, Math.max(15,
        latency + (Math.random() - 0.5) * 12
      ))));
    }, 3000);
    return () => clearInterval(t);
  }, [latency]);

  const storagePercent = 45;
  const dailyMax       = 500;
  const dailyPercent   = Math.min((messageCount / dailyMax) * 100, 100);

  const modelDisplay = model?.includes('gemini')
    ? 'Gemini Flash'
    : 'Llama 3.3 70B';

  return (
    <div className="flex flex-col gap-4 w-full text-white">
      <p className="text-[9px] font-orbitron font-black tracking-[0.25em] text-neon-blue/60 uppercase px-1">
        System Status
      </p>

      {/* AI Engine */}
      <div className="relative bg-[#050811]/90 border border-white/5 rounded-2xl p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-neon-blue/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center flex-shrink-0">
            <CpuIcon size={14} className="text-neon-blue" />
          </div>
          <p className="text-[11px] font-orbitron font-black text-white uppercase tracking-wider">AI Engine</p>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-bold font-mono">UPLINK_OK</span>
          </div>
        </div>
        <p className="text-[12px] text-gray-300 font-mono font-semibold mb-2">{modelDisplay}</p>
        <div className="space-y-1.5 pt-2 border-t border-white/5 font-mono text-[9px]">
          <div className="flex justify-between">
            <span className="text-gray-500">PROVIDER</span>
            <span className="text-neon-blue font-bold uppercase">
              {provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">LATENCY</span>
            <span className="text-neon-blue font-bold">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="relative bg-[#050811]/90 border border-white/5 rounded-2xl p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-neon-purple/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center flex-shrink-0">
            <HardDrive size={14} className="text-neon-purple" />
          </div>
          <p className="text-[11px] font-orbitron font-black text-white uppercase tracking-wider">Workspace Storage</p>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2 relative shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-700 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px]">
          <span className="text-neon-purple font-bold">{storagePercent}% USED</span>
          <span className="text-gray-500">1.0 GB MAX</span>
        </div>
      </div>

      {/* Daily Usage */}
      <div className="relative bg-[#050811]/90 border border-white/5 rounded-2xl p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-neon-pink/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center flex-shrink-0">
            <CpuIcon size={14} className="text-neon-pink" />
          </div>
          <p className="text-[11px] font-orbitron font-black text-white uppercase tracking-wider">Daily Usage</p>
        </div>
        <div className="flex items-end gap-1 mb-0.5 font-mono">
          <span className="text-3xl font-black text-white leading-none tracking-tighter">{messageCount}</span>
          <span className="text-xs text-gray-500 mb-1">/ {dailyMax}</span>
        </div>
        <p className="text-[9px] text-gray-500 tracking-widest font-orbitron mb-2.5">COGNITIVE SYMBOLS</p>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-purple transition-all duration-700 shadow-[0_0_10px_rgba(255,0,200,0.4)]"
            style={{ width: `${dailyPercent}%` }}
          />
        </div>
      </div>

      {/* Connection */}
      <div className="bg-[#050811]/90 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Wifi size={14} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-orbitron font-bold text-white uppercase tracking-wider">Connected</p>
            <p className="text-[9px] text-emerald-400 font-mono font-semibold">STREAM_READY</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-[0_0_8px_#34d399]" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 CHAT HISTORY ITEM
// ============================================================
const ChatHistoryItem = ({ chat, isActive, onClick, onDelete }) => {
  const modelTag = chat.model?.toLowerCase()?.includes('gemini') ? 'GEMINI' : 'GROQ';

  return (
    <div
      onClick={onClick}
      className={`
        group relative flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5
        cursor-pointer transition-all duration-200 border
        ${isActive
          ? 'bg-neon-purple/10 border-neon-purple/30 text-white shadow-[inset_0_0_10px_rgba(138,43,226,0.1)]'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-300 border-transparent'
        }
      `}
    >
      <MessageSquare
        size={13}
        className={`flex-shrink-0 ${isActive ? 'text-neon-purple' : 'text-gray-500'}`}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[11px] font-medium truncate">
          {chat.title}
        </span>
        <span className={`text-[7.5px] font-orbitron font-bold tracking-wider mt-0.5 ${isActive ? 'text-neon-blue' : 'text-gray-600'}`}>
          [{modelTag}]
        </span>
      </div>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-neon-purple flex-shrink-0 shadow-[0_0_6px_#8A2BE2]" />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(chat._id); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-500/20 hover:text-rose-400 flex-shrink-0 transition-all"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// ============================================================
// 🔧 MESSAGE BUBBLE
// ============================================================
const MessageBubble = ({ message, onRetry }) => {
  const isUser = message.role === 'user';
  const time   = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 py-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(138,43,226,0.2)]">
          <Bot size={14} className="text-neon-purple" />
        </div>
      )}

      <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[78%] w-full`}>
        {/* Bubble */}
        {isUser ? (
          <div className="relative bg-gradient-to-br from-neon-blue/10 via-[#070b15]/90 to-transparent border border-neon-blue/30 rounded-2xl rounded-tr-sm px-4.5 py-3 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-blue/60" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-blue/60" />
            <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap break-words font-poppins">
              {message.content}
            </p>
          </div>
        ) : (
          <div className={`relative border rounded-2xl rounded-tl-sm px-4.5 py-3 w-full backdrop-blur-sm ${
            message.isError 
              ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
              : 'bg-[#040712]/60 border-neon-purple/20 shadow-[0_0_20px_rgba(138,43,226,0.03)]'
          }`}>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-purple/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-purple/50" />
            
            {!message.isError && message.content && (
              <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-white/5 select-none">
                <span className="font-orbitron text-[9px] tracking-wider text-neon-purple uppercase font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-ping shrink-0" />
                  HARVOX COGNITIVE FEED
                </span>
                <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                  SYS_LINK_OK
                </span>
              </div>
            )}

            {message.isError ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-xs sm:text-sm text-rose-400 font-semibold leading-relaxed font-mono">
                  {message.content}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 w-max bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-orbitron tracking-widest uppercase font-bold transition-all hover:scale-102"
                  >
                    <RotateCcw size={10} />
                    REGENERATE
                  </button>
                )}
              </div>
            ) : message.content ? (
              <div className="text-xs sm:text-sm prose-invert max-w-none break-words">
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  compact
                />
              </div>
            ) : (
              /* Typing dots */
              <div className="flex items-center gap-1.5 py-1">
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce"
                    style={{ animationDelay: `${j * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[8px] font-mono text-gray-600 mt-1 px-1">{time}</p>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(0,240,255,0.2)] border border-neon-blue/30">
          <User size={13} className="text-white" />
        </div>
      )}
    </div>
  );
};

// ============================================================
// 🚀 MAIN CHAT COMPONENT
// ============================================================
export default function Chat() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const initialFiredRef = useRef(false);

  const { user } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const userName = user?.name || 'Harvox';

  const [chats,        setChats]        = useState([]);
  const [activeChat,   setActiveChat]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [provider,     setProvider]     = useState(AI_PROVIDERS.GROQ);
  const [model,        setModel]        = useState('llama-3.3-70b-versatile');
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar,  setShowSidebar]  = useState(false); // Mobile sidebar drawer
  const [showSystem,   setShowSystem]   = useState(false); // System diagnostics panel
  const [showHistory,  setShowHistory]  = useState(false); // Chat History panel
  const [msgCount,     setMsgCount]     = useState(0);
  const [searchQuery,  setSearchQuery]  = useState('');

  // ── Load chat list ──
  useEffect(() => {
    chatAPI.list().then(({ data }) => setChats(data.chats || []));
  }, []);

  // ── Route state ──
  useEffect(() => {
    if (location.state?.chatId) loadChat(location.state.chatId);
  }, [location.state?.chatId]);

  useEffect(() => {
    const initial = location.state?.initialMessage;
    if (initial && !initialFiredRef.current) {
      initialFiredRef.current = true;
      handleSend(initial);
    }
  }, []);

  // ── Auto scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Message count ──
  useEffect(() => {
    setMsgCount(messages.filter((m) => m.role === 'user').length);
  }, [messages]);

  const loadChat = async (id) => {
    try {
      const { data } = await chatAPI.get(id);
      setActiveChat(data.chat);
      setMessages(data.chat.messages || []);
      setShowSidebar(false);
    } catch (err) {
      console.error('Load chat error:', err);
    }
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveChat(null);
    setMessages([]);
    setInput('');
    setLoading(false);
    setShowSidebar(false);
    inputRef.current?.focus();
  };

  const handleDeleteChat = async (id, e) => {
    e?.stopPropagation();
    try {
      await chatAPI.delete(id);
      setChats((prev) => prev.filter((x) => x._id !== id));
      if (activeChat?._id === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Delete chat error:', err);
    }
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Cancel any existing streaming request before initiating a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user',      content: msg },
      { role: 'assistant', content: '' },
    ]);

    try {
      await aiAPI.streamChat(
        { message: msg, chatId: activeChat?._id, provider, model },
        (parsed) => {
          if (parsed.content) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + parsed.content,
              };
              return updated;
            });
          }
          if (parsed.done) {
            if (parsed.chat) {
              setActiveChat(parsed.chat);
              if (parsed.chat.messages) {
                setMessages(parsed.chat.messages);
              }
            }
            chatAPI.list().then(({ data }) => setChats(data.chats || []));
          }
        },
        controller.signal
      );
    } catch (err) {
      if (err.name === 'AbortError') return;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: err.message || 'Something went wrong.',
          isError: true,
        };
        return updated;
      });
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMessage = messages[messages.length - 2];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      // Remove last assistant message
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastUserMessage.content);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const exportChat = () => {
    const text = messages
      .map((m) => `**${m.role.toUpperCase()}**\n${m.content}`)
      .join('\n\n---\n\n');
    saveAs(
      new Blob([text], { type: 'text/markdown' }),
      `harvox-chat-${Date.now()}.md`
    );
  };

  const filteredChats = chats.filter((c) =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="flex h-screen w-screen bg-[#030206] overflow-hidden text-white font-body relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(138, 43, 226, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(138, 43, 226, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px'
      }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setInput((prev) => `${prev}[Attached file: ${file.name}] `);
          }
        }}
        className="hidden"
      />

      {/* Overlay Background Particles */}
      <ParticleBackground />

      {/* DESKTOP SIDEBAR */}
      <Sidebar mobileOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* WRAPPER FOR CONTENT AND CHAT HISTORY */}
      <div className={cn(
        "flex flex-1 min-w-0 h-full transition-all duration-300",
        isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
      )}>
        {/* CHAT HISTORY PANEL (Slides out next to sidebar) */}
        {showHistory && (
          <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#06040a]/90 backdrop-blur-md flex-shrink-0 z-20 h-full animate-fade-in">
            <div className="flex flex-col h-full p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-orbitron font-black tracking-wider text-gray-500">CHAT HISTORY</span>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* New Chat Button */}
              <button
                onClick={() => {
                  handleNewChat();
                  setShowHistory(false);
                }}
                className="w-full py-2 px-4 rounded-xl font-orbitron font-bold text-xs text-white bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(138,43,226,0.35)]"
              >
                <Plus size={14} />
                New Chat
              </button>

              {/* Search bar */}
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-[#080b12]/60 border border-white/5 rounded-xl text-[11px] text-white outline-none focus:border-neon-purple/50 placeholder:text-gray-700 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Recent Chats List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
                {filteredChats.length === 0 ? (
                  <p className="text-[10px] text-gray-600 px-2 py-1 italic">
                    {searchQuery ? 'No matching chats.' : 'No chats yet.'}
                  </p>
                ) : (
                  filteredChats.map((c) => (
                    <ChatHistoryItem
                      key={c._id}
                      chat={c}
                      isActive={activeChat?._id === c._id}
                      onClick={() => {
                        loadChat(c._id);
                      }}
                      onDelete={(chatId) => handleDeleteChat(chatId)}
                    />
                  ))
                )}
              </div>
            </div>
          </aside>
        )}

        {/* CENTER CONTENT PANEL */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
          {/* Floating Purple Glass Orb */}
          <PurpleGlassOrb isCompact={messages.length > 0} />

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-20 border-b border-white/5 bg-black/20 gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 rounded-xl bg-[#130f22]/60 border border-white/5 text-gray-400 hover:text-white hover:bg-[#1c1633]/60 transition-colors"
                title="Open Sidebar"
              >
                <Menu size={16} />
              </button>
            </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {/* Export conversation */}
            {messages.length > 0 && (
              <button
                onClick={exportChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
                title="Export Conversation"
              >
                <Download size={12} />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                showHistory
                  ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40 shadow-[0_0_10px_rgba(138,43,226,0.3)]'
                  : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
              }`}
              title="Chat History"
            >
              <History size={12} className={showHistory ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Diagnostics toggle */}
            <button
              onClick={() => setShowSystem(!showSystem)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                showSystem
                  ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40 shadow-[0_0_10px_rgba(138,43,226,0.3)]'
                  : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
              }`}
              title="System Diagnostics"
            >
              <CpuIcon size={12} className={showSystem ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            {/* Profile badge */}
            <div 
              onClick={() => navigate('/app/profile')}
              className="flex items-center gap-2 bg-[#130f22]/60 hover:bg-[#1c1633]/60 cursor-pointer px-3.5 py-1.5 rounded-full border border-purple-500/10 transition-colors select-none"
            >
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-black text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] text-gray-300 font-semibold">{userName}</span>
              <ChevronDown size={12} className="text-gray-500" />
            </div>

            {/* Notification Badge */}
            <button className="w-8 h-8 rounded-full bg-[#130f22]/60 border border-purple-500/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
              <Bell size={14} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#a855f7] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            </button>
          </div>
        </header>

        {/* Messages Body */}
        {messages.length === 0 ? (
          /* Landing state */
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full relative z-10 select-none">
            <div className="text-center mb-10 mt-6 sm:mt-10 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-orbitron font-black text-white mb-2 tracking-wide">
                HEY, <span className="gradient-text">{userName}</span>
              </h1>
              <p className="text-sm font-semibold text-gray-500 font-mono tracking-widest uppercase">
                COGNITIVE MATRIX ONLINE. HOW CAN I HELP?
              </p>
            </div>

            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
              <div 
                onClick={() => setInput("Help me create a Presentation")}
                className="bg-[#050811]/60 backdrop-blur-md border border-neon-blue/20 rounded-2xl p-4 hover:border-neon-blue hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="text-neon-blue font-orbitron font-bold text-[9px] uppercase tracking-wider block">
                      Content Help
                    </span>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                      Create a Presentation
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20 flex-shrink-0">
                  <ArrowRight size={13} />
                </div>
              </div>

              <div 
                onClick={() => setInput("Help me ideas")}
                className="bg-[#050811]/60 backdrop-blur-md border border-neon-purple/20 rounded-2xl p-4 hover:border-neon-purple hover:shadow-[0_0_20px_rgba(138,43,226,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20">
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <span className="text-neon-purple font-orbitron font-bold text-[9px] uppercase tracking-wider block">
                      Suggestions
                    </span>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                      Generate ideas
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20 flex-shrink-0">
                  <ArrowRight size={13} />
                </div>
              </div>

              <div 
                onClick={() => setInput("Help me apply for job application")}
                className="bg-[#050811]/60 backdrop-blur-md border border-neon-pink/20 rounded-2xl p-4 hover:border-neon-pink hover:shadow-[0_0_20px_rgba(255,0,200,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center text-neon-pink border border-neon-pink/20">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <span className="text-neon-pink font-orbitron font-bold text-[9px] uppercase tracking-wider block">
                      Job Application
                    </span>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                      Apply for job
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-neon-pink/10 flex items-center justify-center text-neon-pink border border-neon-pink/20 flex-shrink-0">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="w-full max-w-3xl">
              {showSettings && (
                <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-[#050811]/90 backdrop-blur-md border border-neon-purple/30 rounded-2xl shadow-lg animate-fade-in">
                  <div>
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                      Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => {
                        setProvider(e.target.value);
                        setModel(
                          e.target.value === AI_PROVIDERS.GEMINI
                            ? GEMINI_MODELS[0].id
                            : GROQ_MODELS[0].id
                        );
                      }}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-neon-blue/50 cursor-pointer"
                    >
                      <option value={AI_PROVIDERS.GROQ}>⚡ Groq</option>
                      <option value={AI_PROVIDERS.GEMINI}>✨ Gemini</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-neon-blue/50 cursor-pointer"
                    >
                      {getModelsByProvider(provider).map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="relative bg-[#050811]/80 backdrop-blur-md border border-neon-purple/30 rounded-3xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.6),0_0_20px_rgba(138,43,226,0.15)] focus-within:border-neon-blue focus-within:shadow-[0_0_35px_rgba(0,240,255,0.15)] transition-all duration-300">
                <div className="flex items-center gap-1.5 text-neon-blue mb-2 px-1">
                  <Sparkles size={16} className="animate-pulse" />
                </div>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything....."
                  disabled={loading}
                  rows={1}
                  className="w-full bg-transparent px-1 py-1 text-sm sm:text-base text-white outline-none placeholder:text-gray-700 resize-none leading-relaxed font-poppins"
                  style={{ minHeight: '36px', maxHeight: '140px' }}
                />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-2 rounded-xl transition-all border ${
                        showSettings
                          ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40'
                          : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                      }`}
                      title="AI Settings"
                    >
                      <Settings size={12} />
                    </button>
                    <button
                      onClick={triggerFileSelect}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-[11px] text-gray-300 font-semibold rounded-full border border-white/5 transition-all"
                    >
                      <Paperclip size={12} className="text-neon-blue" />
                      Attach file
                    </button>
                  </div>

                  {loading ? (
                    <button
                      onClick={handleStop}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
                      title="Stop generating"
                    >
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-sm" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={loading || !input.trim()}
                      className={`
                        flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
                        ${input.trim() && !loading
                          ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(138,43,226,0.5)] hover:scale-105 active:scale-95'
                          : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <ArrowUp size={15} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat List */
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 z-10" style={{ scrollbarWidth: 'thin' }}>
            <div className="max-w-3xl mx-auto w-full">
              {messages.map((m, i) => (
                <ChatErrorBoundary key={i} compact>
                  <MessageBubble 
                    message={m} 
                    onRetry={
                      i === messages.length - 1 && m.isError 
                        ? () => handleRegenerate() 
                        : null
                    }
                  />
                </ChatErrorBoundary>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {/* Input Dock (when messages exist) */}
        {messages.length > 0 && (
          <footer className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md flex-shrink-0 z-20">
            <div className="max-w-3xl mx-auto w-full">
              {showSettings && (
                <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-[#050811]/90 backdrop-blur-md border border-neon-purple/30 rounded-2xl animate-fade-in">
                  <div>
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                      Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => {
                        setProvider(e.target.value);
                        setModel(
                          e.target.value === AI_PROVIDERS.GEMINI
                            ? GEMINI_MODELS[0].id
                            : GROQ_MODELS[0].id
                        );
                      }}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-neon-blue/50"
                    >
                      <option value={AI_PROVIDERS.GROQ} className="bg-black text-white">⚡ Groq</option>
                      <option value={AI_PROVIDERS.GEMINI} className="bg-black text-white">✨ Gemini</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-neon-blue/50"
                    >
                      {getModelsByProvider(provider).map((m) => (
                        <option key={m.id} value={m.id} className="bg-black text-white">{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="relative bg-[#050811]/80 backdrop-blur-md border border-neon-purple/30 rounded-2xl p-3 shadow-lg focus-within:border-neon-blue transition-all duration-300">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything....."
                  disabled={loading}
                  rows={1}
                  className="w-full bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-gray-700 resize-none leading-relaxed font-poppins"
                  style={{ minHeight: '32px', maxHeight: '120px' }}
                />

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-1.5 rounded-lg transition-all border ${
                        showSettings
                          ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40'
                          : 'text-gray-500 hover:text-white border-transparent'
                      }`}
                      title="AI Settings"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={triggerFileSelect}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 rounded-md transition-all border border-white/5"
                    >
                      <Paperclip size={10} className="text-neon-blue" />
                      Attach file
                    </button>
                  </div>

                  {loading ? (
                    <button
                      onClick={handleStop}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
                      title="Stop generating"
                    >
                      <div className="w-2 h-2 bg-rose-400 rounded-sm" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={loading || !input.trim()}
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full transition-all
                        ${input.trim() && !loading
                          ? 'bg-neon-purple text-white shadow-[0_0_12px_rgba(138,43,226,0.4)] hover:scale-105'
                          : 'bg-white/5 text-gray-600 cursor-not-allowed'
                        }
                      `}
                    >
                      <ArrowUp size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </footer>
        )}
      </main>
      </div>

      {/* SYSTEM DIAGNOSTICS DRAWER */}
      {showSystem && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 transition-opacity duration-300"
            onClick={() => setShowSystem(false)}
          />
          <div
            className="fixed inset-y-0 right-0 z-40 w-80 bg-[#09080d]/95 border-l border-purple-500/20 backdrop-blur-xl transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] translate-x-0"
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <span className="text-xs font-black tracking-wider text-gray-400">SYSTEM DIAGNOSTICS</span>
                <button
                  onClick={() => setShowSystem(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                <SystemStatusPanel
                  provider={provider}
                  model={model}
                  messageCount={msgCount}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}