import { Menu, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuthStore();

  return (
    <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-primary/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted hover:text-white mr-4"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="text-lg font-bold text-white hidden lg:block">
          Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted hover:text-neon-blue transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_8px_rgba(255,0,200,0.8)]"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-muted capitalize">{user?.subscription || 'Free'} Plan</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue p-[2px]">
            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-muted" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
