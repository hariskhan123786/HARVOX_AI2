import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function NeonButton({
  children,
  variant = 'primary',
  className,
  disabled,
  magnetic = false,
  ...props
}) {
  const variants = {
    primary:
      'bg-gradient-neon text-white shadow-neon-purple hover:shadow-neon-blue border-0',
    secondary:
      'bg-transparent border border-neon-purple/50 text-white hover:border-neon-blue hover:shadow-neon-blue',
    outline:
      'bg-transparent border border-white/20 text-white hover:border-neon-blue hover:bg-white/[0.02]',
    pro: 'bg-gradient-pro text-white shadow-neon-pink',
    acid: 'bg-acid text-black font-hero font-bold tracking-wider hover:bg-lime active:bg-volt shadow-neon-acid transition-colors',
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    if (!magnetic || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX * 0.35);
    y.set(mouseY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={magnetic && !disabled ? { x: springX, y: springY } : {}}
      onMouseMove={magnetic ? handleMouseMove : undefined}
      onMouseLeave={magnetic ? handleMouseLeave : undefined}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.95, y: disabled ? 0 : 2 }}
      disabled={disabled}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant !== 'acid' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-sweep pointer-events-none transform -translate-x-full" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
