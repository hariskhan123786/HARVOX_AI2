import { useState, useEffect } from 'react';
import { Download, Code2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import Editor from '@monaco-editor/react';
import { aiAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import LoadingOrb from '../../components/ui/LoadingOrb';

const languages = ['JavaScript', 'React', 'Python', 'HTML', 'CSS', 'Node.js', 'C++', 'SQL'];

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('React');
  const [result, setResult] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractCode = (markdown) => {
    const match = markdown.match(/```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*?)```/);
    if (match) return match[1].trim();
    const partialMatch = markdown.match(/```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*)/);
    if (partialMatch) return partialMatch[1].trim();
    return markdown.replace(/```[a-zA-Z0-9_\-+]*\s*\n?/g, '').replace(/```/g, '').trim();
  };

  const getPreviewHtml = () => {
    if (language === 'HTML') return editedCode;
    if (language === 'CSS') return `<style>${editedCode}</style><div style="padding:20px; font-family:sans-serif;"><h1>CSS Preview</h1><p>Sample text to test styling.</p><button>Sample Button</button></div>`;
    if (language === 'JavaScript') return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px;"><h2>JavaScript Preview</h2><p>Check browser console for output.</p><div id="app"></div><script>${editedCode}</script></body></html>`;
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
    try {
      await aiAPI.streamGenerateCode({ prompt, language, saveNote: true }, (parsed) => {
        if (parsed.content) {
          setResult((prev) => prev + parsed.content);
        }
      });
    } catch (err) {
      setError(err.message || 'Generation failed. Check your API key in settings.');
    } finally {
      setLoading(false);
    }
  };

  const exportCode = () => {
    const extMap = {
      JavaScript: 'js', React: 'jsx', Python: 'py', HTML: 'html', CSS: 'css',
      'Node.js': 'js', 'C++': 'cpp', SQL: 'sql',
    };
    const ext = extMap[language] || 'txt';
    saveAs(new Blob([editedCode], { type: 'application/octet-stream' }), `harvox-code.${ext}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
          AI CODE GENERATOR
        </h1>
        <p className="mt-1 text-sm text-muted">
          Describe what you want to build and HARVOX will generate production-ready code instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt & Config */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard hover={false} className="p-0 overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3 bg-secondary/30">
              <h3 className="font-orbitron text-xs text-neon-blue tracking-widest">CONFIGURE</h3>
            </div>
            <form onSubmit={handleGenerate} className="p-4 flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-orbitron tracking-widest text-muted">LANGUAGE / FRAMEWORK</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-neon w-full text-sm font-mono"
                  disabled={loading}
                >
                  {languages.map((l) => (
                    <option key={l} value={l} className="bg-secondary">{l}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-orbitron tracking-widest text-muted">YOUR PROMPT</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Create a modern login form in React with Tailwind CSS, validation and error states..."
                  className="input-neon min-h-[220px] w-full resize-y text-sm leading-relaxed"
                  disabled={loading}
                  required
                />
              </div>

              <NeonButton type="submit" className="w-full justify-center" disabled={loading || !prompt.trim()}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadingOrb size="sm" /> Synthesizing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Code2 size={16} /> GENERATE CODE
                  </span>
                )}
              </NeonButton>
            </form>
          </GlassCard>

          {/* Tips */}
          <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-xs text-muted space-y-2">
            <p className="font-orbitron text-[10px] tracking-widest text-neon-blue/70">TIPS</p>
            <p>• Be specific: mention framework, styling, and features</p>
            <p>• For HTML/CSS/JS: Live Preview appears automatically</p>
            <p>• Use Export to download the file instantly</p>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-8 space-y-4">
          {error && (
            <GlassCard hover={false} className="border-red-500/30 bg-red-500/5">
              <p className="font-mono text-sm text-red-400">⚠ {error}</p>
            </GlassCard>
          )}

          {!result && !loading && (
            <GlassCard hover={false} className="flex h-[300px] items-center justify-center border-dashed">
              <div className="text-center opacity-40">
                <Code2 size={48} className="mx-auto mb-4 text-neon-blue" />
                <p className="font-orbitron text-sm">Your generated code will appear here</p>
              </div>
            </GlassCard>
          )}

          {loading && !result && (
            <GlassCard hover={false} className="flex h-[300px] items-center justify-center">
              <LoadingOrb text="AI is synthesizing your code..." />
            </GlassCard>
          )}

          {result && (
            <GlassCard hover={false} className="p-0 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-secondary/30">
                <div className="flex items-center gap-3">
                  <h3 className="font-orbitron text-xs text-neon-blue tracking-widest">OUTPUT</h3>
                  <span className="px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-mono">{language}</span>
                </div>
                <button
                  onClick={exportCode}
                  disabled={!editedCode}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors disabled:opacity-40"
                >
                  <Download size={12} /> Export
                </button>
              </div>

              {/* Monaco Editor */}
              <div className="bg-[#0a0a0a]">
                <Editor
                  height="420px"
                  language={language === 'Node.js' ? 'javascript' : language === 'C++' ? 'cpp' : language === 'React' ? 'javascript' : language.toLowerCase()}
                  theme="vs-dark"
                  value={editedCode}
                  onChange={(value) => setEditedCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: '"Fira Code", monospace',
                    padding: { top: 12 },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </GlassCard>
          )}

          {/* Live Browser Preview */}
          {result && ['HTML', 'CSS', 'JavaScript'].includes(language) && (
            <GlassCard hover={false} className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4 flex h-6 items-center justify-center rounded bg-black/40 px-3 text-xs font-mono text-muted">
                  preview://harvox.local
                </div>
              </div>
              <div className="bg-white">
                <iframe
                  title="preview"
                  sandbox="allow-scripts"
                  className="h-[450px] w-full bg-white border-0"
                  srcDoc={getPreviewHtml()}
                />
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
