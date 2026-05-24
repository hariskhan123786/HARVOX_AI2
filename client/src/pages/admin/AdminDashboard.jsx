import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import { Users, CreditCard, Crown, Zap, Code2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <GlassCard hover={false} className="relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted font-mono">{title}</p>
        <p className="text-3xl font-bold mt-1 text-white">{value ?? '—'}</p>
        {sub && <p className="text-[10px] font-mono text-muted mt-1">{sub}</p>}
      </div>
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <Icon className="w-5 h-5 text-white/60" />
      </div>
    </div>
  </GlassCard>
);

const COLORS = ['#8A2BE2', '#00F0FF', '#FF00C8', '#10B981', '#F59E0B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const ADMIN_PASSCODE = '1234';

  const handleUnlock = () => {
    const entered = passcode.trim();
    if (entered === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError(`Invalid passcode. You entered: "${entered}"`);
      setPasscode('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadAnalytics = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const { data } = await adminAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
        setFetchError(err?.response?.data?.message || err?.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [isAuthenticated]);

  // Safe analytics values with fallbacks
  const totalUsers = analytics?.totalUsers ?? 0;
  const proUsers = analytics?.proUsers ?? 0;
  const revenue = analytics?.revenue ?? 0;
  const activeUsers = analytics?.activeUsers ?? 0;
  const growthData = analytics?.growthData ?? [];
  const topUsers = analytics?.topUsers ?? [];
  const chats = analytics?.aiUsageStats?.chats ?? 0;
  const codeGen = analytics?.aiUsageStats?.codeGen ?? 0;
  const files = analytics?.aiUsageStats?.files ?? 0;
  const projects = analytics?.aiUsageStats?.projects ?? 0;

  const aiUsagePie = [
    { name: 'AI Chats', value: chats },
    { name: 'Code Gen', value: codeGen },
    { name: 'Files', value: files },
    { name: 'Projects', value: projects },
  ];

  const barData = [
    { name: 'Chats', value: chats },
    { name: 'Code Gen', value: codeGen },
    { name: 'File Scans', value: files },
    { name: 'Projects', value: projects },
  ];

  // ── LOCK SCREEN ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-red-500/30 bg-gray-900/80 backdrop-blur p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <Lock size={32} />
            </div>
            <h2 className="mb-2 font-orbitron text-xl font-bold tracking-widest text-white">
              RESTRICTED AREA
            </h2>
            <p className="mb-8 text-sm text-gray-400">
              Enter the administrative passcode to access neural telemetry.
            </p>

            <div className="space-y-4">
              <div className="relative flex items-center">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setAuthError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter passcode..."
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', width: '100%', borderRadius: '12px', padding: '12px 40px 12px 16px', fontFamily: 'monospace', fontSize: '16px', textAlign: 'center', outline: 'none', letterSpacing: '0.2em' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authError && (
                <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#f87171', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '8px 12px' }}>
                  {authError}
                </p>
              )}

              <button
                type="button"
                onClick={handleUnlock}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: 'white', fontFamily: 'monospace', fontSize: '14px', padding: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
              >
                <Unlock size={16} /> UNLOCK DASHBOARD
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="font-mono text-sm text-gray-400">Loading telemetry data...</p>
      </div>
    );
  }

  // ── FETCH ERROR ───────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center max-w-md">
          <p className="font-mono text-sm text-red-400 mb-4">⚠ API Error: {fetchError}</p>
          <button
            type="button"
            onClick={() => { setIsAuthenticated(false); setFetchError(''); }}
            style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9CA3AF', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
          NEURAL ANALYTICS CORE
        </h1>
        <p className="text-xs text-gray-500 mt-1">Real-time HARVOX AI platform telemetry and cognitive usage metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Operators" value={totalUsers} icon={Users} />
        <StatCard title="PRO Subscribers" value={proUsers} icon={Crown} sub="Active PRO sessions" />
        <StatCard title="PKR Revenue" value={`Rs. ${revenue.toLocaleString()}`} icon={CreditCard} sub="Total approved payments" />
        <StatCard title="Active Operators" value={activeUsers} icon={Zap} sub="Non-suspended nodes" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard hover={false} className="lg:col-span-2">
          <h3 className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Users size={14} /> USER ACQUISITION (7 DAYS)
          </h3>
          {growthData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-600 font-mono text-xs">No growth data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#00F0FF" strokeWidth={2} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Zap size={14} /> AI USAGE SPLIT
          </h3>
          {aiUsagePie.every(p => p.value === 0) ? (
            <div className="h-[200px] flex items-center justify-center text-gray-600 font-mono text-xs">No usage data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={aiUsagePie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {aiUsagePie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#9CA3AF' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard hover={false}>
          <h3 className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Code2 size={14} /> AI MODULE USAGE
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Crown size={14} className="text-amber-400" /> TOP OPERATORS
          </h3>
          <div className="space-y-2">
            {topUsers.length > 0 ? topUsers.map((u, i) => (
              <div key={u.email} className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500 w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-[10px] text-white">
                    {u.name?.charAt(0) ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{u.name}</p>
                    <p className="text-[9px] font-mono text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${u.subscription === 'pro' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    {u.subscription}
                  </span>
                  <p className="text-[10px] font-mono text-cyan-400 mt-0.5">{u.chats} chats</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-600 font-mono italic text-center py-8">No operator data yet.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
