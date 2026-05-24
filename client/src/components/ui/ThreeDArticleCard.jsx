import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function ThreeDArticleCard({ image, title, description, reverse }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`flex flex-col gap-10 md:items-center ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} mb-32`}
    >
      <motion.div
        className="relative flex-1 group perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-full rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-1 shadow-2xl shadow-neon-purple/20 border border-white/10 overflow-hidden cursor-pointer"
        >
          {/* Internal gradient sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-sweep pointer-events-none transform -translate-x-full transition-all duration-1000" />
          
          <img
            src={image}
            alt={title}
            className="w-full h-auto object-cover rounded-xl bg-[#040B16] transform transition-transform duration-500 group-hover:scale-105"
            style={{ transform: 'translateZ(50px)' }}
          />
        </motion.div>
      </motion.div>

      <div className="flex-1 space-y-4 px-4">
        <h3 className="font-orbitron text-3xl font-bold gradient-text">{title}</h3>
        <p className="text-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
