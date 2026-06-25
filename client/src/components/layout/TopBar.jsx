import { useState, useEffect } from 'react';
import { Menu, Bell, User, Zap, Search, X, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Route label map ──────────────────────────────────────────────────────────
const ROUTE_META = {
  '/app/dashboard':         { label: 'Command Center',     sub: 'Overview & Metrics' },
  '/app/chat':              { label: 'AI Chat',             sub: 'Streaming Intelligence' },
  '/app/code-generator':    { label: 'Code Assistant',      sub: 'AI-Powered Generation' },
  '/app/debug':             { label: 'Debug Assistant',     sub: 'Error Analysis Engine' },
  '/app/project-generator': { label: 'Project Generator',   sub: 'Scaffold & Deploy' },
  '/app/workspace/1':       { label: 'Workspace IDE',       sub: 'Monaco Neural Editor' },
  '/app/file-analyzer':     { label: 'File Analyzer',       sub: 'Document Intelligence' },
  '/app/notes':             { label: 'Notes',               sub: 'Neural Notepad' },
  '/app/voice':             { label: 'Voice Assistant',     sub: 'Audio Command OS' },
  '/app/brain':             { label: 'Brain Core',          sub: 'Memory & Knowledge' },
  '/app/profile':           { label: 'Profile',             sub: 'Identity & Settings' },
  '/app/settings':          { label: 'Settings',            sub: 'System Configuration' },
  '/app/billing':           { label: 'Billing',             sub: 'Subscription & Plans' },
};

export default function TopBar({ onMenuClick }) {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const [hasNotif,   setHasNotif]   = useState(true);
  const [time,       setTime]       = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const routeMeta   = ROUTE_META[location.pathname] || { label: 'HARVOX AI', sub: 'Neural Platform' };
  const isPro       = user?.subscription === 'pro' || user?.role === 'admin';
  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  // Quick search nav items
  const SEARCH_ITEMS = Object.entries(ROUTE_META).map(([path, meta]) => ({
    path,
    label: meta.label,
  }));
  const filtered = searchQ
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(searchQ.toLowerCase()))
    : SEARCH_ITEMS.slice(0, 5);

  return (
    <div className="sticky top-0 z-40 h-[60px] flex items-center justify-between px-4 lg:px-6 border-b border-white/6 shrink-0"
      style={{ background: 'rgba(4,3,16,0.85)', backdropFilter: 'blur(24px)' }}>

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />

      {/* ── LEFT: Hamburger + Breadcrumb ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/4 border border-white/8 text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        >
          <Menu size={16} />
        </button>

        {/* Page title breadcrumb */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.25 }}
            className="hidden lg:flex items-center gap-2 min-w-0"
          >
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-neon-purple to-neon-blue opacity-60" />
            <div className="min-w-0">
              <p className="text-[13px] font-orbitron font-black text-white truncate leading-tight">
                {routeMeta.label}
              </p>
              <p className="text-[8px] font-mono text-gray-600 tracking-widest truncate">
                {routeMeta.sub}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CENTER: Search (expands on click) ── */}
      <div className="flex-1 flex justify-center px-4 max-w-sm">
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div
              key="search-open"
              initial={{ width: 100, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 100, opacity: 0 }}
              className="relative w-full"
            >
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Navigate to..."
                className="w-full bg-white/6 border border-neon-purple/30 rounded-xl pl-8 pr-8 py-2 text-xs font-mono text-white placeholder:text-gray-600 outline-none"
                style={{ boxShadow: '0 0 15px rgba(138,43,226,0.15)' }}
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQ(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
              >
                <X size={12} />
              </button>

              {/* Dropdown */}
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-[#07060f]/98 border border-white/8 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50">
                {filtered.map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setShowSearch(false); setSearchQ(''); }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/5 transition-colors text-left group"
                  >
                    <span className="text-[11px] font-mono text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                    <ChevronRight size={10} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="search-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/6 hover:bg-white/6 hover:border-white/10 transition-all"
            >
              <Search size={11} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-600 hidden sm:block">Quick navigate...</span>
              <span className="text-[8px] font-mono text-gray-700 hidden md:block border border-white/10 rounded px-1 py-0.5">Ctrl K</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── RIGHT: Actions + User ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Live clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/3 border border-white/6">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-gray-500 tabular-nums">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>

        {/* Pro badge */}
        {isPro && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
            <Zap size={9} className="text-amber-400" />
            <span className="text-[8px] font-orbitron font-black text-amber-400 tracking-wider">PRO</span>
          </div>
        )}

        {/* Notification bell */}
        <button
          onClick={() => setHasNotif(false)}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/4 border border-white/6 text-gray-500 hover:text-white hover:bg-white/8 hover:border-white/10 transition-all"
        >
          <Bell size={15} />
          <AnimatePresence>
            {hasNotif && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_8px_rgba(255,0,200,0.8)]"
              />
            )}
          </AnimatePresence>
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('/app/profile')}
          className="flex items-center gap-2.5 pl-3 border-l border-white/6 group"
        >
          <div className="hidden sm:block text-right">
            <p className="text-[11px] font-bold text-white">{user?.name?.split(' ')[0]}</p>
            <p className="text-[8px] font-mono text-gray-600 capitalize">{user?.subscription || 'Free'} Plan</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple/50 to-neon-blue/40 border border-neon-purple/30 flex items-center justify-center font-orbitron font-black text-sm text-white shadow-[0_0_12px_rgba(138,43,226,0.2)] group-hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-shadow">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
              ) : userInitial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#04030f] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>
        </button>
      </div>
    </div>
  );
}
