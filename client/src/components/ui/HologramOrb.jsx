import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function HologramOrb({ onClick, className }) {
  return (
    <motion.div
      className={`relative cursor-pointer group ${className || ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer Glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -inset-4 rounded-full bg-neon-purple/20 blur-xl group-hover:bg-neon-blue/30 transition-colors duration-500"
      />

      {/* Orbiting Rings */}
      <motion.div
        animate={{ rotateZ: 360, rotateX: 60 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-neon-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        style={{ transformStyle: 'preserve-3d' }}
      />
      <motion.div
        animate={{ rotateZ: -360, rotateY: 60 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-neon-purple/40 shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        style={{ transformStyle: 'preserve-3d' }}
      />

      {/* Core Orb */}
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-neon-purple/40 to-neon-blue/30 backdrop-blur-md border border-white/10 shadow-neon-purple overflow-hidden">
        {/* Hologram Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none" />
        
        {/* Inner Pulse */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-neon mix-blend-overlay"
        />

        <Bot size={32} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10" />
      </div>
    </motion.div>
  );
}
