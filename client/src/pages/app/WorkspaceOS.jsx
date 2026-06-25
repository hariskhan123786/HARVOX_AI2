import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import FileExplorer from '../../components/workspace/FileExplorer';
import TerminalPanel from '../../components/terminal/TerminalPanel';
import Editor from '@monaco-editor/react';
import { aiAPI, automationAPI } from '../../services/api';
import {
  Maximize2, Minimize2, Play, Save, X, SquareTerminal,
  Bug, ChevronRight, Search, FolderPlus, FilePlus,
  Cpu, HardDrive, Zap, Wifi, Activity, Cloud,
  RefreshCw, Plus, Trash2, Monitor, Code2, Music, Volume2, VolumeX, Loader2, Check,
  Keyboard, GitCompare, StickyNote, Terminal, Sparkles, Wand2, MessageSquare,
  Copy, RotateCcw, Send, AlignLeft, Hash, DollarSign, Clock
} from 'lucide-react';

// ============================================================
// 🔧 HELPERS
// ============================================================
const getLanguage = (filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    html: 'html',     css: 'css',
    json: 'json',     py: 'python',
    md: 'markdown',   yml: 'yaml',
    yaml: 'yaml',     sh: 'shell',
    txt: 'plaintext',
  };
  return map[ext] || 'plaintext';
};

const getFileColor = (filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    js:   'text-yellow-400',
    jsx:  'text-cyan-400',
    ts:   'text-blue-400',
    tsx:  'text-blue-300',
    html: 'text-orange-400',
    css:  'text-purple-400',
    json: 'text-yellow-300',
    py:   'text-green-400',
    md:   'text-gray-400',
    sh:   'text-green-300',
  };
  return map[ext] || 'text-gray-500';
};

const getFileIcon = (filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons = {
    js:   '⚡', jsx: '⚛',
    ts:   '🔷', tsx: '⚛',
    html: '🌐', css: '🎨',
    json: '{}',  py: '🐍',
    md:   '📝',  sh: '💻',
  };
  return icons[ext] || '📄';
};

