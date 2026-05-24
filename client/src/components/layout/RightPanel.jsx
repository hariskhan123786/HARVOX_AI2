import { Activity, Cpu, Database } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useAuthStore } from '../../store/authStore';

export default function RightPanel() {
  const { user } = useAuthStore();
  
  if (!user) return null;

  return (
    <div className="hidden xl:block w-72 p-6 border-l border-white/10 overflow-y-auto">
      <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-6">System Status</h3>
      
      <div className="space-y-4">
        <GlassCard className="p-4 bg-primary/40 border-white/5">
          <div className="flex items-center mb-2">
            <Cpu className="w-4 h-4 mr-2 text-neon-blue" />
            <span className="text-sm font-medium text-white">AI Engine</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs text-muted">Llama 3.3 70B</span>
            <span className="text-xs text-green-400 font-mono">Online</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-primary/40 border-white/5">
          <div className="flex items-center mb-2">
            <Database className="w-4 h-4 mr-2 text-neon-purple" />
            <span className="text-sm font-medium text-white">Workspace Storage</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-1 mt-2">
            <div className="bg-gradient-to-r from-neon-purple to-neon-blue h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted">45% used</span>
            <span className="text-[10px] text-muted">1GB max</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-primary/40 border-white/5">
          <div className="flex items-center mb-2">
            <Activity className="w-4 h-4 mr-2 text-neon-pink" />
            <span className="text-sm font-medium text-white">Daily Usage</span>
          </div>
          <div className="text-center mt-3 mb-1">
            <span className="text-2xl font-bold gradient-text">{user.dailyUsage || 0}</span>
            <span className="text-xs text-muted ml-1">/ {user.subscription === 'pro' ? '500' : '20'}</span>
          </div>
          <p className="text-[10px] text-center text-muted uppercase tracking-wider">AI Interactions</p>
        </GlassCard>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Quick Shortcuts</h3>
        <div className="space-y-2">
          <kbd className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-muted font-mono">
            <span>Command Palette</span>
            <span className="text-white">Ctrl+K</span>
          </kbd>
          <kbd className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-muted font-mono">
            <span>New Chat</span>
            <span className="text-white">Ctrl+N</span>
          </kbd>
        </div>
      </div>
    </div>
  );
}
