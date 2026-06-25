import { useState } from 'react';
import { aiAPI, noteAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { Bug, AlertTriangle, Copy, Check, FileText, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const PRESETS = [
  {
    name: 'Infinite Rerender',
    description: 'React state loop',
    error: 'Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.',
    code: `import { useState, useEffect } from 'react';\n\nexport default function DataTracker() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    // Bug: Updating state inside useEffect without dependencies triggers infinite loops!\n    setCount(count + 1);\n  });\n\n  return <div>Count: {count}</div>;\n}`
  },
  {
    name: 'Null Pointer',
    description: 'Reading property of null',
    error: "TypeError: Cannot read properties of null (reading 'map')",
    code: `import { useState, useEffect } from 'react';\n\nexport default function UserList() {\n  const [users, setUsers] = useState(null);\n\n  useEffect(() => {\n    // Assume users is fetched here but stays null initially\n  }, []);\n\n  return (\n    <ul>\n      {/* Bug: users is null, calling .map directly throws TypeError! */}\n      {users.map(user => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}`
  },
  {
    name: 'CORS Blocker',
    description: 'API Origin mismatch',
    error: 'Access to fetch at "https://api.harvox.com/data" from origin "http://localhost:3000" has been blocked by CORS policy: No "Access-Control-Allow-Origin" header is present on the requested resource.',
    code: `// Frontend Request\nfetch('https://api.harvox.com/data')\n  .then(res => res.json())\n  .then(data => console.log(data));\n\n// Backend Server (Node.js/Express) - Missing CORS Middleware\nconst express = require('express');\nconst app = express();\n\napp.get('/data', (req, res) => {\n  res.json({ status: 'success' });\n});`
  }
];

export default function DebugAssistant() {
  const [errorMsg, setErrorMsg] = useState('');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleDebug = async () => {
    if (!errorMsg && !code) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await aiAPI.debug({ error: errorMsg, code });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setErrorMsg('');
    setCode('');
    setAnalysis(null);
    setError(null);
  };

  const handleSaveToNotes = async () => {
    if (!analysis) return;
    try {
      setSaveStatus('saving');
      const titleSnippet = errorMsg ? errorMsg.substring(0, 30) + '...' : 'Code Patch';
      await noteAPI.create({
        title: `Debug Analysis: ${titleSnippet}`,
        content: `### Original Error / Code\n\`\`\`\n${errorMsg}\n\`\`\`\n\n### Problematic Code\n\`\`\`javascript\n${code}\n\`\`\`\n\n### AI Analysis & Fix\n${analysis}`,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const loadPreset = (preset) => {
    setErrorMsg(preset.error);
    setCode(preset.code);
    setError(null);
    setAnalysis(null);
  };

  const getLineNumbers = (val, minLines = 5) => {
    const linesCount = Math.max(val.split('\n').length, minLines);
    return Array.from({ length: linesCount }, (_, i) => i + 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-neon flex items-center gap-3">
            <Bug className="w-7 h-7 text-neon-pink animate-pulse" />
            DEBUG ASSISTANT
          </h1>
          <p className="text-xs text-muted">Isolate execution exceptions, trace callstacks, and generate hot-fixes</p>
        </div>
        
        {/* Presets and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-orbitron font-bold text-muted/60 uppercase tracking-widest mr-1">Presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="px-2.5 py-1 text-[10px] font-mono rounded bg-primary border border-white/5 text-muted hover:text-neon-blue hover:border-neon-blue/30 transition-all"
            >
              {preset.name}
            </button>
          ))}
          
          {(errorMsg || code || analysis) && (
            <button
              onClick={handleClear}
              className="ml-2 p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1.5 text-[10px] font-orbitron font-bold tracking-widest uppercase cursor-pointer"
              title="Clear Inputs"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-6">
          {/* Error Message Input */}
          <div className="rounded-xl border border-white/15 bg-[#03060d]/80 overflow-hidden shadow-xl font-mono text-sm relative">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-white/5 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                <span className="text-[10px] text-muted/60 font-semibold pl-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                  error_trace.log
                </span>
              </div>
              <div className="text-[9px] text-muted/40 font-bold uppercase tracking-widest">ASCII</div>
            </div>
            
            {/* Textarea body with line numbers */}
            <div className="flex bg-[#050911]/50 min-h-[120px]">
              <div className="w-9 text-right pr-2 py-3 bg-black/20 text-muted/20 select-none border-r border-white/5 text-[11px] leading-6 font-mono">
                {getLineNumbers(errorMsg, 5).map((ln) => (
                  <div key={ln}>{ln}</div>
                ))}
              </div>
              <textarea
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                className="flex-1 min-h-[120px] bg-transparent border-0 p-3 text-white font-mono text-xs leading-6 resize-none outline-none focus:ring-0"
                placeholder="Paste runtime error stack trace or compiler output here..."
              />
            </div>
          </div>

          {/* Problematic Code Input */}
          <div className="rounded-xl border border-white/15 bg-[#03060d]/80 overflow-hidden shadow-xl font-mono text-sm relative">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-white/5 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                <span className="text-[10px] text-muted/60 font-semibold pl-2 flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-neon-pink" />
                  active_code.jsx
                </span>
              </div>
              <div className="text-[9px] text-muted/40 font-bold uppercase tracking-widest font-mono">React / JS</div>
            </div>
            
            {/* Textarea body with line numbers */}
            <div className="flex bg-[#050911]/50 min-h-[240px]">
              <div className="w-9 text-right pr-2 py-3 bg-black/20 text-muted/20 select-none border-r border-white/5 text-[11px] leading-6 font-mono">
                {getLineNumbers(code, 9).map((ln) => (
                  <div key={ln}>{ln}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 min-h-[240px] bg-transparent border-0 p-3 text-white font-mono text-xs leading-6 resize-none outline-none focus:ring-0"
                placeholder="Paste the React components or files housing the exception..."
              />
            </div>
          </div>

          {/* Action Button */}
          <NeonButton 
            variant="acid" 
            className="w-full justify-center text-xs tracking-widest"
            onClick={handleDebug}
            disabled={loading || (!errorMsg && !code)}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Decompiling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find the Bug
              </>
            )}
          </NeonButton>
          
          {error && (
            <GlassCard className="border-red-500/20 bg-red-500/5 p-4 rounded-xl">
              <p className="text-red-400 text-xs font-mono">{error}</p>
            </GlassCard>
          )}
        </div>

        {/* Output Column */}
        <div className="relative">
          <GlassCard hover={false} className="p-6 h-full flex flex-col min-h-[480px] relative border-white/10 overflow-hidden">
            {/* Scanning Laser Overlay when Analyzing */}
            {loading && (
              <div className="absolute inset-0 bg-[#070b14]/90 z-20 flex flex-col items-center justify-center p-6 border border-neon-blue/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scanLine" />
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border border-neon-blue/20 border-dashed animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-neon-pink/15 border-dotted animate-[spin_5s_linear_infinite_reverse]" />
                  <Bug className="w-8 h-8 text-neon-blue animate-pulse" />
                </div>
                <h3 className="font-orbitron font-bold text-neon-blue tracking-widest text-xs uppercase animate-pulse">Analyzing Code Matrix</h3>
                <p className="text-[11px] text-muted max-w-xs leading-relaxed font-mono text-center mt-2">
                  Parsing callstack syntax, identifying anti-patterns, and assembling localized patch...
                </p>
              </div>
            )}

            {/* Output Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h2 className="text-sm font-semibold font-orbitron tracking-widest text-neon-blue flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_#00F0FF] animate-pulse" />
                AI Analysis & Fix
              </h2>
              
              {analysis && (
                <div className="flex items-center gap-2">
                  {/* Save to Notes */}
                  <button
                    onClick={handleSaveToNotes}
                    disabled={saveStatus === 'saving'}
                    className={`p-1.5 rounded border text-[10px] font-orbitron font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      saveStatus === 'saved'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : saveStatus === 'error'
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : 'border-white/10 bg-secondary hover:border-neon-blue hover:text-neon-blue'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Note'}
                  </button>

                  {/* Copy analysis */}
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded border border-white/10 bg-secondary hover:border-neon-blue hover:text-neon-blue transition-all flex items-center gap-1.5 text-[10px] font-orbitron font-bold tracking-wider uppercase cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Fix
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Content */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs leading-relaxed">
              {analysis ? (
                <div className="prose prose-invert max-w-none font-poppins text-muted">
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="relative group my-4">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(String(children));
                                }}
                                className="p-1.5 rounded bg-black/80 hover:bg-black border border-white/10 hover:border-white/30 text-white cursor-pointer"
                                title="Copy code block"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-xl !bg-[#03060d] border border-white/15 !p-4 !m-0 font-mono text-[11px] leading-6"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[11px] text-white" {...props}>
                            {children}
                          </code>
                        )
                      },
                      h1: ({children}) => <h3 className="font-orbitron font-semibold text-white text-base mt-5 mb-2.5 uppercase tracking-wide">{children}</h3>,
                      h2: ({children}) => <h4 className="font-orbitron font-medium text-white text-sm mt-4 mb-2 uppercase tracking-wide">{children}</h4>,
                      p: ({children}) => <p className="mb-4 text-muted/90 font-poppins">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-muted/90">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-muted/90">{children}</ol>,
                      li: ({children}) => <li className="font-poppins">{children}</li>,
                      blockquote: ({children}) => <blockquote className="border-l-2 border-neon-blue bg-white/[0.02] pl-4 py-2 my-4 rounded text-muted font-mono">{children}</blockquote>
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full min-h-[380px] flex items-center justify-center text-muted opacity-50 flex-col py-10">
                  <Bug className="w-12 h-12 mb-4 text-muted/40 animate-bounce" />
                  <p className="font-orbitron text-xs tracking-wider uppercase">Console Idle</p>
                  <p className="text-[10px] text-center max-w-[240px] mt-1 leading-normal font-poppins">
                    Select a preset above or load your error traces to begin neural execution analysis.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

