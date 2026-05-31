import React, { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import FileExplorer from '../../components/workspace/FileExplorer';
import TerminalPanel from '../../components/terminal/TerminalPanel';
import Editor from '@monaco-editor/react';
import {
  Maximize2, Minimize2, Play, Save, X, SquareTerminal,
  Bug, ChevronRight, Search, FolderPlus, FilePlus,
  Cpu, HardDrive, Zap, Wifi, Activity, Cloud,
  RefreshCw, Plus, Trash2, Monitor, Code2,
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
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="w-[210px] flex-shrink-0 bg-[#0a0a0a] border-l border-white/5 flex flex-col overflow-y-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/5 flex-shrink-0">
        <p className="text-[9px] font-black tracking-[0.2em] text-gray-500 uppercase">
          System Intelligence
        </p>
      </div>

      <div className="flex flex-col gap-2.5 p-2.5">

        {/* ── AI ENGINE ── */}
        <div className="bg-[#141414] border border-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Cpu size={10} className="text-purple-400" />
              </div>
              <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                AI Engine
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-green-400 font-bold">ONLINE</span>
            </div>
          </div>
          <p className="text-[13px] font-black text-white mb-1 leading-tight">{aiModel}</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-600">
              LATENCY: <span className="text-gray-400">{Math.round(metrics.latency)}ms</span>
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[9px] text-gray-600">
              QPS: <span className="text-gray-400">{metrics.qps.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* ── PERFORMANCE METRICS ── */}
        <div className="bg-[#141414] border border-white/5 rounded-lg p-3">
          <p className="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-3">
            Performance Metrics
          </p>

          {/* CPU */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">CPU Utilization</span>
              <span className="text-[9px] font-bold text-white">{Math.round(metrics.cpu)}%</span>
            </div>
            <MetricBar
              value={metrics.cpu}
              colorClass="bg-gradient-to-r from-cyan-600 to-blue-500"
            />
          </div>

          {/* RAM */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">RAM Usage</span>
              <span className="text-[9px] font-bold text-white">
                {metrics.ram.toFixed(1)} / {ramTotal} GB
              </span>
            </div>
            <MetricBar
              value={ramPercent}
              colorClass="bg-gradient-to-r from-yellow-600 to-orange-500"
            />
          </div>

          {/* GPU */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">GPU Load (A100)</span>
              <span className="text-[9px] font-bold text-white">{Math.round(metrics.gpu)}%</span>
            </div>
            <MetricBar
              value={metrics.gpu}
              colorClass="bg-gradient-to-r from-green-600 to-emerald-400"
            />
          </div>
        </div>

        {/* ── WORKSPACE STORAGE ── */}
        <div className="bg-[#141414] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Cloud size={9} className="text-gray-500" />
            <p className="text-[9px] font-black tracking-widest text-gray-500 uppercase">
              Workspace Storage
            </p>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
              isCritical
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/20'
                : 'bg-green-500/20 text-green-400 border border-green-500/20'
            }`}>
              {isCritical ? 'CRITICAL ZONE' : 'HEALTHY'}
            </span>
            <span className={`text-sm font-black ${isCritical ? 'text-pink-400' : 'text-green-400'}`}>
              {storagePercent}%
            </span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCritical
                  ? 'bg-gradient-to-r from-pink-700 to-pink-400'
                  : 'bg-gradient-to-r from-green-700 to-green-400'
              }`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-600">
            Used: {storageUsed}GB / Total: {storageTotal}GB
          </p>
        </div>

        {/* ── DAILY USAGE ── */}
        <div className="bg-[#141414] border border-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black tracking-widest text-gray-500 uppercase">
              Daily Usage
            </p>
            <Zap size={10} className="text-cyan-400" />
          </div>

          <div className="flex items-end gap-1 mb-0.5">
            <span className="text-[26px] font-black text-white leading-none">{dailyUsage}</span>
            <span className="text-xs text-gray-600 mb-1">/ {dailyTotal}</span>
          </div>
          <p className="text-[9px] text-gray-600 mb-2 tracking-wider">AI CREDITS REMAINING</p>

          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-purple-500 transition-all duration-700"
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
        </div>

        {/* ── CONNECTION ── */}
        <div className="bg-[#141414] border border-white/5 rounded-lg p-3">
          <p className="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-2">
            Connection
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Wifi size={10} className="text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-white font-bold">Connected</p>
              <p className="text-[9px] text-gray-600">WebSocket Active</p>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
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
    { id: 'terminal', label: 'TERMINAL',       icon: SquareTerminal },
    { id: 'output',   label: 'OUTPUT',          icon: Activity       },
    { id: 'debug',    label: 'DEBUG CONSOLE',   icon: Bug            },
  ];

  return (
    <div className="flex items-center h-8 bg-[#111111] border-b border-white/5 px-2 select-none flex-shrink-0">
      <div className="flex items-center">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 h-8 text-[9px] font-bold tracking-wider transition-all border-b-2 ${
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

      <div className="flex items-center gap-0.5">
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
        flex flex-col w-full bg-[#0d0d0d] text-white overflow-hidden transition-all duration-300
        ${focusMode
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none'
          : 'h-[calc(100vh-64px)] rounded-xl border border-white/5 shadow-2xl'
        }
      `}
    >

      {/* ===========================================================
          HEADER
      =========================================================== */}
      <div className="flex h-10 items-center justify-between bg-[#0a0a0a] px-4 border-b border-white/5 flex-shrink-0 select-none">

        {/* Left - Logo & Window controls */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/90 hover:bg-red-400 cursor-pointer transition-colors" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/90 hover:bg-yellow-400 cursor-pointer transition-colors" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/90 hover:bg-green-400 cursor-pointer transition-colors" />
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
      <div className="flex flex-1 overflow-hidden">

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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

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
          <div className="flex-1 flex overflow-hidden">

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
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center text-[10px] text-gray-700">
                      {[
                        ['Ctrl+S', 'Save'],
                        ['F5', 'Run'],
                        ['Ctrl+Z', 'Undo'],
                        ['Ctrl+/', 'Comment'],
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
          </div>

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
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR - SYSTEM INTELLIGENCE ── */}
        {showSystemPanel && <SystemIntelligencePanel />}
      </div>
    </div>
  );
}