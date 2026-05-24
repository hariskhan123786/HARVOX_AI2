import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, FileCode, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { id: '1', title: 'Open Terminal', icon: Terminal, path: '/app/workspace/1' },
  { id: '2', title: 'Generate UI Component', icon: FileCode, path: '/app/code-generator' },
  { id: '3', title: 'Start Live Preview', icon: Play, path: '/app/workspace/1' },
  { id: '4', title: 'Ask AI Assistant', icon: Sparkles, path: '/app/chat' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleAction = (path) => {
    setOpen(false);
    navigate(path);
  };

  const filtered = actions.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[20%] z-[1000] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#070B14]/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
              <Search size={20} className="text-neon-blue" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent font-orbitron text-lg outline-none placeholder:text-muted"
              />
              <span className="rounded border border-white/20 px-2 py-0.5 text-xs text-muted">ESC</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted">No commands found.</div>
              ) : (
                filtered.map((action, i) => (
                  <div
                    key={action.id}
                    onClick={() => handleAction(action.path)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-neon-purple">
                      <action.icon size={18} />
                    </div>
                    <span className="font-orbitron text-sm">{action.title}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
