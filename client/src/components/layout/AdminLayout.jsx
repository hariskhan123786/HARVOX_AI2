import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, ArrowLeft } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      {/* Admin Sidebar */}
      <GlassCard className="w-64 flex-shrink-0 flex flex-col h-full rounded-none border-y-0 border-l-0 border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-neon-pink tracking-wider">HARVOX ADMIN</h2>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50'
                    : 'text-muted hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-muted hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Exit Admin</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </GlassCard>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <Outlet />
      </main>
    </div>
  );
}
