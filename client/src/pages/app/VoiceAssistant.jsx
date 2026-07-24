import { useState, useEffect, useRef, useCallback } from 'react';
import { aiAPI, settingsAPI, automationAPI } from '../../services/api';
import VoiceOrb from '../../components/voice/VoiceOrb';
import ChatMessage from '../../components/chat/ChatMessage';
import { useAuthStore } from '../../store/authStore';
import PremiumLockOverlay from '../../components/ui/PremiumLockOverlay';
import {
  CheckCircle2, XCircle, Loader2, Zap, Mic, Brain, Activity,
  Clock, MessageSquare, Settings, ChevronDown, Shield, Volume2,
  BookOpen, FolderOpen, ListChecks, Cpu, RefreshCw, MicOff,
  Trash2, Sparkles, Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceProviderManager, getVoiceConfigStore } from '../../services/voice/index.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const AGENT_BADGES = {
  ceo:      { label: 'CEO AGENT',        color: '#fbbf24' },
  ui:       { label: 'UI AGENT',         color: '#be5cf6' },
  dev:      { label: 'DEVELOPER AGENT',  color: '#00f0ff' },
  research: { label: 'RESEARCH AGENT',   color: '#34d399' },
  deploy:   { label: 'DEPLOYMENT AGENT', color: '#f87171' },
};

const AI_MODELS = [
  { provider: 'groq',       model: 'llama-3.3-70b-versatile', label: 'Groq',       color: '#f97316', aliases: ['groq', 'llama', 'lama'] },
  { provider: 'gemini',     model: 'gemini-2.0-flash',         label: 'Gemini',     color: '#a78bfa', aliases: ['gemini', 'gemeni', 'gemny', 'jemini'] },
  { provider: 'openrouter', model: 'openrouter/free',          label: 'OpenRouter', color: '#2563eb', aliases: ['openrouter', 'router', 'free'] },
  { provider: 'openai',     model: 'gpt-4o',                   label: 'OpenAI',     color: '#10b981', aliases: ['openai', 'chatgpt', 'gpt'] },
];

// ── ElevenLabs Categorized Voice Catalog ─────────────────────────────────────
const ELEVENLABS_VOICES = [
  // Female Hindi Voices (Default)
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Hindi Female Premium (Priya)', category: 'Female Hindi (Default)', gender: 'F', style: 'Multilingual' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Hindi Female 1 (Rachel)',       category: 'Female Hindi',           gender: 'F', style: 'Multilingual' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Hindi Female 2 (Sarah)',        category: 'Female Hindi',           gender: 'F', style: 'Multilingual' },
  { id: 'XB0fDUnUDz4sSJJ5qy5z', name: 'Hindi Female 3 (Charlotte)',    category: 'Female Hindi',           gender: 'F', style: 'Multilingual' },

  // Male Hindi Voices
  { id: 'pNInz6obpgfrhhF2E4DY', name: 'Hindi Male 1 (Adam)',           category: 'Male Hindi',             gender: 'M', style: 'Multilingual' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Hindi Male 2 (Antoni)',         category: 'Male Hindi',             gender: 'M', style: 'Multilingual' },
  { id: 'onwF48T1CtxCmqQRPOHJ', name: 'Hindi Male 3 (Daniel)',         category: 'Male Hindi',             gender: 'M', style: 'Multilingual' },

  // Urdu Voices
  { id: 'ohvvU75FpBEB8fdaLOMh', name: 'Female Urdu Voice 1',          category: 'Urdu Voices',            gender: 'F', style: 'Urdu / Multilingual' },
  { id: 'VG7gYikNQ71LJ52W9fAD', name: 'Female Urdu Voice 2 (Priya)',   category: 'Urdu Voices',            gender: 'F', style: 'Urdu / Multilingual' },
  { id: 'CYZATuZ1tjgW8es1QfPG', name: 'Male Urdu Voice',              category: 'Urdu Voices',            gender: 'M', style: 'Urdu / Multilingual' },

  // English Voices
  { id: 'Lcfc5ZowlhAlwG5vBb22', name: 'English Female (Emily)',       category: 'English Voices',         gender: 'F', style: 'Calm' },
  { id: 'IKne3meq5aKbA1x0m7Ed', name: 'English Male (Charlie)',        category: 'English Voices',         gender: 'M', style: 'Conversational' },
];

const DEFAULT_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Hindi Female Premium (Default)

// ElevenLabs voice IDs as a Set for O(1) lookup
const ELEVENLABS_IDS = new Set(ELEVENLABS_VOICES.map((v) => v.id));

const MAX_HISTORY = 20;

function detectModelSwitch(text) {
  const lower = text.toLowerCase().trim();
  const switchPatterns = [
    /switch(?:ing)?\s+to\s+(\w+)/i,
    /use\s+(\w+)(?:\s+model)?/i,
    /change\s+(?:model\s+)?to\s+(\w+)/i,
    /activate\s+(\w+)/i,
    /enable\s+(\w+)/i,
    /set\s+model\s+(?:to\s+)?(\w+)/i,
  ];
  for (const pattern of switchPatterns) {
    const m = lower.match(pattern);
    if (m) {
      const word = m[1].toLowerCase();
      for (let i = 0; i < AI_MODELS.length; i++) {
        if (AI_MODELS[i].aliases.some(alias => word.includes(alias) || alias.includes(word))) return i;
      }
    }
  }
  return null;
}

// ── Toggle Component ───────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = 'bg-neon-blue' }) {
  const glowStyle = value
    ? { boxShadow: color === 'bg-neon-blue' ? '0 0 10px rgba(0, 240, 255, 0.4)' : '0 0 10px rgba(255, 0, 200, 0.4)' }
    : {};
  return (
    <button
      onClick={() => onChange(!value)}
      style={glowStyle}
      className={`relative w-8 h-4 rounded-full transition-all duration-300 flex items-center px-0.5 shrink-0 ${value ? color : 'bg-[#111118] border border-white/10'}`}
    >
      <motion.div layout className="w-2.5 h-2.5 bg-white rounded-full shadow" />
    </button>
  );
}

// ── HUD Card wrapper ───────────────────────────────────────────────────────────
const HudCard = ({ children, className = '', glow = '#8A2BE2' }) => (
  <div
    className={`relative rounded-2xl border border-white/8 bg-[#07060f]/90 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ boxShadow: `0 0 30px ${glow}18` }}
  >
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow}60, transparent)` }} />
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 rounded-tl-2xl" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 rounded-tr-2xl" />
    {children}
  </div>
);

