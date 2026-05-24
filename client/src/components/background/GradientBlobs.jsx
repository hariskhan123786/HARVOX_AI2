import { motion } from 'framer-motion';

export default function GradientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-neon-purple blur-[120px] opacity-30 mix-blend-screen will-change-transform animate-depthFloat depth-layer-1"
      />
      <motion.div
        animate={{
          x: [0, -150, 0],
          y: [0, 150, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-neon-blue blur-[100px] opacity-20 mix-blend-screen will-change-transform animate-depthFloat depth-layer-2"
      />
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-neon-pink blur-[150px] opacity-20 mix-blend-screen will-change-transform animate-depthFloat depth-layer-3"
      />
    </div>
  );
}
