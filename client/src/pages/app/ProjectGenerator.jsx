import { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { aiAPI } from '../../services/api';
import ChatMessage from '../../components/chat/ChatMessage';
import { useAuthStore } from '../../store/authStore';
import PremiumLockOverlay from '../../components/ui/PremiumLockOverlay';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { ChevronDown, Download, FileText, Zap, Loader2, Github, AlertTriangle, Code2 } from 'lucide-react';

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

  const [idea, setIdea] = useState('');
  const [type, setType] = useState('MERN FYP (Standard)');
  const [complexity, setComplexity] = useState('ADVANCED');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isPro) {
    return (
      <PremiumLockOverlay
        featureName="AI Project Generator"
        description="Scaffold complete, industry-standard project templates and auto-generated repository structures."
      />
    );
  }

  const generate = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setResult('');
    setError('');

    try {
      const { data } = await aiAPI.project({ idea, type, complexity });

      let text = '';
      if (Array.isArray(data.content)) {
        text = data.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('\n');
      } else if (typeof data.content === 'string') {
        text = data.content;
      } else if (typeof data.result === 'string') {
        text = data.result;
      } else if (typeof data.message === 'string') {
        text = data.message;
      }

      if (!text.trim()) {
        throw new Error('Received an empty response from the AI. Please try again.');
      }

      setResult(text);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Generation failed. Please check your connection and try again.';
      setError(msg);
      console.error('[ProjectGenerator] API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    if (!result) return;
    try {
      const zip = new JSZip();
      zip.file('README.md', result);

      const fileRegex =
        /\*\*File:\s*(.+?)\*\*\s*\n*```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*?)```/g;
      let match;
      while ((match = fileRegex.exec(result)) !== null) {
        zip.file(match[1].trim(), match[2].trim());
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `harvox-project-${Date.now()}.zip`);
    } catch {
      saveAs(
        new Blob([result], { type: 'text/markdown' }),
        `harvox-project-${Date.now()}.md`
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-poppins">
      {/* Header */}
      <div>
        <div className="font-mono text-[9px] tracking-widest text-muted uppercase">
          Workspace <span className="text-gray-600">/</span> Project Lab
        </div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-neon flex items-center gap-3 mt-1">
          <Code2 className="w-7 h-7 text-neon-blue animate-[spin_40s_linear_infinite]" />
          ARCHITECT INITIATIVE
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 font-mono text-[9px] tracking-widest text-emerald-400 w-fit mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          LIVE ENGINE SYNCED
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 font-mono text-xs animate-fade-in">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main input card */}
      <GlassCard hover={false} className="border-white/10 p-0 overflow-hidden flex flex-col justify-between">
        <div className="flex items-center gap-3 px-6 py-4 bg-secondary/80 border-b border-white/5 select-none">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-base">
            ✦
          </div>
          <div>
            <h3 className="font-orbitron text-sm font-bold text-white tracking-widest uppercase">Intelligent Blueprint Generator</h3>
            <p className="text-xs text-muted leading-relaxed">
              Synthesize complex full-stack architectures from natural language descriptions.
            </p>
          </div>
        </div>

        <form onSubmit={generate}>
          <div className="p-6 flex flex-col gap-6">
            {/* Row: stack + complexity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase block">Tech Stack Architecture</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#050911]/80 border border-white/10 rounded-xl text-white font-mono text-xs px-3.5 py-2.5 outline-none transition-all duration-300 focus:border-neon-blue/50 focus:shadow-neon-blue/20 cursor-pointer appearance-none"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {STACKS.map((s) => (
                      <option key={s} value={s} className="bg-[#070b14] text-white">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neon-blue pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase block">Complexity Vector</label>
                <div className="flex gap-2 flex-wrap">
                  {COMPLEXITY.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all border ${
                        complexity === c
                          ? 'bg-neon-purple/20 border-neon-purple/40 text-white shadow-[0_0_15px_rgba(138,43,226,0.15)]'
                          : 'border-white/5 bg-white/5 text-muted hover:text-white hover:border-white/10'
                      }`}
                      onClick={() => setComplexity(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase block">Project Intent &amp; Functionality</label>
              <textarea
                className="w-full min-h-[140px] bg-[#050911]/80 border border-white/10 rounded-xl text-white text-xs leading-relaxed p-3.5 resize-none outline-none focus:border-neon-blue/50 focus:shadow-neon-blue/20 transition-all font-poppins placeholder-gray-700 disabled:opacity-50"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your FYP idea… e.g., A decentralized mental health tracking app with AI-driven sentiment analysis and encrypted clinician messaging."
                required
              />
            </div>
          </div>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-3 p-6 border-t border-white/5 bg-white/[0.01]">
            <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-secondary hover:border-neon-blue hover:text-neon-blue transition-all text-xs font-mono text-muted cursor-pointer">
              <FileText size={12} className="text-neon-blue" />
              Add Reference PDF
            </button>
            <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-secondary hover:border-neon-blue hover:text-neon-blue transition-all text-xs font-mono text-muted cursor-pointer">
              <Github size={12} className="text-neon-purple" />
              Import GitHub URL
            </button>
            <NeonButton
              variant="acid"
              className="ml-auto text-xs font-bold font-orbitron tracking-widest"
              type="submit"
              disabled={loading || !idea.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Architecting...
                </>
              ) : (
                <>
                  Generate Project Plan <Zap size={14} className="ml-1.5 text-black" />
                </>
              )}
            </NeonButton>
          </div>
        </form>
      </GlassCard>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Generated Modules */}
          <div className="border border-white/10 bg-[#03060d]/85 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3.5 bg-secondary/80 border-b border-white/5 select-none">
              <span className="font-orbitron text-[10px] font-bold tracking-widest text-neon-blue uppercase">Generated Modules</span>
              <span className="font-mono text-[9px] text-muted">4/12 Computed</span>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-2">
                {[
                  { icon: '▦', name: 'API Gateway Layer', stack: 'NODE.JS / EXPRESS' },
                  { icon: '◈', name: 'Auth Service',      stack: 'JWT / PASSPORT'   },
                  { icon: '⬡', name: 'Database Schema',   stack: 'MONGODB / MONGOOSE'},
                  { icon: '◎', name: 'Frontend Scaffold', stack: 'REACT / VITE'     },
                ].map((m) => (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5" key={m.name}>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold select-none">
                      {m.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{m.name}</div>
                      <div className="font-mono text-[8px] text-muted tracking-wider mt-0.5">{m.stack}</div>
                    </div>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-pink shadow-[0_0_6px_#FF00C8]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Execution Roadmap */}
          <div className="border border-white/10 bg-[#03060d]/85 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/80 border-b border-white/5 select-none">
              <span className="font-orbitron text-[10px] font-bold tracking-widest text-neon-purple uppercase">Execution Roadmap</span>
              <button
                onClick={download}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-secondary hover:border-neon-purple hover:text-neon-purple transition-all text-[9px] font-orbitron font-bold tracking-wider uppercase cursor-pointer"
              >
                <Download size={11} /> Download Plan
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-0 relative">
                {[
                  { label: 'Phase 01: Core Architecture', sub: 'Defining schema & engine logic.',  done: true  },
                  { label: 'Phase 02: API Integration',   sub: 'REST endpoints & middleware.',     done: false },
                  { label: 'Phase 03: Frontend Build',    sub: 'Component tree & routing.',        done: false },
                  { label: 'Phase 04: Deployment',        sub: 'CI/CD pipeline & hosting.',        done: false },
                ].map((phase, i, arr) => (
                  <div className="flex gap-3 py-2.5 border-b border-white/5 last:border-b-0" key={phase.label}>
                    <div className="flex flex-col items-center gap-0">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                        phase.done 
                          ? 'bg-neon-blue border-neon-blue shadow-[0_0_8px_#00F0FF]' 
                          : 'bg-transparent border-white/20'
                      }`} />
                      {i < arr.length - 1 && <div className="w-px flex-grow bg-white/10 min-h-[16px] mt-1" />}
                    </div>
                    <div>
                      <div className="font-mono text-[10px] font-bold text-gray-300">{phase.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{phase.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full AI Output */}
          <div className="border border-white/10 bg-[#03060d]/85 rounded-xl overflow-hidden shadow-2xl lg:col-span-2 w-full">
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/80 border-b border-white/5 select-none">
              <span className="font-orbitron text-[10px] font-bold tracking-widest text-neon-pink uppercase">Full Blueprint</span>
              <button
                onClick={download}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-secondary hover:border-neon-pink hover:text-neon-pink transition-all text-[9px] font-orbitron font-bold tracking-wider uppercase cursor-pointer"
              >
                <Download size={11} /> Download ZIP
              </button>
            </div>
            <div className="p-4 bg-[#0a0a0f] text-left overflow-x-auto">
              <div className="text-xs sm:text-sm prose-invert max-w-none break-words leading-relaxed font-mono">
                <ChatMessage role="assistant" content={result} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}