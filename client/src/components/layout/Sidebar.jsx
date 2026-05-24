import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Code2,
  Bug,
  FolderKanban,
  FileText,
  Mic,
  History,
  Settings,
  Crown,
  Upload,
  CreditCard,
  User,
  MonitorPlay,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import NeonButton from '../ui/NeonButton';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/app/code-generator', icon: Code2, label: 'Code Assistant' },
  { to: '/app/debug', icon: Bug, label: 'Debug Assistant' },
  { to: '/app/project-generator', icon: FolderKanban, label: 'Project Generator' },
  { to: '/app/workspace/1', icon: MonitorPlay, label: 'Workspace IDE' },
  { to: '/app/file-analyzer', icon: Upload, label: 'File Analyzer' },
  { to: '/app/notes', icon: FileText, label: 'Notes' },
  { to: '/app/voice', icon: Mic, label: 'Voice Assistant' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
  { to: '/app/billing', icon: CreditCard, label: 'Billing' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  return (
  <>
    {mobileOpen && (
      <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
    )}
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-white/10 bg-secondary/95 backdrop-blur-xl transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neon font-orbitron text-lg font-bold">
          H
        </div>
        <span className="font-orbitron text-lg font-bold tracking-wider">HARVOX AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item, i) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-neon-purple/20 text-white shadow-neon-purple'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-neon-blue shadow-neon-blue"
                  />
                )}
                <item.icon size={18} className={isActive ? 'text-neon-blue' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <NavLink to="/app/billing" onClick={onClose} className="block w-full">
          <NeonButton variant="pro" className="w-full text-sm">
            <Crown size={16} />
            Upgrade to Pro
          </NeonButton>
        </NavLink>
      </div>
    </aside>
  </>
  );
}
