import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Download, MessageSquare, Settings, Plus, Bot, User,
  Activity, Clock, X, Menu, PanelLeftClose, PanelLeft,
  Copy, Check, ArrowDown,
} from 'lucide-react';
import { aiAPI, chatAPI } from '../../services/api';
import {
  AI_PROVIDERS, GROQ_MODELS, GEMINI_MODELS, getModelsByProvider,
} from '../../config/aiModels';
import ChatMessage from '../../components/chat/ChatMessage';
import { saveAs } from 'file-saver';

// ============================================================
// DESIGN TOKENS — xAI void system, layered for depth
// ============================================================
const C = {
  void: '#0c0c0b',
  surface: '#121316',
  surface2: '#16181c',
  surface3: '#1b1e24',   // hover layer
  graphite: '#1f2228',
  smoke: '#474747',
  ash: '#7d8187',
  white: '#ffffff',
  blue: '#2563eb',
  green: '#4ade80',
};
const FONT_SANS = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";
const READ_MAX = 720;

// ============================================================
// RESPONSIVE HOOK
// ============================================================
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

// ============================================================
// WORDMARK BACKGROUND
// ============================================================
const HarvoxWordmark = () => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: '-10%', top: '50%', transform: 'translateY(-50%)', width: '60%', height: '80%', background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.05) 0%, rgba(37,99,235,0.05) 40%, transparent 70%)', filter: 'blur(40px)' }} />
    <div style={{ position: 'absolute', left: '-15%', bottom: '-20%', width: '50%', height: '60%', background: 'radial-gradient(ellipse at 20% 80%, rgba(37,99,235,0.04) 0%, transparent 65%)', filter: 'blur(50px)' }} />
    <span style={{ fontFamily: FONT_SANS, fontSize: 'clamp(48px, 12vw, 120px)', fontWeight: 400, letterSpacing: '-0.05em', lineHeight: 1, color: 'rgba(255,255,255,0.03)', whiteSpace: 'nowrap' }}>
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
      setLatency(prev => Math.round(Math.min(200, Math.max(15, prev + (Math.random() - 0.5) * 12))));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const storagePercent = 45;
  const dailyMax = 500;
  const dailyPercent = Math.min((messageCount / dailyMax) * 100, 100);
  const modelDisplay = model?.includes('gemini') ? 'Gemini Flash' : 'Llama 3.3 70B';

  const card = { border: `1px solid ${C.graphite}`, borderRadius: '12px', padding: '16px', marginBottom: '10px', background: `linear-gradient(180deg, ${C.surface3} 0%, ${C.surface2} 100%)` };
  const label = { fontFamily: FONT_MONO, fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', color: C.ash, textTransform: 'uppercase', display: 'block', marginBottom: '10px' };
  const value = { fontFamily: FONT_SANS, fontSize: '13px', fontWeight: 400, color: C.white, letterSpacing: '-0.025em' };
  const track = (pct, glow) => (
    <div style={{ height: '4px', background: C.graphite, borderRadius: '2px', position: 'relative', overflow: 'hidden', marginTop: '10px' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: glow || `linear-gradient(90deg, ${C.smoke}, ${C.white})`, borderRadius: '2px', transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <span style={{ ...label, fontSize: '10px', marginBottom: '12px' }}>[ SYSTEM ]</span>

      <div style={card}>
        <span style={label}>AI Engine</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={value}>{modelDisplay}</span>
          <span style={{ ...label, marginBottom: 0, color: C.green, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="harvox-status-dot" /> Online
          </span>
        </div>
        {track(100, 'rgba(255,255,255,0.2)')}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ ...label, marginBottom: 0 }}>Provider</span>
          <span style={{ ...label, marginBottom: 0, color: C.white }}>{provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ ...label, marginBottom: 0 }}>Latency</span>
          <span style={{ ...label, marginBottom: 0, color: C.white }}>{latency}ms</span>
        </div>
      </div>

      <div style={card}>
        <span style={label}>[ STORAGE ]</span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={value}>{storagePercent}% used</span>
          <span style={{ ...label, marginBottom: 0 }}>1 GB max</span>
        </div>
        {track(storagePercent)}
      </div>

      <div style={card}>
        <span style={label}>[ DAILY USAGE ]</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: '32px', fontWeight: 400, color: C.white, letterSpacing: '-0.05em', lineHeight: 1 }}>{messageCount}</span>
          <span style={{ ...label, marginBottom: 0 }}>/ {dailyMax}</span>
        </div>
        {track(dailyPercent)}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={value}>Stream Ready</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '0.1em', color: C.green, fontWeight: 400, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="harvox-status-dot" /> Connected
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EMPTY STATE — time-aware greeting + staggered suggestions
// ============================================================
const EmptyState = ({ onSuggestion, isMobile }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const suggestions = [
    'Build a REST API with Node.js',
    'Debug my React useEffect hook',
    'Explain Big O notation',
    'Optimize this SQL query',
  ];
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '32px', padding: '32px 24px' }}>
      <HarvoxWordmark />
      <div className="harvox-fade-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.15em', color: C.ash, textTransform: 'uppercase', margin: '0 0 10px' }}>{greeting}</p>
        <h3 style={{ fontFamily: FONT_SANS, fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 400, color: C.white, letterSpacing: '-0.5px', lineHeight: 1.3, margin: 0 }}>What do you want to know?</h3>
        <p style={{ fontFamily: FONT_SANS, fontSize: '14px', fontWeight: 400, color: C.ash, letterSpacing: '-0.025em', marginTop: '8px' }}>Ask anything about coding, tech, or learning.</p>
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px', width: '100%', maxWidth: '480px' }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s)}
            className="harvox-fade-up harvox-suggestion"
            style={{ animationDelay: `${0.08 * (i + 1)}s`, fontFamily: FONT_MONO, fontSize: '11px', fontWeight: 400, letterSpacing: '0.05em', color: C.ash, background: C.surface, border: `1px solid ${C.graphite}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {s} <span className="harvox-suggestion-arrow">↗</span>
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
    className="harvox-sidebar-item"
    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', margin: '0 8px 2px', borderRadius: '8px', background: isActive ? C.surface2 : 'transparent', borderLeft: `2px solid ${isActive ? C.white : 'transparent'}`, cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surface3; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
  >
    <MessageSquare size={12} color={isActive ? C.white : C.ash} style={{ flexShrink: 0 }} />
    <span style={{ fontFamily: FONT_SANS, fontSize: '12px', fontWeight: 400, letterSpacing: '-0.025em', color: isActive ? C.white : C.ash, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{chat.title}</span>
    <button
      onClick={e => { e.stopPropagation(); onDelete?.(chat._id); }}
      className="delete-btn"
      style={{ background: 'none', border: 'none', color: C.ash, cursor: 'pointer', padding: '2px', display: 'flex', opacity: 0, transition: 'opacity 0.15s, color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.color = C.white)}
      onMouseLeave={e => (e.currentTarget.style.color = C.ash)}
    >
      <X size={11} />
    </button>
  </div>
);

// ============================================================
// MESSAGE ROW — fade-in, copy on hover, streaming cursor
// ============================================================
const MessageRow = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="harvox-fade-up harvox-message-row" style={{ display: 'flex', gap: '14px', padding: '18px 0', borderBottom: `1px solid ${C.graphite}` }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${isUser ? C.smoke : C.graphite}`, background: isUser ? 'transparent' : `linear-gradient(180deg, ${C.surface3}, ${C.surface2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isUser ? <User size={13} color={C.white} /> : <Bot size={13} color={C.ash} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.08em', color: C.white, fontWeight: 400, textTransform: 'uppercase' }}>{isUser ? 'You' : 'HARVOX'}</span>
          {!isUser && message.content && (
            <button onClick={handleCopy} className="copy-btn" title="Copy message"
              style={{ background: 'none', border: 'none', color: copied ? C.green : C.ash, cursor: 'pointer', padding: '2px', display: 'flex', marginLeft: 'auto', opacity: 0, transition: 'opacity 0.15s, color 0.15s' }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
        {message.content ? (
          isUser ? (
            <p style={{ fontFamily: FONT_SANS, fontSize: '15px', fontWeight: 400, color: C.white, letterSpacing: '-0.025em', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{message.content}</p>
          ) : (
            <div style={{ fontFamily: FONT_SANS, fontSize: '15px', fontWeight: 400, color: C.white, letterSpacing: '-0.025em', lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              <ChatMessage role={message.role} content={message.content} compact />
              {isStreaming && <span className="harvox-cursor" />}
            </div>
          )
        ) : (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 0' }}>
            {[0, 1, 2].map(j => (
              <div key={j} style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.ash, animation: `pulse 1s ease-in-out ${j * 0.2}s infinite` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAIN CHAT COMPONENT
// ============================================================
export default function Chat() {
  const location = useLocation();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(AI_PROVIDERS.GROQ);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => { chatAPI.list().then(({ data }) => setChats(data.chats || [])); }, []);
  useEffect(() => { if (location.state?.chatId) loadChat(location.state.chatId); }, [location.state?.chatId]);
  useEffect(() => { const initial = location.state?.initialMessage; if (initial) handleSend(initial); }, []);
  useEffect(() => { if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, atBottom]);
  useEffect(() => { setMsgCount(messages.filter(m => m.role === 'user').length); }, [messages]);
  useEffect(() => { if (isDesktop) { setShowSidebar(false); setShowSystem(false); } }, [isDesktop]);
  useEffect(() => {
    const open = !isDesktop && (showSidebar || showSystem);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDesktop, showSidebar, showSystem]);

  const handleScroll = useCallback((e) => {
    const el = e.currentTarget;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAtBottom(true);
  };

  const loadChat = async (id) => {
    try {
      const { data } = await chatAPI.get(id);
      setActiveChat(data.chat);
      setMessages(data.chat.messages || []);
      setShowSidebar(false);
      setAtBottom(true);
    } catch (err) { console.error('Load chat error:', err); }
  };

  const handleNewChat = () => {
    setActiveChat(null); setMessages([]); setInput(''); setShowSidebar(false);
    inputRef.current?.focus();
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setLoading(true);
    setAtBottom(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: '' }]);
    try {
      await aiAPI.streamChat({ message: msg, chatId: activeChat?._id, provider, model }, (parsed) => {
        if (parsed.content) {
          setMessages(prev => {
            const u = [...prev];
            u[u.length - 1] = { ...u[u.length - 1], content: u[u.length - 1].content + parsed.content };
            return u;
          });
        }
        if (parsed.done) {
          setActiveChat(parsed.chat);
          setMessages(parsed.chat.messages);
          chatAPI.list().then(({ data }) => setChats(data.chats || []));
        }
      });
    } catch (err) {
      setMessages(prev => {
        const u = [...prev];
        u[u.length - 1] = { ...u[u.length - 1], content: err.response?.data?.message || err.message || 'Something went wrong.' };
        return u;
      });
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };
  const exportChat = () => {
    const text = messages.map(m => `**${m.role.toUpperCase()}**\n${m.content}`).join('\n\n---\n\n');
    saveAs(new Blob([text], { type: 'text/markdown' }), `harvox-chat-${Date.now()}.md`);
  };

  const monoLabel = { fontFamily: FONT_MONO, fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', color: C.ash, textTransform: 'uppercase' };
  const sansText = (size = 13, color = C.white) => ({ fontFamily: FONT_SANS, fontSize: `${size}px`, fontWeight: 400, letterSpacing: '-0.025em', color });
  const iconBtn = (active) => ({ background: active ? C.surface2 : 'none', border: 'none', borderRadius: '8px', color: active ? C.white : C.ash, cursor: 'pointer', padding: '8px', display: 'flex', transition: 'background 0.15s, color 0.15s' });

  const railWidth = railCollapsed ? 64 : 240;
  const leftAsideStyle = {
    flexShrink: 0, display: 'flex', flexDirection: 'column',
    width: isDesktop ? `${railWidth}px` : '80%', maxWidth: '320px',
    borderRight: `1px solid ${C.graphite}`, background: C.surface, overflow: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s ease',
    ...(isDesktop ? {} : { position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30, transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)', boxShadow: showSidebar ? '8px 0 32px rgba(0,0,0,0.5)' : 'none' }),
  };
  const rightAsideStyle = {
    flexShrink: 0, width: isDesktop ? '240px' : '80%', maxWidth: '320px',
    borderLeft: `1px solid ${C.graphite}`, background: C.surface,
    overflowY: 'auto', overflowX: 'hidden', padding: '20px 16px',
    ...(isDesktop ? {} : { position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 30, transform: showSystem ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.25s ease', boxShadow: showSystem ? '-8px 0 32px rgba(0,0,0,0.5)' : 'none' }),
  };
  const showRailLabels = !isDesktop || !railCollapsed;
  const lastAssistantIdx = messages.length - 1;

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.2; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); } 50% { box-shadow: 0 0 0 4px rgba(74,222,128,0); } }
        .harvox-fade-up { animation: fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .harvox-cursor { display: inline-block; width: 7px; height: 15px; margin-left: 3px; vertical-align: text-bottom; background: ${C.white}; border-radius: 1px; animation: blink 0.9s steps(1) infinite; }
        .harvox-status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${C.green}; animation: glowPulse 2s ease-in-out infinite; }
        .harvox-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
        .harvox-scrollbar::-webkit-scrollbar-thumb { background: ${C.graphite}; border-radius: 3px; }
        .harvox-scrollbar::-webkit-scrollbar-thumb:hover { background: ${C.smoke}; }
        .harvox-sidebar-item:hover .delete-btn { opacity: 1 !important; }
        .harvox-message-row:hover .copy-btn { opacity: 1 !important; }
        .harvox-suggestion { transition: color 0.15s, border-color 0.15s, background 0.15s, transform 0.15s; }
        .harvox-suggestion:hover { color: ${C.white} !important; border-color: ${C.smoke} !important; background: ${C.surface2} !important; transform: translateY(-2px); }
        .harvox-suggestion-arrow { opacity: 0.4; transition: opacity 0.15s; }
        .harvox-suggestion:hover .harvox-suggestion-arrow { opacity: 1; }
        .harvox-send-btn:not(:disabled):hover { transform: scale(1.06); }
        .harvox-send-btn:not(:disabled):active { transform: scale(0.96); }
        textarea::placeholder { color: ${C.ash}; }
        select option { background: ${C.surface2}; color: ${C.white}; }
        @media (prefers-reduced-motion: reduce) {
          .harvox-fade-up, .harvox-cursor, .harvox-status-dot { animation: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', position: 'relative', background: C.void, fontFamily: FONT_SANS }}>

        {!isDesktop && (showSidebar || showSystem) && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 25, backdropFilter: 'blur(4px)' }} onClick={() => { setShowSidebar(false); setShowSystem(false); }} />
        )}

        {/* LEFT RAIL / SIDEBAR */}
        <aside style={leftAsideStyle} className="harvox-scrollbar">
          <div style={{ padding: showRailLabels ? '16px' : '16px 12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: showRailLabels ? 'space-between' : 'center' }}>
            {showRailLabels && <span style={{ fontFamily: FONT_SANS, fontSize: '15px', fontWeight: 400, color: C.white, letterSpacing: '-0.03em' }}>HARVOX</span>}
            {isDesktop ? (
              <button onClick={() => setRailCollapsed(v => !v)} style={iconBtn(false)} title="Toggle sidebar">
                {railCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            ) : (
              <button onClick={() => setShowSidebar(false)} style={iconBtn(false)}><X size={16} /></button>
            )}
          </div>

          <div style={{ padding: showRailLabels ? '0 16px 14px' : '0 12px 14px' }}>
            <button
              onClick={handleNewChat}
              style={{ width: '100%', padding: showRailLabels ? '10px 16px' : '10px', background: `linear-gradient(180deg, ${C.surface3}, ${C.surface2})`, border: `1px solid ${C.graphite}`, borderRadius: '10px', ...sansText(13), cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.smoke; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.graphite; }}
              title="New Chat"
            >
              <Plus size={15} /> {showRailLabels && 'New Chat'}
            </button>
          </div>

          {showRailLabels && <div style={{ padding: '0 16px 8px' }}><span style={monoLabel}>[ Recent ]</span></div>}

          <div className="harvox-scrollbar" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {!showRailLabels ? null : chats.length === 0 ? (
              <p style={{ ...monoLabel, padding: '16px', textAlign: 'center', fontStyle: 'italic' }}>No chats yet.</p>
            ) : (
              chats.map(c => (
                <ChatHistoryItem key={c._id} chat={c} isActive={activeChat?._id === c._id}
                  onClick={() => loadChat(c._id)}
                  onDelete={() => { setChats(prev => prev.filter(x => x._id !== c._id)); if (activeChat?._id === c._id) handleNewChat(); }}
                />
              ))
            )}
          </div>

          {showRailLabels && (
            <div style={{ borderTop: `1px solid ${C.graphite}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={11} color={C.ash} />
              <span style={{ ...monoLabel, textTransform: 'none' }}>{msgCount} message{msgCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </aside>

        {/* CENTER */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden', background: C.void, position: 'relative' }}>
          {/* HEADER */}
          <header style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', padding: isMobile ? '0 12px' : '0 20px', height: '56px', borderBottom: `1px solid ${C.graphite}`, flexShrink: 0, background: 'rgba(12,12,11,0.85)', backdropFilter: 'blur(8px)', zIndex: 5 }}>
            {!isDesktop && <button onClick={() => setShowSidebar(true)} style={iconBtn(false)}><Menu size={18} /></button>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <span style={{ ...sansText(14), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeChat?.title || 'New conversation'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {!isMobile && (
                <span style={{ ...monoLabel, border: `1px solid ${C.graphite}`, borderRadius: '9999px', padding: '5px 12px', background: C.surface, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="harvox-status-dot" /> {provider === AI_PROVIDERS.GEMINI ? 'Gemini' : 'Groq'}
                </span>
              )}
              {messages.length > 0 && (
                <button onClick={exportChat} style={{ ...monoLabel, border: `1px solid ${C.graphite}`, borderRadius: '9999px', padding: '6px 12px', background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.smoke)} onMouseLeave={e => (e.currentTarget.style.borderColor = C.graphite)}>
                  <Download size={12} /> {!isMobile && 'Export'}
                </button>
              )}
              {!isDesktop && <button onClick={() => setShowSystem(true)} style={iconBtn(false)}><Activity size={16} /></button>}
            </div>
          </header>

          {/* MESSAGES */}
          <div ref={scrollRef} onScroll={handleScroll} className="harvox-scrollbar" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {messages.length === 0 && !loading ? (
              <EmptyState onSuggestion={s => handleSend(s)} isMobile={isMobile} />
            ) : (
              <div style={{ maxWidth: `${READ_MAX}px`, margin: '0 auto', padding: isMobile ? '8px 12px 24px' : '12px 24px 32px' }}>
                {messages.map((m, i) => (
                  <MessageRow key={i} message={m} isStreaming={loading && i === lastAssistantIdx && m.role === 'assistant'} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* SCROLL TO BOTTOM */}
          {!atBottom && messages.length > 0 && (
            <button onClick={scrollToBottom} className="harvox-fade-up"
              style={{ position: 'absolute', bottom: isMobile ? '120px' : '140px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${C.smoke}`, background: C.surface2, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
              <ArrowDown size={15} />
            </button>
          )}

          {/* COMPOSER */}
          <footer style={{ flexShrink: 0, borderTop: `1px solid ${C.graphite}`, padding: isMobile ? '12px' : '16px 24px 20px', background: C.void }}>
            <div style={{ maxWidth: `${READ_MAX}px`, margin: '0 auto' }}>
              {showSettings && (
                <div className="harvox-fade-up" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px', padding: '14px', border: `1px solid ${C.graphite}`, borderRadius: '12px', background: C.surface }}>
                  {[
                    { labelText: '[ Provider ]', content: (
                      <select value={provider} onChange={e => { setProvider(e.target.value); setModel(e.target.value === AI_PROVIDERS.GEMINI ? GEMINI_MODELS[0].id : GROQ_MODELS[0].id); }}
                        style={{ width: '100%', padding: '9px 12px', background: C.surface2, border: `1px solid ${C.graphite}`, borderRadius: '8px', ...sansText(12), outline: 'none', cursor: 'pointer' }}>
                        <option value={AI_PROVIDERS.GROQ}>Groq</option>
                        <option value={AI_PROVIDERS.GEMINI}>Gemini</option>
                      </select>
                    )},
                    { labelText: '[ Model ]', content: (
                      <select value={model} onChange={e => setModel(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', background: C.surface2, border: `1px solid ${C.graphite}`, borderRadius: '8px', ...sansText(12), outline: 'none', cursor: 'pointer' }}>
                        {getModelsByProvider(provider).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    )},
                  ].map(({ labelText, content }, i) => (
                    <div key={i}>
                      <span style={{ ...monoLabel, display: 'block', marginBottom: '8px' }}>{labelText}</span>
                      {content}
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', border: `1px solid ${C.graphite}`, borderRadius: '16px', padding: '0 10px 0 18px', background: `linear-gradient(180deg, ${C.surface2}, ${C.surface})`, transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = 'rgba(37,99,235,0.3) 0px 0px 0px 3px, 0 8px 24px rgba(0,0,0,0.3)'; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = C.graphite; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <textarea
                  ref={inputRef} value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown}
                  placeholder="Ask HARVOX a question or request code..." disabled={loading} rows={1}
                  style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', resize: 'none', ...sansText(16, C.white), lineHeight: 1.5, padding: '14px 0', minHeight: '52px', maxHeight: '140px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '9px', flexShrink: 0 }}>
                  <button onClick={() => setShowSettings(v => !v)} style={iconBtn(showSettings)} title="Model settings"
                    onMouseEnter={e => !showSettings && (e.currentTarget.style.color = C.white)} onMouseLeave={e => !showSettings && (e.currentTarget.style.color = C.ash)}>
                    <Settings size={16} />
                  </button>
                  <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="harvox-send-btn"
                    style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', background: input.trim() && !loading ? C.white : C.surface2, color: input.trim() && !loading ? C.void : C.ash, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.15s, color 0.15s, transform 0.15s', flexShrink: 0 }}>
                    <Send size={15} style={{ opacity: loading ? 0.4 : 1 }} />
                  </button>
                </div>
              </div>

              <p style={{ ...monoLabel, textAlign: 'center', marginTop: '10px', textTransform: 'none' }}>
                {isMobile ? 'Enter to send' : 'Enter to send · Shift+Enter for new line'}
              </p>
            </div>
          </footer>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={rightAsideStyle} className="harvox-scrollbar">
          {!isDesktop && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button onClick={() => setShowSystem(false)} style={iconBtn(false)}><X size={16} /></button>
            </div>
          )}
          <SystemStatusPanel provider={provider} model={model} messageCount={msgCount} />
        </aside>
      </div>
    </>
  );
}
