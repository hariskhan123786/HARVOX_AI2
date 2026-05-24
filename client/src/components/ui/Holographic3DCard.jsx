import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Holographic3DCard({ children, className }) {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 ${className || ''}`}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full rounded-2xl border border-white/10 bg-secondary/80 backdrop-blur-xl shadow-glass overflow-hidden group cursor-pointer transition-shadow duration-300 hover:shadow-neon-purple hover:border-neon-purple/40"
      >
        {/* Holographic Shimmer on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/0 via-white/5 to-neon-blue/0 opacity-0 group-hover:opacity-100 group-hover:animate-sweep pointer-events-none transform -translate-x-full" />
        
        {/* Internal Content (Pushed forward for 3D effect) */}
        <div 
          className="relative h-full w-full p-6"
          style={{ transform: 'translateZ(30px)' }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
