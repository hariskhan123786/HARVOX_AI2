import { motion } from 'framer-motion';

export default function AuroraBorealis() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen z-0">
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.15)_0%,rgba(138,43,226,0.1)_30%,transparent_70%)] animate-aurora blur-3xl"
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <motion.div
        className="absolute top-1/4 -right-1/4 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(255,0,200,0.1)_0%,rgba(0,240,255,0.1)_40%,transparent_70%)] animate-aurora blur-3xl"
        style={{
          backgroundSize: '200% 200%',
          animationDelay: '-5s',
          animationDuration: '25s',
        }}
      />
    </div>
  );
}
