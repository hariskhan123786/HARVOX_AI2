import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function NeonButton({
  children,
  variant = 'primary',
  className,
  disabled,
  ...props
}) {
  const variants = {
    primary:
      'bg-gradient-neon text-white shadow-neon-purple hover:shadow-neon-blue border-0',
    secondary:
      'bg-transparent border border-neon-purple/50 text-white hover:border-neon-blue hover:shadow-neon-blue',
    pro: 'bg-gradient-pro text-white shadow-neon-pink',
  };

  return (
    <motion.button
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
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-sweep pointer-events-none transform -translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