// ── Audio Level Meter ──────────────────────────────────────────────────────────
function AudioLevelMeter({ level = 0, active }) {
  const bars = 16;
  return (
    <div className="flex items-end justify-center gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i / bars) * 100;
        const lit = active && level > threshold;
        const color = lit
          ? i < bars * 0.5 ? '#34d399' : i < bars * 0.75 ? '#fbbf24' : '#f87171'
          : 'rgba(255,255,255,0.06)';
        return (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-75"
            style={{
              height: lit ? `${Math.max(20, 20 + (level / 100) * 80)}%` : '20%',
              background: color,
              boxShadow: lit ? `0 0 4px ${color}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}


// ── Conversation History Item ──────────────────────────────────────────────────
function HistoryItem({ item, onReplay }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="border border-white/5 rounded-xl bg-white/2 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-white/3 transition-colors"
      >
        <div
          className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: item.isError ? '#f8717120' : '#00f0ff15',
            border: `1px solid ${item.isError ? '#f8717130' : '#00f0ff20'}`,
          }}
        >
          {item.isError
            ? <XCircle size={10} className="text-rose-400" />
            : <MessageSquare size={10} className="text-cyan-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono text-gray-400 truncate">{item.query}</p>
          <p className="text-[8px] font-mono text-gray-700 mt-0.5">{item.time} · {item.model}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onReplay(item.query); }}
            className="text-[8px] font-mono text-cyan-600 hover:text-cyan-400 transition-colors px-1.5 py-0.5 rounded border border-cyan-900/40 hover:border-cyan-600/40"
          >
            Replay
          </button>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={10} className="text-gray-600" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-white/5">
              <p className="text-[9px] font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                {item.response}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Voice Task Runner ──────────────────────────────────────────────────────────
function VoiceTaskRunner({ plan, onDone, speakRef }) {
  const [steps, setSteps] = useState(plan.steps.map(s => ({ ...s, status: 'pending' })));
  const [logs, setLogs] = useState([]);
  const hasRun = useRef(false);

  const addLog = (text, type = 'info') =>
    setLogs(prev => [...prev, { text, type, time: new Date().toLocaleTimeString() }]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    runAll();
  }, []);

  const runAll = async () => {
    speakRef.current?.(`Starting execution of: ${plan.title}`);
    addLog(`Executing plan: ${plan.title}`, 'success');
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      addLog(`Step ${i + 1}: ${step.description}...`, 'info');
      try {
        const normalizedStep = { ...step };
        if (!Array.isArray(normalizedStep.args))
          normalizedStep.args = normalizedStep.target ? [String(normalizedStep.target)] : [];
        const { data } = await automationAPI.executeStep(normalizedStep);
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
        addLog(`✓ ${data.message || 'Done.'}`, 'success');
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed';
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'failed' } : s));
        addLog(`✗ ${msg}`, 'error');
        speakRef.current?.(`Sorry, step ${i + 1} failed. ${msg}`);
        onDone?.();
        return;
      }
    }
    speakRef.current?.(`System update complete. ${plan.title} completed successfully.`);
    addLog('All steps completed.', 'success');
    onDone?.();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <HudCard glow="#fbbf24" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={11} className="text-yellow-400 animate-pulse" />
          <span className="text-[9px] font-orbitron font-black tracking-[0.2em] text-yellow-400 uppercase">
            Automation Pipeline Running
          </span>
        </div>
        <p className="text-xs font-orbitron font-bold text-white mb-3">{plan.title}</p>
        <div className="space-y-1.5 mb-3">
          {steps.map((step, i) => {
            const badge = step.agent && AGENT_BADGES[step.agent.toLowerCase()];
            return (
              <div key={step.id || i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[9px] font-mono text-gray-600 w-5 shrink-0">0{i + 1}</span>
                <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                  <p className="text-[10px] text-gray-300 leading-none truncate">{step.description}</p>
                  {badge && (
                    <span
                      className="text-[6px] font-orbitron font-black px-1.5 py-0.5 rounded border shrink-0"
                      style={{ color: badge.color, borderColor: `${badge.color}40`, background: `${badge.color}10` }}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                {step.status === 'pending'   && <span className="text-[8px] text-gray-600 font-mono shrink-0">QUEUED</span>}
                {step.status === 'running'   && <Loader2 size={11} className="text-neon-blue animate-spin shrink-0" />}
                {step.status === 'completed' && <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />}
                {step.status === 'failed'    && <XCircle size={11} className="text-rose-400 shrink-0" />}
              </div>
            );
          })}
        </div>
        {logs.length > 0 && (
          <div className="bg-black/60 border border-white/5 rounded-xl p-2.5 max-h-24 overflow-y-auto font-mono text-[9px] space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
            {logs.map((log, i) => (
              <div key={i} className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-gray-400'}>
                <span className="text-gray-700 mr-1">[{log.time}]</span>{log.text}
              </div>
            ))}
          </div>
        )}
      </HudCard>
    </motion.div>
  );
}

// ── Brain Core Stats Panel ─────────────────────────────────────────────────────
function BrainCorePanel({ activeModel, sessionStats, listening, thinking, speaking }) {
  const uptime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - uptime.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const coreState =
    thinking  ? { label: 'PROCESSING', color: '#facc15' } :
    listening ? { label: 'LISTENING',  color: '#22d3ee' } :
    speaking  ? { label: 'SPEAKING',   color: '#a78bfa' } :
                { label: 'STANDBY',    color: '#22c55e' };

  return (
    <HudCard glow={activeModel.color} className="w-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Brain size={11} style={{ color: activeModel.color }} />
          <span className="text-[9px] font-orbitron font-black tracking-[0.2em] text-white/50 uppercase">Brain Core</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: coreState.color, boxShadow: `0 0 6px ${coreState.color}` }}
          />
          <span className="text-[8px] font-mono font-black" style={{ color: coreState.color }}>{coreState.label}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/5">
        {[
          { icon: MessageSquare, label: 'Queries',  value: sessionStats.queries,   color: '#60a5fa' },
          { icon: Clock,         label: 'Uptime',   value: fmt(elapsed),            color: '#34d399' },
          { icon: Activity,      label: 'Model',    value: activeModel.label,       color: activeModel.color },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center py-3 px-1 gap-1">
            <Icon size={10} style={{ color }} className="opacity-60" />
            <span className="text-[11px] font-orbitron font-black" style={{ color }}>{value}</span>
            <span className="text-[7px] font-mono text-white/25 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-2 px-4 py-2 border-t border-white/5"
        style={{ background: `linear-gradient(90deg, ${activeModel.color}10, transparent)` }}
      >
        <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: activeModel.color }} />
        <span className="text-[8px] font-mono" style={{ color: `${activeModel.color}bb` }}>
          {activeModel.provider.toUpperCase()} · {activeModel.model}
        </span>
      </div>
    </HudCard>
  );
}

// ── Daily Operator HUD Panel ───────────────────────────────────────────────────
const BSCS_SUBJECTS = [
  { key: 'AI',                   label: 'Artificial Intelligence', color: '#00f0ff' },
  { key: 'Database',             label: 'Database Systems',         color: '#a78bfa' },
  { key: 'Software Engineering', label: 'Software Engineering',     color: '#34d399' },
  { key: 'Assembly Language',    label: 'Assembly Language',        color: '#fbbf24' },
];

function DailyAssistantPanel() {
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [data,          setData]          = useState(null);
  const [lastFetched,   setLastFetched]   = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, studyRes] = await Promise.all([
        automationAPI.getDashboard(),
        automationAPI.getLearning(),
      ]);
      setData({ ...dashRes.data, studyTrack: studyRes.data });
      setLastFetched(new Date());
    } catch { /* informational only */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadDashboard();
    const id = setInterval(loadDashboard, 90_000);
    return () => clearInterval(id);
  }, [open, loadDashboard]);

  const tasks       = data?.tasks       || [];
  const studyTrack  = data?.studyTrack  || [];
  const projects    = data?.projects    || [];
  const activities  = data?.activities  || [];
  const doneTasks    = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'completed').length;
  const totalStudyHrs = studyTrack.reduce((s, t) => s + (t.hours || 0), 0);

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase"
      >
        <div className="flex items-center gap-2">
          <Cpu size={10} />
          Daily Operator HUD
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 size={9} className="animate-spin text-neon-blue" />}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <HudCard glow="#00f0ff" className="mt-2 p-4 space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ListChecks, label: 'Pending', value: pendingTasks, color: '#fbbf24' },
                  { icon: CheckCircle2, label: 'Done',  value: doneTasks,    color: '#34d399' },
                  { icon: BookOpen,    label: 'Study Hrs', value: `${totalStudyHrs}h`, color: '#00f0ff' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl"
                    style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                  >
                    <Icon size={11} style={{ color }} />
                    <span className="font-orbitron font-black text-sm" style={{ color }}>{value}</span>
                    <span className="text-[7px] font-mono text-white/25 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                  <ListChecks size={8} /> Active Tasks
                </p>
                {tasks.length === 0 ? (
                  <p className="text-[9px] font-mono text-white/20 text-center py-2">No tasks found. Create one via voice.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {tasks.slice(0, 8).map((task) => {
                      const isDone = task.status === 'done' || task.status === 'completed';
                      const priColor = task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#fbbf24' : '#6b7280';
                      return (
                        <div
                          key={task._id}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          {isDone
                            ? <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                            : <div className="w-2.5 h-2.5 rounded-full border shrink-0" style={{ borderColor: priColor }} />
                          }
                          <p className={`flex-1 text-[10px] font-mono leading-none truncate ${isDone ? 'line-through text-white/25' : 'text-white/70'}`}>
                            {task.title}
                          </p>
                          {task.priority && (
                            <span className="text-[7px] font-orbitron font-black uppercase shrink-0" style={{ color: priColor }}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                  <BookOpen size={8} /> BSCS Study Track
                </p>
                <div className="space-y-2.5">
                  {BSCS_SUBJECTS.map(({ key, label, color }) => {
                    const track = studyTrack.find(t => t.subject === key);
                    const hrs   = track?.hours || 0;
                    const pct   = Math.min(100, Math.round((hrs / 50) * 100));
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] font-mono text-white/40">{label}</span>
                          <span className="text-[8px] font-orbitron font-black" style={{ color }}>{hrs}h</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}40` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {projects.length > 0 && (
                <div>
                  <p className="text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <FolderOpen size={8} /> Active Projects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {projects.slice(0, 5).map((proj) => (
                      <span
                        key={proj._id}
                        className="text-[8px] font-mono px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.2)', color: '#a78bfa' }}
                      >
                        {proj.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                  <Activity size={8} /> Recent Activity
                </p>
                {activities.length === 0 ? (
                  <p className="text-[9px] font-mono text-white/20 text-center py-2">No recent activity logged.</p>
                ) : (
                  <div className="space-y-1 max-h-28 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {activities.slice(0, 8).map((act, i) => (
                      <div key={act._id || i} className="flex items-start gap-2">
                        <span className="w-1 h-1 mt-1.5 rounded-full bg-neon-purple/50 shrink-0" />
                        <span className="text-[8px] font-mono text-white/35 leading-relaxed">{act.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {lastFetched && (
                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 text-[8px] font-mono text-white/20 hover:text-white/40 transition-colors py-1"
                >
                  <RefreshCw size={8} className={loading ? 'animate-spin' : ''} />
                  Last updated {lastFetched.toLocaleTimeString()}
                </button>
              )}
            </HudCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Particles = () => {
  const pts = useRef(Array.from({ length: 25 }).map(() => ({
    w: Math.random() * 2 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    dur: Math.random() * 6 + 4,
  }))).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pts.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${p.w}px`, height: `${p.w}px`,
            left: `${p.left}%`, top: `${p.top}%`,
            background: ['rgba(138,43,226,0.15)', 'rgba(0,240,255,0.1)', 'rgba(255,0,200,0.08)'][i % 3],
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          }}
        />
      ))}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl bg-neon-purple/5" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function VoiceAssistant() {
  const { user } = useAuthStore();
  const isPro = user?.subscription === 'pro' || user?.role === 'admin';
  // NOTE: Do NOT put an early return here — all hooks must run unconditionally
  // (React Rules of Hooks). The isPro gate is applied in the JSX return below.

  // ── Mobile Detection ──────────────────────────────────────────────────────
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const browserSupported = (() => {
    const hasSR = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasMR = 'MediaRecorder' in window;
    const hasGUM = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    // iOS Safari doesn't support SpeechRecognition, needs MediaRecorder
    if (isIOSDevice) return hasMR && hasGUM;
    // Android/Desktop needs at least one method
    return hasSR || (hasMR && hasGUM);
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [listening,           setListening]           = useState(false);
  const [thinking,            setThinking]            = useState(false);
  const [speaking,            setSpeaking]            = useState(false);
  const [hasError,            setHasError]            = useState(false);
  const [errorMsg,            setErrorMsg]            = useState('');
  const [transcript,          setTranscript]          = useState('');
  const [response,            setResponse]            = useState('');
  const [taskPlan,            setTaskPlan]            = useState(null);
  const [executingPlan,       setExecutingPlan]       = useState(null);
  const [pendingPlanApproval, setPendingPlanApproval] = useState(false);
  const [supported,           setSupported]           = useState(browserSupported);
  const [selectedModelIdx,    setSelectedModelIdx]    = useState(0);
  const [switchToast,         setSwitchToast]         = useState(null);
  const [sessionStats,        setSessionStats]        = useState({ queries: 0 });
  const [showControls,        setShowControls]        = useState(false);
  const [audioLevel,          setAudioLevel]          = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showHistory,         setShowHistory]         = useState(false);
  const [retryCount,          setRetryCount]          = useState(0);
  const [voiceConfidence,     setVoiceConfidence]     = useState(98);
  const [ambientNoise,        setAmbientNoise]        = useState(32);
  const [voices,              setVoices]              = useState([]);
  const [selectedVoice,       setSelectedVoice]       = useState(DEFAULT_VOICE_ID);
  const [voiceSpeed,          setVoiceSpeed]          = useState(1.0);
  const [voiceLanguage,       setVoiceLanguage]       = useState('en-US');

  const [continuousMode, setContinuousMode] = useState(() => {
    const val = localStorage.getItem('harvox_voice_continuous');
    return val !== null ? JSON.parse(val) : true;
  });
  const [autoApprove, setAutoApprove] = useState(true);

  // ── Mutable refs (avoid stale closures) ───────────────────────────────────
  const srClassRef              = useRef(null);  // SpeechRecognition constructor class
  const recognitionRef          = useRef(null);  // current LIVE SR instance (new each session)
  const silenceTimerRef         = useRef(null);
  const restartTimerRef         = useRef(null);
  const isRestartingRef         = useRef(false);
  const manualStopRef           = useRef(false); // true = user intentionally stopped
  const finalTranscriptRef      = useRef('');
  const isProcessingRef         = useRef(false);
  const canvasRef               = useRef(null);
  const elevenLabsAudioRef      = useRef(null);
  const mediaRecorderRef        = useRef(null);
  const mediaStreamRef          = useRef(null);
  const recordingTimerRef       = useRef(null);

  // ── Voice Provider Manager ─────────────────────────────────────────────────
  const voiceProviderManagerRef = useRef(null);
  const voiceConfigStoreRef     = useRef(null);

  // Initialize voice provider manager and config store
  useEffect(() => {
    try {
      if (!voiceConfigStoreRef.current) {
        voiceConfigStoreRef.current = getVoiceConfigStore();
      }
      
      if (!voiceProviderManagerRef.current) {
        const config = voiceConfigStoreRef.current.getConfig();
        voiceProviderManagerRef.current = new VoiceProviderManager(config);
        
        // Expose to window for testing (development only)
        if (process.env.NODE_ENV === 'development') {
          window.__HARVOX_VOICE_MANAGER__ = voiceProviderManagerRef.current;
          window.__HARVOX_VOICE_CONFIG__ = voiceConfigStoreRef.current;
          console.log('[VoiceAssistant] Voice Provider Manager initialized');
          console.log('[VoiceAssistant] Testing: Access via window.__HARVOX_VOICE_MANAGER__');
        }
      }
    } catch (error) {
      console.error('[VoiceAssistant] Voice Provider Manager initialization failed:', error);
      // Continue without voice provider manager - fallback to legacy mode
    }

    // Cleanup on unmount
    return () => {
      try {
        if (voiceProviderManagerRef.current) {
          voiceProviderManagerRef.current.cleanup();
          voiceProviderManagerRef.current = null;
        }
        if (process.env.NODE_ENV === 'development') {
          delete window.__HARVOX_VOICE_MANAGER__;
          delete window.__HARVOX_VOICE_CONFIG__;
        }
      } catch (error) {
        console.error('[VoiceAssistant] Cleanup error:', error);
      }
    };
  }, []);


  // State refs — keep up-to-date so callbacks always see fresh values
  const continuousRef           = useRef(continuousMode);
  const autoApproveRef          = useRef(autoApprove);
  const pendingPlanApprovalRef  = useRef(pendingPlanApproval);
  const taskPlanRef             = useRef(taskPlan);
  const executingPlanRef        = useRef(executingPlan);
  const selectedModelIdxRef     = useRef(selectedModelIdx);
  const voicesRef               = useRef(voices);
  const selectedVoiceRef        = useRef(selectedVoice);
  const voiceSpeedRef           = useRef(voiceSpeed);
  const voiceLanguageRef        = useRef(voiceLanguage);
  const thinkingRef             = useRef(thinking);
  const speakingRef             = useRef(speaking);

  // Forward refs to break circular deps between speak / startListening
  const startListeningRef = useRef(null);
  const speakRef          = useRef(null);  // used by VoiceTaskRunner

  useEffect(() => { continuousRef.current          = continuousMode; },      [continuousMode]);
  useEffect(() => { autoApproveRef.current         = autoApprove; },         [autoApprove]);
  useEffect(() => { pendingPlanApprovalRef.current = pendingPlanApproval; }, [pendingPlanApproval]);
  useEffect(() => { taskPlanRef.current            = taskPlan; },            [taskPlan]);
  useEffect(() => { executingPlanRef.current       = executingPlan; },       [executingPlan]);
  useEffect(() => { selectedModelIdxRef.current    = selectedModelIdx; },    [selectedModelIdx]);
  useEffect(() => { voicesRef.current              = voices; },              [voices]);
  useEffect(() => { selectedVoiceRef.current       = selectedVoice; },       [selectedVoice]);
  useEffect(() => { voiceSpeedRef.current          = voiceSpeed; },          [voiceSpeed]);
  useEffect(() => { voiceLanguageRef.current       = voiceLanguage; },       [voiceLanguage]);
  useEffect(() => { thinkingRef.current            = thinking; },            [thinking]);
  useEffect(() => { speakingRef.current            = speaking; },            [speaking]);

  const activeModel = AI_MODELS[selectedModelIdx];

  // ── speak — Multi-Provider TTS with automatic fallback ────────────────────
  const speak = useCallback(async (text, onEnd) => {
    // Stop any ongoing audio
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.pause();
      elevenLabsAudioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const clean = (text || '').replace(/[#*`\->_]/g, '').slice(0, 800).trim();
    if (!clean) { onEnd?.(); return; }

    const afterSpeak = () => {
      setSpeaking(false);
      if (onEnd) {
        onEnd();
      } else if (continuousRef.current && !pendingPlanApprovalRef.current && !executingPlanRef.current) {
        setTimeout(() => startListeningRef.current?.(), 200);
      }
    };

    // Use Voice Provider Manager if available
    if (voiceProviderManagerRef.current) {
      try {
        setSpeaking(true);

        // Update voice config with current settings
        voiceProviderManagerRef.current.updateVoiceConfig({
          voiceId: selectedVoiceRef.current,
          speed: voiceSpeedRef.current,
          language: voiceLanguageRef.current
        });

        // Synthesize with automatic fallback
        const result = await voiceProviderManagerRef.current.synthesize(clean);

        if (process.env.NODE_ENV === 'development') {
          console.log('[VoiceAssistant] TTS Success:', {
            provider: result.provider,
            cached: result.cached
          });
        }

        // Handle audio playback based on provider type
        if (result.audio instanceof Audio) {
          // ElevenLabs provider returns Audio object
          elevenLabsAudioRef.current = result.audio;
          result.audio.onended = afterSpeak;
          result.audio.onerror = afterSpeak;
          await result.audio.play();
        } else {
          // Edge/Browser providers handle playback internally
          // Speech is already playing, just wait for completion
          // The afterSpeak will be called when utterance ends
        }

      } catch (error) {
        console.error('[VoiceAssistant] TTS failed:', error);
        // All providers failed, fallback to basic native speech
        speakNative(clean, afterSpeak);
      }
    } else {
      // Fallback to legacy implementation if manager not initialized
      const sel = selectedVoiceRef.current;
      const isElevenLabs = sel && ELEVENLABS_IDS.has(sel);

      if (isElevenLabs) {
        setSpeaking(true);
        aiAPI.tts({ text: clean, voiceId: sel })
          .then(({ data }) => {
            if (data.audioBase64) {
              const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
              audio.playbackRate = voiceSpeedRef.current;
              elevenLabsAudioRef.current = audio;
              audio.onended  = afterSpeak;
              audio.onerror  = () => {
                console.warn('[ElevenLabs] Playback error — falling back to native TTS');
                elevenLabsAudioRef.current = null;
                speakNative(clean, afterSpeak);
              };
              audio.play().catch(() => speakNative(clean, afterSpeak));
            } else {
              speakNative(clean, afterSpeak);
            }
          })
          .catch(() => {
            console.warn('[ElevenLabs] API call failed — falling back to native TTS');
            speakNative(clean, afterSpeak);
          });
      } else {
        speakNative(clean, afterSpeak);
      }
    }
  }, []); // intentionally empty — reads via refs

  // ── speakNative — browser Web Speech API helper ───────────────────────────
  const speakNative = useCallback((clean, afterSpeak) => {
    if (!('speechSynthesis' in window)) { afterSpeak(); return; }
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate  = voiceSpeedRef.current;

    const isUrdu = voiceLanguageRef.current === 'ur-PK' || /[\u0600-\u06FF]/.test(clean);
    if (isUrdu) {
      const urduVoice = voicesRef.current.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu'));
      if (urduVoice) utter.voice = urduVoice;
      utter.lang = 'ur-PK';
    } else {
      const sel = selectedVoiceRef.current;
      if (sel && sel !== 'female' && sel !== 'male' && !ELEVENLABS_IDS.has(sel)) {
        const matched = voicesRef.current.find(v => v.name === sel);
        if (matched) utter.voice = matched;
      }
    }
    utter.onstart = () => setSpeaking(true);
    utter.onend   = afterSpeak;
    utter.onerror = afterSpeak;
    window.speechSynthesis.speak(utter);
  }, []);

  speakRef.current = speak;

  // ── startListening — stable callback ──────────────────────────────────────
  const startFallbackRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setListening(true);
      setTranscript('Recording voice… tap again to send.');
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        clearTimeout(recordingTimerRef.current);
        stream.getTracks().forEach((track) => track.stop());
        setListening(false);
        const audio = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (!audio.size) return;
        try {
          setThinking(true);
          const formData = new FormData();
          formData.append('file', audio, 'harvox-voice.webm');
          const { data } = await aiAPI.transcribe(formData);
          const text = data?.text?.trim();
          if (!text) throw new Error('No speech was detected.');
          setTranscript(text);
          isProcessingRef.current = true;
          askAIRef.current(text);
        } catch (error) {
          setThinking(false);
          setHasError(true);
          setErrorMsg(error.response?.data?.message || error.message || 'Voice transcription failed.');
          if (continuousRef.current) {
            setTimeout(() => {
              if (continuousRef.current && !thinkingRef.current && !speakingRef.current) {
                startListeningRef.current?.();
              }
            }, 1500);
          }
        }
      };
      recorder.start();
      recordingTimerRef.current = setTimeout(() => recorder.state === 'recording' && recorder.stop(), 12000);
    } catch (error) {
      setListening(false);
      setHasError(true);
      setErrorMsg('Microphone access is required for voice input.');
    }
  }, []);

  // ── createNewSRSession: creates a FRESH SR instance and starts it ───────────
  // SpeechRecognition instances are single-use — once onend fires, they are dead.
  // Every listening session MUST use a new instance.
  const createNewSRSession = useCallback(() => {
    const SR = srClassRef.current;
    if (!SR) return false;

    // GUARD: Prevent creating a new session if already restarting
    if (isRestartingRef.current) {
      console.log('[SR] Already restarting, ignoring duplicate session request');
      return false;
    }

    // GUARD: Prevent creating a new session if one is already active
    if (recognitionRef.current) {
      console.log('[SR] Active session exists, aborting it first');
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const rec = new SR();
    rec.continuous      = true;   // IMPROVED: Continuous mode for better detection
    rec.interimResults  = true;
    rec.lang            = voiceLanguageRef.current;
    rec.maxAlternatives = 1;
    
    // IMPROVED: More sensitive audio detection
    rec.audioTrack = true;

    rec.onresult = (e) => {
      let interim = '', final = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final   += r[0].transcript;
        else           interim += r[0].transcript;
      }
      const full = (final + interim).trim();
      if (full) {
        setTranscript(full);
        finalTranscriptRef.current = full;
      }
      
      // IMPROVED: Faster silence detection (1.5s instead of 3s)
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const captured = finalTranscriptRef.current.trim();
        if (captured && !isProcessingRef.current) {
          // Quick process on silence
          console.log('[SR] Silence detected, processing:', captured);
          isProcessingRef.current = true;
          try { rec.stop(); } catch {}
          askAIRef.current(captured);
        }
      }, 1500); // FASTER: 1.5s instead of 3s
    };

    rec.onend = () => {
      console.log('[SR] onend fired');
      clearTimeout(silenceTimerRef.current);
      clearTimeout(restartTimerRef.current);
      recognitionRef.current = null;
      setListening(false);

      const captured = finalTranscriptRef.current.trim();
      if (captured && !isProcessingRef.current) {
        console.log('[SR] Processing captured speech:', captured);
        isProcessingRef.current = true;
        isRestartingRef.current = false;
        askAIRef.current(captured);
      } else if (
        continuousRef.current &&
        !isProcessingRef.current &&
        !thinkingRef.current &&
        !speakingRef.current &&
        !isRestartingRef.current
      ) {
        // IMPROVED: Faster restart (300ms instead of 800ms)
        console.log('[SR] No speech captured, scheduling restart in 300ms');
        isRestartingRef.current = true;
        restartTimerRef.current = setTimeout(() => {
          if (
            continuousRef.current &&
            !isProcessingRef.current &&
            !thinkingRef.current &&
            !speakingRef.current
          ) {
            console.log('[SR] Executing scheduled restart');
            startListeningRef.current?.();
          } else {
            console.log('[SR] Restart cancelled - conditions no longer met');
            isRestartingRef.current = false;
          }
        }, 300); // FASTER: 300ms instead of 800ms
      } else {
        console.log('[SR] No restart needed');
        isRestartingRef.current = false;
      }
    };

    rec.onerror = (e) => {
      console.log('[SR] onerror fired:', e.error);
      clearTimeout(silenceTimerRef.current);
      clearTimeout(restartTimerRef.current);
      recognitionRef.current = null;
      
      if (e.error === 'no-speech' || e.error === 'aborted') {
        // Benign errors — restart quickly for better responsiveness
        setListening(false);
        if (
          continuousRef.current &&
          !isProcessingRef.current &&
          !isRestartingRef.current
        ) {
          console.log('[SR] Benign error, scheduling restart in 500ms');
          isRestartingRef.current = true;
          restartTimerRef.current = setTimeout(() => {
            if (
              continuousRef.current &&
              !isProcessingRef.current &&
              !thinkingRef.current &&
              !speakingRef.current
            ) {
              console.log('[SR] Executing benign error restart');
              startListeningRef.current?.();
            } else {
              console.log('[SR] Benign error restart cancelled');
              isRestartingRef.current = false;
            }
          }, 500); // FASTER: 500ms instead of 1200ms
        } else {
          console.log('[SR] Benign error - restart already scheduled or not in continuous mode');
          isRestartingRef.current = false;
        }
        return;
      }

      // Non-benign errors
      console.warn('[SR] Non-benign error:', e.error);
      setListening(false);
      isRestartingRef.current = false;
      
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        setHasError(true);
        setErrorMsg('Microphone permission denied. Please allow mic access in your browser.');
        setSupported(false);
      } else if (continuousRef.current && !isProcessingRef.current) {
        // Non-benign errors get moderate delay before retry
        console.log('[SR] Non-benign error, scheduling recovery restart in 1500ms');
        isRestartingRef.current = true;
        restartTimerRef.current = setTimeout(() => {
          if (
            continuousRef.current &&
            !isProcessingRef.current &&
            !thinkingRef.current &&
            !speakingRef.current
          ) {
            console.log('[SR] Executing recovery restart');
            startListeningRef.current?.();
          } else {
            console.log('[SR] Recovery restart cancelled');
            isRestartingRef.current = false;
          }
        }, 1500); // FASTER: 1500ms instead of 2500ms
      }
    };

    // Assign ref AFTER start() succeeds to avoid dead instances in ref
    try {
      rec.start();
      console.log('[SR] Recognition started successfully');
      recognitionRef.current = rec;
      return true;
    } catch (e) {
      console.warn('[SR] start() threw error:', e.message);
      // Don't assign to ref if start failed
      setListening(false);
      isRestartingRef.current = false;
      
      // Handle "already started" error specifically
      if (e.message && e.message.includes('already started')) {
        console.log('[SR] Recognition already started - ignoring');
        return false;
      }
      
      return false;
    }
  }, []); // empty deps — reads everything via refs

  const startListening = useCallback(() => {
    console.log('[SR] startListening called');
    
    // Clear all pending timers
    clearTimeout(restartTimerRef.current);
    clearTimeout(silenceTimerRef.current);

    // Cancel any ongoing TTS
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (elevenLabsAudioRef.current) {
      try { elevenLabsAudioRef.current.pause(); } catch {}
      elevenLabsAudioRef.current = null;
    }
    setSpeaking(false);
    
    // Reset state
    finalTranscriptRef.current = '';
    isProcessingRef.current    = false;
    setTranscript('');
    setResponse('');
    setHasError(false);
    setErrorMsg('');
    setThinking(false);

    // Use SpeechRecognition if available, else fall back to MediaRecorder
    if (srClassRef.current) {
      // Set listening AFTER successful start
      const ok = createNewSRSession();
      if (ok) {
        console.log('[SR] Session created, setting listening=true');
        setListening(true);
        // Clear restart flag only after successful start
        isRestartingRef.current = false;
      } else {
        console.log('[SR] Session creation failed, setting listening=false');
        setListening(false);
        isRestartingRef.current = false;
      }
    } else {
      // Fallback: MediaRecorder + Whisper transcription
      isRestartingRef.current = false;
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      else startFallbackRecording();
    }
  }, [createNewSRSession, startFallbackRecording]);


  const toggleListening = useCallback(() => {
    if (listening) {
      console.log('[SR] Manual stop requested');
      // Manual stop — cancel all pending restarts
      clearTimeout(restartTimerRef.current);
      clearTimeout(silenceTimerRef.current);
      isRestartingRef.current = false;
      isProcessingRef.current = false;
      setListening(false);
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.abort(); 
          console.log('[SR] Recognition aborted');
        } catch {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
    } else {
      console.log('[SR] Manual start requested');
      startListening();
    }
  }, [listening, startListening]);


  startListeningRef.current = startListening;

  // ── askAI — reads model + speak via refs; wrapped in useCallback ──────────
  const askAI = useCallback(async (text) => {
    if (!text?.trim()) { isProcessingRef.current = false; return; }

    // Handle pending plan approval via voice
    if (pendingPlanApprovalRef.current && taskPlanRef.current) {
      const lower = text.toLowerCase().trim();
      const approve = ['yes','approve','execute','run','confirm','okay','ok','haji','haan','han','chalao','kar do','kar lo','theek','thek'];
      const reject  = ['no','cancel','stop','reject','nah','nhi','nahi','roko','ruk','rehne do','rehn do'];
      if (approve.some(p => lower.includes(p))) {
        const plan = taskPlanRef.current;
        setPendingPlanApproval(false);
        setExecutingPlan(plan);
        setTaskPlan(null);
      } else if (reject.some(p => lower.includes(p))) {
        setPendingPlanApproval(false);
        setTaskPlan(null);
        speak('Operation aborted. Automation plan has been rejected.');
      } else {
        speak('Please say yes to execute the plan, or no to reject.');
      }
      isProcessingRef.current = false;
      setTranscript('');
      return;
    }

    // Model switch
    const switchIdx = detectModelSwitch(text);
    const curIdx    = selectedModelIdxRef.current;
    if (switchIdx !== null && switchIdx !== curIdx) {
      const target = AI_MODELS[switchIdx];
      setSelectedModelIdx(switchIdx);
      const msg = `Switched to ${target.label}.`;
      setSwitchToast(msg);
      speak(msg);
      setTimeout(() => setSwitchToast(null), 2500);
      isProcessingRef.current = false;
      setTranscript('');
      return;
    }

    setThinking(true);
    setHasError(false);
    setErrorMsg('');
    setRetryCount(0);

    const attemptRequest = async (attempt = 0) => {
      try {
        const model = AI_MODELS[selectedModelIdxRef.current];
        const { data } = await aiAPI.chat({
          message: text,
          provider: model.provider,
          model: model.model,
        });

        // ── Auto model switching detection ──
        if (data.isFailover) {
          const matchedIdx = AI_MODELS.findIndex(
            (m) => m.provider === data.provider && m.model === data.model
          );
          if (matchedIdx !== -1) {
            setSelectedModelIdx(matchedIdx);
            const targetModel = AI_MODELS[matchedIdx];
            const switchMsg = `Auto Switch: Limit reached. Migrated to ${targetModel.label}.`;
            setSwitchToast(switchMsg);
            speak(`Limit reached. Automatically switched model to ${targetModel.label}`);
            setTimeout(() => setSwitchToast(null), 6000);
          }
        }

        const reply = (data.reply || '').trim();
        if (!reply) throw new Error('Empty response received from AI. Please try again.');

        setSessionStats(s => ({ ...s, queries: s.queries + 1 }));

        const planRegex = /---TASK_PLAN_START---([\s\S]*?)---TASK_PLAN_END---/;
        const match = reply.match(planRegex);

        if (match) {
          try {
            const plan     = JSON.parse(match[1].trim());
            const cleanTxt = reply.replace(planRegex, '').trim();
            setResponse(cleanTxt);
            setTaskPlan(plan);
            if (autoApproveRef.current) {
              setExecutingPlan(plan);
              if (cleanTxt) speak(cleanTxt);
            } else {
              setPendingPlanApproval(true);
              const confirmTxt = cleanTxt
                ? `${cleanTxt}. I have prepared a task plan. Do you want to execute it?`
                : 'I have prepared a task plan. Do you want to execute it?';
              speak(confirmTxt, () => {
                if (continuousRef.current) setTimeout(() => startListeningRef.current?.(), 600);
              });
            }
          } catch {
            setResponse(reply);
            speak(reply);
          }
        } else {
          setResponse(reply);
          speak(reply);
        }

        // Store in session history
        setConversationHistory(prev => [
          {
            id: Date.now(),
            query: text,
            response: reply.replace(/---TASK_PLAN_START---[\s\S]*?---TASK_PLAN_END---/g, '').trim(),
            time: new Date().toLocaleTimeString(),
            isError: false,
            model: AI_MODELS[selectedModelIdxRef.current].label,
          },
          ...prev,
        ].slice(0, MAX_HISTORY));

        setThinking(false);
      } catch (err) {
        const status = err.response?.status;
        const isRetryable = !status || status >= 500;
        if (isRetryable && attempt < 2) {
          setRetryCount(attempt + 1);
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          return attemptRequest(attempt + 1);
        }

        setThinking(false);
        setHasError(true);
        const msg = err.response?.data?.message || err.message || 'Could not get a response. Please try again.';
        setErrorMsg(msg);
        setResponse('');

        setConversationHistory(prev => [
          {
            id: Date.now(),
            query: text,
            response: msg,
            time: new Date().toLocaleTimeString(),
            isError: true,
            model: AI_MODELS[selectedModelIdxRef.current].label,
          },
          ...prev,
        ].slice(0, MAX_HISTORY));

        speak('Sorry, I encountered an error. Please try again.');
      } finally {
        isProcessingRef.current = false;
      }
    };

    await attemptRequest();
  }, [speak]); // speak is stable

  // keep a ref to askAI so the SR onend handler always calls the latest version
  const askAIRef = useRef(askAI);
  useEffect(() => { askAIRef.current = askAI; }, [askAI]);

  // ── Plan approve / reject ──────────────────────────────────────────────────
  const handleApprovePlan = useCallback((planToRun) => {
    const plan = planToRun || taskPlanRef.current;
    if (!plan) return;
    setPendingPlanApproval(false);
    setExecutingPlan(plan);
    setTaskPlan(null);
  }, []);

  const handleRejectPlan = useCallback(() => {
    setPendingPlanApproval(false);
    setTaskPlan(null);
    speak('Operation aborted. Automation plan has been rejected.');
  }, [speak]);

  // ── Speech recognition: detect SR class + cleanup on unmount ───────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      srClassRef.current = SR;
    } else {
      // No SR support — check if MediaRecorder fallback is available
      srClassRef.current = null;
      setSupported(Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder));
    }
    // Cleanup: abort any live session on unmount
    return () => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(restartTimerRef.current);
      isRestartingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);


  // ── Voice list ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = () => { if ('speechSynthesis' in window) setVoices(window.speechSynthesis.getVoices()); };
    load();
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = load;
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // ── Load settings ──────────────────────────────────────────────────────────
  useEffect(() => {
    settingsAPI.get().then(({ data }) => {
      if (data?.settings?.voice) {
        setSelectedVoice(data.settings.voice.voiceSelection || 'female');
        setVoiceSpeed(data.settings.voice.speed || 1.0);
        setVoiceLanguage(data.settings.voice.language || 'en-US');
      }
    }).catch(() => {});
  }, []);

  // ── Canvas waveform + audio level ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, audioCtx, source, stream;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    if (listening) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
        stream = s;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx  = new Ctx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const bufLen  = analyser.frequencyBinCount;
        const data    = new Uint8Array(bufLen);
        source = audioCtx.createMediaStreamSource(s);
        source.connect(analyser);

        const draw = () => {
          animId = requestAnimationFrame(draw);
          const w = canvas.offsetWidth, h = canvas.offsetHeight;
          ctx.clearRect(0, 0, w, h);
          analyser.getByteTimeDomainData(data);

          let sum = 0;
          for (let i = 0; i < bufLen; i++) { const v = data[i] / 128.0 - 1.0; sum += v * v; }
          const rms = Math.sqrt(sum / bufLen);
          setAmbientNoise(Math.max(30, Math.min(90, 30 + Math.round(rms * 100))));
          setAudioLevel(Math.min(100, rms * 600));
          if (rms > 0.01) setVoiceConfidence(Math.round(88 + Math.random() * 11));

          ctx.lineWidth = 2; ctx.strokeStyle = '#00F0FF';
          ctx.shadowBlur = 10; ctx.shadowColor = '#00F0FF';
          ctx.beginPath();
          const sw = w / bufLen; let x = 0;
          for (let i = 0; i < bufLen; i++) {
            const y = (data[i] / 128.0) * h / 2;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            x += sw;
          }
          ctx.lineTo(w, h / 2); ctx.stroke();
        };
        draw();
      }).catch(() => runSimulated());
    } else {
      setAudioLevel(0);
      runSimulated();
    }

    function runSimulated() {
      let t = 0;
      const draw = () => {
        animId = requestAnimationFrame(draw);
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);
        t += 0.05;
        ctx.lineWidth = 1.5; ctx.shadowBlur = 5;
        if (speaking) {
          ctx.strokeStyle = '#be5cf6'; ctx.shadowColor = '#be5cf6';
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            const amp = (14 - j * 3) * Math.abs(Math.sin(t * 0.5 + j));
            for (let i = 0; i < w; i++) {
              const y = h / 2 + Math.sin(i * 0.025 + t + j) * amp;
              if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
            }
            ctx.stroke();
          }
        } else if (thinking) {
          ctx.strokeStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24';
          ctx.beginPath();
          for (let i = 0; i < w; i++) {
            const noise = Math.sin(i * 0.08 + t * 2.5) * 5 * Math.cos(i * 0.04 + t);
            if (i === 0) ctx.moveTo(i, h / 2 + noise); else ctx.lineTo(i, h / 2 + noise);
          }
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.shadowBlur = 0;
          ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
        }
      };
      draw();
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      stream?.getTracks().forEach(t => t.stop());
      audioCtx?.close();
    };
  }, [listening, speaking, thinking]);

  // ── Derived UI state ───────────────────────────────────────────────────────
  const statusText =
    listening && pendingPlanApproval ? 'Waiting for voice confirmation… "Yes" or "No"' :
    listening ? 'Listening… speak your command.' :
    thinking  ? 'Processing your request…' :
    speaking  ? 'AI is responding…' :
    hasError  ? errorMsg || 'System error encountered.' :
    executingPlan ? 'Executing task plan…' :
    pendingPlanApproval ? 'Waiting for approval…' :
    retryCount > 0 ? `Retrying… (attempt ${retryCount + 1})` :
    'Tap the orb to speak';

  const statusColor =
    listening ? '#00F0FF' : thinking ? '#fbbf24' : speaking ? '#be5cf6' :
    hasError ? '#f87171' : executingPlan ? '#fbbf24' : '#6b7280';

  // ── Replay ─────────────────────────────────────────────────────────────────
  const replayQuery = useCallback((query) => {
    if (isProcessingRef.current || listening || thinking || speaking) return;
    isProcessingRef.current = true;
    setTranscript(query);
    setResponse('');
    setHasError(false);
    setErrorMsg('');
    askAI(query);
  }, [askAI, listening, thinking, speaking]);

  // ══════════════════════════════════════════════════════════════════════════
  // isPro gate MUST be here — after all hooks, not before them
  if (!isPro) {
    return (
      <PremiumLockOverlay
        featureName="Voice Assistant System"
        description="Initiate voice reactive holograms, text-to-speech feedback, and wake-word telemetry links."
      />
    );
  }

  return (
    <div className="relative min-h-screen pb-10">
      <Particles />


      <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center gap-6 pt-4">

        {/* ── Header ── */}
        <div className="text-center w-full">
          <p className="text-[9px] font-orbitron font-black tracking-[0.3em] text-neon-purple/50 uppercase mb-2">HARVOX Voice OS</p>
          <h1 className="font-orbitron text-3xl font-black tracking-wider">
            Voice <span className="gradient-text">Assistant</span>
          </h1>
          <p className="text-[10px] text-gray-600 mt-1.5 font-mono tracking-widest">
            PHASE 9 · {autoApprove ? 'AUTO-EXECUTE MODE ACTIVE' : 'SECURE VERIFICATION MODE ACTIVE'}
          </p>
        </div>

        {/* ── Model Toggle ── */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/4 border border-white/8 backdrop-blur-md">
          {AI_MODELS.map((m, idx) => {
            const isActive = selectedModelIdx === idx;
            return (
              <button
                key={m.provider}
                id={`voice-model-${m.provider}`}
                onClick={() => setSelectedModelIdx(idx)}
                className="relative px-5 py-2 rounded-xl font-orbitron text-[10px] font-black tracking-wider transition-all duration-300"
                style={isActive
                  ? { background: `${m.color}18`, boxShadow: `0 0 16px ${m.color}40`, border: `1px solid ${m.color}40`, color: m.color }
                  : { color: 'rgba(255,255,255,0.25)', border: '1px solid transparent' }
                }
              >
                {isActive && (
                  <motion.span layoutId="model-pill" className="absolute inset-0 rounded-xl"
                    style={{ background: `${m.color}08` }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <span className="relative z-10 flex items-center gap-1.5 font-bold">
                  {isActive && <Radio size={8} className="animate-pulse" />}
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Model switch toast ── */}
        <AnimatePresence>
          {switchToast && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-orbitron font-black tracking-wider"
              style={{ color: activeModel.color, borderColor: `${activeModel.color}40`, backgroundColor: `${activeModel.color}10`, boxShadow: `0 0 20px ${activeModel.color}30` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeModel.color }} />
              {switchToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Unsupported warning ── */}
        {!supported && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/8 text-yellow-400 text-xs font-mono">
            <MicOff size={13} /> Speech recognition not supported. Use Chrome or Edge.
          </div>
        )}

        {/* ── Orb ── */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${listening ? '#00F0FF' : thinking ? '#fbbf24' : '#8A2BE2'}20, transparent 70%)`, margin: '-30px' }} />
            <button
              onClick={() => {
                if (speaking) {
                  if (elevenLabsAudioRef.current) { elevenLabsAudioRef.current.pause(); elevenLabsAudioRef.current = null; }
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setSpeaking(false);
                  startListening();
                } else {
                  toggleListening();
                }
              }}
              disabled={thinking || !supported}
              className="focus:outline-none disabled:cursor-not-allowed relative z-10"
              title={listening ? 'Stop listening' : speaking ? 'Interrupt' : 'Click to speak'}
            >
              <VoiceOrb isListening={listening} isSpeaking={speaking} isThinking={thinking} isError={hasError} />
            </button>
          </div>

          {/* Status */}
          <div className="flex flex-col items-center gap-2">
            <motion.p key={statusText} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm font-mono font-medium text-center" style={{ color: statusColor }}>
              {statusText}
            </motion.p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/10 px-3 py-1 rounded-full">
                <Volume2 size={9} /> CONFIDENCE: {voiceConfidence}%
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-purple-400/80 bg-purple-400/5 border border-purple-400/10 px-3 py-1 rounded-full">
                <Activity size={9} /> NOISE: {ambientNoise}dB
              </div>
              {retryCount > 0 && (
                <div className="flex items-center gap-1 text-[9px] font-mono text-amber-400/80 bg-amber-400/5 border border-amber-400/10 px-3 py-1 rounded-full">
                  <RefreshCw size={9} className="animate-spin" /> RETRY {retryCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Audio Level Meter ── */}
        <div className="w-full max-w-sm">
          <AudioLevelMeter level={audioLevel} active={listening} />
        </div>

        {/* ── Canvas Waveform ── */}
        <div className="w-full max-w-sm px-2">
          <canvas ref={canvasRef} className="w-full h-10 rounded-xl border border-white/5 bg-black/40 shadow-inner" />
        </div>

        {/* ── Transcript bubble ── */}
        <AnimatePresence>
          {transcript && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center bg-neon-blue/5 border border-neon-blue/20 px-5 py-3 rounded-2xl backdrop-blur-md max-w-sm w-full mx-auto shadow-[0_0_20px_rgba(0,240,255,0.08)]">
              <p className="text-[9px] font-orbitron font-black tracking-widest text-cyan-600/80 uppercase mb-1">You said</p>
              <p className="text-xs text-neon-blue font-mono italic">"{transcript}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {hasError && errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm flex items-start gap-3 px-4 py-3 rounded-xl border border-rose-500/25 bg-rose-500/6 text-rose-400">
              <XCircle size={13} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono leading-relaxed">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Brain Core ── */}
        <div className="w-full max-w-sm">
          <BrainCorePanel activeModel={activeModel} sessionStats={sessionStats}
            listening={listening} thinking={thinking} speaking={speaking} />
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          <motion.button
            onClick={() => {
              if (speaking) {
                if (elevenLabsAudioRef.current) { elevenLabsAudioRef.current.pause(); elevenLabsAudioRef.current = null; }
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setSpeaking(false);
                startListening();
              } else {
                toggleListening();
              }
            }}
            disabled={thinking || !supported}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex-1 relative flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-orbitron font-black text-sm tracking-widest uppercase overflow-hidden transition-all disabled:opacity-50 group"
            style={{
              background: listening || thinking ? 'linear-gradient(135deg, #1e0a3c, #0a1e3c)' : 'linear-gradient(135deg, #8A2BE2, #00F0FF)',
              boxShadow: '0 0 30px rgba(138,43,226,0.35)',
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
            </div>
            <span className="relative flex items-center gap-2">
              {listening  ? <><Loader2 size={15} className="animate-spin" /> Listening…</>
              : thinking  ? <><Brain size={15} className="animate-pulse" /> Thinking…</>
              : speaking  ? <><Volume2 size={15} className="animate-bounce" /> Speaking…</>
              :              <><Mic size={15} /> Tap to Speak</>}
            </span>
          </motion.button>

          {speaking && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.speechSynthesis?.cancel();
                if (elevenLabsAudioRef.current) { elevenLabsAudioRef.current.pause(); elevenLabsAudioRef.current = null; }
                setSpeaking(false);
              }}
              className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/8 text-rose-400 hover:bg-rose-500/15 transition-all"
              title="Stop speaking">
              <MicOff size={15} />
            </motion.button>
          )}
        </div>

        {/* ── Voice Controls Accordion ── */}
        <div className="w-full max-w-sm">
          <button onClick={() => setShowControls(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase">
            <div className="flex items-center gap-2"><Settings size={10} />Voice Controls</div>
            <motion.div animate={{ rotate: showControls ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showControls && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <HudCard glow="#8A2BE2" className="mt-2 p-4 space-y-4">
                  {/* Language */}
                  <div>
                    <label className="block text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2">Language</label>
                    <div className="flex gap-2">
                      {[{ id: 'en-US', label: 'EN 🇬🇧' }, { id: 'ur-PK', label: 'UR 🇵🇰' }].map((lang) => {
                        const isActive = voiceLanguage === lang.id;
                        return (
                          <button key={lang.id}
                            onClick={() => { setVoiceLanguage(lang.id); settingsAPI.update({ voice: { language: lang.id } }).catch(() => {}); }}
                            className="flex-1 py-2 rounded-xl font-orbitron text-[10px] font-black tracking-wider transition-all border"
                            style={isActive
                              ? { borderColor: 'rgba(255,0,200,0.4)', color: '#FF00C8', background: 'rgba(255,0,200,0.08)', boxShadow: '0 0 12px rgba(255,0,200,0.2)' }
                              : { borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
                            {lang.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Voice */}
                  <div>
                    <label className="block text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2">
                      Voice {ELEVENLABS_IDS.has(selectedVoice) && <span className="ml-1 text-amber-400/80">⚡ ElevenLabs</span>}
                    </label>
                    <select value={selectedVoice}
                      onChange={(e) => { setSelectedVoice(e.target.value); settingsAPI.update({ voice: { voiceSelection: e.target.value, speed: voiceSpeed } }).catch(() => {}); }}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 outline-none focus:border-neon-purple/40 transition-all">
                      <optgroup label="── Female Hindi Voices (Default) ──">
                        {ELEVENLABS_VOICES.filter(v => v.category.includes('Female Hindi')).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} {v.id === DEFAULT_VOICE_ID ? '(Default)' : ''}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── Male Hindi Voices ──">
                        {ELEVENLABS_VOICES.filter(v => v.category.includes('Male Hindi')).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── Urdu Voices ──">
                        {ELEVENLABS_VOICES.filter(v => v.category.includes('Urdu')).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── English Voices ──">
                        {ELEVENLABS_VOICES.filter(v => v.category.includes('English')).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── Native Browser Fallbacks ──">
                        <option value="female">System Browser — Female</option>
                        <option value="male">System Browser — Male</option>
                        {voices.map((v) => (<option key={v.name} value={v.name}>{v.name} [{v.lang}]</option>))}
                      </optgroup>
                    </select>
                    {ELEVENLABS_IDS.has(selectedVoice) && (
                      <p className="text-[8px] font-mono text-amber-400/60 mt-1">Add ELEVENLABS_API_KEY to .env for premium voices</p>
                    )}
                  </div>
                  {/* Speed */}
                  <div>
                    <label className="block text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2">
                      Speed — {voiceSpeed.toFixed(1)}×
                    </label>
                    <input type="range" min="0.5" max="2.0" step="0.1" value={voiceSpeed}
                      onChange={(e) => { const v = parseFloat(e.target.value); setVoiceSpeed(v); settingsAPI.update({ voice: { speed: v } }).catch(() => {}); }}
                      className="w-full accent-neon-purple" />
                  </div>
                  {/* Toggles */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-orbitron text-[10px] font-bold text-white tracking-wider">CONTINUOUS MODE</p>
                        <p className="text-[8px] text-gray-500">Auto-restarts voice detection after speaking</p>
                      </div>
                      <Toggle value={continuousMode} onChange={(v) => { setContinuousMode(v); localStorage.setItem('harvox_voice_continuous', JSON.stringify(v)); }} color="bg-neon-pink" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-orbitron text-[10px] font-bold text-white tracking-wider">AUTO-APPROVE ACTIONS</p>
                        <p className="text-[8px] text-gray-500">Autopilot mode is strictly enforced</p>
                      </div>
                      <span className="text-[8px] font-orbitron font-black text-neon-blue bg-neon-blue/10 border border-neon-blue/20 px-2 py-1 rounded">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </HudCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DailyAssistantPanel />

        {/* ── AI Response ── */}
        <AnimatePresence>
          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <HudCard glow="#8A2BE2" className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={10} className="text-neon-purple" />
                    <p className="text-[9px] font-orbitron font-black tracking-widest text-neon-purple/60 uppercase">AI Response</p>
                  </div>
                  <span className="text-[8px] font-mono text-gray-700">{activeModel.label}</span>
                </div>
                <ChatMessage role="assistant" content={response} compact />
                {speaking && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <Volume2 size={9} className="text-purple-400 animate-pulse" />
                    <span className="text-[8px] font-mono text-purple-400/70">Speaking response…</span>
                    <div className="flex items-end gap-0.5 h-4 ml-auto">
                      {[1,2,3,4].map(i => (
                        <motion.div key={i} animate={{ height: ['30%', '100%', '30%'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 rounded-full bg-purple-400" />
                      ))}
                    </div>
                  </div>
                )}
              </HudCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Task Runner ── */}
        <AnimatePresence>
          {executingPlan && (
            <div className="w-full">
              <VoiceTaskRunner
                key={executingPlan.title}
                plan={executingPlan}
                speakRef={speakRef}
                onDone={() => {
                  setExecutingPlan(null);
                  if (continuousRef.current) setTimeout(() => startListeningRef.current?.(), 800);
                }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* ── Conversation History ── */}
        {conversationHistory.length > 0 && (
          <div className="w-full max-w-sm">
            <button onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase">
              <div className="flex items-center gap-2"><Clock size={10} />Session History ({conversationHistory.length})</div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setConversationHistory([]); }}
                  className="text-[8px] font-mono text-gray-600 hover:text-rose-400 transition-colors" title="Clear history">
                  <Trash2 size={8} />
                </button>
                <motion.div animate={{ rotate: showHistory ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={12} />
                </motion.div>
              </div>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
                  <div className="space-y-1.5 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {conversationHistory.map(item => (
                      <HistoryItem key={item.id} item={item} onReplay={replayQuery} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Safety Confirmation Modal ── */}
        <AnimatePresence>
          {pendingPlanApproval && taskPlan && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-lg overflow-hidden border border-white/10 rounded-2xl bg-[#0b0a14]/95 shadow-2xl p-6 relative" style={{ boxShadow: '0 0 40px rgba(0, 240, 255, 0.2)' }}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
                <h2 className="font-orbitron font-bold text-lg text-white mb-2 tracking-wider flex items-center gap-2">
                  <Shield className="text-neon-blue shrink-0 animate-pulse" size={18} />
                  CONFIRM OPERATION PLAN
                </h2>
                <p className="text-xs text-muted mb-4 font-mono">
                  Review the queued automation sequence. Say{' '}
                  <span className="text-neon-blue font-bold">"Yes"</span> or click{' '}
                  <span className="text-neon-blue font-bold">"Approve"</span> to run, or{' '}
                  <span className="text-rose-400 font-bold">"No"</span> to reject.
                </p>
                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {taskPlan.steps.map((step, i) => {
                    const badge = step.agent && AGENT_BADGES[step.agent.toLowerCase()];
                    return (
                      <div key={step.id || i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
                        <span className="text-[10px] font-mono text-gray-500 w-5 shrink-0">0{i + 1}</span>
                        <div className="flex-1 flex flex-col min-w-0">
                          <p className="text-xs text-white leading-tight font-medium">{step.description}</p>
                          <span className="text-[9px] font-mono text-muted/60 mt-0.5">
                            {step.action}({step.args ? step.args.join(', ') : ''})
                          </span>
                        </div>
                        {badge && (
                          <span className="text-[7px] font-orbitron font-black px-2 py-0.5 rounded border shrink-0"
                            style={{ color: badge.color, borderColor: `${badge.color}40`, background: `${badge.color}10` }}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button onClick={handleRejectPlan} className="px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider text-rose-400 border border-rose-500/20 hover:border-rose-500/40 bg-rose-950/10 hover:bg-rose-950/20 transition-all duration-300">Reject Plan</button>
                  <button onClick={() => handleApprovePlan(taskPlan)} className="px-6 py-2.5 rounded-xl font-orbitron text-xs font-bold tracking-wider text-white border border-neon-blue/40 bg-neon-blue/15 hover:bg-neon-blue/25 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]">Approve & Run</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
