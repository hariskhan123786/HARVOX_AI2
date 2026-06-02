import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(
    () => sessionStorage.getItem('admin_passcode_verified') === 'true'
  );
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleNumberPress = (num) => {
    setError('');
    if (passcode.length < 6) {
      const nextPasscode = passcode + num;
      setPasscode(nextPasscode);

      if (nextPasscode === '223356') {
        sessionStorage.setItem('admin_passcode_verified', 'true');
        setIsVerified(true);
      } else if (nextPasscode.length === 6) {
        setError('ACCESS DENIED: INVALID PASSCODE');
        setTimeout(() => setPasscode(''), 500);
      }
    }
  };

  const handleBackspace = () => {
    setError('');
    setPasscode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPasscode('');
  };

  useEffect(() => {
    if (isVerified) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumberPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        navigate('/app/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcode, isVerified, navigate]);

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

  if (!isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070B14] p-4 relative overflow-hidden font-poppins">
        {/* Futuristic grid / glow backgrounds */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <GlassCard className="p-8 border border-white/10 relative overflow-hidden group hover:border-neon-pink/40 hover:shadow-neon-pink transition-all duration-300" hover={false}>
            {/* Holographic scanning line effect */}
            <div 
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-pink to-transparent opacity-40 pointer-events-none" 
              style={{ animation: 'scanLine 3s linear infinite' }} 
            />
            
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Header Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-neon-pink/10 flex items-center justify-center border border-neon-pink/30 animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-neon-pink" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-neon-pink/20 blur-sm pointer-events-none -z-10" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-orbitron tracking-wider text-white">
                  ADMIN AUTHORIZATION
                </h2>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  Enter the secure 6-digit administration passcode to access restricted terminal consoles.
                </p>
              </div>

              {/* Dot indicators or passcode display */}
              <div className="flex justify-center space-x-3 my-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                      i < passcode.length
                        ? 'bg-neon-pink border-neon-pink shadow-[0_0_10px_#FF00C8]'
                        : 'border-white/20 bg-white/5'
                    }`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                  {error}
                </div>
              )}

              {/* Numerical Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberPress(num.toString())}
                    className="h-14 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all text-xl font-semibold flex items-center justify-center text-white cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="h-14 rounded-xl border border-white/5 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 transition-all text-sm font-semibold flex items-center justify-center text-red-400 cursor-pointer"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => handleNumberPress('0')}
                  className="h-14 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all text-xl font-semibold flex items-center justify-center text-white cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-14 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all text-sm font-semibold flex items-center justify-center text-muted cursor-pointer"
                >
                  DEL
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 w-full pt-4 border-t border-white/10">
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium text-muted flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Exit Terminal</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      {/* Admin Sidebar */}
      <GlassCard className="w-64 flex-shrink-0 flex flex-col h-full rounded-none border-y-0 border-l-0 border-r border-white/10" hover={false}>
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
