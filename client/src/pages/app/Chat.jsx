import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Download, MessageSquare, Settings } from 'lucide-react';
import { aiAPI, chatAPI } from '../../services/api';
import { AI_PROVIDERS, GROQ_MODELS, GEMINI_MODELS, getModelsByProvider } from '../../config/aiModels';
import ChatMessage from '../../components/chat/ChatMessage';
import LoadingOrb from '../../components/ui/LoadingOrb';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { saveAs } from 'file-saver';

export default function Chat() {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(AI_PROVIDERS.GROQ);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    chatAPI.list().then(({ data }) => setChats(data.chats || []));
  }, []);

  useEffect(() => {
    if (location.state?.chatId) loadChat(location.state.chatId);
  }, [location.state?.chatId]);

  useEffect(() => {
    const initial = location.state?.initialMessage;
    if (!initial) return;
    const run = async () => {
      setLoading(true);
      setMessages([{ role: 'user', content: initial }]);
      try {
        const { data } = await aiAPI.chat({ message: initial });
        setActiveChat(data.chat);
        setMessages(data.chat.messages);
      } catch (err) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: err.response?.data?.message || 'Error' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async (id) => {
    const { data } = await chatAPI.get(id);
    setActiveChat(data.chat);
    setMessages(data.chat.messages || []);
  };

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput('');
    setLoading(true);
    setMessages((m) => [...m, { role: 'user', content: msg }, { role: 'assistant', content: '' }]);

    try {
      await aiAPI.streamChat({ message: msg, chatId: activeChat?._id }, (parsed) => {
        if (parsed.content) {
          setMessages((m) => {
            const newM = [...m];
            newM[newM.length - 1] = { ...newM[newM.length - 1], content: newM[newM.length - 1].content + parsed.content };
            return newM;
          });
        }
        if (parsed.done) {
          setActiveChat(parsed.chat);
          setMessages(parsed.chat.messages);
          chatAPI.list().then(({ data: d }) => setChats(d.chats || []));
        }
      });
    } catch (err) {
      setMessages((m) => {
        const newM = [...m];
        newM[newM.length - 1] = { ...newM[newM.length - 1], content: err.message || 'Something went wrong.' };
        return newM;
      });
    } finally {
      setLoading(false);
    }
  };

  const exportChat = () => {
    const text = messages.map((m) => `**${m.role}**: ${m.content}`).join('\n\n');
    saveAs(new Blob([text], { type: 'text/markdown' }), `harvox-chat-${Date.now()}.md`);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="hidden w-56 shrink-0 space-y-2 overflow-y-auto md:block">
        <NeonButton className="w-full text-xs" onClick={() => { setActiveChat(null); setMessages([]); }}>
          New Chat
        </NeonButton>
        {chats.map((c) => (
          <button
            key={c._id}
            type="button"
            onClick={() => loadChat(c._id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
              activeChat?._id === c._id ? 'bg-neon-purple/20 text-white' : 'text-muted hover:bg-white/5'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <GlassCard hover={false} className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-orbitron text-lg">AI Chat</h2>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={exportChat}
              className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
            >
              <Download size={14} /> Export
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-purple/20 shadow-neon-purple">
                <MessageSquare size={32} className="text-neon-purple" />
              </div>
              <p className="font-orbitron text-sm text-muted">Ask anything about coding, tech, or learning.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {loading && <LoadingOrb />}
          <div ref={bottomRef} />
        </div>

        {/* Modern PromptBar Style Input */}
        <div className="p-4 bg-secondary/50 border-t border-white/5 space-y-3">
          {/* Model & Provider Selector */}
          {showSettings && (
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/10">
              <div className="space-y-1">
                <label className="text-[9px] font-orbitron font-bold tracking-widest text-muted">PROVIDER</label>
                <select 
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    setModel(e.target.value === AI_PROVIDERS.GEMINI ? GEMINI_MODELS[0].id : GROQ_MODELS[0].id);
                  }}
                  className="w-full px-2 py-1 bg-secondary/50 border border-white/10 rounded text-[9px] text-white outline-none hover:border-white/20"
                >
                  <option value={AI_PROVIDERS.GROQ}>Groq</option>
                  <option value={AI_PROVIDERS.GEMINI}>Gemini</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-orbitron font-bold tracking-widest text-muted">MODEL</label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-2 py-1 bg-secondary/50 border border-white/10 rounded text-[9px] text-white outline-none hover:border-white/20"
                >
                  {getModelsByProvider(provider).map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-neon-purple/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask HARVOX a question or request code..."
              className="w-full bg-transparent px-6 py-4 text-sm outline-none placeholder:text-muted/50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 text-muted hover:text-neon-blue transition-colors"
              title="Toggle AI settings"
            >
              <Settings size={18} />
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted hover:bg-neon-purple/20 hover:text-neon-purple disabled:opacity-50 transition-colors"
            >
              <Send size={18} className={loading ? 'animate-pulse text-neon-purple' : ''} />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
