import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Cpu, Database, Zap, Clock, Bot, Crown,
  MessageSquare, Code2, Mic, ArrowRight, TrendingUp,
  Shield, Wifi, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mini HUD Card ────────────────────────────────────────────────────────────
const HudCard = ({ children, glow = '#8A2BE2', className = '' }) => (
  <div
    className={`relative rounded-2xl border border-white/7 bg-[#06050f]/80 overflow-hidden ${className}`}
    style={{ boxShadow: `0 0 20px ${glow}10` }}
  >
    <div className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(to right, transparent, ${glow}50, transparent)` }} />
    {children}
  </div>
);

// ─── Animated progress bar ────────────────────────────────────────────────────
const ProgressBar = ({ pct, color, animated = true }) => (
  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="h-full rounded-full"
      style={{
        background: `linear-gradient(to right, ${color}90, ${color})`,
        boxShadow: animated ? `0 0 8px ${color}60` : 'none',
      }}
    />
  </div>
);

// ─── Metric row ───────────────────────────────────────────────────────────────
const MetricRow = ({ icon: Icon, label, value, color, sub }) => (
  <div className="flex items-center gap-2.5">
    <div
      className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
      style={{ background: `${color}15`, border: `1px solid ${color}25` }}
    >
      <Icon size={11} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] text-gray-600 font-mono truncate">{label}</p>
      <p className="text-[11px] font-bold text-white leading-tight">{value}</p>
    </div>
    {sub && <span className="text-[9px] font-mono shrink-0" style={{ color }}>{sub}</span>}
  </div>
);

// ─── Animated uptime clock ────────────────────────────────────────────────────
function UptimeClock() {
  const start = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return <span className="font-mono text-emerald-400 tabular-nums">{h}:{m}:{s}</span>;
}

// ─── Quick action tile ────────────────────────────────────────────────────────
const QuickTile = ({ icon: Icon, label, to, color, navigate }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -1 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate(to)}
    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all duration-200 group"
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={13} style={{ color }} className="group-hover:scale-110 transition-transform" />
    </div>
    <span className="text-[8px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors text-center leading-tight">
      {label}
    </span>
  </motion.button>
);

// ─── Keyboard shortcut row ─────────────────────────────────────────────────────
const KbdRow = ({ label, keys }) => (
  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/3 transition-colors">
    <span className="text-[9px] text-gray-600 font-mono">{label}</span>
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="text-[8px] font-mono text-gray-400 bg-white/6 border border-white/10 rounded px-1.5 py-0.5"
        >
          {k}
        </kbd>
      ))}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function RightPanel() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [ping, setPing] = useState(null);

  useEffect(() => {
    // Simulate ping calculation
    const t = setTimeout(() => setPing(Math.floor(Math.random() * 30) + 12), 800);
    return () => clearTimeout(t);
  }, []);

  if (!user) return null;

  const isPro       = user?.subscription === 'pro' || user?.role === 'admin';
  const dailyUsage  = user.dailyUsage || 0;
  const dailyLimit  = isPro ? 500 : 20;
  const usagePct    = Math.min(100, Math.round((dailyUsage / dailyLimit) * 100));
  const usageColor  = usagePct > 80 ? '#f87171' : usagePct > 50 ? '#FFBD2E' : '#34d399';

  return (
    <div
      className="hidden xl:flex flex-col w-72 border-l border-white/6 overflow-y-auto"
      style={{ scrollbarWidth: 'none', background: 'rgba(4,3,16,0.6)', backdropFilter: 'blur(20px)' }}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 right-0 w-72 h-px bg-gradient-to-l from-neon-purple/20 to-transparent" />

      <div className="flex flex-col gap-5 p-4 pt-5">

        {/* ── HEADER ── */}
        <div>
          <p className="text-[8px] font-orbitron font-black tracking-[0.25em] text-gray-700 uppercase mb-0.5">Neural Telemetry</p>
          <h3 className="text-xs font-bold text-white">System Status</h3>
        </div>

        {/* ── SYSTEM HEALTH CARD ── */}
        <HudCard glow="#34d399">
          <div className="p-4 space-y-3.5">
            {/* Overall status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[9px] font-orbitron font-black tracking-widest text-emerald-400/80 uppercase">All Systems Go</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] font-mono text-gray-600">
                <Wifi size={9} />
                {ping ? <span className="text-emerald-400">{ping}ms</span> : <span className="animate-pulse">...</span>}
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between text-[9px] font-mono border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock size={9} />
                <span>Session uptime</span>
              </div>
              <UptimeClock />
            </div>

            {/* Services */}
            <div className="space-y-2 pt-1">
              {[
                { label: 'AI Engine',   status: 'Online', color: '#34d399', dot: true },
                { label: 'Groq LLM',    status: 'Active', color: '#00F0FF', dot: true },
                { label: 'Gemini API',  status: 'Active', color: '#be5cf6', dot: true },
                { label: 'Automation',  status: 'Ready',  color: '#FFBD2E', dot: false },
              ].map(({ label, status, color, dot }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-gray-600">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {dot && <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color }} />}
                    <span className="text-[9px] font-mono font-bold" style={{ color }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HudCard>

        {/* ── AI USAGE CARD ── */}
        <HudCard glow={usageColor}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${usageColor}15`, border: `1px solid ${usageColor}30` }}>
                  <Activity size={11} style={{ color: usageColor }} />
                </div>
                <div>
                  <p className="text-[8px] font-orbitron font-black tracking-widest text-gray-600 uppercase">Daily Usage</p>
                  <p className="text-[10px] font-bold text-white">AI Interactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black font-orbitron" style={{ color: usageColor }}>{dailyUsage}</p>
                <p className="text-[8px] font-mono text-gray-600">/ {dailyLimit}</p>
              </div>
            </div>
            <ProgressBar pct={usagePct} color={usageColor} />
            <div className="flex items-center justify-between text-[8px] font-mono">
              <span className="text-gray-600">{usagePct}% consumed</span>
              <span style={{ color: usageColor }}>{dailyLimit - dailyUsage} remaining</span>
            </div>
          </div>
        </HudCard>

        {/* ── STORAGE CARD ── */}
        <HudCard glow="#8A2BE2">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-neon-purple/10 border border-neon-purple/25 flex items-center justify-center">
                <Database size={11} className="text-neon-purple" />
              </div>
              <div>
                <p className="text-[8px] font-orbitron font-black tracking-widest text-gray-600 uppercase">Workspace Storage</p>
                <p className="text-[10px] font-bold text-white">Neural Vault</p>
              </div>
            </div>
            <ProgressBar pct={45} color="#8A2BE2" />
            <div className="flex items-center justify-between text-[8px] font-mono">
              <span className="text-gray-600">450 MB used</span>
              <span className="text-neon-purple">1 GB total</span>
            </div>
          </div>
        </HudCard>

        {/* ── CPU / MODEL INFO ── */}
        <HudCard glow="#00F0FF">
          <div className="p-4 space-y-3">
            <p className="text-[8px] font-orbitron font-black tracking-widest text-gray-600 uppercase mb-3">Active Modules</p>
            <MetricRow icon={Cpu}        label="Primary Model"   value="Llama 3.3 70B" color="#00F0FF"  sub="GROQ" />
            <MetricRow icon={Bot}        label="Fallback Model"  value="Gemini 2.0"    color="#be5cf6"  sub="FAST" />
            <MetricRow icon={Shield}     label="Plan Tier"       value={isPro ? 'PRO' : 'Free'}  color={isPro ? '#FFBD2E' : '#6b7280'} />
            <MetricRow icon={TrendingUp} label="Total Sessions"  value={`${user.dailyUsage || 0} today`}  color="#34d399" />
          </div>
        </HudCard>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <p className="text-[8px] font-orbitron font-black tracking-[0.25em] text-gray-700 uppercase mb-3">Quick Actions</p>
          <div className="grid grid-cols-3 gap-2">
            <QuickTile icon={MessageSquare} label="AI Chat"   to="/app/chat"           color="#00F0FF" navigate={navigate} />
            <QuickTile icon={Code2}         label="Code Gen"  to="/app/code-generator" color="#8A2BE2" navigate={navigate} />
            <QuickTile icon={Mic}           label="Voice"     to="/app/voice"          color="#FF00C8" navigate={navigate} />
          </div>
        </div>

        {/* ── KEYBOARD SHORTCUTS ── */}
        <div>
          <p className="text-[8px] font-orbitron font-black tracking-[0.25em] text-gray-700 uppercase mb-2">Shortcuts</p>
          <HudCard glow="#ffffff">
            <div className="p-2 space-y-0.5">
              <KbdRow label="Command Palette" keys={['Ctrl', 'K']} />
              <KbdRow label="New Chat"        keys={['Ctrl', 'N']} />
              <KbdRow label="Workspace IDE"   keys={['Ctrl', 'W']} />
              <KbdRow label="Voice Mode"      keys={['Ctrl', 'M']} />
            </div>
          </HudCard>
        </div>

        {/* ── UPGRADE CTA (Free only) ── */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HudCard glow="#FF00C8" className="overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(255,0,200,0.3), transparent 70%)' }}
              />
              <div className="relative p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={14} className="text-amber-400" />
                  <p className="text-[10px] font-orbitron font-black text-white tracking-wider">Unlock Pro</p>
                </div>
                <p className="text-[9px] text-gray-500 font-mono mb-3 leading-relaxed">
                  Upgrade to 500 daily interactions, voice mode, priority AI, and more.
                </p>
                <button
                  onClick={() => navigate('/app/billing')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-orbitron font-black tracking-wider text-white transition-all group"
                  style={{ background: 'linear-gradient(135deg, #FF00C8, #8A2BE2)', boxShadow: '0 0 15px rgba(255,0,200,0.25)' }}
                >
                  Upgrade Now <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </HudCard>
          </motion.div>
        )}

        {/* Bottom padding */}
        <div className="h-2" />
      </div>
    </div>
  );
}
