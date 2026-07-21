import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { automationAPI, chatAPI } from '../../services/api';
import PromptBar from '../../components/dashboard/PromptBar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Trash2, Plus, Target, BookOpen, Zap,
  Terminal, Activity, Cpu, FolderKanban, Clock, AlertCircle,
  ChevronRight, Sparkles, Bot, ArrowRight, X, Check,
  BarChart3, Code2, Database, Layers, Mic, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// ─── Particles Background ───────────────────────────────────────────────────
const ParticleBg = () => {
  const particles = useRef(
    Array.from({ length: 30 }).map(() => ({
      w: Math.random() * 2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      dur: Math.random() * 8 + 6,
      color: ['rgba(138,43,226,0.12)', 'rgba(0,240,255,0.08)', 'rgba(255,0,200,0.08)'][Math.floor(Math.random() * 3)],
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${p.w}px`,
            height: `${p.w}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            background: p.color,
          }}
        />
      ))}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-600/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-2/3 w-[300px] h-[300px] bg-gradient-to-br from-neon-pink/4 to-transparent rounded-full blur-3xl pointer-events-none" />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.015] pointer-events-none" />
    </div>
  );
};

// ─── Glowing section card ───────────────────────────────────────────────────
const GlowCard = ({ children, className = '', glow = 'purple', noBg = false }) => {
  const glowMap = {
    purple: { border: 'border-neon-purple/25', shadow: 'shadow-[0_0_40px_rgba(138,43,226,0.1)]', top: 'from-neon-purple/50' },
    cyan: { border: 'border-neon-blue/25', shadow: 'shadow-[0_0_40px_rgba(0,240,255,0.1)]', top: 'from-neon-blue/50' },
    green: { border: 'border-emerald-500/25', shadow: 'shadow-[0_0_40px_rgba(52,211,153,0.1)]', top: 'from-emerald-500/50' },
    gold: { border: 'border-yellow-500/25', shadow: 'shadow-[0_0_40px_rgba(251,191,36,0.1)]', top: 'from-yellow-400/50' },
    pink: { border: 'border-neon-pink/25', shadow: 'shadow-[0_0_40px_rgba(255,0,200,0.1)]', top: 'from-neon-pink/50' },
  };
  const g = glowMap[glow] || glowMap.purple;
  return (
    <div className={`relative rounded-2xl border ${g.border} ${g.shadow} ${noBg ? '' : 'bg-[#07060f]/90'} backdrop-blur-xl overflow-hidden w-full max-w-full ${className}`}>
      {/* Top shimmer line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${g.top} to-transparent opacity-80`} />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/10 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 rounded-br-2xl" />
      {children}
    </div>
  );
};

// ─── Card section header ─────────────────────────────────────────────────────
const CardHeader = ({ icon: Icon, iconBg, label, title, right }) => (
  <div className="flex items-center justify-between gap-2 mb-4">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-inner shrink-0`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-orbitron font-black tracking-[0.18em] text-muted/60 uppercase truncate">{label}</p>
        <p className="text-xs font-bold text-white leading-tight truncate">{title}</p>
      </div>
    </div>
    <div className="shrink-0">{right}</div>
  </div>
);

// ─── Tooltip for Recharts ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0e0a1b]/95 border border-neon-purple/30 rounded-xl px-3 py-2 text-[10px] font-mono shadow-[0_0_15px_rgba(138,43,226,0.3)]">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-neon-purple font-black">{payload[0].value}h studied</p>
    </div>
  );
};

// ─── Priority badge ─────────────────────────────────────────────────────────
const PriorityBadge = ({ p }) => {
  const styles = {
    high: 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.2)]',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.2)]',
    low: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.2)]',
  };
  return (
    <span className={`text-[7px] font-orbitron font-extrabold px-1.5 py-0.5 rounded border tracking-wider whitespace-nowrap ${styles[p] || styles.medium}`}>
      {p?.toUpperCase()}
    </span>
  );
};

// ─── BSCS Subject icons ─────────────────────────────────────────────────────
const SUBJECT_META = {
  'AI': { icon: Cpu, color: '#be5cf6', shadow: 'rgba(190,92,246,0.3)', bar: 'from-purple-600 to-purple-400' },
  'Database': { icon: Database, color: '#00f0ff', shadow: 'rgba(0,240,255,0.3)', bar: 'from-cyan-600 to-cyan-400' },
  'Software Engineering': { icon: Layers, color: '#34d399', shadow: 'rgba(52,211,153,0.3)', bar: 'from-green-600 to-green-400' },
  'Assembly Language': { icon: Code2, color: '#f87171', shadow: 'rgba(248,113,113,0.3)', bar: 'from-rose-600 to-rose-400' },
};

// ─── Quick-action command tiles ─────────────────────────────────────────────
const QUICK_COMMANDS = [
  { label: 'New Project', icon: Code2, path: '/app/chat', prompt: 'Create a new Next.js, Node/Express, or React project', neon: '#8A2BE2', glow: 'rgba(138,43,226,0.3)' },
  { label: 'Generate Notes', icon: BookOpen, path: '/app/chat', prompt: 'Generate study notes for my BSCS subjects', neon: '#00F0FF', glow: 'rgba(0,240,255,0.3)' },
  { label: 'Debug Project', icon: AlertCircle, path: '/app/debug', prompt: '', neon: '#FF5F56', glow: 'rgba(255,95,86,0.3)' },
  { label: 'Workspace', icon: FolderKanban, path: '/app/workspace/default', prompt: '', neon: '#34d399', glow: 'rgba(52,211,153,0.3)' },
  { label: 'Voice Autopilot', icon: Mic, path: '/app/voice', prompt: '', neon: '#FFBD2E', glow: 'rgba(255,189,46,0.3)' },
  { label: 'AI Chat', icon: Bot, path: '/app/chat', prompt: '', neon: '#FF00C8', glow: 'rgba(255,0,200,0.3)' },
];

// ────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Developer';

  // Dashboard data
  const [tasks, setTasks] = useState([]);
  const [study, setStudy] = useState([]);
  const [projects, setProjects] = useState([]);
  const [actLog, setActLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState([]);

  // Task form
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Study log form
  const [studySubject, setStudySubject] = useState('AI');
  const [studyHours, setStudyHours] = useState('');
  const [logStudy, setLogStudy] = useState(false);

  // Fetch dashboard data from server
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashRes, chatRes] = await Promise.all([
        automationAPI.getDashboard(),
        chatAPI.list(),
      ]);
      setTasks(dashRes.data.tasks || []);
      setStudy(dashRes.data.studyTrack || []);
      setProjects(dashRes.data.projects || []);
      setActLog(dashRes.data.activities || []);
      setRecentChats(chatRes.data.chats?.slice(0, 5) || []);
    } catch {
      /* silently ignore — could be first run */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Task operations
  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    setAddingTask(true);
    try {
      const { data } = await automationAPI.createTask({
        title: newTitle,
        priority: newPriority,
        deadline: newDeadline || undefined,
      });
      setTasks(prev => [data, ...prev]);
      setNewTitle('');
      setNewDeadline('');
      setNewPriority('medium');
      setShowForm(false);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    try {
      await automationAPI.updateTask(task._id, { status: newStatus });
    } catch {
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: task.status } : t));
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    try { await automationAPI.deleteTask(id); } catch { fetchAll(); }
  };

  // Study log
  const handleLogStudy = async () => {
    if (!studyHours || isNaN(Number(studyHours))) return;
    setLogStudy(true);
    try {
      await automationAPI.logLearning({ subject: studySubject, hours: Number(studyHours) });
      const { data } = await automationAPI.getLearning();
      setStudy(data);
      setStudyHours('');
    } finally {
      setLogStudy(false);
    }
  };

  // Build Recharts data
  const ALL_SUBJECTS = ['AI', 'Database', 'Software Engineering', 'Assembly Language'];
  const studyChartData = ALL_SUBJECTS.map(subject => ({
    name: subject === 'Software Engineering' ? 'Soft. Eng.' : subject,
    hours: study.find(s => s.subject === subject)?.hours || 0,
  }));

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalStudy = study.reduce((a, s) => a + (s.hours || 0), 0);

  const metricCards = [
    { label: 'Tasks Pending', value: pendingTasks, color: '#FFBD2E', glow: 'rgba(255,189,46,0.3)', icon: Target, suffix: '' },
    { label: 'Tasks Completed', value: completedTasks, color: '#34d399', glow: 'rgba(52,211,153,0.3)', icon: CheckCircle2, suffix: '' },
    { label: 'Study Hours', value: totalStudy, color: '#be5cf6', glow: 'rgba(190,92,246,0.3)', icon: BookOpen, suffix: 'h' },
    { label: 'Projects', value: projects.length, color: '#00F0FF', glow: 'rgba(0,240,255,0.3)', icon: FolderKanban, suffix: '' },
  ];

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-10">
      <ParticleBg />

      {/* ── HEADER greeting ── */}
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <p className="text-[10px] font-orbitron font-bold tracking-widest text-emerald-400/70 uppercase">System Online</p>
          </div>
          <p className="text-muted text-sm">
            Welcome back, <span className="text-neon-purple font-semibold">{firstName}</span> 👋
          </p>
          <h1 className="mt-1 font-orbitron text-xl xs:text-2xl lg:text-3xl font-black tracking-widest break-words">
            HARVOX <span className="gradient-text-animated">Command Center</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] text-gray-600 mt-1 font-mono tracking-widest">
            PHASE 8 — ADVANCED AUTOMATION ENGINE ONLINE
          </p>
          <div className="mt-5 max-w-2xl">
            <PromptBar />
          </div>
        </div>

        {/* Live metric strip */}
        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap lg:flex-nowrap lg:flex-col lg:gap-2 lg:min-w-[180px] shrink-0">
          {metricCards.map(({ label, value, color, glow, icon: Icon, suffix }) => (
            <motion.div
              key={label}
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex items-center gap-2.5 sm:gap-3 bg-[#07060f]/80 border border-white/8 rounded-2xl px-2.5 sm:px-3 py-2.5 backdrop-blur-sm relative overflow-hidden min-w-0"
              style={{ boxShadow: `0 0 20px ${glow}` }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}50, transparent)` }} />
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon size={13} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black leading-none" style={{ color }}>{value}{suffix}</p>
                <p className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5 font-mono truncate">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── QUICK COMMANDS ROW ── */}
      <div className="relative z-10">
        <p className="text-[9px] font-orbitron font-bold tracking-[0.2em] text-gray-500 uppercase mb-3 flex items-center gap-2">
          <Zap size={9} className="text-yellow-400" /> Quick Automation Commands
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {QUICK_COMMANDS.map(({ label, icon: Icon, path, prompt, neon, glow }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(path, prompt ? { state: { initialMessage: prompt } } : undefined)}
              className="relative bg-[#07060f]/90 border border-white/8 rounded-2xl p-3 sm:p-4 text-left group overflow-hidden transition-all duration-300"
              style={{ boxShadow: `0 0 0px ${glow}` }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 25px ${glow}, 0 0 0 1px ${neon}30`; e.currentTarget.style.borderColor = `${neon}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden pointer-events-none">
                <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep" />
              </div>
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-5 h-5 opacity-30" style={{ background: `radial-gradient(circle at top right, ${neon}40, transparent 70%)` }} />
              <div
                className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: `${neon}12`, border: `1px solid ${neon}30` }}
              >
                <Icon size={15} style={{ color: neon }} />
              </div>
              <p className="text-[10px] font-bold text-gray-300 group-hover:text-white leading-tight transition-colors">
                {label}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── TASK CHECKLIST ─────────────────────────────── */}
        <GlowCard className="lg:col-span-1" glow="purple">
          <div className="p-4 sm:p-5">
            <CardHeader
              icon={Target}
              iconBg="bg-neon-purple/10 border border-neon-purple/25 text-neon-purple"
              label="Mission Control"
              title="Daily Task List"
              right={
                <button
                  onClick={() => setShowForm(v => !v)}
                  className="w-7 h-7 rounded-xl bg-neon-purple/10 border border-neon-purple/25 flex items-center justify-center hover:bg-neon-purple/25 transition-all duration-300"
                >
                  <motion.div animate={{ rotate: showForm ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <Plus size={12} className="text-neon-purple" />
                  </motion.div>
                </button>
              }
            />

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-[8px] font-mono text-gray-600 mb-1.5">
                  <span className="tracking-widest">{completedTasks}/{tasks.length} COMPLETED</span>
                  <span className="text-neon-purple font-bold">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    animate={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full shadow-[0_0_8px_rgba(138,43,226,0.6)]"
                  />
                </div>
              </div>
            )}

            {/* Add task form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 space-y-2.5 overflow-hidden"
                >
                  <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    placeholder="Task title..."
                    className="w-full bg-white/5 border border-neon-purple/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-neon-purple/50 focus:shadow-[0_0_10px_rgba(138,43,226,0.2)] transition-all"
                    autoFocus
                  />
                  <div className="flex flex-col xs:flex-row gap-2">
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value)}
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-gray-400 outline-none focus:border-neon-purple/30 transition-all"
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={e => setNewDeadline(e.target.value)}
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-gray-400 outline-none focus:border-neon-purple/30 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTitle.trim() || addingTask}
                    className="w-full py-2 bg-neon-purple hover:bg-neon-purple/80 rounded-xl text-[10px] font-black text-white tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(138,43,226,0.3)]"
                  >
                    {addingTask ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                    Add Mission
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Task list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                ))
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
                  <Target size={28} className="text-neon-purple/20 mx-auto mb-2" />
                  <p className="text-[10px] text-gray-600 font-mono">No tasks yet. Add your first mission!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group flex items-start gap-2.5 p-2.5 rounded-xl border transition-all duration-300 ${task.status === 'completed'
                      ? 'bg-emerald-950/10 border-emerald-500/15 opacity-60'
                      : 'bg-white/3 border-white/5 hover:border-neon-purple/25 hover:bg-neon-purple/5'
                      }`}
                  >
                    <button onClick={() => handleToggleTask(task)} className="mt-0.5 shrink-0">
                      {task.status === 'completed'
                        ? <CheckCircle2 size={14} className="text-emerald-400" />
                        : <Circle size={14} className="text-gray-600 hover:text-neon-purple transition-colors" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-semibold leading-tight truncate ${task.status === 'completed' ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <PriorityBadge p={task.priority} />
                        {task.deadline && (
                          <span className="text-[7px] text-gray-600 font-mono flex items-center gap-0.5">
                            <Clock size={7} />
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 hover:bg-rose-500/10 rounded-lg text-gray-700 hover:text-rose-400 transition-all shrink-0"
                    >
                      <Trash2 size={10} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </GlowCard>

        {/* ─── BSCS STUDY TRACKER ─────────────────────────── */}
        <GlowCard className="lg:col-span-2" glow="cyan">
          <div className="p-4 sm:p-5">
            <CardHeader
              icon={BookOpen}
              iconBg="bg-neon-blue/10 border border-neon-blue/25 text-neon-blue"
              label="Neural Learning Core"
              title="BSCS Study Tracker"
              right={
                <span className="text-[9px] font-mono font-black text-neon-blue/80 bg-neon-blue/8 border border-neon-blue/20 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.15)] whitespace-nowrap">
                  {totalStudy}h TOTAL
                </span>
              }
            />

            {/* Quick log row */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4">
              <select
                value={studySubject}
                onChange={e => setStudySubject(e.target.value)}
                className="flex-1 min-w-[130px] bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-neon-blue/40 focus:shadow-[0_0_8px_rgba(0,240,255,0.15)] transition-all"
              >
                {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                value={studyHours}
                onChange={e => setStudyHours(e.target.value)}
                placeholder="hrs"
                className="w-16 shrink-0 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-gray-300 outline-none text-center focus:border-neon-blue/40 transition-all"
              />
              <button
                onClick={handleLogStudy}
                disabled={logStudy || !studyHours}
                className="shrink-0 px-3.5 py-1.5 bg-neon-blue hover:bg-neon-blue/80 rounded-xl text-[10px] font-black text-black transition-all disabled:opacity-50 flex items-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                {logStudy ? <Loader2 size={9} className="animate-spin" /> : <Plus size={9} />}
                Log
              </button>
            </div>

            {/* Recharts bar chart */}
            <div className="h-32 sm:h-36 mb-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 8, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 8, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    width={22}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,240,255,0.03)' }} />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="url(#studyGrad)" />
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#8A2BE2" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject mini-cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              {ALL_SUBJECTS.map(subject => {
                const meta = SUBJECT_META[subject];
                const Icon = meta.icon;
                const hours = study.find(s => s.subject === subject)?.hours || 0;
                const last = study.find(s => s.subject === subject)?.lastStudied;
                const pct = totalStudy > 0 ? Math.round((hours / totalStudy) * 100) : 0;
                return (
                  <div
                    key={subject}
                    className="flex items-center gap-2.5 bg-white/3 border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-all duration-300 group relative overflow-hidden"
                    style={{ '--c': meta.color }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to right, transparent, ${meta.color}50, transparent)` }} />
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30`, boxShadow: `0 0 10px ${meta.shadow}` }}
                    >
                      <Icon size={13} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[7px] text-gray-500 font-mono truncate tracking-wider">{subject.toUpperCase()}</p>
                      <div className="flex items-end gap-1.5">
                        <p className="text-sm font-black leading-tight" style={{ color: meta.color }}>{hours}h</p>
                        {totalStudy > 0 && <span className="text-[7px] text-gray-600 mb-0.5 font-mono">{pct}%</span>}
                      </div>
                      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${meta.color}, ${meta.color}80)` }}
                        />
                      </div>
                    </div>
                    {last && (
                      <span className="text-[7px] text-gray-700 font-mono shrink-0">
                        {new Date(last).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlowCard>
      </div>

      {/* ── SECOND ROW: Projects + Automation Log ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ─── PROJECT PROGRESS PANEL ─────────────────────── */}
        <GlowCard glow="green">
          <div className="p-4 sm:p-5">
            <CardHeader
              icon={FolderKanban}
              iconBg="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
              label="Project Matrix"
              title="Active Projects"
              right={
                <Link
                  to="/app/workspace/default"
                  className="text-[9px] font-mono text-emerald-400/70 flex items-center gap-1 hover:text-emerald-400 transition-colors whitespace-nowrap"
                >
                  Workspace <ChevronRight size={10} />
                </Link>
              }
            />

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse" />
                ))
              ) : projects.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
                  <FolderKanban size={28} className="text-emerald-500/20 mx-auto mb-2" />
                  <p className="text-[10px] text-gray-600">No projects yet.</p>
                  <button
                    onClick={() => navigate('/app/chat', { state: { initialMessage: 'Create React Project' } })}
                    className="mt-2 text-[9px] text-emerald-400/70 hover:text-emerald-400 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <Sparkles size={9} /> Say "Create React Project"
                  </button>
                </div>
              ) : (
                projects.map((proj, i) => {
                  const progress = Math.min(95, 30 + (i * 20));
                  return (
                    <div key={proj._id || i} className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all duration-300 group">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Code2 size={13} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <p className="text-[10px] font-bold text-gray-200 truncate">{proj.name}</p>
                          <span className="text-[8px] text-emerald-400 font-black ml-2 shrink-0">{progress}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full shadow-[0_0_6px_rgba(52,211,153,0.5)] transition-all duration-700"
                            style={{ width: `${progress}%`, background: 'linear-gradient(to right, #059669, #34d399)' }}
                          />
                        </div>
                        <p className="text-[7px] text-gray-600 font-mono mt-1 tracking-wider truncate">{proj.framework || 'MERN'} · {new Date(proj.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </GlowCard>

        {/* ─── LIVE AUTOMATION LOG ────────────────────────── */}
        <GlowCard glow="gold">
          <div className="p-4 sm:p-5">
            <CardHeader
              icon={Terminal}
              iconBg="bg-yellow-500/10 border border-yellow-500/25 text-yellow-400"
              label="Automation Core"
              title="Live Activity Log"
              right={
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                  <span className="text-[8px] font-mono font-bold text-yellow-400/80 tracking-widest">LIVE</span>
                </div>
              }
            />

            {/* Terminal-style log */}
            <div
              className="bg-black/60 border border-white/8 rounded-2xl p-3 max-h-72 overflow-y-auto overflow-x-hidden font-mono text-[9px] space-y-1.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid opacity-[0.015] pointer-events-none rounded-2xl" />
              <div className="flex items-center gap-1.5 text-gray-600 border-b border-white/5 pb-1.5 mb-2">
                <Terminal size={9} />
                <span>harvox-automation-core v8.0 — log stream</span>
              </div>

              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
                ))
              ) : actLog.length === 0 ? (
                <div className="text-center py-4 text-gray-700">
                  <p>Awaiting automation events...</p>
                  <p className="mt-1 text-yellow-400/50">Ask HARVOX to open an app or create a project</p>
                </div>
              ) : (
                [...actLog].reverse().map((log, i) => {
                  const isError = log.key?.includes('error');
                  const isAction = log.key?.includes('open') || log.key?.includes('run') || log.key?.includes('project');
                  return (
                    <div key={i} className={`leading-relaxed flex gap-1.5 ${isError ? 'text-rose-400' : isAction ? 'text-yellow-300' : 'text-gray-400'}`}>
                      <span className="text-gray-700 shrink-0">
                        [{new Date(log.createdAt || Date.now()).toLocaleTimeString()}]
                      </span>
                      <span className="text-yellow-400/80 shrink-0">›</span>
                      <span className="break-all">{log.value || log.key}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick navigate to voice / chat */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => navigate('/app/voice')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-500/8 hover:bg-yellow-500/15 border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-400 rounded-xl text-[9px] font-bold transition-all duration-300"
              >
                <Mic size={10} /> Voice Autopilot
              </button>
              <button
                onClick={() => navigate('/app/chat')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neon-purple/8 hover:bg-neon-purple/15 border border-neon-purple/20 hover:border-neon-purple/40 text-neon-purple rounded-xl text-[9px] font-bold transition-all duration-300"
              >
                <Bot size={10} /> AI Chat
              </button>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* ── RECENT CHATS ── */}
      <div className="relative z-10">
        <GlowCard glow="pink">
          <div className="p-4 sm:p-5">
            <CardHeader
              icon={Bot}
              iconBg="bg-neon-pink/10 border border-neon-pink/25 text-neon-pink"
              label="Neural Session Archive"
              title="Recent AI Sessions"
              right={
                <Link to="/app/chat" className="text-[9px] font-mono font-bold text-neon-pink/70 flex items-center gap-1 hover:text-neon-pink transition-colors whitespace-nowrap">
                  New Chat <ArrowRight size={9} />
                </Link>
              }
            />

            {recentChats.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl">
                <Bot size={28} className="text-neon-pink/15 mx-auto mb-2" />
                <p className="text-[10px] text-gray-600">No chats yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {recentChats.map(c => (
                  <Link
                    key={c._id}
                    to="/app/chat"
                    state={{ chatId: c._id }}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/3 px-3.5 py-2.5 transition-all duration-300 hover:border-neon-pink/25 hover:bg-neon-pink/5 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center shrink-0">
                        <Bot size={10} className="text-neon-pink" />
                      </div>
                      <span className="text-[10px] text-gray-400 truncate group-hover:text-white transition-colors">{c.title}</span>
                    </div>
                    <span className="text-[8px] text-gray-600 shrink-0 font-mono">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}