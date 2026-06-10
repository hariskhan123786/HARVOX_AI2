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
// DESIGN TOKENS — xAI system
// --color-void-black:    #0c0c0b   page canvas
// --color-graphite:      #1f2228   hairline borders
// --color-charcoal:      #141619   deep structural borders
// --color-smoke:         #474747   ghost-pill outlines
// --color-ash:           #7d8187   muted text
// --color-stellar-white: #ffffff   primary text / emitted light
// --color-signal-blue:   #2563eb   input focus only
// Fonts: Inter (universalSans sub) + JetBrains Mono (GeistMono sub)
// ============================================================

// ============================================================
// HARVOX WORDMARK BACKGROUND — luminous void
// ============================================================
const HarvoxWordmark = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
    {/* Radial bloom from right — single light source */}
    <div
      style={{
        position: 'absolute',
        right: '-10%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '60%',
        height: '80%',
        background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.04) 0%, rgba(37,99,235,0.03) 40%, transparent 70%)',
        filter: 'blur(40px)',
      }}
    />
    <span
      style={{
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        fontSize: 'clamp(64px, 12vw, 120px)',
        fontWeight: 400,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        color: 'rgba(255,255,255,0.03)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      HARVOX
    </span>
  </div>
);

// ============================================================
// SYSTEM STATUS PANEL
// ============================================================
const SystemStatusPanel = ({ provider, model, messageCount }) => {
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const t = setInterval(() => {
      setLatency(prev =>
        Math.round(Math.min(200, Math.max(15, prev + (Math.random() - 0.5) * 12)))
      );
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const storagePercent = 45;
  const dailyMax       = 500;
  const dailyPercent   = Math.min((messageCount / dailyMax) * 100, 100);

  const modelDisplay = model?.includes('gemini') ? 'Gemini Flash' : 'Llama 3.3 70B';

  // shared card style — no bg fill, hairline border, zero radius
  const card = {
    border: '1px solid #1f2228',
    borderRadius: 0,
    padding: '16px',
    marginBottom: '8px',
  };

  const label = {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: '11px',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#7d8187',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '10px',
  };

  const value = {
    fontFamily: "'Inter', ui-sans-serif, sans-serif",
    fontSize: '13px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '-0.025em',
  };

  const bar = {
    height: '1px',
    background: '#1f2228',
    width: '100%',
    marginTop: '10px',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: '#7d8187',
          textTransform: 'uppercase',
          fontWeight: 400,
          padding: '0 0 8px 0',
          display: 'block',
        }}
      >
        [ SYSTEM ]
      </span>

      {/* AI Engine */}
      <div style={card}>
        <span style={label}>AI Engine</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={value}>{modelDisplay}</span>
          <span style={{ ...label, marginBottom: 0, color: '#ffffff' }}>
            ● Online
          </span>
        </div>
        <div style={bar}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ ...label, marginBottom: 0 }}>Provider</span>
          <span style={{ ...label, marginBottom: 0, color: '#ffffff' }}>
            {provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ ...label, marginBottom: 0 }}>Latency</span>
          <span style={{ ...label, marginBottom: 0, color: '#ffffff' }}>{latency}ms</span>
        </div>
      </div>

      {/* Storage */}
      <div style={card}>
        <span style={label}>[ STORAGE ]</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={value}>{storagePercent}% used</span>
          <span style={{ ...label, marginBottom: 0 }}>1 GB max</span>
        </div>
        <div style={{ height: '1px', background: '#1f2228', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${storagePercent}%`,
              background: '#ffffff',
              transition: 'width 0.7s ease',
            }}
          />
        </div>
      </div>

      {/* Daily Usage */}
      <div style={card}>
        <span style={label}>[ DAILY USAGE ]</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#ffffff',
              letterSpacing: '-0.05em',
              lineHeight: 1,
            }}
          >
            {messageCount}
          </span>
          <span style={{ ...label, marginBottom: 0 }}>/ {dailyMax}</span>
        </div>
        <div style={{ height: '1px', background: '#1f2228', position: 'relative', overflow: 'hidden', marginTop: '10px' }}>
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${dailyPercent}%`,
              background: '#ffffff',
              transition: 'width 0.7s ease',
            }}
          />
        </div>
      </div>

      {/* Connection */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={value}>Stream Ready</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: '#ffffff',
              fontWeight: 400,
            }}
          >
            ● Connected
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EMPTY STATE — HARVOX wordmark as luminous void
// ============================================================
const EmptyState = ({ onSuggestion }) => {
  const suggestions = [
    { label: 'Build a REST API with Node.js'  },
    { label: 'Debug my React useEffect hook'  },
    { label: 'Explain Big O notation'         },
    { label: 'Optimize this SQL query'        },
  ];

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '32px',
        padding: '32px 24px',
      }}
    >
      <HarvoxWordmark />

      {/* Heading */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h3
          style={{
            fontFamily: "'Inter', ui-sans-serif, sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '-0.4px',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          What do you want to know?
        </h3>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: '#7d8187',
            letterSpacing: '-0.025em',
            marginTop: '6px',
          }}
        >
          Ask anything about coding, tech, or learning.
        </p>
      </div>

      {/* Suggestion Pills */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.label)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.05em',
              color: '#7d8187',
              background: 'transparent',
              border: '1px solid #1f2228',
              borderRadius: '9999px',
              padding: '10px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#474747';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#7d8187';
              e.currentTarget.style.borderColor = '#1f2228';
            }}
          >
            {s.label} ↗
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// CHAT HISTORY ITEM
// ============================================================
const ChatHistoryItem = ({ chat, isActive, onClick, onDelete }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      borderTop: isActive ? '1px solid #1f2228' : '1px solid transparent',
      borderBottom: isActive ? '1px solid #1f2228' : '1px solid transparent',
      borderLeft: isActive ? '1px solid #ffffff' : '1px solid transparent',
      borderRight: '1px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => {
      if (!isActive) e.currentTarget.style.borderColor = '#1f2228';
    }}
    onMouseLeave={e => {
      if (!isActive) {
        e.currentTarget.style.borderTop = '1px solid transparent';
        e.currentTarget.style.borderBottom = '1px solid transparent';
        e.currentTarget.style.borderLeft = '1px solid transparent';
      }
    }}
  >
    <MessageSquare size={11} color={isActive ? '#ffffff' : '#7d8187'} style={{ flexShrink: 0 }} />
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '-0.025em',
        color: isActive ? '#ffffff' : '#7d8187',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}
    >
      {chat.title}
    </span>
    <button
      onClick={e => { e.stopPropagation(); onDelete?.(chat._id); }}
      style={{
        background: 'none',
        border: 'none',
        color: '#7d8187',
        cursor: 'pointer',
        padding: '2px',
        display: 'flex',
        opacity: 0,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
      onMouseLeave={e => e.currentTarget.style.color = '#7d8187'}
      className="delete-btn"
    >
      <X size={10} />
    </button>
  </div>
);

// ============================================================
// MESSAGE BUBBLE
// ============================================================
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const time   = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '10px 0',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #1f2228',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <Bot size={12} color="#7d8187" />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '76%',
          minWidth: 0,
        }}
      >
        {/* Bubble */}
        {isUser ? (
          <div
            style={{
              border: '1px solid #1f2228',
              borderRadius: 0,
              padding: '12px 16px',
              background: 'transparent',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                color: '#ffffff',
                letterSpacing: '-0.025em',
                lineHeight: 1.5,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-words',
              }}
            >
              {message.content}
            </p>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid #1f2228',
              borderRadius: 0,
              padding: '12px 16px',
              width: '100%',
            }}
          >
            {message.content ? (
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#ffffff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.5,
                  wordBreak: 'break-words',
                }}
              >
                <ChatMessage role={message.role} content={message.content} compact />
              </div>
            ) : (
              /* Typing indicator — 3 hairline pulses */
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '2px 0' }}>
                {[0, 1, 2].map(j => (
                  <div
                    key={j}
                    style={{
                      width: '4px',
                      height: '4px',
                      background: '#7d8187',
                      borderRadius: 0,
                      animation: `pulse 1s ease-in-out ${j * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: '#1f2228',
            marginTop: '4px',
            paddingLeft: '2px',
            fontWeight: 400,
          }}
        >
          {time}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            border: '1px solid #474747',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <User size={12} color="#ffffff" />
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN CHAT COMPONENT
// ============================================================
export default function Chat() {
  const location  = useLocation();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

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

  useEffect(() => {
    chatAPI.list().then(({ data }) => setChats(data.chats || []));
  }, []);

  useEffect(() => {
    if (location.state?.chatId) loadChat(location.state.chatId);
  }, [location.state?.chatId]);

  useEffect(() => {
    const initial = location.state?.initialMessage;
    if (initial) handleSend(initial);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMsgCount(messages.filter(m => m.role === 'user').length);
  }, [messages]);

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
    if (inputRef.current) inputRef.current.style.height = 'auto';

    setLoading(true);
    setMessages(prev => [
      ...prev,
      { role: 'user',      content: msg },
      { role: 'assistant', content: '' },
    ]);

    try {
      await aiAPI.streamChat(
        { message: msg, chatId: activeChat?._id },
        (parsed) => {
          if (parsed.content) {
            setMessages(prev => {
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
      setMessages(prev => {
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
      .map(m => `**${m.role.toUpperCase()}**\n${m.content}`)
      .join('\n\n---\n\n');
    saveAs(new Blob([text], { type: 'text/markdown' }), `harvox-chat-${Date.now()}.md`);
  };

  // ── Shared inline style helpers ──
  const monoLabel = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#7d8187',
    textTransform: 'uppercase',
  };

  const sansText = (size = 13, color = '#ffffff') => ({
    fontFamily: "'Inter', ui-sans-serif, sans-serif",
    fontSize: `${size}px`,
    fontWeight: 400,
    letterSpacing: '-0.025em',
    color,
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {/* Global animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scaleY(0.5); }
          50%       { opacity: 1;   transform: scaleY(1);   }
        }
        .harvox-scrollbar::-webkit-scrollbar { width: 1px; background: transparent; }
        .harvox-scrollbar::-webkit-scrollbar-thumb { background: #1f2228; }
        .harvox-sidebar-item:hover .delete-btn { opacity: 1 !important; }
      `}</style>

      <div
        style={{
          display: 'flex',
          height: 'calc(100vh - 80px)',
          overflow: 'hidden',
          position: 'relative',
          background: '#0c0c0b',
          fontFamily: "'Inter', ui-sans-serif, sans-serif",
        }}
      >

        {/* ── MOBILE OVERLAY ── */}
        {(showSidebar || showSystem) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 20,
            }}
            onClick={() => { setShowSidebar(false); setShowSystem(false); }}
          />
        )}

        {/* ============================================================
            LEFT SIDEBAR
        ============================================================ */}
        <aside
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            width: '200px',
            borderRight: '1px solid #1f2228',
            background: '#0c0c0b',
            overflow: 'hidden',
            transition: 'transform 0.25s ease',
          }}
          className="harvox-scrollbar"
        >
          {/* New Chat — ghost pill */}
          <div style={{ padding: '20px 16px 16px' }}>
            <button
              onClick={handleNewChat}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #ffffff',
                borderRadius: '9999px',
                ...sansText(13),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#474747'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff'}
            >
              <Plus size={13} />
              New Chat
            </button>
          </div>

          {/* Section eyebrow */}
          <div style={{ padding: '0 16px 8px' }}>
            <span style={monoLabel}>[ Recent ]</span>
          </div>

          {/* Chat List */}
          <div
            className="harvox-scrollbar"
            style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
          >
            {chats.length === 0 ? (
              <p style={{ ...monoLabel, padding: '16px', textAlign: 'center', fontStyle: 'italic' }}>
                No chats yet.
              </p>
            ) : (
              chats.map(c => (
                <ChatHistoryItem
                  key={c._id}
                  chat={c}
                  isActive={activeChat?._id === c._id}
                  onClick={() => loadChat(c._id)}
                  onDelete={() => {
                    setChats(prev => prev.filter(x => x._id !== c._id));
                    if (activeChat?._id === c._id) handleNewChat();
                  }}
                />
              ))
            )}
          </div>

          {/* Session info */}
          <div
            style={{
              borderTop: '1px solid #1f2228',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Clock size={11} color="#7d8187" />
            <span style={{ ...monoLabel, textTransform: 'none' }}>
              {msgCount} message{msgCount !== 1 ? 's' : ''}
            </span>
          </div>
        </aside>

        {/* ============================================================
            CENTER — MAIN CHAT
        ============================================================ */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            background: '#0c0c0b',
            borderLeft: '1px solid #1f2228',
            borderRight: '1px solid #1f2228',
          }}
        >
          {/* HEADER */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 20px',
              height: '56px',
              borderBottom: '1px solid #1f2228',
              flexShrink: 0,
            }}
          >
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowSidebar(true)}
              style={{
                display: 'none', // hide on desktop; you can add media query via className
                background: 'none',
                border: 'none',
                color: '#7d8187',
                cursor: 'pointer',
                padding: '4px',
              }}
              className="lg:hidden"
            >
              <Menu size={15} />
            </button>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#ffffff',
                  letterSpacing: '-0.025em',
                }}
              >
                HARVOX
              </span>
              {activeChat && (
                <span style={{ ...monoLabel, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  / {activeChat.title}
                </span>
              )}
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Provider pill */}
              <span
                style={{
                  ...monoLabel,
                  border: '1px solid #1f2228',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                }}
              >
                ● {provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}
              </span>

              {/* Export */}
              {messages.length > 0 && (
                <button
                  onClick={exportChat}
                  style={{
                    ...monoLabel,
                    border: '1px solid #474747',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#474747'}
                >
                  <Download size={11} />
                  Export ↗
                </button>
              )}

              {/* Mobile system toggle */}
              <button
                onClick={() => setShowSystem(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7d8187',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <Activity size={14} />
              </button>
            </div>
          </header>

          {/* MESSAGES */}
          <div
            className="harvox-scrollbar"
            style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 20px' }}
          >
            {messages.length === 0 && !loading ? (
              <EmptyState onSuggestion={s => handleSend(s)} />
            ) : (
              <div style={{ padding: '16px 0' }}>
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <footer
            style={{
              flexShrink: 0,
              borderTop: '1px solid #1f2228',
              padding: '16px 20px 20px',
              background: '#0c0c0b',
            }}
          >
            {/* Settings panel */}
            {showSettings && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px',
                  padding: '12px',
                  border: '1px solid #1f2228',
                }}
              >
                {[
                  {
                    labelText: '[ Provider ]',
                    content: (
                      <select
                        value={provider}
                        onChange={e => {
                          setProvider(e.target.value);
                          setModel(
                            e.target.value === AI_PROVIDERS.GEMINI
                              ? GEMINI_MODELS[0].id
                              : GROQ_MODELS[0].id
                          );
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: '#0c0c0b',
                          border: '1px solid #1f2228',
                          borderRadius: '9999px',
                          ...sansText(12),
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={AI_PROVIDERS.GROQ}>Groq</option>
                        <option value={AI_PROVIDERS.GEMINI}>Gemini</option>
                      </select>
                    ),
                  },
                  {
                    labelText: '[ Model ]',
                    content: (
                      <select
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: '#0c0c0b',
                          border: '1px solid #1f2228',
                          borderRadius: '9999px',
                          ...sansText(12),
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {getModelsByProvider(provider).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    ),
                  },
                ].map(({ labelText, content }, i) => (
                  <div key={i}>
                    <span style={{ ...monoLabel, display: 'block', marginBottom: '6px' }}>
                      {labelText}
                    </span>
                    {content}
                  </div>
                ))}
              </div>
            )}

            {/* Input box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                border: '1px solid #1f2228',
                borderRadius: '24px',
                padding: '0 12px 0 20px',
                background: '#0c0c0b',
                transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.boxShadow = 'rgb(113, 113, 122) 0px 0px 0px 2px';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = '#1f2228';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask HARVOX a question or request code..."
                disabled={loading}
                rows={1}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  ...sansText(14, '#ffffff'),
                  lineHeight: 1.5,
                  padding: '14px 0',
                  minHeight: '52px',
                  maxHeight: '140px',
                  '::placeholder': { color: '#7d8187' },
                }}
              />

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '10px', flexShrink: 0 }}>
                {/* Settings toggle */}
                <button
                  onClick={() => setShowSettings(v => !v)}
                  style={{
                    background: 'none',
                    border: showSettings ? '1px solid #474747' : 'none',
                    borderRadius: '9999px',
                    padding: '6px',
                    color: showSettings ? '#ffffff' : '#7d8187',
                    cursor: 'pointer',
                    display: 'flex',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => !showSettings && (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => !showSettings && (e.currentTarget.style.color = '#7d8187')}
                >
                  <Settings size={14} />
                </button>

                {/* Send button — ghost pill */}
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9999px',
                    border: `1px solid ${input.trim() && !loading ? '#ffffff' : '#1f2228'}`,
                    background: 'transparent',
                    color: input.trim() && !loading ? '#ffffff' : '#7d8187',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    transition: 'border-color 0.15s, color 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (input.trim() && !loading) e.currentTarget.style.borderColor = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    if (input.trim() && !loading) e.currentTarget.style.borderColor = '#ffffff';
                  }}
                >
                  <Send size={13} style={{ opacity: loading ? 0.4 : 1 }} />
                </button>
              </div>
            </div>

            {/* Hint */}
            <p
              style={{
                ...monoLabel,
                textAlign: 'center',
                marginTop: '8px',
                textTransform: 'none',
              }}
            >
              Enter to send · Shift+Enter for new line
            </p>
          </footer>
        </main>

        {/* ============================================================
            RIGHT SIDEBAR — System Status
        ============================================================ */}
        <aside
          style={{
            flexShrink: 0,
            width: '220px',
            borderLeft: '1px solid #1f2228',
            background: '#0c0c0b',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 16px',
          }}
          className="harvox-scrollbar"
        >
          <SystemStatusPanel
            provider={provider}
            model={model}
            messageCount={msgCount}
          />

          {/* Horizon glow at bottom of sidebar */}
          <div
            style={{
              position: 'sticky',
              bottom: '-20px',
              left: 0,
              right: 0,
              height: '60px',
              background: 'linear-gradient(to top, rgba(255,99,8,0.08), rgba(151,196,255,0.04), transparent)',
              pointerEvents: 'none',
              marginTop: '24px',
            }}
          />
        </aside>

      </div>
    </>
  );
}