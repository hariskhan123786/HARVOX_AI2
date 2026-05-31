import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Download, MessageSquare, Settings, Plus,
  Bot, User, Cpu, HardDrive, Activity,
  Wifi, Clock, X, Sparkles, ChevronDown,
  Menu, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { aiAPI, chatAPI } from '../../services/api';
import {
  AI_PROVIDERS, GROQ_MODELS, GEMINI_MODELS, getModelsByProvider,
} from '../../config/aiModels';
import ChatMessage from '../../components/chat/ChatMessage';
import { saveAs } from 'file-saver';

// ============================================================
// 🔧 PARTICLE BACKGROUND
// ============================================================
const ParticleBackground = () => {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id:    i,
    size:  Math.random() * 3 + 1,
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    delay: Math.random() * 5,
    dur:   Math.random() * 8 + 6,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-purple-500/20 animate-pulse"
          style={{
            width:            `${p.size}px`,
            height:           `${p.size}px`,
            left:             `${p.x}%`,
            top:              `${p.y}%`,
            animationDelay:   `${p.delay}s`,
            animationDuration:`${p.dur}s`,
          }}
        />
      ))}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-cyan-600/5 rounded-full blur-3xl" />
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
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <p className="text-[9px] font-black tracking-[0.25em] text-gray-500 uppercase px-1">
        System Status
      </p>

      {/* AI Engine */}
      <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Cpu size={14} className="text-cyan-400" />
          </div>
          <p className="text-[11px] font-black text-white">AI Engine</p>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] text-green-400 font-bold">Online</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-semibold mb-2">{modelDisplay}</p>
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="flex justify-between">
            <span className="text-[9px] text-gray-600">Provider</span>
            <span className="text-[9px] text-purple-400 font-bold capitalize">
              {provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] text-gray-600">Latency</span>
            <span className="text-[9px] text-cyan-400 font-bold">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <HardDrive size={14} className="text-purple-400" />
          </div>
          <p className="text-[11px] font-black text-white">Workspace Storage</p>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 transition-all duration-700"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-gray-600">{storagePercent}% used</span>
          <span className="text-[9px] text-gray-600">1GB max</span>
        </div>
      </div>

      {/* Daily Usage */}
      <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
            <Activity size={14} className="text-pink-400" />
          </div>
          <p className="text-[11px] font-black text-white">Daily Usage</p>
        </div>
        <div className="flex items-end gap-1 mb-0.5">
          <span className="text-3xl font-black text-white leading-none">{messageCount}</span>
          <span className="text-sm text-gray-600 mb-1">/ {dailyMax}</span>
        </div>
        <p className="text-[9px] text-gray-600 tracking-wider mb-2.5">AI INTERACTIONS</p>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-600 to-purple-500 transition-all duration-700"
            style={{ width: `${dailyPercent}%` }}
          />
        </div>
      </div>

      {/* Connection */}
      <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <Wifi size={14} className="text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white">Connected</p>
            <p className="text-[9px] text-gray-600">Stream Ready</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 EMPTY STATE