// ============================================================
// 🔧 SYSTEM INTELLIGENCE PANEL
// ============================================================
const SystemIntelligencePanel = ({ aiModel = 'Llama 3.3 70B' }) => {
  const [metrics, setMetrics] = useState({
    cpu:     34,
    ram:     6.2,
    gpu:     12,
    latency: 42,
    qps:     12.4,
  });

  // Simulate live metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu:     Math.min(99, Math.max(5,  prev.cpu     + (Math.random() - 0.5) * 6)),
        gpu:     Math.min(99, Math.max(1,  prev.gpu     + (Math.random() - 0.5) * 4)),
        latency: Math.min(200, Math.max(10, prev.latency + (Math.random() - 0.5) * 8)),
        qps:     Math.min(50, Math.max(1,  prev.qps     + (Math.random() - 0.5) * 2)),
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const ramTotal      = 16;
  const storageUsed   = 7.2;
  const storageTotal  = 10;
  const dailyUsage    = 384;
  const dailyTotal    = 1000;
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);
  const dailyPercent   = Math.round((dailyUsage  / dailyTotal)  * 100);
  const ramPercent     = Math.round((metrics.ram  / ramTotal)   * 100);
  const isCritical     = storagePercent >= 70;

  const MetricBar = ({ value, max = 100, colorClass }) => (
    <div className="h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="w-[210px] flex-shrink-0 bg-[#03060c]/90 border-l border-white/5 flex flex-col overflow-y-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/5 flex-shrink-0">
        <p className="text-[9px] font-orbitron font-black tracking-[0.2em] text-neon-blue/60 uppercase">
          System Intelligence
        </p>
      </div>

      <div className="flex flex-col gap-2.5 p-2.5">

        {/* ── AI ENGINE ── */}
        <div className="bg-[#050811]/80 border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-neon-blue/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                <Cpu size={10} className="text-neon-blue" />
              </div>
              <span className="text-[9px] font-orbitron font-bold tracking-widest text-muted uppercase">
                AI Engine
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-bold font-mono">ONLINE</span>
            </div>
          </div>
          <p className="text-[12px] font-mono font-black text-white mb-1 leading-tight">{aiModel}</p>
          <div className="flex items-center gap-2 font-mono text-[8px]">
            <span className="text-gray-500">
              LAT: <span className="text-gray-400">{Math.round(metrics.latency)}ms</span>
            </span>
            <span className="text-white/10">·</span>
            <span className="text-gray-500">
              QPS: <span className="text-gray-400">{metrics.qps.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* ── PERFORMANCE METRICS ── */}
        <div className="bg-[#050811]/80 border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <p className="text-[9px] font-orbitron font-bold tracking-widest text-muted uppercase mb-3">
            Performance Metrics
          </p>

          {/* CPU */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5 font-mono text-[9px]">
              <span className="text-gray-500 uppercase tracking-wider">CPU UTIL</span>
              <span className="text-neon-blue font-bold">{Math.round(metrics.cpu)}%</span>
            </div>
            <MetricBar
              value={metrics.cpu}
              colorClass="bg-gradient-to-r from-neon-blue to-blue-500 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
            />
          </div>

          {/* RAM */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5 font-mono text-[9px]">
              <span className="text-gray-500 uppercase tracking-wider">RAM LOAD</span>
              <span className="text-neon-purple font-bold">
                {metrics.ram.toFixed(1)}G
              </span>
            </div>
            <MetricBar
              value={ramPercent}
              colorClass="bg-gradient-to-r from-neon-purple to-indigo-500 shadow-[0_0_8px_rgba(138,43,226,0.4)]"
            />
          </div>

          {/* GPU */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono text-[9px]">
              <span className="text-gray-500 uppercase tracking-wider">GPU LOAD</span>
              <span className="text-neon-pink font-bold">{Math.round(metrics.gpu)}%</span>
            </div>
            <MetricBar
              value={metrics.gpu}
              colorClass="bg-gradient-to-r from-neon-pink to-rose-400 shadow-[0_0_8px_rgba(255,0,200,0.4)]"
            />
          </div>
        </div>

        {/* ── WORKSPACE STORAGE ── */}
        <div className="bg-[#050811]/80 border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Cloud size={9} className="text-neon-blue" />
            <p className="text-[9px] font-orbitron font-black tracking-widest text-muted uppercase">
              Workspace Storage
            </p>
          </div>

          <div className="flex justify-between items-center mb-2 font-mono text-[9px]">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
              isCritical
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isCritical ? 'CRITICAL' : 'HEALTHY'}
            </span>
            <span className={`text-xs font-black ${isCritical ? 'text-rose-400' : 'text-neon-blue'}`}>
              {storagePercent}%
            </span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCritical
                  ? 'bg-gradient-to-r from-rose-700 to-rose-400'
                  : 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_8px_rgba(0,240,255,0.4)]'
              }`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-[8px] font-mono text-gray-500">
            USED: {storageUsed}G / {storageTotal}G
          </p>
        </div>

        {/* ── DAILY USAGE ── */}
        <div className="bg-[#050811]/80 border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-orbitron font-black tracking-widest text-muted uppercase">
              Daily Usage
            </p>
            <Zap size={10} className="text-neon-pink" />
          </div>

          <div className="flex items-end gap-1 mb-0.5 font-mono">
            <span className="text-xl font-black text-white leading-none">{dailyUsage}</span>
            <span className="text-[9px] text-gray-600 mb-0.5">/ {dailyTotal}</span>
          </div>
          <p className="text-[8px] text-gray-500 tracking-wider font-orbitron mb-2">AI INTERACTIONS</p>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-purple transition-all duration-700 shadow-[0_0_8px_rgba(255,0,200,0.4)]"
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </div>

        {/* ── CONNECTION ── */}
        <div className="bg-[#050811]/80 border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <p className="text-[9px] font-orbitron font-black tracking-widest text-muted uppercase mb-2">
            Connection
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wifi size={10} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-white font-bold font-orbitron uppercase tracking-wider">Connected</p>
              <p className="text-[8px] font-mono text-emerald-400">ACTIVE_STREAM</p>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================
// 🔧 TERMINAL TABS BAR
// ============================================================
const TerminalTabsBar = ({ activeTab, setActiveTab, onClear, onNewTerminal, onClose }) => {
  const tabs = [
    { id: 'terminal',  label: 'TERMINAL',       icon: SquareTerminal },
    { id: 'output',    label: 'OUTPUT',          icon: Activity       },
    { id: 'debug',     label: 'DEBUG',           icon: Bug            },
    { id: 'agent',     label: 'AI AGENT',        icon: Cpu            },
    { id: 'ghost',     label: 'GHOST TYPER',     icon: Keyboard       },
    { id: 'diff',      label: 'AI DIFF',         icon: GitCompare     },
  ];

  return (
    <div className="flex items-center h-8 bg-[#111111] border-b border-white/5 px-2 select-none flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="flex items-center flex-shrink-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 h-8 text-[9px] font-bold tracking-wider transition-all border-b-2 flex-shrink-0 ${
              activeTab === id
                ? 'text-white border-purple-500 bg-white/3'
                : 'text-gray-600 border-transparent hover:text-gray-400'
            }`}
          >
            <Icon size={10} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={onNewTerminal}
          className="p-1.5 text-gray-600 hover:text-white rounded hover:bg-white/5 transition-colors"
          title="New Terminal"
        >
          <Plus size={11} />
        </button>
        <button
          onClick={onClear}
          className="p-1.5 text-gray-600 hover:text-white rounded hover:bg-white/5 transition-colors"
          title="Clear"
        >
          <Trash2 size={11} />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-600 hover:text-white rounded hover:bg-white/5 transition-colors"
          title="Close Panel"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 SMART STATUS BAR
// ============================================================
const SmartStatusBar = ({ content = '', filename = '', cursorLine = 1, cursorCol = 1, language = 'plaintext' }) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content.split('\n').length;
  const chars = content.length;
  const tokens = Math.ceil(chars / 4); // ~4 chars per token
  const costPer1k = 0.0002; // GPT-4o input price estimate
  const costEst = ((tokens / 1000) * costPer1k).toFixed(5);

  return (
    <div className="flex items-center h-5 bg-[#0a0a0a] border-t border-white/5 px-3 gap-4 flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {/* File info */}
      <div className="flex items-center gap-1.5 text-[9px] text-gray-600 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-gray-500 font-mono">{filename || 'untitled'}</span>
        <span className="text-gray-700">·</span>
        <span>{language}</span>
      </div>
      <div className="w-px h-3 bg-white/8" />
      {/* Cursor */}
      <span className="text-[9px] text-gray-700 font-mono flex-shrink-0">Ln {cursorLine}, Col {cursorCol}</span>
      <div className="w-px h-3 bg-white/8" />
      {/* Stats */}
      <div className="flex items-center gap-3 text-[9px] text-gray-700 flex-shrink-0">
        <span className="flex items-center gap-1"><AlignLeft size={8} className="text-gray-600" />{lines.toLocaleString()} lines</span>
        <span className="flex items-center gap-1"><Hash size={8} className="text-gray-600" />{words.toLocaleString()} words</span>
        <span className="flex items-center gap-1"><Cpu size={8} className="text-gray-600" />~{tokens.toLocaleString()} tokens</span>
        <span className="flex items-center gap-1 text-purple-500/60"><DollarSign size={8} />${costEst}</span>
      </div>
      <div className="flex-1" />
      {/* Right side */}
      <div className="flex items-center gap-3 text-[9px] text-gray-700 flex-shrink-0">
        <span className="flex items-center gap-1"><Clock size={8} className="text-gray-600" />{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="text-green-500/70 font-bold">● HARVOX IDE v2.4</span>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 GHOST TYPER PANEL
// ============================================================
const GhostTyperPanel = () => {
  const [text, setText]             = useState('');
  const [delay, setDelay]           = useState(30);
  const [status, setStatus]         = useState(null); // null | 'loading' | 'success' | 'error'
  const [statusMsg, setStatusMsg]   = useState('');
  const [history, setHistory]       = useState([]);

  const handleType = async () => {
    if (!text.trim()) return;
    setStatus('loading');
    setStatusMsg('Injecting keystrokes into focused window...');
    try {
      const { data } = await automationAPI.executeStep({
        action: 'type_text',
        args: [text, String(delay)]
      });
      setStatus('success');
      setStatusMsg(data.message || 'Text typed successfully.');
      setHistory(prev => [{ text: text.slice(0, 60) + (text.length > 60 ? '…' : ''), time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.response?.data?.message || err.message || 'Typing failed.');
    }
  };

  const handleClear = () => { setText(''); setStatus(null); setStatusMsg(''); };

  return (
    <div className="h-full flex overflow-hidden p-3 gap-3">
      {/* Left: Input */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <Keyboard size={12} className="text-purple-400" />
          <span className="text-[10px] font-bold tracking-widest text-white uppercase">Ghost Typer</span>
          <span className="text-[9px] text-gray-600 ml-1">— AI types into any focused window</span>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text to inject into the focused OS window...\n\nTip: Click any text input field outside HARVOX first, then click 'Type For Me'."
          className="flex-1 bg-black/40 border border-white/8 rounded-xl p-3 text-[11px] text-white placeholder-gray-700 font-mono resize-none focus:outline-none focus:border-purple-500/40 transition-colors"
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleType(); }}
        />

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-600">Speed (ms/char):</span>
            <input
              type="range" min="5" max="200" step="5"
              value={delay}
              onChange={e => setDelay(Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
            <span className="text-[9px] text-purple-400 font-mono w-8">{delay}ms</span>
          </div>
          <div className="flex-1" />
          <button onClick={handleClear} className="px-3 py-1.5 text-[10px] text-gray-600 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/8 transition-colors">
            Clear
          </button>
          <button
            onClick={handleType}
            disabled={!text.trim() || status === 'loading'}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold text-black bg-purple-400 hover:bg-purple-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-lg shadow-purple-500/20"
          >
            {status === 'loading' ? <Loader2 size={11} className="animate-spin" /> : <Keyboard size={11} />}
            {status === 'loading' ? 'Typing...' : 'Type For Me'}
          </button>
        </div>

        {/* Status */}
        {statusMsg && (
          <div className={`flex items-center gap-2 p-2 rounded-lg text-[10px] font-mono ${
            status === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
            status === 'error'   ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
            'bg-white/5 border border-white/10 text-gray-400'
          }`}>
            {status === 'success' && <Check size={10} />}
            {status === 'error'   && <X size={10} />}
            {status === 'loading' && <Loader2 size={10} className="animate-spin" />}
            {statusMsg}
          </div>
        )}
      </div>

      {/* Right: History */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2">
        <span className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">Type History</span>
        <div className="flex-1 bg-black/30 border border-white/5 rounded-xl p-2 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
          {history.length === 0 ? (
            <p className="text-[9px] text-gray-700 italic text-center mt-4">No history yet</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex flex-col gap-0.5 p-1.5 bg-white/3 rounded-lg border border-white/5">
                <span className="text-[9px] text-gray-500 font-mono">{h.time}</span>
                <span className="text-[10px] text-gray-400 truncate">{h.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 AI DIFF EXPLAINER PANEL
// ============================================================
const AIDiffPanel = () => {
  const [codeA, setCodeA]           = useState('');
  const [codeB, setCodeB]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [explanation, setExplanation] = useState('');
  const [diffLines, setDiffLines]   = useState([]);

  const computeDiff = (a, b) => {
    const linesA = a.split('\n');
    const linesB = b.split('\n');
    const max = Math.max(linesA.length, linesB.length);
    const result = [];
    for (let i = 0; i < max; i++) {
      const la = linesA[i] ?? null;
      const lb = linesB[i] ?? null;
      if (la === lb)    result.push({ type: 'same',    a: la, b: lb });
      else if (la === null) result.push({ type: 'added',   a: '',  b: lb });
      else if (lb === null) result.push({ type: 'removed', a: la,  b: '' });
      else                  result.push({ type: 'changed', a: la,  b: lb });
    }
    return result;
  };

  const handleAnalyze = async () => {
    if (!codeA.trim() && !codeB.trim()) return;
    setLoading(true);
    setExplanation('');
    const diff = computeDiff(codeA, codeB);
    setDiffLines(diff);
    try {
      const { data } = await aiAPI.chat({
        message: `You are a senior code reviewer. Analyze the difference between Version A and Version B of this code and explain what changed, why it matters, any bugs introduced or fixed, and best practices.\n\n--- VERSION A ---\n${codeA}\n\n--- VERSION B ---\n${codeB}\n\nProvide a clear, structured explanation in 3-5 sentences.`
      });
      setExplanation(data.reply || 'No explanation generated.');
    } catch (err) {
      setExplanation(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const typeColor = { same: 'text-gray-600', added: 'text-green-400 bg-green-500/10', removed: 'text-red-400 bg-red-500/10 line-through', changed: 'text-yellow-400 bg-yellow-500/10' };

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-2">
      <div className="flex items-center gap-2 flex-shrink-0">
        <GitCompare size={12} className="text-purple-400" />
        <span className="text-[10px] font-bold tracking-widest text-white uppercase">AI Diff Explainer</span>
        <span className="text-[9px] text-gray-600 ml-1">— Compare two code versions with AI analysis</span>
        <div className="flex-1" />
        <button
          onClick={handleAnalyze}
          disabled={loading || (!codeA.trim() && !codeB.trim())}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold text-black bg-purple-400 hover:bg-purple-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          {loading ? 'Analyzing...' : 'AI Analyze'}
        </button>
      </div>

      <div className="flex gap-2 flex-1 overflow-hidden min-h-0">
        {/* Code inputs */}
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-[9px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-red-500/60" /> Version A (Original)
          </label>
          <textarea
            value={codeA}
            onChange={e => setCodeA(e.target.value)}
            placeholder="Paste original code..."
            className="flex-1 bg-black/40 border border-white/8 rounded-xl p-2.5 text-[10px] text-white placeholder-gray-700 font-mono resize-none focus:outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-[9px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-green-500/60" /> Version B (Modified)
          </label>
          <textarea
            value={codeB}
            onChange={e => setCodeB(e.target.value)}
            placeholder="Paste modified code..."
            className="flex-1 bg-black/40 border border-white/8 rounded-xl p-2.5 text-[10px] text-white placeholder-gray-700 font-mono resize-none focus:outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>

        {/* Diff output + AI */}
        <div className="flex flex-col gap-1 w-1/3">
          <label className="text-[9px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={9} className="text-purple-400" /> AI Explanation & Diff
          </label>
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* AI Explanation */}
            {explanation && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5 text-[10px] text-gray-300 leading-relaxed flex-shrink-0">
                <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">AI Analysis</p>
                {explanation}
              </div>
            )}
            {/* Line diff */}
            {diffLines.length > 0 && (
              <div className="bg-black/40 border border-white/5 rounded-xl p-2 font-mono text-[9px] space-y-0.5 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {diffLines.map((d, i) => d.type !== 'same' && (
                  <div key={i} className={`flex gap-2 px-1 rounded ${typeColor[d.type]}`}>
                    <span className="w-3 flex-shrink-0">{d.type === 'added' ? '+' : d.type === 'removed' ? '-' : '~'}</span>
                    <span className="truncate">{d.b || d.a}</span>
                  </div>
                ))}
              </div>
            )}
            {diffLines.length === 0 && !loading && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[9px] text-gray-700 italic">Paste code in both panels and click AI Analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 FLOATING NOTES PAD
// ============================================================
const FloatingNotesPad = ({ onClose }) => {
  const STORAGE_KEY = 'harvox_scratch_notes';
  const [notes, setNotes] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [pos, setPos]     = useState({ x: 80, y: 80 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const padRef    = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, notes);
  }, [notes]);

  const handleMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX - pos.x, my: e.clientY - pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => setPos({ x: e.clientX - dragStart.current.mx, y: e.clientY - dragStart.current.my });
    const onUp   = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup',   onUp); };
  }, [dragging]);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div
      ref={padRef}
      style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: 100, width: 320 }}
      className="bg-[#0f0d06]/98 border border-yellow-500/30 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.15)] backdrop-blur-xl flex flex-col overflow-hidden animate-fade-in"
    >
      {/* Danger/Warning Stripes Strip */}
      <div className="h-1 w-full flex-shrink-0" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #eab308, #eab308 6px, #000 6px, #000 12px)'
      }} />

      {/* Header - drag handle */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1608]/90 border-b border-yellow-500/15 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <StickyNote size={11} className="text-yellow-500 animate-pulse" />
        <span className="text-[10px] font-orbitron font-extrabold tracking-[0.15em] text-yellow-400 uppercase">Scratch Notes</span>
        <div className="flex-1" />
        <span className="text-[9px] text-yellow-600/70 font-mono font-bold bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10">{wordCount}w</span>
        <button onClick={() => setNotes('')} className="p-1 text-yellow-600 hover:text-yellow-400 transition-colors" title="Clear">
          <RotateCcw size={10} />
        </button>
        <button onClick={onClose} className="p-1 text-yellow-600 hover:text-white transition-colors">
          <X size={10} />
        </button>
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Scratch notes... (auto-saved)"
        className="flex-1 bg-transparent text-[11px] text-yellow-100/90 placeholder-yellow-600/40 font-mono p-3 resize-none focus:outline-none min-h-[180px] max-h-[400px] leading-relaxed"
        style={{ scrollbarWidth: 'thin' }}
      />
      <div className="px-3 py-2 border-t border-yellow-500/10 text-[8px] text-yellow-500/50 font-mono bg-[#161205]/60 select-none flex items-center justify-between">
        <span>⚠️ TELEMETRY PERSISTENCE ACTIVE</span>
        <span>DRAG TO MOVE</span>
      </div>
    </div>
  );
};

// ============================================================
// 🔧 EXPLORER HEADER
// ============================================================
const ExplorerHeader = ({ onSearch, onNewFile, onNewFolder }) => (
  <div className="flex-shrink-0 border-b border-white/5">
    <div className="flex items-center justify-between px-3 py-2.5">
      <p className="text-[9px] font-black tracking-[0.18em] text-gray-500 uppercase">
        Project Explorer
      </p>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onNewFile}
          className="p-1 text-gray-600 hover:text-white rounded hover:bg-white/10 transition-colors"
          title="New File"
        >
          <FilePlus size={12} />
        </button>
        <button
          onClick={onNewFolder}
          className="p-1 text-gray-600 hover:text-white rounded hover:bg-white/10 transition-colors"
          title="New Folder"
        >
          <FolderPlus size={12} />
        </button>
      </div>
    </div>

    <div className="px-3 pb-2.5">
      <div className="flex items-center gap-2 bg-white/5 rounded-md px-2.5 py-1.5 border border-white/5 focus-within:border-purple-500/40 transition-colors">
        <Search size={10} className="text-gray-600 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search files.."
          onChange={(e) => onSearch?.(e.target.value)}
          className="bg-transparent text-[10px] text-gray-300 placeholder-gray-700 outline-none w-full"
        />
      </div>
    </div>
  </div>
);

// ============================================================
// 🚀 MAIN WORKSPACE COMPONENT
// ============================================================
export default function WorkspaceOS() {
  const {
    focusMode, toggleFocusMode,
    activeFile, openFiles,
    setActiveFile, closeFile, updateFileContent,
  } = useWorkspaceStore();

  // Editor
  const [editorContent,    setEditorContent]    = useState('');

  // Preview
  const [previewContent,   setPreviewContent]   = useState(null);
  const [previewKey,       setPreviewKey]        = useState(0);
  const [previewFullWidth, setPreviewFullWidth]  = useState(false);

  // Layout
  const [showSystemPanel,   setShowSystemPanel]  = useState(true);
  const [showTerminal,      setShowTerminal]      = useState(true);
  const [activeBottomTab,   setActiveBottomTab]  = useState('terminal');
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [isResizing,        setIsResizing]        = useState(false);

  // Floating widgets
  const [showMusicPlayer,   setShowMusicPlayer]  = useState(false);
  const [showNotesPad,      setShowNotesPad]     = useState(false);

  // Smart Status Bar cursor tracking
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol,  setCursorCol]  = useState(1);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null); // { x, y, selectedText }
  const [contextLoading, setContextLoading] = useState(false);
  const [contextResult, setContextResult] = useState(null);

  // Floating Music Player Widget
  const [musicSearchQuery,  setMusicSearchQuery] = useState('');
  const [musicPlaying,      setMusicPlaying]     = useState(false);
  const [currentSongName,   setCurrentSongName]  = useState('Cyberpunk Synthwave Beats');

  // AI Agent Core State
  const [agentTask,         setAgentTask]        = useState('');
  const [agentRunning,      setAgentRunning]     = useState(false);
  const [agentSteps,        setAgentSteps]       = useState([]);
  const [agentLogs,         setAgentLogs]        = useState([]);
  const agentLogsEndRef                          = useRef(null);

  // Monaco autocomplete refs
  const monacoRef = useRef(null);
  const inlineProviderRef = useRef(null);

  const containerRef = useRef(null);

  // ── Sync editor with active file ──
  useEffect(() => {
    setEditorContent(activeFile?.content || '');
  }, [activeFile]);

  // ── Bottom panel drag resize ──
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newH  = rect.bottom - e.clientY;
      setBottomPanelHeight(Math.min(Math.max(newH, 120), 520));
    };
    const onMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup',   onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [isResizing]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'F5') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeFile, editorContent]);

  // ── Monaco Autocomplete (Smart Compose) Inline Suggestion Logic ──
  const getAICompletion = async (snippet) => {
    try {
      const { data } = await aiAPI.chat({
        message: `Complete this code snippet (return ONLY the inline code completion, no comments, no code blocks, no markdown, just the direct completion text. If nothing makes sense, return empty): \n\n${snippet}`
      });
      let reply = data.reply || '';
      if (reply.startsWith('```')) {
        reply = reply.replace(/```[a-zA-Z]*\n?|```/g, '');
      }
      return reply;
    } catch (err) {
      console.error('Failed to fetch autocomplete suggestion:', err);
      return '';
    }
  };

  const registerInlineCompletions = (monaco) => {
    if (inlineProviderRef.current) {
      inlineProviderRef.current.dispose();
    }

    const lang = getLanguage(activeFile?.name || '');
    inlineProviderRef.current = monaco.languages.registerInlineCompletionsProvider(lang, {
      provideInlineCompletions: async (model, position) => {
        const text = model.getValueInRange({
          startLineNumber: Math.max(1, position.lineNumber - 5),
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        if (!text.trim() || text.length < 5) return { items: [] };

        // Debounce: wait 700ms
        await new Promise(resolve => setTimeout(resolve, 700));

        const completion = await getAICompletion(text);
        if (!completion || !completion.trim()) return { items: [] };

        return {
          items: [
            {
              insertText: completion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              )
            }
          ]
        };
      },
      freeInlineCompletions: () => {}
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = monaco;
    registerInlineCompletions(monaco);

    // Track cursor position for Status Bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorLine(e.position.lineNumber);
      setCursorCol(e.position.column);
    });

    // Right-click context menu (AI actions)
    editor.addAction({
      id: 'harvox-fix-code',
      label: '🔧 HARVOX: Fix This Code',
      contextMenuGroupId: 'harvox',
      contextMenuOrder: 1,
      run: async (ed) => {
        const selection = ed.getModel().getValueInRange(ed.getSelection());
        if (!selection.trim()) return;
        setContextResult(null);
        setContextLoading(true);
        setContextMenu({ x: 200, y: 100, selectedText: selection, mode: 'fix' });
        try {
          const { data } = await aiAPI.chat({
            message: `Fix the following code. Return ONLY the corrected code with no explanation:\n\n${selection}`
          });
          setContextResult(data.reply);
        } catch (err) {
          setContextResult('Error: ' + err.message);
        } finally {
          setContextLoading(false);
        }
      }
    });

    editor.addAction({
      id: 'harvox-explain-code',
      label: '💡 HARVOX: Explain This Code',
      contextMenuGroupId: 'harvox',
      contextMenuOrder: 2,
      run: async (ed) => {
        const selection = ed.getModel().getValueInRange(ed.getSelection());
        if (!selection.trim()) return;
        setContextResult(null);
        setContextLoading(true);
        setContextMenu({ x: 200, y: 100, selectedText: selection, mode: 'explain' });
        try {
          const { data } = await aiAPI.chat({
            message: `Explain this code clearly and concisely in 3-4 sentences:\n\n${selection}`
          });
          setContextResult(data.reply);
        } catch (err) {
          setContextResult('Error: ' + err.message);
        } finally {
          setContextLoading(false);
        }
      }
    });

    editor.addAction({
      id: 'harvox-optimize-code',
      label: '⚡ HARVOX: Optimize This Code',
      contextMenuGroupId: 'harvox',
      contextMenuOrder: 3,
      run: async (ed) => {
        const selection = ed.getModel().getValueInRange(ed.getSelection());
        if (!selection.trim()) return;
        setContextResult(null);
        setContextLoading(true);
        setContextMenu({ x: 200, y: 100, selectedText: selection, mode: 'optimize' });
        try {
          const { data } = await aiAPI.chat({
            message: `Optimize this code for performance and readability. Return ONLY the optimized code:\n\n${selection}`
          });
          setContextResult(data.reply);
        } catch (err) {
          setContextResult('Error: ' + err.message);
        } finally {
          setContextLoading(false);
        }
      }
    });
  };

  useEffect(() => {
    if (monacoRef.current) {
      registerInlineCompletions(monacoRef.current);
    }
  }, [activeFile]);

  useEffect(() => {
    return () => {
      if (inlineProviderRef.current) {
        inlineProviderRef.current.dispose();
      }
    };
  }, []);

  // ── Music Player Controls ──
  const handlePlayMusic = async (songName) => {
    const targetSong = songName || musicSearchQuery;
    if (!targetSong.trim()) return;
    setMusicPlaying(true);
    setCurrentSongName(targetSong);
    try {
      await automationAPI.executeStep({
        action: 'play_music',
        args: [targetSong]
      });
    } catch (err) {
      console.error('Failed to play music:', err);
    }
  };

  const handleMediaControl = async (cmd) => {
    try {
      await automationAPI.executeStep({
        action: 'media_control',
        args: [cmd]
      });
    } catch (err) {
      console.error('Failed to send media control:', err);
    }
  };

  // ── AI Autonomous Agent Execution ──
  const addAgentLog = (text, type = 'info') => {
    setAgentLogs(prev => [...prev, { text, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    if (agentLogsEndRef.current) {
      agentLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  const runAgentTask = async () => {
    if (!agentTask.trim()) return;
    setAgentRunning(true);
    setAgentLogs([]);
    setAgentSteps([]);
    addAgentLog(`Initializing Agent Core for task: "${agentTask}"...`, 'info');

    try {
      // Step 1: Decompose task using AI
      addAgentLog('Querying AI model for cognitive decomposition...', 'info');
      const { data: aiResponse } = await aiAPI.chat({
        message: `You are the HARVOX OS Autonomous AI Agent planner.
Analyze this user task and break it down into a JSON array of automation steps:
"${agentTask}"

Allowed actions are:
- 'mkdir' (args: [folderName])
- 'create_file' (args: [fileName, content])
- 'run_command' (args: [shellCommand])
- 'type_text' (args: [textToType])
- 'click_element' (args: [buttonNameOrCoords])
- 'play_music' (args: [songQuery])

Format your output EXACTLY as a JSON object:
{
  "title": "Task Title",
  "steps": [
    {
      "description": "Step explanation",
      "action": "action_name",
      "args": ["arg1", "arg2"]
    }
  ]
}
Return ONLY valid JSON. Do not include markdown code block backticks (like \`\`\`json) or any conversational text.`
      });

      let cleanReply = aiResponse.reply.trim();
      if (cleanReply.startsWith('```json')) {
        cleanReply = cleanReply.substring(7);
      }
      if (cleanReply.startsWith('```')) {
        cleanReply = cleanReply.substring(3);
      }
      if (cleanReply.endsWith('```')) {
        cleanReply = cleanReply.substring(0, cleanReply.length - 3);
      }
      cleanReply = cleanReply.trim();

      const plan = JSON.parse(cleanReply);
      addAgentLog(`Task plan generated successfully: ${plan.title}`, 'success');
      setAgentSteps(plan.steps.map(s => ({ ...s, status: 'pending' })));

      // Step 2: Sequentially execute plan steps
      const stepsCopy = plan.steps.map(s => ({ ...s, status: 'pending' }));
      for (let i = 0; i < stepsCopy.length; i++) {
        const step = stepsCopy[i];
        addAgentLog(`[Agent Core] Executing step ${i + 1}: ${step.description}`, 'info');
        setAgentSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));

        try {
          const { data } = await automationAPI.executeStep({
            action: step.action,
            args: step.args
          });
          setAgentSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
          addAgentLog(`✓ ${data.message || 'Done.'}`, 'success');
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || 'Execution error';
          setAgentSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'failed' } : s));
          addAgentLog(`✗ Step failed: ${errMsg}`, 'error');
          setAgentRunning(false);
          return;
        }
      }

      addAgentLog('★ [Agent Core] All tasks executed successfully! Synaptic thread closed.', 'success');
    } catch (err) {
      addAgentLog(`✗ Failed to parse task plan: ${err.message}`, 'error');
    } finally {
      setAgentRunning(false);
    }
  };

  const handleSave = () => {
    if (activeFile) updateFileContent(activeFile.id, editorContent);
  };

  const handleRun = () => {
    if (!activeFile) return;
    updateFileContent(activeFile.id, editorContent);
    const previewExts = ['html', 'js', 'jsx', 'ts', 'tsx'];
    const ext = activeFile.name.split('.').pop()?.toLowerCase();
    if (previewExts.includes(ext)) {
      setPreviewContent(editorContent);
      setPreviewKey(k => k + 1);
      setPreviewFullWidth(false);
    } else {
      setActiveBottomTab('output');
      setShowTerminal(true);
    }
  };

  const handleRefreshPreview = () => {
    setPreviewKey(k => k + 1);
  };

  const handleClosePreview = () => {
    setPreviewContent(null);
    setPreviewFullWidth(false);
  };

  // ── Build iframe srcDoc ──
  const buildSrcDoc = () => {
    if (!activeFile) return '';
    const isHTML = activeFile.name.endsWith('.html');

    if (isHTML) return previewContent;

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Segoe UI', sans-serif;
        background: #111827;
        color: #e5e7eb;
        padding: 20px;
        min-height: 100vh;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #1f2937;
      }
      .dot { width:8px; height:8px; border-radius:50%; }
      .title { font-size: 11px; color: #6b7280; font-weight: 600; letter-spacing: 0.05em; }
      .console-box {
        background: #0d1117;
        border: 1px solid #1f2937;
        border-radius: 10px;
        padding: 16px;
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.7;
        min-height: 120px;
      }
      .log   { color: #d1d5db; }
      .error { color: #f87171; }
      .warn  { color: #fbbf24; }
      .info  { color: #60a5fa; }
      .success { color: #34d399; }
      .prompt { color: #8b5cf6; margin-right: 6px; }
      .empty  { color: #374151; font-style: italic; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="dot" style="background:#ef4444"></div>
      <div class="dot" style="background:#f59e0b"></div>
      <div class="dot" style="background:#10b981"></div>
      <span class="title">▶ SCRIPT OUTPUT — ${activeFile.name}</span>
    </div>
    <div class="console-box" id="output">
      <span class="empty">Waiting for output...</span>
    </div>
    <script>
      const output = document.getElementById('output');
      let hasOutput = false;

      const write = (text, cls) => {
        if (!hasOutput) { output.innerHTML = ''; hasOutput = true; }
        const line = document.createElement('div');
        line.innerHTML = '<span class="prompt">›</span><span class="' + cls + '">' + String(text).replace(/</g,'&lt;') + '</span>';
        output.appendChild(line);
      };

      const origLog   = console.log;
      const origError = console.error;
      const origWarn  = console.warn;
      const origInfo  = console.info;

      console.log   = (...a) => { write(a.join(' '), 'log');     origLog(...a);   };
      console.error = (...a) => { write(a.join(' '), 'error');   origError(...a); };
      console.warn  = (...a) => { write(a.join(' '), 'warn');    origWarn(...a);  };
      console.info  = (...a) => { write(a.join(' '), 'info');    origInfo(...a);  };

      try {
        ${previewContent}
        if (!hasOutput) {
          output.innerHTML = '<span class="success prompt">›</span><span class="success">Script executed successfully with no output.</span>';
        }
      } catch(e) {
        if (!hasOutput) output.innerHTML = '';
        write('Error: ' + e.message, 'error');
      }
    </script>
  </body>
</html>`;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col w-full bg-[#08080f]/95 text-white overflow-hidden transition-all duration-300 relative backdrop-blur-xl
        ${focusMode
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none'
          : 'h-[calc(100vh-64px)] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(138,43,226,0.15)] bg-gradient-to-b from-[#08080f]/95 to-[#030307]/98'
        }
      `}
    >

      {/* ===========================================================
          HEADER
      =========================================================== */}
      <div className="flex h-10 items-center justify-between bg-[#05050a]/90 px-4 border-b border-white/5 flex-shrink-0 select-none">

        {/* Left - Logo & Window controls */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer shadow-[0_0_8px_rgba(255,95,86,0.5)] transition-all duration-300 hover:scale-110" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer shadow-[0_0_8px_rgba(255,189,46,0.5)] transition-all duration-300 hover:scale-110" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer shadow-[0_0_8px_rgba(39,201,63,0.5)] transition-all duration-300 hover:scale-110" />
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow">
              <span className="text-[9px] font-black text-white">H</span>
            </div>
            <div>
              <span className="text-[11px] font-black text-white tracking-widest">HARVOX</span>
              <span className="text-[11px] font-black text-purple-400 tracking-widest ml-1">IDE</span>
            </div>
            <span className="text-[8px] text-gray-700 font-semibold bg-white/5 px-1.5 py-0.5 rounded">v2.4.0</span>
          </div>
        </div>

        {/* Center - Breadcrumb */}
        {activeFile && (
          <div className="flex items-center gap-1 text-[10px] text-gray-600 absolute left-1/2 -translate-x-1/2">
            <Code2 size={10} className="text-gray-700" />
            <span>src</span>
            <ChevronRight size={10} className="text-gray-700" />
            <span className={`font-bold ${getFileColor(activeFile.name)}`}>
              {activeFile.name}
            </span>
          </div>
        )}

        {/* Right - Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNotesPad(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
              showNotesPad
                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                : 'text-gray-600 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Scratch Notes"
          >
            <StickyNote size={11} />
            Notes
          </button>
          <button
            onClick={() => { setShowMusicPlayer(v => !v); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
              showMusicPlayer
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-600 hover:text-white hover:bg-white/5'
            }`}
            title="Launch Music Core Controls"
          >
            <Music size={11} />
            Music Core
          </button>
          <button
            onClick={() => { setShowTerminal(v => !v); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
              showTerminal
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-600 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Terminal"
          >
            <SquareTerminal size={11} />
            Terminal
          </button>
          <button
            onClick={() => setShowSystemPanel(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
              showSystemPanel
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-600 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle System Panel"
          >
            <Activity size={11} />
            System
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={toggleFocusMode}
            className="text-gray-600 hover:text-white transition-colors p-1.5 rounded hover:bg-white/5"
            title={focusMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {focusMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ===========================================================
          MAIN BODY
      =========================================================== */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[230px] flex-shrink-0 bg-[#0f0f0f] border-r border-white/5 flex flex-col">
          <ExplorerHeader
            onSearch={() => {}}
            onNewFile={() => {}}
            onNewFolder={() => {}}
          />
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <FileExplorer />
          </div>
        </div>

        {/* ── CENTER COLUMN ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

          {/* TABS ROW */}
          <div
            className="flex bg-[#0a0a0a] h-9 items-end border-b border-white/5 flex-shrink-0 overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {openFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFile(file)}
                className={`
                  flex items-center gap-1.5 px-3 h-full min-w-[110px] max-w-[170px]
                  text-[11px] cursor-pointer transition-all group flex-shrink-0
                  border-r border-white/5
                  ${activeFile?.id === file.id
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-t-purple-500'
                    : 'text-gray-600 hover:text-gray-300 hover:bg-white/3 border-t-2 border-t-transparent'
                  }
                `}
              >
                <span className="text-[9px]">{getFileIcon(file.name)}</span>
                <span className={`text-[10px] font-semibold truncate flex-1 ${
                  activeFile?.id === file.id ? getFileColor(file.name) : ''
                }`}>
                  {file.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                  className={`p-0.5 rounded hover:bg-white/15 flex-shrink-0 transition-opacity ${
                    activeFile?.id === file.id
                      ? 'opacity-50 hover:opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {openFiles.length === 0 && (
              <div className="px-4 py-2 text-[11px] text-gray-700 italic self-center">
                No files open
              </div>
            )}

            <div className="flex-1" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 px-3 self-center flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={!activeFile}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-white/5"
              >
                <Save size={10} /> Save
              </button>
              <button
                onClick={handleRun}
                disabled={!activeFile}
                className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-black bg-green-400 hover:bg-green-300 rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
              >
                <Play size={10} /> Run
              </button>
            </div>
          </div>

          {/* ✅ EDITOR + PREVIEW - FULL HEIGHT FLEX */}
          <div className="flex-1 flex overflow-hidden relative">

            {/* Monaco Editor */}
            {(!previewFullWidth) && (
              <div className={`
                flex flex-col overflow-hidden transition-all duration-300
                ${previewContent !== null ? 'w-1/2 border-r border-white/5' : 'flex-1'}
              `}>
                {activeFile ? (
                  <Editor
                    height="100%"
                    language={getLanguage(activeFile.name)}
                    theme="vs-dark"
                    value={editorContent}
                    onMount={handleEditorDidMount}
                    onChange={(val = '') => {
                      setEditorContent(val);
                      if (activeFile) updateFileContent(activeFile.id, val);
                    }}
                    options={{
                      minimap:              { enabled: false },
                      fontSize:             13,
                      fontFamily:           "'JetBrains Mono','Fira Code','Droid Sans Mono',monospace",
                      fontLigatures:        true,
                      padding:              { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling:      true,
                      cursorBlinking:       'smooth',
                      cursorWidth:          2,
                      lineNumbers:          'on',
                      renderLineHighlight:  'gutter',
                      bracketPairColorization: { enabled: true },
                      guides:               { bracketPairs: true },
                      tabSize:              2,
                      wordWrap:             'off',
                    }}
                  />
                ) : (
                  /* ── EMPTY STATE ── */
                  <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0d0d] gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
                          <span className="text-base font-black text-white">H</span>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0d0d0d] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-200 animate-ping" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-400 tracking-widest">HARVOX IDE</p>
                      <p className="text-[11px] text-gray-700 mt-1">
                        Open a file from the Explorer to start coding
                      </p>
                      <p className="text-[10px] text-purple-400 mt-2 font-mono">
                        💡 Smart Compose Active (Gmail-style tab autocomplete)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center text-[10px] text-gray-700">
                      {[
                        ['Ctrl+S', 'Save'],
                        ['F5', 'Run'],
                        ['Ctrl+Z', 'Undo'],
                        ['Ctrl+K', 'Command Palette'],
                      ].map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/5 rounded border border-white/10 font-mono text-gray-500">
                            {key}
                          </kbd>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ✅ LIVE PREVIEW PANE - FULL HEIGHT */}
            {previewContent !== null && (
              <div className={`
                flex flex-col overflow-hidden bg-[#111]
                transition-all duration-300
                ${previewFullWidth ? 'flex-1' : 'w-1/2'}
              `}>

                {/* Preview Toolbar */}
                <div className="flex items-center gap-2 px-3 h-9 bg-[#0a0a0a] border-b border-white/5 flex-shrink-0">

                  {/* Browser dots */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>

                  {/* URL Bar */}
                  <div className="flex-1 bg-white/5 border border-white/8 rounded-md px-2.5 py-1 flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] text-gray-500 truncate font-mono">
                      localhost:3000/{activeFile?.name}
                    </span>
                  </div>

                  {/* Preview Actions */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={handleRefreshPreview}
                      className="p-1.5 text-gray-600 hover:text-white rounded hover:bg-white/8 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw size={11} />
                    </button>
                    <button
                      onClick={() => setPreviewFullWidth(v => !v)}
                      className={`p-1.5 rounded transition-colors ${
                        previewFullWidth
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-gray-600 hover:text-white hover:bg-white/8'
                      }`}
                      title={previewFullWidth ? 'Split View' : 'Full Width Preview'}
                    >
                      {previewFullWidth ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                    </button>
                    <button
                      onClick={handleClosePreview}
                      className="p-1.5 text-gray-600 hover:text-red-400 rounded hover:bg-white/8 transition-colors"
                      title="Close Preview"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>

                {/* ✅ IFRAME - TAKES ALL REMAINING HEIGHT */}
                <div className="flex-1 overflow-hidden">
                  <iframe
                    key={previewKey}
                    className="w-full h-full border-none block"
                    srcDoc={buildSrcDoc()}
                    sandbox="allow-scripts allow-same-origin"
                    title="Live Preview"
                  />
                </div>
              </div>
            )}

            {/* ✅ FLOATING HOLOGRAPHIC MUSIC PLAYER WIDGET */}
            {showMusicPlayer && (
              <div className="absolute right-4 top-4 z-50 w-72 bg-[#0c0a15]/95 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(138,43,226,0.3)] font-mono text-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-orbitron font-black text-neon-purple tracking-widest uppercase">
                    HARVOX MUSIC CORE
                  </span>
                  <button onClick={() => setShowMusicPlayer(false)} className="text-gray-500 hover:text-white">
                    <X size={12} />
                  </button>
                </div>

                <div className="bg-black/45 rounded-xl border border-white/5 p-3 space-y-1.5 text-center">
                  <p className="text-[9px] text-gray-500 font-mono tracking-wider">CURRENT TELEMETRY TRACK</p>
                  <p className="text-[11px] text-white font-bold font-sans truncate">{currentSongName}</p>
                  
                  {/* Equalizer Visualizer */}
                  <div className="flex items-end justify-center gap-1.5 h-8 my-2 select-none">
                    {[
                      'animate-eq-1 bg-neon-blue',
                      'animate-eq-2 bg-neon-purple',
                      'animate-eq-3 bg-neon-pink',
                      'animate-eq-4 bg-neon-blue',
                      'animate-eq-5 bg-neon-purple',
                      'animate-eq-2 bg-neon-pink'
                    ].map((cls, i) => (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-300 ${musicPlaying ? cls : 'h-1 bg-white/10'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search song to play..."
                    value={musicSearchQuery}
                    onChange={(e) => setMusicSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePlayMusic()}
                    className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none"
                  />
                  <button
                    onClick={() => handlePlayMusic()}
                    className="p-1.5 bg-neon-purple text-white rounded-xl hover:bg-neon-purple/80"
                  >
                    <Play size={12} />
                  </button>
                </div>

                {/* Pre-sets */}
                <div className="mt-3.5 space-y-1">
                  <p className="text-[8px] text-gray-600 uppercase tracking-widest">Neural Stations</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handlePlayMusic('Lofi Coding beats on youtube')}
                      className="p-1.5 bg-white/3 border border-white/5 rounded-lg text-gray-400 hover:text-white text-left truncate text-[10px]"
                    >
                      🎵 Lofi Coding
                    </button>
                    <button
                      onClick={() => handlePlayMusic('Synthwave Cyberpunk mix on youtube')}
                      className="p-1.5 bg-white/3 border border-white/5 rounded-lg text-gray-400 hover:text-white text-left truncate text-[10px]"
                    >
                      🎵 Cyberpunk
                    </button>
                  </div>
                </div>

                {/* Volume system control */}
                <div className="mt-3.5 border-t border-white/5 pt-2.5 flex items-center justify-between">
                  <span className="text-[8px] text-gray-600 uppercase font-mono">System Volume</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleMediaControl('voldown')} className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded">
                      <VolumeX size={12} />
                    </button>
                    <button onClick={() => handleMediaControl('volup')} className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded">
                      <Volume2 size={12} />
                    </button>
                    <button onClick={() => handleMediaControl('mute')} className="p-1 hover:bg-white/5 text-red-500/70 hover:text-red-400 rounded">
                      <VolumeX size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── AI CONTEXT MENU RESULT PANEL ── */}
          {contextMenu && (
            <div
              className="absolute right-4 top-12 z-50 w-96 bg-[#0e0e1a]/96 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 backdrop-blur-xl overflow-hidden"
              style={{ maxHeight: '60%' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a14] border-b border-purple-500/10">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  contextMenu.mode === 'fix' ? 'bg-red-500/20' :
                  contextMenu.mode === 'explain' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                }`}>
                  {contextMenu.mode === 'fix' && <Wand2 size={10} className="text-red-400" />}
                  {contextMenu.mode === 'explain' && <MessageSquare size={10} className="text-blue-400" />}
                  {contextMenu.mode === 'optimize' && <Zap size={10} className="text-yellow-400" />}
                </div>
                <span className="text-[10px] font-bold text-white capitalize tracking-wider">
                  AI {contextMenu.mode} Result
                </span>
                <div className="flex-1" />
                {contextResult && (
                  <button
                    onClick={() => navigator.clipboard.writeText(contextResult)}
                    className="p-1 text-gray-600 hover:text-white transition-colors"
                    title="Copy result"
                  >
                    <Copy size={10} />
                  </button>
                )}
                <button
                  onClick={() => { setContextMenu(null); setContextResult(null); }}
                  className="p-1 text-gray-600 hover:text-white transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
              {/* Selected snippet preview */}
              <div className="px-3 py-2 bg-black/30 border-b border-white/5">
                <p className="text-[8px] text-gray-600 uppercase tracking-wider mb-1">Selected code</p>
                <code className="text-[9px] text-gray-500 font-mono line-clamp-2">{contextMenu.selectedText.slice(0, 120)}{contextMenu.selectedText.length > 120 ? '…' : ''}</code>
              </div>
              {/* Result */}
              <div className="p-3 overflow-y-auto" style={{ maxHeight: 280, scrollbarWidth: 'thin' }}>
                {contextLoading ? (
                  <div className="flex items-center gap-2 text-[10px] text-purple-400">
                    <Loader2 size={12} className="animate-spin" />
                    AI is thinking...
                  </div>
                ) : contextResult ? (
                  <pre className="text-[10px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">{contextResult}</pre>
                ) : null}
              </div>
            </div>
          )}

          {/* ── FLOATING NOTES PAD ── */}
          {showNotesPad && (
            <FloatingNotesPad onClose={() => setShowNotesPad(false)} />
          )}

          {/* ── BOTTOM TERMINAL PANEL ── */}
          {showTerminal && (
            <div
              className="border-t border-white/5 flex flex-col flex-shrink-0 bg-[#0a0a0a]"
              style={{ height: bottomPanelHeight }}
            >
              {/* Drag Resize Handle */}
              <div
                className="h-1.5 bg-transparent hover:bg-purple-500/30 cursor-row-resize flex-shrink-0 flex items-center justify-center group transition-colors"
                onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
              >
                <div className="w-10 h-0.5 bg-white/10 rounded-full group-hover:bg-purple-400 transition-colors" />
              </div>

              <TerminalTabsBar
                activeTab={activeBottomTab}
                setActiveTab={setActiveBottomTab}
                onClear={() => {}}
                onNewTerminal={() => {}}
                onClose={() => setShowTerminal(false)}
              />

              <div className="flex-1 overflow-hidden">
                {activeBottomTab === 'terminal' && <TerminalPanel />}

                {activeBottomTab === 'output' && (
                  <div className="h-full overflow-y-auto p-3 font-mono text-[11px] space-y-1">
                    <p><span className="text-gray-600">$</span> <span className="text-green-400">npm run build</span></p>
                    <p className="text-gray-400">▶ Building for production...</p>
                    <p className="text-gray-400">▶ Rendering 12 components...</p>
                    <p className="text-gray-400">▶ Optimizing bundle size (842KB)...</p>
                    <p className="text-cyan-400">✓ Build completed in 3.2s</p>
                    <p className="text-gray-700 mt-2">Waiting for next run...</p>
                  </div>
                )}

                {activeBottomTab === 'debug' && (
                  <div className="h-full overflow-y-auto p-3 font-mono text-[11px] space-y-1">
                    <p className="text-yellow-400">⚡ Debug session ready</p>
                    <p className="text-gray-600">No active breakpoints</p>
                    <p className="text-gray-700 mt-2">Set breakpoints in the editor to begin debugging.</p>
                  </div>
                )}

                {/* ✅ GHOST TYPER TAB */}
                {activeBottomTab === 'ghost' && <GhostTyperPanel />}

                {/* ✅ AI DIFF EXPLAINER TAB */}
                {activeBottomTab === 'diff' && <AIDiffPanel />}

                {/* ✅ AUTONOMOUS AI AGENT CORE TAB */}
                {activeBottomTab === 'agent' && (
                  <div className="h-full flex overflow-hidden divide-x divide-white/5 p-3">
                    {/* Left: Input task form */}
                    <div className="w-1/3 flex flex-col justify-between pr-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="text-neon-purple w-4 h-4 animate-pulse" />
                          <span className="text-[10px] font-orbitron font-bold tracking-widest text-white uppercase">
                            AI Agent Core
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal font-sans">
                          Describe an automation task (e.g. creating files, folder hierarchies, text typing, music player controls) and watch the agent operate.
                        </p>
                        
                        <textarea
                          rows={3}
                          placeholder="Type task details here..."
                          value={agentTask}
                          onChange={(e) => setAgentTask(e.target.value)}
                          disabled={agentRunning}
                          className="w-full bg-black/45 border border-white/10 rounded-xl p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/50 resize-none font-sans"
                        />
                      </div>
                      
                      <button
                        onClick={runAgentTask}
                        disabled={agentRunning || !agentTask.trim()}
                        className="w-full py-2 bg-neon-purple hover:bg-neon-purple/80 text-white font-orbitron font-bold tracking-widest rounded-xl text-[10px] uppercase shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {agentRunning ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Agent Executing...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Launch Agent Thread
                          </>
                        )}
                      </button>
                    </div>

                    {/* Center: Step planner status */}
                    <div className="w-1/3 px-3 flex flex-col">
                      <span className="text-[9px] font-orbitron font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Task Execution Steps
                      </span>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1.5" style={{ scrollbarWidth: 'none' }}>
                        {agentSteps.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 text-[10px] font-mono border border-dashed border-white/5 rounded-xl p-4 bg-black/10">
                            No task plan initialized.
                          </div>
                        ) : (
                          agentSteps.map((step, idx) => {
                            const isRunning = step.status === 'running';
                            const isCompleted = step.status === 'completed';
                            const isFailed = step.status === 'failed';
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-[10px] transition-all duration-300 ${
                                  isRunning ? 'bg-neon-blue/5 border-neon-blue/40 shadow-[0_0_12px_rgba(0,240,255,0.15)] text-white' :
                                  isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400/90' :
                                  isFailed ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                                  'bg-white/2 border-white/5 text-gray-500'
                                }`}
                              >
                                <span className={`text-[9px] font-bold ${isRunning ? 'text-neon-blue' : isCompleted ? 'text-emerald-500' : 'text-gray-600'}`}>
                                  [0{idx + 1}]
                                </span>
                                <span className="truncate mx-2 flex-1">{step.description}</span>
                                
                                {step.status === 'pending' && <span className="text-[8px] tracking-wider text-gray-600 font-bold bg-white/5 px-1 py-0.5 rounded">QUEUED</span>}
                                {step.status === 'running' && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-ping" />
                                    <Loader2 className="w-3 h-3 animate-spin text-neon-blue shrink-0" />
                                  </div>
                                )}
                                {step.status === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                {step.status === 'failed' && <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right: Live Scrolling Logs terminal */}
                    <div className="w-1/3 pl-3 flex flex-col h-full">
                      <span className="text-[9px] font-orbitron font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Live Agent Telemetry Logs
                      </span>
                      
                      <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 overflow-y-auto font-mono text-[9px] space-y-1.5 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative" style={{ scrollbarWidth: 'thin' }}>
                        {/* Terminal Overlay grid line */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-grid" />
                        {agentLogs.length === 0 ? (
                          <div className="text-gray-600 italic">Core log empty. Waiting for task thread initialization...</div>
                        ) : (
                          agentLogs.map((log, idx) => (
                            <div key={idx} className={`leading-normal ${
                              log.type === 'success' ? 'text-emerald-400' :
                              log.type === 'error' ? 'text-rose-400 font-bold' : 'text-gray-400'
                            }`}>
                              <span className="text-gray-600 font-bold mr-1">[{log.time}]</span>
                              <span className="text-white/20 mr-1">»</span>
                              {log.text}
                            </div>
                          ))
                        )}
                        <div ref={agentLogsEndRef} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR - SYSTEM INTELLIGENCE ── */}
        {showSystemPanel && <SystemIntelligencePanel />}
      </div>

      {/* ── SMART STATUS BAR ── */}
      <SmartStatusBar
        content={editorContent}
        filename={activeFile?.name || ''}
        cursorLine={cursorLine}
        cursorCol={cursorCol}
        language={activeFile ? getLanguage(activeFile.name) : 'plaintext'}
      />
    </div>
  );
}