import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightPanel from './RightPanel';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../utils/cn';

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const loadUser = useAuthStore((s) => s.loadUser);
  const { isCollapsed } = useSidebarStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const isChatPage = location.pathname === '/app/chat';

  if (isChatPage) {
    return (
      <div className="flex h-screen w-screen bg-transparent overflow-hidden">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
      )}>
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20, scale: 0.95, rotateX: -10 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: 10 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                  className="w-full h-full"
                >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
