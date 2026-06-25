import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Code2, Bug, FolderKanban,
  FileText, Mic, Settings, Crown, Upload, CreditCard, User,
  MonitorPlay, LogOut, ChevronLeft, ChevronRight, Brain, Zap,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { useState } from 'react';

// ─── Nav Groups ───────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { to: '/app/dashboard',        icon: LayoutDashboard, label: 'Dashboard',        neon: '#8A2BE2' },
      { to: '/app/chat',             icon: MessageSquare,   label: 'AI Chat',           neon: '#00F0FF' },
      { to: '/app/brain',            icon: Brain,           label: 'Brain Core',        neon: '#be5cf6' },
    ],
  },
  {
    label: 'Dev Tools',
    items: [
      { to: '/app/code-generator',   icon: Code2,           label: 'Code Assistant',    neon: '#34d399' },
      { to: '/app/debug',            icon: Bug,             label: 'Debug Assistant',   neon: '#f87171' },
      { to: '/app/project-generator',icon: FolderKanban,    label: 'Project Generator', neon: '#FFBD2E' },
      { to: '/app/workspace/1',      icon: MonitorPlay,     label: 'Workspace IDE',     neon: '#00F0FF' },
      { to: '/app/file-analyzer',    icon: Upload,          label: 'File Analyzer',     neon: '#a78bfa' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/app/notes',            icon: FileText,        label: 'Notes',             neon: '#34d399' },
      { to: '/app/voice',            icon: Mic,             label: 'Voice Assistant',   neon: '#FF00C8' },
      { to: '/app/profile',          icon: User,            label: 'Profile',           neon: '#8A2BE2' },
      { to: '/app/settings',         icon: Settings,        label: 'Settings',          neon: '#6b7280' },
      { to: '/app/billing',          icon: CreditCard,      label: 'Billing',           neon: '#FFBD2E' },
    ],
  },
];

