import { useState, useEffect, useRef, useCallback } from 'react';
import { aiAPI, settingsAPI, automationAPI } from '../../services/api';
import VoiceOrb from '../../components/voice/VoiceOrb';
import ChatMessage from '../../components/chat/ChatMessage';
import { useAuthStore } from '../../store/authStore';
import PremiumLockOverlay from '../../components/ui/PremiumLockOverlay';
import {
  CheckCircle2, XCircle, Loader2, Zap, Mic, Brain, Activity,
  Clock, MessageSquare, Settings, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_BADGES = {
  ceo:      { label: 'CEO AGENT',        color: '#fbbf24' },
  ui:       { label: 'UI AGENT',         color: '#be5cf6' },
  dev:      { label: 'DEVELOPER AGENT',  color: '#00f0ff' },
  research: { label: 'RESEARCH AGENT',   color: '#34d399' },
  deploy:   { label: 'DEPLOYMENT AGENT', color: '#f87171' },
};

const AI_MODELS = [
  { provider: 'groq',   model: 'llama-3.3-70b-versatile', label: 'Groq',   color: '#f97316', aliases: ['groq', 'llama', 'lama'] },
  { provider: 'gemini', model: 'gemini-2.0-flash',         label: 'Gemini', color: '#a78bfa', aliases: ['gemini', 'gemeni', 'gemny', 'jemini'] },
];

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

// ── Shared card wrapper ───────────────────────────────────────────────────────
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

// ── Voice Auto Task Runner ────────────────────────────────────────────────────
function VoiceAutoTaskRunner({ plan, onDone, speak }) {
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
    speak(`Executing: ${plan.title}`);
    addLog(`Auto-executing: ${plan.title}`, 'success');
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
        speak(`Sorry, step ${i + 1} failed. ${msg}`);
        onDone?.();
        return;
      }
    }
    speak(`Done. ${plan.title} completed successfully.`);
    addLog('All steps completed.', 'success');
    onDone?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <HudCard glow="#fbbf24" className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={11} className="text-yellow-400 animate-pulse" />
          <span className="text-[9px] font-orbitron font-black tracking-[0.2em] text-yellow-400 uppercase">
            Voice Auto-Execute — No Approval Required
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

// ── Brain Core Stats ──────────────────────────────────────────────────────────
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

