import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { Users, CreditCard, Crown, Zap, MessageSquare, Code2, Upload, FolderKanban, Lock, Unlock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <GlassCard hover className={`border-${color}/20 bg-${color}/5 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 bg-${color}`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="font-orbitron text-[10px] uppercase tracking-widest text-muted">{title}</p>
          <p className={`font-orbitron text-3xl font-bold mt-1 text-${color}`}>{value ?? '—'}</p>
          {sub && <p className="text-[10px] font-mono text-muted mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-${color}/10 border border-${color}/20`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

const COLORS = ['#8A2BE2', '#00F0FF', '#FF00C8', '#10B981', '#F59E0B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-secondary/90 backdrop-blur border border-white/10 rounded-xl px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-muted mb-1">{label}</p>
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
  const [loading, setLoading] = useState(true);
  
  // Passcode state
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const ADMIN_PASSCODE = '1234'; // Default passcode as requested or simple one for demo

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid neural passcode. Access denied.');
      setPasscode('');
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await adminAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const aiUsagePie = analytics
    ? [
        { name: 'AI Chats', value: analytics.aiUsageStats.chats },
        { name: 'Code Gen', value: analytics.aiUsageStats.codeGen },
        { name: 'Files', value: analytics.aiUsageStats.files },
        { name: 'Projects', value: analytics.aiUsageStats.projects },
      ]
    : [];

  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard hover={false} className="relative overflow-hidden border-red-500/30 text-center">
            <div className="absolute inset-0 bg-red-500/5 backdrop-blur-sm" />
            <div className="relative z-10 p-6">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <Lock size={32} />
              </div>
              <h2 className="mb-2 font-orbitron text-xl font-bold tracking-widest text-white">
                RESTRICTED AREA
              </h2>
              <p className="mb-8 text-sm text-muted">
                Please enter the administrative passcode to access neural telemetry.
              </p>
              
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="input-neon text-center font-mono tracking-widest"
                  autoFocus
                />
                {error && <p className="font-mono text-xs text-red-500">{error}</p>}
                <NeonButton type="submit" variant="pro" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <Unlock size={16} /> UNLOCK DASHBOARD
                  </span>
                </NeonButton>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
          NEURAL ANALYTICS CORE
        </h1>
        <p className="text-xs text-muted">Real-time HARVOX AI platform telemetry and cognitive usage metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Operators"
          value={analytics?.totalUsers ?? '…'}
          icon={Users}
          color="neon-blue"
          sub="Registered neural nodes"
        />
        <StatCard
          title="PRO Subscribers"
          value={analytics?.proUsers ?? '…'}
          icon={Crown}
          color="amber-400"
          sub="Active PRO sessions"
        />
        <StatCard
          title="PKR Revenue"
          value={analytics ? `Rs. ${analytics.revenue.toLocaleString()}` : '…'}
          icon={CreditCard}
          color="neon-purple"
          sub="Total approved payments"
        />
        <StatCard
          title="Active Operators"
          value={analytics?.activeUsers ?? '…'}
          icon={Zap}
          color="emerald-400"
          sub="Non-suspended nodes"
        />
      </div>

      {/* Growth Chart + AI Usage Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: User Growth */}
        <GlassCard hover={false} className="lg:col-span-2 border-neon-blue/10">
          <h3 className="font-orbitron text-xs font-bold tracking-widest text-muted uppercase mb-4 flex items-center gap-2">
            <Users size={14} className="text-neon-blue" /> USER ACQUISITION SIGNAL (7 DAYS)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics?.growthData || []}>
              <defs>
                <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#00F0FF"
                strokeWidth={2}
                fill="url(#userGrowthGrad)"
                dot={{ fill: '#00F0FF', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#00F0FF', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* AI Usage Pie */}
        <GlassCard hover={false} className="border-neon-purple/10">
          <h3 className="font-orbitron text-xs font-bold tracking-widest text-muted uppercase mb-4 flex items-center gap-2">
            <Zap size={14} className="text-neon-purple" /> AI USAGE DISTRIBUTION
          </h3>
          {aiUsagePie.every(p => p.value === 0) ? (
            <p className="text-xs text-muted font-mono italic text-center py-16">No AI usage data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={aiUsagePie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {aiUsagePie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#9CA3AF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* AI Usage Bar Chart + Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: AI Modules */}
        <GlassCard hover={false} className="border-white/5">
          <h3 className="font-orbitron text-xs font-bold tracking-widest text-muted uppercase mb-4 flex items-center gap-2">
            <Code2 size={14} className="text-neon-pink" /> AI MODULE USAGE STATS
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: 'Chats', value: analytics?.aiUsageStats?.chats || 0 },
                { name: 'Code Gen', value: analytics?.aiUsageStats?.codeGen || 0 },
                { name: 'File Scans', value: analytics?.aiUsageStats?.files || 0 },
                { name: 'Projects', value: analytics?.aiUsageStats?.projects || 0 },
              ]}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {['#8A2BE2', '#00F0FF', '#FF00C8', '#10B981'].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Top Users Table */}
        <GlassCard hover={false} className="border-white/5">
          <h3 className="font-orbitron text-xs font-bold tracking-widest text-muted uppercase mb-4 flex items-center gap-2">
            <Crown size={14} className="text-amber-400" /> TOP OPERATORS (BY AI USAGE)
          </h3>
          <div className="space-y-2">
            {analytics?.topUsers?.length > 0 ? (
              analytics.topUsers.map((u, i) => (
                <div
                  key={u.email}
                  className="flex items-center justify-between py-2 border-b border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron text-xs font-bold text-muted w-4">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-orbitron font-bold text-[10px] text-white">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{u.name}</p>
                      <p className="text-[9px] font-mono text-muted">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      u.subscription === 'pro'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-white/5 text-muted border border-white/10'
                    }`}>{u.subscription}</span>
                    <p className="text-[10px] font-mono text-neon-blue mt-0.5">{u.chats} chats</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted font-mono italic text-center py-8">No operator data in telemetry.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
