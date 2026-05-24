import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '../../utils/cn';

export default function GlassCard({ children, className, hover = true, ...props }) {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e) => {
    if (!hover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (!hover) return;
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(hover && "perspective-1000", className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          rotateX: hover ? rotateX : 0,
          rotateY: hover ? rotateY : 0,
          transformStyle: 'preserve-3d'
        }}
        whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        className={cn('glass rounded-2xl p-5 relative overflow-hidden', hover && 'glass-hover cursor-pointer group')}
        {...props}
      >
        {hover && (
          <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/0 via-white/5 to-neon-blue/0 opacity-0 group-hover:opacity-100 group-hover:animate-sweep pointer-events-none transform -translate-x-full" />
        )}
        <div style={{ transform: hover ? 'translateZ(10px)' : 'none' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
