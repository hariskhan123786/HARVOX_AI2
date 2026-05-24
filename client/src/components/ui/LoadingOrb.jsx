import { motion } from 'framer-motion';

export default function LoadingOrb({ text = 'Thinking...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      <div className="relative h-20 w-20 perspective-1000">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full bg-neon-purple/20 blur-xl"
        />
        <motion.div
          animate={{ rotateZ: 360, rotateX: 60 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          style={{ transformStyle: 'preserve-3d' }}
        />
        <motion.div
          animate={{ rotateZ: -360, rotateY: 60 }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="absolute inset-2 rounded-full border border-neon-purple shadow-[0_0_15px_rgba(138,43,226,0.4)]"
          style={{ transformStyle: 'preserve-3d' }}
        />
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute inset-4 rounded-full bg-gradient-neon shadow-neon-purple"
        />
      </div>
      <p className="font-orbitron text-sm text-neon-blue tracking-widest uppercase animate-pulse">{text}</p>
    </motion.div>
  );
}