// ── Particles ─────────────────────────────────────────────────────────────────
const Particles = () => {
  const pts = useRef(Array.from({ length: 20 }).map(() => ({
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

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function VoiceAssistant() {
  const { user } = useAuthStore();
  const isPro = user?.subscription === 'pro' || user?.role === 'admin';
  if (!isPro) {
    return (
      <PremiumLockOverlay
        featureName="Voice Assistant System"
        description="Initiate voice reactive holograms, text-to-speech feedback, and wake-word telemetry links."
      />
    );
  }

  const [listening,   setListening]   = useState(false);
  const [thinking,    setThinking]    = useState(false);
  const [speaking,    setSpeaking]    = useState(false);
  const [hasError,    setHasError]    = useState(false);
  const [transcript,  setTranscript]  = useState('');
  const [response,    setResponse]    = useState('');
  const [taskPlan,    setTaskPlan]    = useState(null);
  const [supported,   setSupported]   = useState(true);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const activeModel = AI_MODELS[selectedModelIdx];
  const [switchToast, setSwitchToast] = useState(null);
  const [sessionStats, setSessionStats] = useState({ queries: 0 });
  const [showControls, setShowControls] = useState(false);

  const recognitionRef  = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTranscript = useRef('');
  const isProcessingRef = useRef(false);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('female');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');

  const speak = useCallback((text, onEnd) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`\-_>]/g, '').slice(0, 600);
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate  = voiceSpeed;
    const isUrdu = voiceLanguage === 'ur-PK' || /[\u0600-\u06FF]/.test(clean);
    let matched = null;
    if (isUrdu) {
      matched = voices.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu'));
      utter.lang = 'ur-PK';
    } else {
      matched = voices.find(v => v.name === selectedVoice);
    }
    if (matched) utter.voice = matched;
    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => { setSpeaking(false); onEnd?.(); };
    utter.onerror = () => { setSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utter);
  }, [voices, selectedVoice, voiceSpeed, voiceLanguage]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = voiceLanguage;
    rec.onresult = (e) => {
      let interim = '', final = '';
      for (const result of e.results) {
        if (result.isFinal) final   += result[0].transcript;
        else                interim += result[0].transcript;
      }
      const full = final + interim;
      setTranscript(full);
      finalTranscript.current = full;
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current && !isProcessingRef.current) recognitionRef.current.stop();
      }, 2000);
    };
    rec.onend = () => {
      clearTimeout(silenceTimerRef.current);
      setListening(false);
      if (finalTranscript.current.trim() && !isProcessingRef.current) {
        isProcessingRef.current = true;
        askAI(finalTranscript.current.trim());
      }
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech') return;
      setListening(false);
      setHasError(true);
    };
    recognitionRef.current = rec;
    return () => clearTimeout(silenceTimerRef.current);
  }, [voiceLanguage]);

  useEffect(() => {
    const load = () => { if ('speechSynthesis' in window) setVoices(window.speechSynthesis.getVoices()); };
    load();
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = load;
  }, []);

  useEffect(() => {
    settingsAPI.get().then(({ data }) => {
      if (data?.settings?.voice) {
        setSelectedVoice(data.settings.voice.voiceSelection || 'female');
        setVoiceSpeed(data.settings.voice.speed || 1.0);
        setVoiceLanguage(data.settings.voice.language || 'en-US');
      }
    }).catch(() => {});
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || listening) return;
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setSpeaking(false); }
    finalTranscript.current = '';
    isProcessingRef.current = false;
    setTranscript('');
    setResponse('');
    setTaskPlan(null);
    setHasError(false);
    setListening(true);
    setThinking(false);
    try { recognitionRef.current.start(); } catch {}
  };

  const askAI = async (text) => {
    const switchIdx = detectModelSwitch(text);
    if (switchIdx !== null && switchIdx !== selectedModelIdx) {
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
    try {
      const { data } = await aiAPI.chat({
        message: text,
        provider: activeModel.provider,
        model: activeModel.model,
      });
      const reply = data.reply || '';
      setSessionStats(s => ({ ...s, queries: s.queries + 1 }));
      const planRegex = /---TASK_PLAN_START---([\s\S]*?)---TASK_PLAN_END---/;
      const match = reply.match(planRegex);
      if (match) {
        try {
          const plan = JSON.parse(match[1].trim());
          const cleanText = reply.replace(planRegex, '').trim();
          setResponse(cleanText);
          setTaskPlan(plan);
          if (cleanText) speak(cleanText);
        } catch {
          setResponse(reply);
          speak(reply);
        }
      } else {
        setResponse(reply);
        speak(reply);
      }
      setThinking(false);
    } catch (err) {
      setThinking(false);
      setHasError(true);
      const msg = err.response?.data?.message || 'Could not get response.';
      setResponse(msg);
      speak('Sorry, I encountered an error.');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const statusText =
    listening ? 'Listening… speak your command.' :
    thinking  ? 'Processing your request…'        :
    speaking  ? 'Speaking…'                        :
    hasError  ? 'System error encountered.'        :
    taskPlan  ? 'Executing task plan…'             :
                'Tap the orb to speak';

  const statusColor =
    listening ? '#00F0FF' :
    thinking  ? '#fbbf24' :
    speaking  ? '#be5cf6' :
    hasError  ? '#f87171' :
                '#6b7280';

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
          <p className="text-[10px] text-gray-600 mt-1.5 font-mono tracking-widest">PHASE 8 · AUTO-EXECUTE MODE ACTIVE</p>
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
                style={isActive ? {
                  background: `${m.color}18`,
                  boxShadow: `0 0 16px ${m.color}40`,
                  border: `1px solid ${m.color}40`,
                  color: m.color,
                } : { color: 'rgba(255,255,255,0.25)', border: '1px solid transparent' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="model-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${m.color}08` }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Model switch toast ── */}
        <AnimatePresence>
          {switchToast && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-orbitron font-black tracking-wider"
              style={{ color: activeModel.color, borderColor: `${activeModel.color}40`, backgroundColor: `${activeModel.color}10`, boxShadow: `0 0 20px ${activeModel.color}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeModel.color }} />
              {switchToast}
            </motion.div>
          )}
        </AnimatePresence>

        {!supported && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/8 text-yellow-400 text-xs font-mono">
            ⚠ Speech recognition not supported. Use Chrome or Edge.
          </div>
        )}

        {/* ── Orb ── */}
        <div className="relative flex flex-col items-center gap-4">
          {/* Outer glow rings */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${listening ? '#00F0FF' : thinking ? '#fbbf24' : '#8A2BE2'}20, transparent 70%)`, margin: '-30px' }}
            />
            <button
              onClick={startListening}
              disabled={listening || thinking || speaking || !supported}
              className="focus:outline-none disabled:cursor-not-allowed relative z-10"
              title={listening ? 'Listening…' : 'Click to speak'}
            >
              <VoiceOrb
                isListening={listening}
                isSpeaking={speaking}
                isThinking={thinking}
                isError={hasError}
              />
            </button>
          </div>

          {/* Status text */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-mono font-medium" style={{ color: statusColor }}>{statusText}</p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400/70 bg-emerald-400/5 border border-emerald-400/10 px-3 py-1 rounded-full">
              <Zap size={9} />
              AUTO-EXECUTE · voice switch enabled
            </div>
          </div>
        </div>

        {/* ── Transcript bubble ── */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center bg-neon-blue/5 border border-neon-blue/20 px-5 py-3 rounded-2xl backdrop-blur-md max-w-sm w-full mx-auto shadow-[0_0_20px_rgba(0,240,255,0.08)]"
            >
              <p className="text-xs text-neon-blue font-mono italic">"{transcript}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Brain Core ── */}
        <div className="w-full max-w-sm">
          <BrainCorePanel
            activeModel={activeModel}
            sessionStats={sessionStats}
            listening={listening}
            thinking={thinking}
            speaking={speaking}
          />
        </div>

        {/* ── Speak / Stop button ── */}
        <motion.button
          onClick={startListening}
          disabled={listening || thinking || speaking || !supported}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-orbitron font-black text-sm tracking-widest uppercase overflow-hidden transition-all disabled:opacity-50 group"
          style={{
            background: listening || thinking
              ? 'linear-gradient(135deg, #1e0a3c, #0a1e3c)'
              : 'linear-gradient(135deg, #8A2BE2, #00F0FF)',
            boxShadow: '0 0 30px rgba(138,43,226,0.35)',
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
          </div>
          <span className="relative flex items-center gap-2">
            {listening
              ? <><Loader2 size={15} className="animate-spin" /> Listening…</>
              : <><Mic size={15} /> Tap to Speak</>
            }
          </span>
        </motion.button>

        {/* ── Controls accordion ── */}
        <div className="w-full max-w-sm">
          <button
            onClick={() => setShowControls(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase"
          >
            <div className="flex items-center gap-2">
              <Settings size={10} />
              Voice Controls
            </div>
            <motion.div animate={{ rotate: showControls ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <HudCard glow="#8A2BE2" className="mt-2 p-4 space-y-4">
                  {/* Language */}
                  <div>
                    <label className="block text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2">Language</label>
                    <div className="flex gap-2">
                      {[{ id: 'en-US', label: 'EN 🇬🇧' }, { id: 'ur-PK', label: 'UR 🇵🇰' }].map((lang) => {
                        const isActive = voiceLanguage === lang.id;
                        return (
                          <button
                            key={lang.id}
                            onClick={() => {
                              setVoiceLanguage(lang.id);
                              settingsAPI.update({ voice: { language: lang.id } }).catch(() => {});
                            }}
                            className="flex-1 py-2 rounded-xl font-orbitron text-[10px] font-black tracking-wider transition-all border"
                            style={isActive ? {
                              borderColor: 'rgba(255,0,200,0.4)',
                              color: '#FF00C8',
                              background: 'rgba(255,0,200,0.08)',
                              boxShadow: '0 0 12px rgba(255,0,200,0.2)',
                            } : { borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
                          >
                            {lang.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Voice select */}
                  <div>
                    <label className="block text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase mb-2">Voice</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => {
                        setSelectedVoice(e.target.value);
                        settingsAPI.update({ voice: { voiceSelection: e.target.value, speed: voiceSpeed } }).catch(() => {});
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 outline-none focus:border-neon-purple/40 transition-all"
                    >
                      <option value="female">Default — Aura (Female)</option>
                      <option value="male">Default — Echo (Male)</option>
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>{v.name} [{v.lang}]</option>
                      ))}
                    </select>
                  </div>
                </HudCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── AI text response ── */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <HudCard glow="#8A2BE2" className="p-4">
                <p className="text-[9px] font-orbitron font-black tracking-widest text-neon-purple/60 uppercase mb-3">AI Response</p>
                <ChatMessage role="assistant" content={response} compact />
              </HudCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Task plan runner ── */}
        <AnimatePresence>
          {taskPlan && (
            <div className="w-full">
              <VoiceAutoTaskRunner
                key={taskPlan.title}
                plan={taskPlan}
                speak={speak}
                onDone={() => { setTimeout(() => setTaskPlan(null), 3000); }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