// ─── Single nav item ──────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onClose }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl transition-all duration-200 overflow-hidden',
          collapsed
            ? 'justify-center h-10 w-10 mx-auto px-0'
            : 'px-3.5 py-2.5',
          isActive
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-200'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active background */}
          {isActive && (
            <motion.div
              layoutId="nav-bg"
              className="absolute inset-0 rounded-xl"
              style={{ background: `${item.neon}14`, border: `1px solid ${item.neon}35` }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}

          {/* Hover background */}
          {!isActive && (
            <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/4 transition-colors duration-200" />
          )}

          {/* Left accent bar */}
          {isActive && !collapsed && (
            <motion.div
              layoutId="nav-bar"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
              style={{ background: item.neon, boxShadow: `0 0 8px ${item.neon}` }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}

          {/* Icon */}
          <div
            className="relative z-10 shrink-0 transition-colors duration-200"
            style={{ color: isActive ? item.neon : undefined }}
          >
            <item.icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
            {/* Glow dot for active */}
            {isActive && (
              <div
                className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full"
                style={{ background: item.neon, boxShadow: `0 0 6px ${item.neon}` }}
              />
            )}
          </div>

          {/* Label */}
          {!collapsed && (
            <span className="relative z-10 text-[11px] font-semibold tracking-wide truncate animate-fade-in">
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Group section ────────────────────────────────────────────────────────────
function NavGroup({ group, collapsed, onClose }) {
  const [open, setOpen] = useState(true);

  if (collapsed) {
    // In collapsed mode just show items without group label
    return (
      <div className="space-y-0.5">
        {group.items.map(item => (
          <NavItem key={item.to} item={item} collapsed onClose={onClose} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 group"
      >
        <span className="text-[8px] font-orbitron font-black tracking-[0.22em] text-gray-700 uppercase group-hover:text-gray-500 transition-colors">
          {group.label}
        </span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={10} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-0.5"
          >
            {group.items.map(item => (
              <NavItem key={item.to} item={item} collapsed={false} onClose={onClose} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────
export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleCollapse } = useSidebarStore();

  const userName    = user?.name || 'Developer';
  const userInitial = userName.charAt(0).toUpperCase();
  const isPro       = user?.subscription === 'pro' || user?.role === 'admin';
  const collapsed   = isCollapsed && !mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col transition-all duration-300 ease-in-out',
          'border-r border-white/6 bg-[#040310]/98 backdrop-blur-2xl',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ boxShadow: '4px 0 40px rgba(0,0,0,0.6), 1px 0 0 rgba(138,43,226,0.08)' }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />

        {/* ── LOGO ─────────────────────────────────────────────── */}
        <div className={cn(
          'flex items-center border-b border-white/5 shrink-0',
          collapsed ? 'justify-center h-[60px]' : 'justify-between px-4 h-[60px]'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo mark */}
            <div className="relative w-9 h-9 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-orbitron font-black text-base shadow-[0_0_20px_rgba(138,43,226,0.4)]">
                H
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-neon-purple" style={{ animationDuration: '3s' }} />
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="font-orbitron text-sm font-black tracking-widest text-white truncate">HARVOX AI</p>
                <p className="text-[8px] font-mono text-neon-blue/50 tracking-widest truncate">PHASE 8 ONLINE</p>
              </div>
            )}
          </div>

          {/* Collapse toggle (desktop only) */}
          {!mobileOpen && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all shrink-0"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* ── STATUS STRIP (expanded only) ──────────────────────── */}
        {!collapsed && (
          <div className="mx-3 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[8px] font-mono text-gray-600 tracking-widest">SYSTEM OPERATIONAL</span>
            <div className="ml-auto flex gap-1">
              {['#8A2BE2', '#00F0FF', '#FF00C8'].map((c, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full opacity-60"
                  style={{ background: c, animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Collapsed separator */}
        {collapsed && <div className="mx-auto w-8 border-t border-white/5 my-2" />}

        {/* ── NAV GROUPS ────────────────────────────────────────── */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-4',
            collapsed ? 'px-2' : 'px-2'
          )}
          style={{ scrollbarWidth: 'none' }}
        >
          {NAV_GROUPS.map(group => (
            <NavGroup
              key={group.label}
              group={group}
              collapsed={collapsed}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* ── UPGRADE BANNER ────────────────────────────────────── */}
        {!isPro && (
          <div className={cn('px-3 pb-2', collapsed && 'flex justify-center')}>
            {collapsed ? (
              <NavLink to="/app/billing" onClick={onClose} title="Upgrade to Pro">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 hover:border-neon-purple/50 transition-all shadow-[0_0_15px_rgba(138,43,226,0.2)]">
                  <Crown size={15} className="text-neon-pink" />
                </div>
              </NavLink>
            ) : (
              <NavLink to="/app/billing" onClick={onClose}>
                <div className="relative rounded-xl p-px overflow-hidden group cursor-pointer">
                  {/* Gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue rounded-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative rounded-[11px] bg-[#0c0820] px-3.5 py-2.5 flex items-center gap-2.5">
                    <Crown size={14} className="text-neon-pink shrink-0" />
                    <div>
                      <p className="text-[10px] font-orbitron font-black text-white tracking-wider">Upgrade to Pro</p>
                      <p className="text-[8px] text-gray-600 font-mono">Unlock all features</p>
                    </div>
                    <Zap size={10} className="text-yellow-400 ml-auto shrink-0 animate-pulse" />
                  </div>
                </div>
              </NavLink>
            )}
          </div>
        )}

        {/* ── USER FOOTER ───────────────────────────────────────── */}
        <div className="border-t border-white/5 p-2.5 shrink-0">
          <div
            className={cn(
              'group flex items-center rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden',
              collapsed
                ? 'justify-center w-10 h-10 mx-auto'
                : 'gap-2.5 px-2.5 py-2.5 hover:bg-white/4 border border-transparent hover:border-white/6'
            )}
            onClick={() => { navigate('/app/profile'); onClose(); }}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-purple/40 to-neon-blue/30 border border-neon-purple/30 flex items-center justify-center font-orbitron font-black text-sm text-white shadow-[0_0_12px_rgba(138,43,226,0.25)]">
                {userInitial}
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#040310] shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-[11px] font-bold text-white truncate">{userName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isPro ? (
                      <span className="text-[8px] font-orbitron font-black text-amber-400 tracking-wide">PRO</span>
                    ) : (
                      <span className="text-[8px] font-mono text-gray-600">Free Plan</span>
                    )}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    navigate('/login');
                  }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                  title="Log Out"
                >
                  <LogOut size={12} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
