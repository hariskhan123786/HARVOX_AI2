import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Terminal, FileCode, Play, Sparkles, LayoutDashboard,
  Brain, User, Settings, CreditCard, Music, MousePointer, Keyboard,
  HelpCircle, ChevronRight, CornerDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navigationActions = [
  { id: 'nav-dash', title: 'Navigate to Dashboard', subtitle: 'View main console stats & logs', icon: LayoutDashboard, category: 'Navigation', action: (nav) => nav('/app/dashboard') },
  { id: 'nav-chat', title: 'Navigate to Chat Assistant', subtitle: 'Interact with Gemini / Groq models', icon: Sparkles, category: 'Navigation', action: (nav) => nav('/app/chat') },
  { id: 'nav-codegen', title: 'Navigate to Code Generator', subtitle: 'Auto-compose files & scripts', icon: FileCode, category: 'Navigation', action: (nav) => nav('/app/code-generator') },
  { id: 'nav-workspace', title: 'Navigate to Workspace IDE', subtitle: 'Launch Monaco code workspace', icon: Terminal, category: 'Navigation', action: (nav) => nav('/app/workspace/default') },
  { id: 'nav-brain', title: 'Navigate to Brain Core', subtitle: 'Inspect operator knowledge graphs', icon: Brain, category: 'Navigation', action: (nav) => nav('/app/brain') },
  { id: 'nav-voice', title: 'Navigate to Voice Assistant', subtitle: 'Trigger telemetry voice controls', icon: Sparkles, category: 'Navigation', action: (nav) => nav('/app/voice') },
  { id: 'nav-profile', title: 'Navigate to Profile', subtitle: 'View operator profile matrix', icon: User, category: 'Navigation', action: (nav) => nav('/app/profile') },
  { id: 'nav-billing', title: 'Navigate to Billing', subtitle: 'Manage billing & subscriptions', icon: CreditCard, category: 'Navigation', action: (nav) => nav('/app/billing') },
  { id: 'nav-settings', title: 'Navigate to Settings', subtitle: 'Configure API keys & themes', icon: Settings, category: 'Navigation', action: (nav) => nav('/app/settings') },
];

