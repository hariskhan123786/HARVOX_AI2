import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminAPI } from '../../services/api';
import {
  Users, CreditCard, Crown, Zap, Code2, Lock, Unlock,
  Eye, EyeOff, Activity, TrendingUp, AlertCircle, Loader2,
} from 'lucide-react';

// ─── Shared HUD card ─────────────────────────────────────────────────────────
const AdminCard = ({ children, className = '', glow = '#8A2BE2' }) => (
  <div
    className={`relative rounded-2xl border border-white/8 bg-[#07060f]/95 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ boxShadow: `0 0 30px ${glow}15` }}
  >
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow}60, transparent)` }} />
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 rounded-tl-2xl" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 rounded-tr-2xl" />
    {children}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <AdminCard glow={color} className="p-5 relative overflow-hidden group hover:border-white/12 transition-colors duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at top right, ${color}08, transparent 70%)` }} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] font-orbitron font-bold text-gray-600">{title}</p>
          <p className="text-3xl font-black mt-2 text-white font-orbitron">{value ?? '—'}</p>
          {sub && <p className="text-[9px] font-mono text-gray-600 mt-1.5 tracking-wide">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, boxShadow: `0 0 15px ${color}20` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}30, transparent)` }} />
    </AdminCard>
  </motion.div>
);

const COLORS = ['#8A2BE2', '#00F0FF', '#FF00C8', '#10B981', '#F59E0B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#07060f]/95 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <p className="text-gray-500 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-black">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Admin background particles ─────────────────────────────────────────────
const AdminBg = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/4 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/4 rounded-full blur-3xl" />
    <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
      <defs>
        <pattern id="adminGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#f87171" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#adminGrid)" />
    </svg>
  </div>
);

export default function AdminDashboard() {
  const [analytics,       setAnalytics]       = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [fetchError,      setFetchError]      = useState('');
  const [passcode,        setPasscode]        = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError,       setAuthError]       = useState('');

  const ADMIN_PASSCODE = '1234';

  const handleUnlock = () => {
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError(`Invalid passcode. You entered: "${passcode.trim()}"`);
      setPasscode('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const { data } = await adminAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setFetchError(err?.response?.data?.message || err?.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const totalUsers  = analytics?.totalUsers  ?? 0;
  const proUsers    = analytics?.proUsers    ?? 0;
  const revenue     = analytics?.revenue     ?? 0;
  const activeUsers = analytics?.activeUsers ?? 0;
  const growthData  = analytics?.growthData  ?? [];
  const topUsers    = analytics?.topUsers    ?? [];
  const chats       = analytics?.aiUsageStats?.chats    ?? 0;
  const codeGen     = analytics?.aiUsageStats?.codeGen  ?? 0;
  const files       = analytics?.aiUsageStats?.files    ?? 0;
  const projects    = analytics?.aiUsageStats?.projects ?? 0;
  const aiUsagePie  = [
    { name: 'AI Chats',  value: chats },
    { name: 'Code Gen',  value: codeGen },
    { name: 'Files',     value: files },
    { name: 'Projects',  value: projects },
  ];
  const barData = [
    { name: 'Chats',      value: chats },
    { name: 'Code Gen',   value: codeGen },
    { name: 'File Scans', value: files },
    { name: 'Projects',   value: projects },
  ];

  // ── LOCK SCREEN ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AdminBg />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <AdminCard glow="#f87171" className="p-10 text-center">
            {/* Lock icon */}
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(248,113,113,0.2)]">
              <Lock size={28} className="text-rose-400" />
            </div>
            <p className="text-[9px] font-orbitron font-black tracking-[0.3em] text-rose-500/60 uppercase mb-3">Restricted Access</p>
            <h2 className="font-orbitron text-2xl font-black tracking-widest text-white mb-2">
              NEURAL ADMIN CORE
            </h2>
            <p className="text-xs text-gray-500 mb-8 font-mono leading-relaxed">
              Enter the administrative passcode to access neural telemetry and platform controls.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setAuthError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="· · · · · · ·"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-center text-white font-mono text-xl tracking-[0.5em] outline-none focus:border-rose-500/40 focus:shadow-[0_0_15px_rgba(248,113,113,0.15)] transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="flex items-center gap-2 bg-rose-500/8 border border-rose-500/25 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-mono"
                  >
                    <AlertCircle size={12} className="shrink-0" />
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleUnlock}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-orbitron font-black text-sm tracking-widest uppercase transition-all group relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', border: '1px solid rgba(248,113,113,0.4)', boxShadow: '0 0 20px rgba(248,113,113,0.2)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
                  <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
                </div>
                <Unlock size={15} /> Unlock Dashboard
              </motion.button>
            </div>
          </AdminCard>
        </motion.div>
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center flex-col gap-4">
        <AdminBg />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border border-rose-500/30 flex items-center justify-center">
            <Loader2 size={20} className="text-rose-400 animate-spin" />
          </div>
          <p className="font-mono text-sm text-gray-500 tracking-widest">LOADING TELEMETRY DATA...</p>
        </div>
      </div>
    );
  }

  // ── FETCH ERROR ───────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AdminBg />
        <AdminCard glow="#f87171" className="p-8 text-center max-w-md relative z-10">
          <AlertCircle size={32} className="text-rose-400 mx-auto mb-4" />
          <p className="font-mono text-sm text-rose-400 mb-4">⚠ API Error: {fetchError}</p>
          <button
            onClick={() => { setIsAuthenticated(false); setFetchError(''); }}
            className="text-[10px] font-mono text-gray-500 hover:text-gray-300 transition-colors border border-white/10 rounded-lg px-4 py-2"
          >
            Go back
          </button>
        </AdminCard>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative space-y-6 pb-10">
      <AdminBg />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
          <p className="text-[9px] font-orbitron font-black tracking-[0.3em] text-rose-500/60 uppercase">Admin Control Panel</p>
        </div>
        <h1 className="font-orbitron text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
          NEURAL ANALYTICS CORE
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-mono">Real-time HARVOX AI platform telemetry and cognitive usage metrics</p>
      </div>

      {/* Stat cards */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Operators"  value={totalUsers}                       icon={Users}      color="#8A2BE2" sub="Registered accounts"       delay={0.05} />
        <StatCard title="PRO Subscribers"  value={proUsers}                         icon={Crown}      color="#F59E0B" sub="Active PRO sessions"        delay={0.1} />
        <StatCard title="PKR Revenue"      value={`Rs. ${revenue.toLocaleString()}`} icon={CreditCard} color="#10B981" sub="Total approved payments"    delay={0.15} />
        <StatCard title="Active Operators" value={activeUsers}                       icon={Zap}        color="#00F0FF" sub="Non-suspended nodes"         delay={0.2} />
      </div>

      {/* Charts Row 1 */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AdminCard glow="#00F0FF" className="lg:col-span-2 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <TrendingUp size={12} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase">Growth Telemetry</p>
              <p className="text-xs font-bold text-white">User Acquisition (7 Days)</p>
            </div>
          </div>
          {growthData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-700 font-mono text-xs border border-dashed border-white/5 rounded-xl">No growth data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#00F0FF" strokeWidth={2} fill="url(#adminGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </AdminCard>

        <AdminCard glow="#FF00C8" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center">
              <Activity size={12} className="text-neon-pink" />
            </div>
            <div>
              <p className="text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase">Usage Split</p>
              <p className="text-xs font-bold text-white">AI Module Breakdown</p>
            </div>
          </div>
          {aiUsagePie.every(p => p.value === 0) ? (
            <div className="h-[200px] flex items-center justify-center text-gray-700 font-mono text-xs border border-dashed border-white/5 rounded-xl">No usage data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={aiUsagePie} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value">
                  {aiUsagePie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#9CA3AF' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </AdminCard>
      </div>

      {/* Charts Row 2 */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard glow="#8A2BE2" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
              <Code2 size={12} className="text-neon-purple" />
            </div>
            <div>
              <p className="text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase">Module Analytics</p>
              <p className="text-xs font-bold text-white">AI Module Usage</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>

        <AdminCard glow="#F59E0B" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Crown size={12} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase">Leaderboard</p>
              <p className="text-xs font-bold text-white">Top Operators</p>
            </div>
          </div>
          <div className="space-y-2">
            {topUsers.length > 0 ? topUsers.map((u, i) => (
              <div key={u.email} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors">
                <span className="font-orbitron text-[9px] font-black text-gray-600 w-4 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-black text-[11px] text-white shrink-0">
                  {u.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{u.name}</p>
                  <p className="text-[9px] font-mono text-gray-600 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide ${u.subscription === 'pro' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-gray-500 border border-white/8'}`}>
                    {u.subscription}
                  </span>
                  <p className="text-[9px] font-mono text-neon-blue mt-0.5">{u.chats} chats</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-gray-700 font-mono">No operator data yet.</p>
              </div>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