// ============================================================
const EmptyState = ({ onSuggestion }) => {
  const suggestions = [
    { icon: '🚀', text: 'Build a REST API with Node.js'    },
    { icon: '🐛', text: 'Debug my React useEffect hook'    },
    { icon: '📊', text: 'Explain Big O notation'           },
    { icon: '⚡', text: 'Optimize this SQL query'          },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 relative p-4">
      <ParticleBackground />

      {/* Icon */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <MessageSquare size={28} className="text-purple-400 sm:hidden" />
          <MessageSquare size={34} className="text-purple-400 hidden sm:block" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
          <Sparkles size={10} className="text-white" />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 text-center">
        <h3 className="text-lg sm:text-xl font-black text-white mb-2 tracking-wide">
          AI Chat
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
          Ask anything about coding, tech, or learning.
        </p>
      </div>

      {/* Suggestions Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="text-left px-3 py-2.5 bg-white/3 border border-white/8 rounded-xl text-[11px] text-gray-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-200 flex items-center gap-2"
          >
            <span className="flex-shrink-0">{s.icon}</span>
            <span className="truncate">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 🔧 CHAT HISTORY ITEM
// ============================================================
const ChatHistoryItem = ({ chat, isActive, onClick, onDelete }) => (
  <div
    onClick={onClick}
    className={`
      group relative flex items-center gap-2 w-full rounded-xl px-3 py-2.5
      cursor-pointer transition-all duration-200
      ${isActive
        ? 'bg-gradient-to-r from-purple-600/20 to-transparent border border-purple-500/30 text-white'
        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
      }
    `}
  >
    <MessageSquare
      size={12}
      className={`flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-gray-600'}`}
    />
    <span className="text-[11px] font-medium truncate flex-1 min-w-0">
      {chat.title}
    </span>
    {isActive && (
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
    )}
    <button
      onClick={(e) => { e.stopPropagation(); onDelete?.(chat._id); }}
      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 flex-shrink-0 transition-all"
    >
      <X size={10} />
    </button>
  </div>
);

// ============================================================
// 🔧 MESSAGE BUBBLE
// ============================================================
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const time   = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`flex gap-2 sm:gap-3 py-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={12} className="text-purple-400" />
        </div>
      )}

      <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[75%]`}>
        {/* Bubble */}
        {isUser ? (
          <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/20 border border-purple-500/20 rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2.5 sm:py-3 w-full">
            {message.content ? (
              <div className="text-xs sm:text-sm prose-invert max-w-none break-words">
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  compact
                />
              </div>
            ) : (
              /* Typing dots */
              <div className="flex items-center gap-1.5 py-0.5">
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${j * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[9px] text-gray-700 mt-1 px-1">{time}</p>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
          <User size={11} className="text-white" />
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
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  const [chats,        setChats]        = useState([]);
  const [activeChat,   setActiveChat]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [provider,     setProvider]     = useState(AI_PROVIDERS.GROQ);
  const [model,        setModel]        = useState('llama-3.3-70b-versatile');
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar,  setShowSidebar]  = useState(false);
  const [showSystem,   setShowSystem]   = useState(false);
  const [msgCount,     setMsgCount]     = useState(0);

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
    if (initial) handleSend(initial);
  }, []);

  // ── Auto scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Message count ──
  useEffect(() => {
    setMsgCount(messages.filter((m) => m.role === 'user').length);
  }, [messages]);

  // ── Close mobile panels on resize ──
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(false);
        setShowSystem(false);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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
    setActiveChat(null);
    setMessages([]);
    setInput('');
    setShowSidebar(false);
    inputRef.current?.focus();
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user',      content: msg },
      { role: 'assistant', content: '' },
    ]);

    try {
      await aiAPI.streamChat(
        { message: msg, chatId: activeChat?._id },
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
            setActiveChat(parsed.chat);
            setMessages(parsed.chat.messages);
            chatAPI.list().then(({ data }) => setChats(data.chats || []));
          }
        }
      );
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: err.response?.data?.message || err.message || 'Something went wrong.',
        };
        return updated;
      });
    } finally {
      setLoading(false);
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

  const exportChat = () => {
    const text = messages
      .map((m) => `**${m.role.toUpperCase()}**\n${m.content}`)
      .join('\n\n---\n\n');
    saveAs(
      new Blob([text], { type: 'text/markdown' }),
      `harvox-chat-${Date.now()}.md`
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">

      {/* ============================================================
          MOBILE OVERLAY (closes sidebars)
      ============================================================ */}
      {(showSidebar || showSystem) && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => { setShowSidebar(false); setShowSystem(false); }}
        />
      )}

      {/* ============================================================
          LEFT SIDEBAR - Chat History
          Desktop: always visible | Mobile: slide-over drawer
      ============================================================ */}
      <aside
        className={`
          flex-shrink-0 flex flex-col gap-3
          bg-[#080b10] border-r border-white/5
          transition-all duration-300 overflow-hidden

          /* Mobile: fixed drawer */
          fixed top-0 left-0 h-full z-30 p-4 w-[240px]
          lg:relative lg:w-[200px] lg:z-auto lg:p-0 lg:bg-transparent lg:border-0

          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between lg:hidden mb-2">
          <span className="text-xs font-bold text-gray-400">Chats</span>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="
            w-full py-3 rounded-xl font-bold text-sm text-white flex-shrink-0
            bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500
            hover:from-purple-500 hover:to-cyan-400
            shadow-[0_0_20px_rgba(168,85,247,0.3)]
            hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]
            transition-all duration-300 flex items-center justify-center gap-2
          "
        >
          <Plus size={15} />
          New Chat
        </button>

        {/* Recent label */}
        <div className="flex items-center gap-2 px-1 flex-shrink-0">
          <MessageSquare size={11} className="text-gray-600" />
          <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
            Recent
          </span>
        </div>

        {/* Chat List */}
        <div
          className="flex-1 overflow-y-auto space-y-1 min-h-0"
          style={{ scrollbarWidth: 'thin' }}
        >
          {chats.length === 0 ? (
            <p className="text-[10px] text-gray-700 text-center mt-6 italic px-2">
              No chats yet. Start a new conversation!
            </p>
          ) : (
            chats.map((c) => (
              <ChatHistoryItem
                key={c._id}
                chat={c}
                isActive={activeChat?._id === c._id}
                onClick={() => loadChat(c._id)}
                onDelete={() => {
                  setChats((prev) => prev.filter((x) => x._id !== c._id));
                  if (activeChat?._id === c._id) handleNewChat();
                }}
              />
            ))
          )}
        </div>

        {/* Session Info */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={11} className="text-gray-600" />
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Session</span>
          </div>
          <p className="text-[11px] text-gray-400 font-semibold">
            {msgCount} message{msgCount !== 1 ? 's' : ''}
          </p>
        </div>
      </aside>

      {/* ============================================================
          CENTER - Main Chat
      ============================================================ */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-[#0d1117] border border-white/8 rounded-2xl mx-0 lg:mx-4">

        {/* ── HEADER ── */}
        <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 border-b border-white/8 bg-[#0a0d13] flex-shrink-0">

          {/* Mobile: sidebar toggle */}
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors flex-shrink-0"
          >
            <Menu size={15} />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={13} className="text-purple-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-wide">AI Chat</h2>
              {activeChat && (
                <p className="text-[9px] text-gray-600 truncate">
                  {activeChat.title}
                </p>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Provider badge - hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-gray-400 font-semibold">
                {provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}
              </span>
            </div>

            {/* Export */}
            {messages.length > 0 && (
              <button
                onClick={exportChat}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 hover:text-white bg-white/3 hover:bg-white/8 border border-white/8 rounded-lg transition-all"
              >
                <Download size={11} />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* Mobile: system status toggle */}
            <button
              onClick={() => setShowSystem(true)}
              className="xl:hidden p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"
              title="System Status"
            >
              <Activity size={14} />
            </button>
          </div>
        </header>

        {/* ── MESSAGES ── */}
        <div
          className="flex-1 overflow-y-auto min-h-0 px-2 sm:px-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {messages.length === 0 && !loading ? (
            <EmptyState onSuggestion={(s) => handleSend(s)} />
          ) : (
            <div className="py-4 space-y-1">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}

              {/* Standalone loading indicator when last msg has no content yet */}
              {loading && messages[messages.length - 1]?.content === '' && (
                null // handled inside MessageBubble via empty content check
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── INPUT AREA ── */}
        <footer className="flex-shrink-0 p-3 sm:p-4 border-t border-white/8 bg-[#0a0d13]">

          {/* Settings Panel */}
          {showSettings && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 p-3 bg-white/3 border border-white/8 rounded-xl">
              <div>
                <label className="text-[9px] font-black tracking-widest text-gray-600 uppercase mb-1.5 block">
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
                  className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value={AI_PROVIDERS.GROQ}>⚡ Groq</option>
                  <option value={AI_PROVIDERS.GEMINI}>✨ Gemini</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black tracking-widest text-gray-600 uppercase mb-1.5 block">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-purple-500/50 transition-colors"
                >
                  {getModelsByProvider(provider).map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="relative flex items-end gap-2 bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask HARVOX a question or request code..."
              disabled={loading}
              rows={1}
              className="flex-1 min-w-0 bg-transparent px-4 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm text-white outline-none placeholder:text-gray-700 resize-none leading-relaxed"
              style={{ minHeight: '52px', maxHeight: '140px' }}
            />

            {/* Actions */}
            <div className="flex items-center gap-1 px-2 sm:px-3 pb-2.5 sm:pb-3 flex-shrink-0">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`p-1.5 sm:p-2 rounded-xl transition-all ${
                  showSettings
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
                }`}
                title="AI Settings"
              >
                <Settings size={15} />
              </button>

              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className={`
                  flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl
                  font-bold transition-all duration-200 flex-shrink-0
                  ${input.trim() && !loading
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-gray-700 cursor-not-allowed'
                  }
                `}
              >
                <Send size={14} className={loading ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="text-center text-[9px] text-gray-700 mt-2 hidden sm:block">
            Press{' '}
            <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-600">Enter</kbd>
            {' '}to send ·{' '}
            <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-600">Shift+Enter</kbd>
            {' '}for new line
          </p>
        </footer>
      </main>

      {/* ============================================================
          RIGHT SIDEBAR - System Status
          Desktop (xl): always visible | Mobile: slide-over drawer
      ============================================================ */}
      <aside
        className={`
          flex-shrink-0 flex flex-col
          bg-[#080b10] border-l border-white/5
          transition-all duration-300 overflow-y-auto overflow-x-hidden

          /* Mobile: fixed drawer from right */
          fixed top-0 right-0 h-full z-30 p-4 w-[240px]
          xl:relative xl:w-[220px] xl:z-auto xl:p-0 xl:bg-transparent xl:border-0

          ${showSystem ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
        `}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between xl:hidden mb-4">
          <span className="text-xs font-bold text-gray-400">System Status</span>
          <button
            onClick={() => setShowSystem(false)}
            className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <SystemStatusPanel
          provider={provider}
          model={model}
          messageCount={msgCount}
        />
      </aside>
    </div>
  );
}