const automationActions = [
  { id: 'auto-typer', title: 'Launch AI Ghost Typer', subtitle: 'Simulate keystrokes into any window', icon: Keyboard, category: 'Automation', isNestedTrigger: 'typer' },
  { id: 'auto-click', title: 'Trigger Virtual Mouse Click', subtitle: 'Perform click at coords or UI target', icon: MousePointer, category: 'Automation', isNestedTrigger: 'click' },
  { id: 'auto-music', title: 'Play Voice Music Telemetry', subtitle: 'Open Spotify/YouTube player widgets', icon: Music, category: 'Automation', isNestedTrigger: 'music' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentMenu, setCurrentMenu] = useState('main'); // 'main' | 'typer' | 'click' | 'music'
  
  // Custom nested parameters input
  const [nestedInputVal, setNestedInputVal] = useState('');
  
  const navigate = useNavigate();
  const listRef = useRef(null);

  // Global Ctrl+K trigger
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        setCurrentMenu('main');
        setSearch('');
        setNestedInputVal('');
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Keyboard navigation inside list
  const activeActions = React.useMemo(() => {
    if (currentMenu !== 'main') return [];
    const all = [...navigationActions, ...automationActions];
    if (!search) return all;
    return all.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentMenu, search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, currentMenu]);

  useEffect(() => {
    // Scroll selected item into view if necessary
    const container = listRef.current;
    if (!container) return;
    const selectedEl = container.children[selectedIndex];
    if (!selectedEl) return;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const elemTop = selectedEl.offsetTop;
    const elemBottom = elemTop + selectedEl.clientHeight;

    if (elemTop < containerTop) {
      container.scrollTop = elemTop;
    } else if (elemBottom > containerBottom) {
      container.scrollTop = elemBottom - container.clientHeight;
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKeys = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
      
      // If we are in main menu
      if (currentMenu === 'main') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % activeActions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + activeActions.length) % activeActions.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const active = activeActions[selectedIndex];
          if (active) {
            if (active.isNestedTrigger) {
              setCurrentMenu(active.isNestedTrigger);
              setSearch('');
            } else if (active.action) {
              active.action(navigate);
              setOpen(false);
            }
          }
        }
      } 
      // If we are in nested param input menus
      else {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerNestedAction();
        } else if (e.key === 'Backspace' && !nestedInputVal) {
          e.preventDefault();
          setCurrentMenu('main');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [open, selectedIndex, activeActions, currentMenu, nestedInputVal]);

  const triggerNestedAction = async () => {
    if (!nestedInputVal.trim()) return;
    
    // We send request to automation route directly via fetch
    try {
      let actionName = '';
      if (currentMenu === 'typer') actionName = 'type_text';
      else if (currentMenu === 'click') actionName = 'click_element';
      else if (currentMenu === 'music') actionName = 'play_music';

      const token = localStorage.getItem('harvox_token');
      await fetch('/api/automation/execute-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          step: {
            action: actionName,
            args: [nestedInputVal]
          }
        })
      });
    } catch (err) {
      console.error('Command Palette nested action failed:', err);
    }
    
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[15%] z-[10000] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#07050f]/95 shadow-[0_0_50px_rgba(138,43,226,0.3)] backdrop-blur-2xl"
          >
            {/* Header Search */}
            {currentMenu === 'main' ? (
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5">
                <Search size={18} className="text-neon-blue animate-pulse" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Fuzzy search views or automations..."
                  className="w-full bg-transparent font-orbitron text-sm outline-none placeholder:text-gray-500 text-white"
                />
                <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] font-mono text-gray-500">ESC</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 bg-white/2">
                <div className="flex items-center gap-1 text-neon-purple text-xs font-orbitron font-black uppercase">
                  <span>{currentMenu}</span>
                  <ChevronRight size={10} />
                </div>
                <input
                  autoFocus
                  value={nestedInputVal}
                  onChange={(e) => setNestedInputVal(e.target.value)}
                  placeholder={
                    currentMenu === 'typer' ? "Enter text parameters to auto-inject..." :
                    currentMenu === 'click' ? "Enter coordinates (e.g. 500,300) or element name..." :
                    "Enter song/playlist name to search..."
                  }
                  className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-gray-600 text-white"
                />
                <button
                  onClick={() => setCurrentMenu('main')}
                  className="text-[9px] font-mono text-gray-500 hover:text-white"
                >
                  [Back]
                </button>
              </div>
            )}

            {/* List */}
            {currentMenu === 'main' ? (
              <div 
                ref={listRef} 
                className="max-h-[340px] overflow-y-auto p-2 scrollbar-thin divide-y divide-white/2"
                style={{ scrollbarWidth: 'thin' }}
              >
                {activeActions.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-gray-500 flex flex-col items-center gap-1.5">
                    <HelpCircle size={16} />
                    No synaptic actions found matching search query.
                  </div>
                ) : (
                  activeActions.map((action, i) => {
                    const ActIcon = action.icon;
                    const isSelected = selectedIndex === i;
                    return (
                      <div
                        key={action.id}
                        onMouseEnter={() => setSelectedIndex(i)}
                        onClick={() => {
                          if (action.isNestedTrigger) {
                            setCurrentMenu(action.isNestedTrigger);
                          } else if (action.action) {
                            action.action(navigate);
                            setOpen(false);
                          }
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-all duration-150 ${
                          isSelected
                            ? 'bg-white/5 border-l-2 border-neon-purple pl-2.5 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]'
                            : 'bg-transparent border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                            isSelected 
                              ? 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple' 
                              : 'bg-white/3 border-white/5 text-gray-500'
                          }`}>
                            <ActIcon size={16} />
                          </div>
                          <div>
                            <span className={`font-orbitron text-xs block font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {action.title}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono block mt-0.5">{action.subtitle}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 text-[8px] font-mono text-gray-500 bg-black/45 px-1.5 py-0.5 rounded border border-white/10">
                            <span>ENTER</span>
                            <CornerDownLeft size={8} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="p-5 space-y-3 font-mono text-[10px] text-gray-500">
                <p className="text-gray-400">⚡ HARVOX NEURAL ACTION ACTIVE</p>
                <div className="bg-black/35 rounded-xl border border-white/5 p-3 space-y-1">
                  <p className="text-neon-blue">&gt; SYSTEM COMPONENT: OS EXECUTOR</p>
                  <p>
                    {currentMenu === 'typer' && "Types matching text parameters into the focused application window char-by-char."}
                    {currentMenu === 'click' && "Moves physical pointer and registers left clicks dynamically."}
                    {currentMenu === 'music' && "Opens player frames and navigates controls."}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Backspace: Back to main</span>
                  <button
                    onClick={triggerNestedAction}
                    className="px-3.5 py-1.5 rounded-xl bg-neon-purple hover:bg-neon-purple/80 text-white font-orbitron font-bold tracking-wider"
                  >
                    Execute Command
                  </button>
                </div>
              </div>
            )}

            {/* Sticky footer info */}
            <div className="bg-black/30 px-4 py-2 text-[9px] font-mono text-gray-600 border-t border-white/5 flex justify-between">
              <span>Arrow Keys: Navigate</span>
              <span>Ctrl+K: Toggle Palette</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
