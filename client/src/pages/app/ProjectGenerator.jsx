import { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { aiAPI } from '../../services/api';
import ChatMessage from '../../components/chat/ChatMessage';
import { useAuthStore } from '../../store/authStore';
import PremiumLockOverlay from '../../components/ui/PremiumLockOverlay';

const STACKS = [
  'MERN FYP (Standard)',
  'Full Stack Web',
  'Mobile App',
  'AI/ML Project',
  'Desktop App',
];

const COMPLEXITY = ['MVP', 'ADVANCED', 'ENTERPRISE'];

export default function ProjectGenerator() {
  const { user } = useAuthStore();
  const isPro = user?.subscription === 'pro' || user?.role === 'admin';

  if (!isPro) {
    return (
      <PremiumLockOverlay
        featureName="AI Project Generator"
        description="Scaffold complete, industry-standard project templates and auto-generated repository structures."
      />
    );
  }

  const [idea, setIdea] = useState('');
  const [type, setType] = useState('MERN FYP (Standard)');
  const [complexity, setComplexity] = useState('ADVANCED');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const { data } = await aiAPI.project({ idea, type, complexity });
      setResult(data.content);
    } catch (err) {
      setResult(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    try {
      const zip = new JSZip();
      zip.file('README.md', result);
      const fileRegex = /\*\*File:\s*(.+?)\*\*\s*\n*```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*?)```/g;
      let match;
      while ((match = fileRegex.exec(result)) !== null) {
        zip.file(match[1].trim(), match[2].trim());
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `harvox-project-${Date.now()}.zip`);
    } catch {
      saveAs(new Blob([result], { type: 'text/markdown' }), `harvox-project-${Date.now()}.md`);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@500;600;700;800&display=swap');

        .pg-wrap {
          display: flex;
          flex-direction: column;
          gap: 22px;
          font-family: 'Syne', sans-serif;
        }

        /* ── Header ── */
        .pg-header { display: flex; flex-direction: column; gap: 3px; }
        .pg-breadcrumb {
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          color: #475569; text-transform: uppercase;
        }
        .pg-breadcrumb span { color: #94a3b8; }
        .pg-title {
          font-size: 36px; font-weight: 800; color: #f1f5f9;
          line-height: 1.1; letter-spacing: -0.02em;
        }
        .pg-live-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px; border-radius: 99px;
          border: 1px solid rgba(0,230,200,0.25);
          background: rgba(0,230,200,0.07);
          font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.15em; color: #00e6c8;
          width: fit-content; margin-top: 4px;
        }
        .pg-live-dot {
          width: 7px; height: 7px; border-radius: 99px;
          background: #ec4899;
          box-shadow: 0 0 8px #ec4899;
          animation: pg-pulse 1.8s ease-in-out infinite;
        }
        @keyframes pg-pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }

        /* ── Main card ── */
        .pg-card {
          background: rgba(13,19,35,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }
        .pg-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,230,200,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Card header ── */
        .pg-card-top {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .pg-icon-box {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .pg-card-title { font-size: 17px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .pg-card-sub { font-size: 13px; color: #64748b; line-height: 1.45; font-weight: 400; }

        /* ── Form body ── */
        .pg-form-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 20px; }

        /* Field label */
        .pg-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; letter-spacing: 0.22em;
          color: #475569; text-transform: uppercase;
          margin-bottom: 8px; display: block;
        }

        /* Stack select */
        .pg-select-wrap { position: relative; }
        .pg-select {
          width: 100%; appearance: none;
          background: rgba(8,12,20,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #cbd5e1;
          font-family: 'Space Mono', monospace; font-size: 13px;
          padding: 12px 40px 12px 16px;
          outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .pg-select:focus { border-color: rgba(0,230,200,0.35); }
        .pg-select-arrow {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); pointer-events: none;
          color: #475569; font-size: 12px;
        }

        /* Complexity buttons */
        .pg-complexity { display: flex; gap: 8px; }
        .pg-cx-btn {
          padding: 9px 20px; border-radius: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 0.12em;
          font-weight: 700; cursor: pointer;
          transition: all 0.18s; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #64748b;
        }
        .pg-cx-btn:hover { color: #cbd5e1; border-color: rgba(255,255,255,0.2); }
        .pg-cx-btn.active {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
          color: #f1f5f9;
        }

        /* Textarea */
        .pg-textarea {
          width: 100%; min-height: 150px;
          background: rgba(8,12,20,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #94a3b8;
          font-family: 'Syne', sans-serif; font-size: 14px;
          line-height: 1.65; padding: 14px 16px;
          resize: vertical; outline: none;
          transition: border-color 0.2s; box-sizing: border-box;
        }
        .pg-textarea::placeholder { color: #334155; }
        .pg-textarea:focus { border-color: rgba(0,230,200,0.3); }

        /* Action row */
        .pg-actions {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
          flex-wrap: wrap;
        }
        .pg-action-secondary {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 16px; border-radius: 99px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #64748b; font-family: 'Space Mono', monospace;
          font-size: 11px; cursor: pointer; letter-spacing: 0.05em;
          transition: all 0.18s; white-space: nowrap;
        }
        .pg-action-secondary:hover { color: #94a3b8; border-color: rgba(255,255,255,0.2); }
        .pg-action-secondary svg { flex-shrink: 0; }

        .pg-generate-btn {
          margin-left: auto;
          display: flex; align-items: center; gap: 9px;
          padding: 12px 28px; border-radius: 99px;
          background: linear-gradient(135deg, #00e6c8 0%, #00b4d8 100%);
          border: none; cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
          color: #0a0f1a;
          box-shadow: 0 0 28px rgba(0,230,200,0.35);
          transition: all 0.2s;
        }
        .pg-generate-btn:hover:not(:disabled) {
          box-shadow: 0 0 40px rgba(0,230,200,0.5);
          transform: translateY(-1px);
        }
        .pg-generate-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .pg-btn-spinner {
          width: 14px; height: 14px; border-radius: 99px;
          border: 2px solid rgba(10,15,26,0.3);
          border-top-color: #0a0f1a;
          animation: pg-spin 0.75s linear infinite;
        }
        @keyframes pg-spin { to { transform: rotate(360deg); } }

        /* ── Result section ── */
        .pg-result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pg-result-card {
          background: rgba(13,19,35,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; overflow: hidden;
        }
        .pg-result-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .pg-result-title { font-size: 14px; font-weight: 700; color: #e2e8f0; }
        .pg-result-count {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #64748b;
        }
        .pg-result-body { padding: 16px 18px; }
        .pg-download-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; font-family: 'Space Mono', monospace;
          font-size: 11px; cursor: pointer; letter-spacing: 0.05em;
          transition: all 0.18s;
        }
        .pg-download-btn:hover { background: rgba(0,230,200,0.1); color: #00e6c8; border-color: rgba(0,230,200,0.25); }

        /* Phase timeline */
        .pg-timeline { display: flex; flex-direction: column; gap: 0; }
        .pg-phase {
          display: flex; gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: relative;
        }
        .pg-phase:last-child { border-bottom: none; }
        .pg-phase-dot-col {
          display: flex; flex-direction: column; align-items: center; gap: 0;
          flex-shrink: 0; padding-top: 2px;
        }
        .pg-phase-dot {
          width: 10px; height: 10px; border-radius: 99px;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.2);
          flex-shrink: 0;
        }
        .pg-phase-dot.done { background: #00e6c8; border-color: #00e6c8; box-shadow: 0 0 8px #00e6c8; }
        .pg-phase-line { width: 1px; flex: 1; background: rgba(255,255,255,0.06); min-height: 20px; }
        .pg-phase-label { font-family: 'Space Mono', monospace; font-size: 11px; color: #94a3b8; font-weight: 700; }
        .pg-phase-sub { font-size: 12px; color: #475569; margin-top: 2px; }

        /* Module chips */
        .pg-modules { display: flex; flex-direction: column; gap: 8px; }
        .pg-module {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 9px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .pg-module-icon {
          width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
          background: rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
        }
        .pg-module-name { font-size: 13px; font-weight: 600; color: #cbd5e1; }
        .pg-module-stack { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: #475569; }
        .pg-module-dot {
          margin-left: auto; width: 6px; height: 6px; border-radius: 99px;
          background: #ec4899; box-shadow: 0 0 6px #ec4899;
        }

        /* Content prose */
        .pg-prose { color: #64748b; font-size: 13px; line-height: 1.7; }
        .pg-prose pre { font-family: 'Space Mono', monospace; font-size: 11px; white-space: pre-wrap; word-break: break-word; }
      `}</style>

      <div className="pg-wrap">

        {/* Header */}
        <div className="pg-header">
          <div className="pg-breadcrumb">Workspace <span>/</span> Project Lab</div>
          <h1 className="pg-title">Architect Initiative</h1>
          <div className="pg-live-badge">
            <div className="pg-live-dot" />
            LIVE ENGINE SYNCED
          </div>
        </div>

        {/* Main input card */}
        <div className="pg-card">
          <div className="pg-card-top">
            <div className="pg-icon-box">✦</div>
            <div>
              <div className="pg-card-title">Intelligent Blueprint Generator</div>
              <div className="pg-card-sub">
                Synthesize complex full-stack architectures from natural language descriptions.
              </div>
            </div>
          </div>

          <form onSubmit={generate}>
            <div className="pg-form-body">
              {/* Row: stack + complexity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="pg-label">Tech Stack Architecture</label>
                  <div className="pg-select-wrap">
                    <select
                      className="pg-select"
                      value={type}
                      onChange={e => setType(e.target.value)}
                    >
                      {STACKS.map(s => (
                        <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>
                      ))}
                    </select>
                    <span className="pg-select-arrow">▾</span>
                  </div>
                </div>

                <div>
                  <label className="pg-label">Complexity Vector</label>
                  <div className="pg-complexity">
                    {COMPLEXITY.map(c => (
                      <button
                        key={c} type="button"
                        className={`pg-cx-btn ${complexity === c ? 'active' : ''}`}
                        onClick={() => setComplexity(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="pg-label">Project Intent &amp; Functionality</label>
                <textarea
                  className="pg-textarea"
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder="Describe your FYP idea… e.g., A decentralized mental health tracking app with AI-driven sentiment analysis and encrypted clinician messaging."
                  required
                />
              </div>
            </div>

            {/* Action row */}
            <div className="pg-actions">
              <button type="button" className="pg-action-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Add Reference PDF
              </button>
              <button type="button" className="pg-action-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Import GitHub URL
              </button>
              <button
                className="pg-generate-btn"
                type="submit"
                disabled={loading || !idea.trim()}
              >
                {loading ? (
                  <><div className="pg-btn-spinner" /> Architecting...</>
                ) : (
                  <>
                    Generate Project Plan
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="pg-result-grid">

            {/* Generated Modules */}
            <div className="pg-result-card">
              <div className="pg-result-header">
                <div>
                  <div className="pg-result-title">Generated Modules</div>
                </div>
                <div className="pg-result-count">4/12 Computed</div>
              </div>
              <div className="pg-result-body">
                <div className="pg-modules">
                  {[
                    { icon: '▦', name: 'API Gateway Layer', stack: 'NODE.JS / EXPRESS' },
                    { icon: '◈', name: 'Auth Service', stack: 'JWT / PASSPORT' },
                    { icon: '⬡', name: 'Database Schema', stack: 'MONGODB / MONGOOSE' },
                    { icon: '◎', name: 'Frontend Scaffold', stack: 'REACT / VITE' },
                  ].map(m => (
                    <div className="pg-module" key={m.name}>
                      <div className="pg-module-icon">{m.icon}</div>
                      <div>
                        <div className="pg-module-name">{m.name}</div>
                        <div className="pg-module-stack">{m.stack}</div>
                      </div>
                      <div className="pg-module-dot" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Roadmap */}
            <div className="pg-result-card">
              <div className="pg-result-header">
                <div className="pg-result-title">Execution Roadmap</div>
                <button className="pg-download-btn" onClick={download}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Plan
                </button>
              </div>
              <div className="pg-result-body">
                <div className="pg-timeline">
                  {[
                    { label: 'Phase 01: Core Architecture', sub: 'Defining schema & engine logic.', done: true },
                    { label: 'Phase 02: API Integration', sub: 'REST endpoints & middleware.', done: false },
                    { label: 'Phase 03: Frontend Build', sub: 'Component tree & routing.', done: false },
                    { label: 'Phase 04: Deployment', sub: 'CI/CD pipeline & hosting.', done: false },
                  ].map((phase, i, arr) => (
                    <div className="pg-phase" key={phase.label}>
                      <div className="pg-phase-dot-col">
                        <div className={`pg-phase-dot ${phase.done ? 'done' : ''}`} />
                        {i < arr.length - 1 && <div className="pg-phase-line" />}
                      </div>
                      <div>
                        <div className="pg-phase-label">{phase.label}</div>
                        <div className="pg-phase-sub">{phase.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full AI Output */}
            <div className="pg-result-card" style={{ gridColumn: '1 / -1' }}>
              <div className="pg-result-header">
                <div className="pg-result-title">Full Blueprint</div>
                <button className="pg-download-btn" onClick={download}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download ZIP
                </button>
              </div>
              <div className="pg-result-body">
                <div className="pg-prose">
                  <ChatMessage role="assistant" content={result} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}