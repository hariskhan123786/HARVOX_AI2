import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MODES = [
  {
    id: 'professional',
    label: 'Professional',
    emoji: '💼',
    desc: 'Precise, technical, efficient',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-400/30',
    glow: 'shadow-[0_0_14px_rgba(59,130,246,0.25)]',
    activeBg: 'bg-blue-500/15',
    dotColor: '#3B82F6',
  },
  {
    id: 'friendly',
    label: 'Friendly',
    emoji: '😊',
    desc: 'Warm, supportive teammate',
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-emerald-400/30',
    glow: 'shadow-[0_0_14px_rgba(52,211,153,0.25)]',
    activeBg: 'bg-emerald-500/15',
    dotColor: '#34D399',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    emoji: '🎓',
    desc: 'Step-by-step teacher mode',
    gradient: 'from-purple-500/20 to-violet-500/20',
    border: 'border-purple-400/30',
    glow: 'shadow-[0_0_14px_rgba(167,139,250,0.25)]',
    activeBg: 'bg-purple-500/15',
    dotColor: '#A78BFA',
  },
  {
    id: 'playful',
    label: 'Playful',
    emoji: '🎮',
    desc: 'Humor with technical skills',
    gradient: 'from-orange-500/20 to-amber-500/20',
    border: 'border-amber-400/30',
    glow: 'shadow-[0_0_14px_rgba(251,191,36,0.25)]',
    activeBg: 'bg-amber-500/15',
    dotColor: '#FBBF24',
  },
  {
    id: 'flirty',
    label: 'Flirty',
    emoji: '😘',
    desc: 'Charming & witty banter',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-400/30',
    glow: 'shadow-[0_0_14px_rgba(236,72,153,0.25)]',
    activeBg: 'bg-pink-500/15',
    dotColor: '#EC4899',
  },
  {
    id: 'fun',
    label: 'Fun',
    emoji: '🎉',
    desc: 'Max energy, emojis & hype!',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-400/30',
    glow: 'shadow-[0_0_14px_rgba(234,179,8,0.25)]',
    activeBg: 'bg-yellow-500/15',
    dotColor: '#EAB308',
  },
];

export default function ModeSelector({ isOpen, onClose, currentMode, onSelect, anchorRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose, anchorRef]);

  const active = MODES.find((m) => m.id === currentMode) || MODES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute z-[9999] w-[320px] rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: 'rgba(5, 5, 18, 0.97)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 0 60px rgba(138,43,226,0.12), 0 20px 60px rgba(0,0,0,0.9)',
            bottom: '100%',
            left: 0,
            marginBottom: 8,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/5">
            <div>
              <h3 className="font-orbitron text-xs font-bold tracking-widest text-neon-purple uppercase">
                Personality Mode
              </h3>
              <p className="text-[9px] text-muted/50 font-mono mt-0.5">
                Active: <span style={{ color: active.dotColor }}>{active.emoji} {active.label}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Grid */}
          <div className="p-3 grid grid-cols-2 gap-2">
            {MODES.map((mode) => {
              const isSelected = currentMode === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onSelect(mode.id); onClose(); }}
                  className={`
                    relative flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer
                    ${isSelected
                      ? `${mode.activeBg} ${mode.border} ${mode.glow}`
                      : 'border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/15'
                    }
                  `}
                >
                  {/* Active indicator dot */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: mode.dotColor, boxShadow: `0 0 6px ${mode.dotColor}` }}
                    />
                  )}
                  <span className="text-lg leading-none">{mode.emoji}</span>
                  <p
                    className="text-xs font-bold font-orbitron tracking-wide"
                    style={{ color: isSelected ? mode.dotColor : 'rgba(255,255,255,0.85)' }}
                  >
                    {mode.label}
                  </p>
                  <p className="text-[9px] text-muted/50 font-mono leading-tight">
                    {mode.desc}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 pb-3 pt-1 border-t border-white/5">
            <p className="text-[8px] font-mono text-muted/30 text-center">
              Mode shapes AI personality for this session
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
