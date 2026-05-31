import { useState, useEffect } from 'react';
import { Download, Code2, Zap, Settings, ChevronDown, AlertTriangle } from 'lucide-react';
import { saveAs } from 'file-saver';
import Editor from '@monaco-editor/react';
import { aiAPI } from '../../services/api';
import { AI_PROVIDERS, GROQ_MODELS, GEMINI_MODELS, getModelsByProvider } from '../../config/aiModels';

const languages = ['JavaScript', 'React', 'Python', 'HTML', 'CSS', 'Node.js', 'C++', 'SQL'];

const extMap = {
  JavaScript: 'js', React: 'jsx', Python: 'py', HTML: 'html',
  CSS: 'css', 'Node.js': 'js', 'C++': 'cpp', SQL: 'sql',
};

function NeonSelect({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{
        fontSize: 9, fontFamily: 'Orbitron, sans-serif',
        letterSpacing: '0.18em', color: '#475569', textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%', appearance: 'none',
            background: 'rgba(8,12,20,0.9)',
            border: '1px solid rgba(56,189,248,0.18)',
            borderRadius: 8, color: '#cbd5e1',
            fontFamily: '"Fira Code", monospace',
            fontSize: 13, padding: '8px 34px 8px 11px',
            cursor: 'pointer', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.18)'}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#0f172a' }}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} style={{
          position: 'absolute', right: 10, top: '50%',
          transform: 'translateY(-50%)', color: '#38bdf8', pointerEvents: 'none',
        }} />
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Fira+Code:wght@400;500&display=swap');

        .cg-wrap { display: flex; flex-direction: column; gap: 20px; }

        /* ── Page heading ── */
        .cg-heading { display: flex; flex-direction: column; gap: 4px; }
        .cg-title {
          font-family: Orbitron, sans-serif; font-weight: 800;
          font-size: 22px; letter-spacing: 0.07em;
          background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .cg-subtitle { color: #475569; font-size: 13px; }

        /* ── Two-column grid ── */
        .cg-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 18px;
          align-items: start;
        }

        /* ── Shared card shell ── */
        .cg-card {
          background: rgba(13,19,35,0.85);
          border: 1px solid rgba(56,189,248,0.1);
          border-radius: 14px;
          overflow: hidden;
        }
        .cg-card-header {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 16px;
          background: rgba(56,189,248,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cg-card-label {
          font-family: Orbitron, sans-serif; font-size: 9px;
          letter-spacing: 0.2em; color: #38bdf8; text-transform: uppercase;
        }

        /* ── Config form ── */
        .cg-form { padding: 16px; display: flex; flex-direction: column; gap: 13px; }
        .cg-field-label {
          display: block; margin-bottom: 5px;
          font-size: 9px; font-family: Orbitron, sans-serif;
          letter-spacing: 0.18em; color: #475569; text-transform: uppercase;
        }
        .cg-textarea {
          width: 100%; min-height: 170px;
          background: rgba(8,12,20,0.9);
          border: 1px solid rgba(56,189,248,0.18);
          border-radius: 8px; color: #cbd5e1;
          font-size: 13px; line-height: 1.6;
          padding: 10px 12px; resize: vertical; outline: none;
          transition: border-color 0.2s; box-sizing: border-box;
          font-family: inherit;
        }
        .cg-textarea::placeholder { color: #334155; }
        .cg-textarea:focus { border-color: rgba(56,189,248,0.45); }

        /* ── Generate button ── */
        .cg-btn {
          width: 100%; padding: 11px;
          border-radius: 9px; border: none; cursor: pointer;
          font-family: Orbitron, sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 0.12em; color: #fff;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 0 22px rgba(14,165,233,0.28);
          transition: opacity 0.18s, transform 0.1s;
        }
        .cg-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .cg-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* ── Tips ── */
        .cg-tips {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
          background: rgba(56,189,248,0.025);
          display: flex; flex-direction: column; gap: 5px;
        }
        .cg-tips-label {
          font-size: 9px; font-family: Orbitron, sans-serif;
          letter-spacing: 0.2em; color: #38bdf8; opacity: 0.55;
          text-transform: uppercase; margin-bottom: 2px;
        }
        .cg-tip { color: #334155; font-size: 11px; line-height: 1.45; }

        /* ── Output card ── */
        .cg-output { display: flex; flex-direction: column; }
        .cg-output-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          background: rgba(56,189,248,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cg-toolbar-left { display: flex; align-items: center; gap: 10px; }
        .cg-lang-pill {
          padding: 2px 9px; border-radius: 99px;
          background: rgba(56,189,248,0.1);
          border: 1px solid rgba(56,189,248,0.22);
          color: #38bdf8; font-size: 10px;
          font-family: "Fira Code", monospace;
        }
        .cg-tabs { display: flex; gap: 2px; }
        .cg-tab {
          padding: 5px 13px; border-radius: 6px; font-size: 11px;
          background: transparent; border: none; cursor: pointer; color: #64748b;
          transition: all 0.15s;
        }
        .cg-tab.active { background: rgba(56,189,248,0.12); color: #38bdf8; }
        .cg-tab:hover:not(.active) { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .cg-export-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 7px; cursor: pointer;
          font-size: 11px; border: 1px solid rgba(56,189,248,0.22);
          background: rgba(56,189,248,0.08); color: #38bdf8;
          transition: all 0.15s;
        }
        .cg-export-btn:hover:not(:disabled) { background: rgba(56,189,248,0.18); }
        .cg-export-btn:disabled { opacity: 0.38; cursor: not-allowed; }

        /* ── Empty / loading states ── */
        .cg-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          padding: 70px 20px; opacity: 0.22;
        }
        .cg-empty-label {
          font-family: Orbitron, sans-serif; font-size: 12px; letter-spacing: 0.08em;
          color: #94a3b8;
        }
        .cg-loading-wrap {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 70px 20px; gap: 14px;
        }
        .cg-spinner {
          width: 34px; height: 34px; border-radius: 99px;
          border: 2px solid rgba(56,189,248,0.15);
          border-top-color: #38bdf8;
          animation: cg-spin 0.75s linear infinite;
        }
        @keyframes cg-spin { to { transform: rotate(360deg); } }
        .cg-loading-text {
          color: #38bdf8; font-size: 13px;
          font-family: "Fira Code", monospace;
        }

        /* ── Error banner ── */
        .cg-error {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 15px; border-radius: 9px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.22);
          color: #f87171; font-size: 13px;
          font-family: "Fira Code", monospace;
        }

        /* ── Preview ── */
        .cg-preview-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 14px; background: #111827;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .cg-preview-dots { display: flex; gap: 5px; }
        .cg-preview-dot { width: 10px; height: 10px; border-radius: 99px; }
        .cg-url-bar {
          flex: 1; height: 20px; border-radius: 4px;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          color: #475569; font-size: 10px;
          font-family: "Fira Code", monospace;
        }
      `}</style>

      <div className="cg-wrap">

        {/* Heading */}
        <div className="cg-heading">
          <h1 className="cg-title">AI CODE GENERATOR</h1>
          <p className="cg-subtitle">
            Describe what you want to build and HARVOX will generate production-ready code instantly.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="cg-error">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Main grid */}
        <div className="cg-grid">

          {/* ── Left: Configure ── */}
          <div className="cg-card">
            <div className="cg-card-header">
              <Settings size={12} style={{ color: '#38bdf8' }} />
              <span className="cg-card-label">Configure</span>
            </div>

            <form className="cg-form" onSubmit={handleGenerate}>
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

              <div>
                <label className="cg-field-label">Your Prompt</label>
                <textarea
                  className="cg-textarea"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Create a modern login form in React with Tailwind CSS, validation and error states..."
                  disabled={loading}
                  required
                />
              </div>

              <button className="cg-btn" type="submit" disabled={loading || !prompt.trim()}>
                {loading ? (
                  <>
                    <div className="cg-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Zap size={14} /> GENERATE CODE
                  </>
                )}
              </button>
            </form>

            <div className="cg-tips">
              <span className="cg-tips-label">Tips</span>
              <span className="cg-tip">• Be specific: mention framework, styling, and features</span>
              <span className="cg-tip">• For HTML/CSS/JS: Live Preview appears automatically</span>
              <span className="cg-tip">• Use Export to download the file instantly</span>
            </div>
          </div>

          {/* ── Right: Output ── */}
          <div className="cg-card cg-output">
            <div className="cg-output-toolbar">
              <div className="cg-toolbar-left">
                <span className="cg-card-label">Output</span>
                {result && <span className="cg-lang-pill">{language}</span>}
                {canPreview && (
                  <div className="cg-tabs">
                    <button
                      className={`cg-tab ${activeTab === 'code' ? 'active' : ''}`}
                      onClick={() => setActiveTab('code')}
                    >Code</button>
                    <button
                      className={`cg-tab ${activeTab === 'preview' ? 'active' : ''}`}
                      onClick={() => setActiveTab('preview')}
                    >Preview</button>
                  </div>
                )}
              </div>
              <button
                className="cg-export-btn"
                onClick={exportCode}
                disabled={!editedCode}
              >
                <Download size={11} /> Export
              </button>
            </div>

            {/* Empty state */}
            {!result && !loading && (
              <div className="cg-empty">
                <Code2 size={46} style={{ color: '#38bdf8' }} />
                <span className="cg-empty-label">Your generated code will appear here</span>
              </div>
            )}

            {/* Loading state */}
            {loading && !result && (
              <div className="cg-loading-wrap">
                <div className="cg-spinner" />
                <span className="cg-loading-text">AI is synthesizing your code...</span>
              </div>
            )}

            {/* Monaco Editor */}
            {result && activeTab === 'code' && (
              <div style={{ background: '#0a0a0f' }}>
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
              <>
                <div className="cg-preview-bar">
                  <div className="cg-preview-dots">
                    <div className="cg-preview-dot" style={{ background: '#ef4444' }} />
                    <div className="cg-preview-dot" style={{ background: '#eab308' }} />
                    <div className="cg-preview-dot" style={{ background: '#22c55e' }} />
                  </div>
                  <div className="cg-url-bar">preview://harvox.local</div>
                </div>
                <iframe
                  title="preview"
                  sandbox="allow-scripts"
                  style={{ width: '100%', height: 450, border: 'none', background: '#fff' }}
                  srcDoc={getPreviewHtml()}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
