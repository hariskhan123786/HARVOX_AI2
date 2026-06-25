import { useState, useEffect } from 'react';
import { Download, Code2, Zap, Settings, ChevronDown, AlertTriangle, Eye, Sparkles, RefreshCw } from 'lucide-react';
import { saveAs } from 'file-saver';
import Editor from '@monaco-editor/react';
import { aiAPI } from '../../services/api';
import { AI_PROVIDERS, GROQ_MODELS, GEMINI_MODELS, getModelsByProvider } from '../../config/aiModels';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';

const languages = ['JavaScript', 'React', 'Python', 'HTML', 'CSS', 'Node.js', 'C++', 'SQL'];

const extMap = {
  JavaScript: 'js', React: 'jsx', Python: 'py', HTML: 'html',
  CSS: 'css', 'Node.js': 'js', 'C++': 'cpp', SQL: 'sql',
};

function NeonSelect({ label, value, onChange, options, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-orbitron font-bold tracking-widest text-muted/50 uppercase">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-[#050911]/80 border border-white/10 rounded-xl text-white font-mono text-xs px-3.5 py-2.5 outline-none transition-all duration-300 focus:border-neon-blue/50 focus:shadow-neon-blue/20 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-[#070b14] text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neon-blue pointer-events-none" />
      </div>
    </div>
  );
}

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('React');
  const [provider, setProvider] = useState(AI_PROVIDERS.GROQ);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [result, setResult] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('code');

  const extractCode = (markdown) => {
    const match = markdown.match(/```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*?)```/);
    if (match) return match[1].trim();
    const partial = markdown.match(/```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*)/);
    if (partial) return partial[1].trim();
    return markdown.replace(/```[a-zA-Z0-9_\-+]*\s*\n?/g, '').replace(/```/g, '').trim();
  };

  const getPreviewHtml = () => {
    if (language === 'HTML') return editedCode;
    if (language === 'CSS') return `<style>${editedCode}</style><div style="padding:20px;font-family:sans-serif;"><h1>CSS Preview</h1><p>Sample text.</p><button>Sample Button</button></div>`;
    if (language === 'JavaScript') return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px;"><h2>JS Preview</h2><div id="app"></div><script>${editedCode}<\/script></body></html>`;
    return editedCode;
  };

  useEffect(() => {
    if (result) setEditedCode(extractCode(result));
  }, [result]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    setEditedCode('');
    setError('');
    setActiveTab('code');
    try {
      await aiAPI.streamGenerateCode({ prompt, language, saveNote: true }, (parsed) => {
        if (parsed.content) setResult((prev) => prev + parsed.content);
      });
    } catch (err) {
      setError(err.message || 'Generation failed. Check your API key in settings.');
    } finally {
      setLoading(false);
    }
  };

  const exportCode = () => {
    saveAs(
      new Blob([editedCode], { type: 'application/octet-stream' }),
      `harvox-code.${extMap[language] || 'txt'}`
    );
  };

  const canPreview = result && ['HTML', 'CSS', 'JavaScript'].includes(language);
  const monacoLang = { 'Node.js': 'javascript', 'C++': 'cpp', React: 'javascript' }[language] ?? language.toLowerCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-neon flex items-center gap-3">
          <Code2 className="w-7 h-7 text-neon-blue animate-[spin_40s_linear_infinite]" />
          AI CODE GENERATOR
        </h1>
        <p className="text-xs text-muted">
          Describe what you want to build and HARVOX will generate production-ready code instantly.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 font-mono text-xs">
          <AlertTriangle size={15} className="shrink-0" /> 
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        
        {/* Left Configure Card */}
        <GlassCard hover={false} className="border-white/10 p-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-2 px-4 py-3.5 bg-secondary/80 border-b border-white/5 select-none">
            <Settings size={14} className="text-neon-blue" />
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-neon-blue uppercase">Configure</span>
          </div>

          <form className="p-4 flex flex-col gap-4" onSubmit={handleGenerate}>
            <NeonSelect
              label="AI Provider"
              value={provider}
              onChange={e => {
                setProvider(e.target.value);
                setModel(
                  e.target.value === AI_PROVIDERS.GEMINI
                    ? GEMINI_MODELS[0].id
                    : GROQ_MODELS[0].id
                );
              }}
              options={[
                { value: AI_PROVIDERS.GROQ, label: 'Groq' },
                { value: AI_PROVIDERS.GEMINI, label: 'Google Gemini' },
              ]}
              disabled={loading}
            />

            <NeonSelect
              label="AI Model"
              value={model}
              onChange={e => setModel(e.target.value)}
              options={getModelsByProvider(provider).map(m => ({ value: m.id, label: m.name }))}
              disabled={loading}
            />

            <NeonSelect
              label="Language / Framework"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              options={languages.map(l => ({ value: l, label: l }))}
              disabled={loading}
            />

            <div className="space-y-1.5">
              <label className="text-[9px] font-orbitron font-bold tracking-widest text-muted/50 uppercase block">Your Prompt</label>
              <textarea
                className="w-full min-h-[160px] bg-[#050911]/80 border border-white/10 rounded-xl text-white text-xs leading-relaxed p-3.5 resize-none outline-none focus:border-neon-blue/50 focus:shadow-neon-blue/20 transition-all font-poppins placeholder-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Create a modern login form in React with Tailwind CSS, validation and error states..."
                disabled={loading}
                required
              />
            </div>

            <NeonButton variant="acid" className="w-full text-xs font-bold font-orbitron tracking-widest" type="submit" disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Zap size={14} className="mr-1.5 text-black" /> GENERATE CODE
                </>
              )}
            </NeonButton>
          </form>

          {/* Guidelines Box */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-col gap-2.5">
            <span className="text-[9px] font-orbitron font-bold tracking-widest text-neon-blue/50 uppercase">Active AI Guidance</span>
            <div className="space-y-2 text-[10px] text-muted leading-relaxed font-poppins">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1 shrink-0 animate-pulse" />
                <p>Be specific: mention framework requirements, styling, and animations.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple mt-1 shrink-0 animate-pulse" />
                <p>For HTML/CSS/JS: Live Preview will become active automatically.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-pink mt-1 shrink-0 animate-pulse" />
                <p>Use the Export button to save the file onto your local filesystem.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right Output Card */}
        <div className="rounded-xl border border-white/10 bg-[#03060d]/80 overflow-hidden shadow-2xl font-mono text-sm relative flex flex-col min-h-[500px]">
          {/* Mock IDE Window Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/80 border-b border-white/5 select-none">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              <span className="text-[10px] text-muted/60 font-semibold pl-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-neon-blue" />
                {result && activeTab === 'preview' ? 'preview.html' : `generated_source.${extMap[language] || 'txt'}`}
              </span>
            </div>
            
            {/* Toolbar Buttons */}
            <div className="flex items-center gap-3">
              {result && (
                <div className="flex items-center gap-2">
                  {canPreview && (
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/5 select-none">
                      <button
                        className={`px-2.5 py-1 rounded-md text-[9px] font-orbitron font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                          activeTab === 'code'
                            ? 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue'
                            : 'border border-transparent text-muted/40 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('code')}
                      >
                        <Code2 className="w-3 h-3" />
                        Code
                      </button>
                      <button
                        className={`px-2.5 py-1 rounded-md text-[9px] font-orbitron font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                          activeTab === 'preview'
                            ? 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue'
                            : 'border border-transparent text-muted/40 hover:text-white'
                        }`}
                        onClick={() => setActiveTab('preview')}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                  )}
                  {result && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-orbitron font-bold uppercase tracking-wider bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
                      {language}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={exportCode}
                disabled={!editedCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-secondary hover:border-neon-blue hover:text-neon-blue transition-all text-[10px] font-orbitron font-bold tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={11} /> Export
              </button>
            </div>
          </div>

          {/* Output Content Area */}
          <div className="flex-1 flex flex-col justify-center relative min-h-[440px]">
            {/* Empty state */}
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center opacity-85 select-none">
                <div className="w-14 h-14 rounded-2xl bg-primary border border-white/5 flex items-center justify-center mb-1 text-neon-blue/40 shadow-inner">
                  <Code2 size={28} />
                </div>
                <h3 className="font-orbitron font-bold text-white tracking-widest text-xs uppercase">Editor Offline</h3>
                <p className="text-[10px] text-muted max-w-[240px] leading-relaxed font-poppins">
                  Configure your system parameters on the left and invoke the generator to compile code outputs.
                </p>
              </div>
            )}

            {/* Scanning / Loading state */}
            {loading && !result && (
              <div className="absolute inset-0 bg-[#070b14]/90 z-20 flex flex-col items-center justify-center p-6 rounded-b-2xl overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scanLine" />
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border border-neon-blue/20 border-dashed animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-neon-purple/15 border-dotted animate-[spin_5s_linear_infinite_reverse]" />
                  <Zap className="w-8 h-8 text-neon-blue animate-pulse" />
                </div>
                <h3 className="font-orbitron font-bold text-neon-blue tracking-widest text-xs uppercase animate-pulse">Synthesizing Code Matrix</h3>
                <p className="text-[11px] text-muted max-w-xs leading-relaxed font-mono text-center mt-2">
                  Consulting language rules, scaffolding folder layout, and streaming variables...
                </p>
              </div>
            )}

            {/* Monaco Editor */}
            {result && activeTab === 'code' && (
              <div className="flex-1 w-full bg-[#0a0a0f] text-left">
                <Editor
                  height="460px"
                  language={monacoLang}
                  theme="vs-dark"
                  value={editedCode}
                  onChange={(v) => setEditedCode(v || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: '"Fira Code", monospace',
                    padding: { top: 14 },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    renderLineHighlight: 'line',
                  }}
                />
              </div>
            )}

            {/* Live preview */}
            {result && activeTab === 'preview' && canPreview && (
              <div className="flex-grow flex flex-col bg-[#111827] min-h-[460px]">
                <div className="flex items-center gap-2.5 px-4 py-2 bg-[#111827] border-b border-white/5 select-none shrink-0 font-mono text-xs">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#eab308' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <div className="flex-1 h-5 rounded-md bg-black/45 flex items-center justify-center text-gray-500 text-[10px] font-medium font-mono select-none px-3">
                    preview://harvox.local
                  </div>
                </div>
                <iframe
                  title="preview"
                  sandbox="allow-scripts"
                  className="w-full flex-grow border-none bg-white"
                  srcDoc={getPreviewHtml()}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
