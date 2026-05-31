import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "../../utils/cn";

export default function HologramCard({
  children,
  className = "",
  glowColor = "from-neon-purple/30 via-neon-blue/20 to-neon-pink/30",
  borderColor = "border-white/10 hover:border-neon-purple/50",
  ...props
}) {
  const ref = useRef(null);

  // Motion Values for custom cursor/shine tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Soft spring configuration for silky smooth animations
  const springConfig = { stiffness: 120, damping: 20 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Dynamic transforms for 3D Perspective Tilt
  const rotateX = useTransform(springY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-12deg", "12deg"]);

  // Dynamic transforms for shine tracking
  const shineX = useTransform(springX, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(springY, [-0.5, 0.5], ["0%", "100%"]);

  // Dynamic holographic radial gradient template matching tracking cursor
  const shineBackground = useMotionTemplate`
    radial-gradient(
      280px circle at ${shineX} ${shineY},
      rgba(0, 240, 255, 0.15) 0%,
      rgba(138, 43, 226, 0.15) 35%,
      transparent 80%
    )
  `;

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Normalize coordinates from -0.5 to 0.5
    const xVal = (e.clientX - rect.left) / rect.width - 0.5;
    const yVal = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(xVal);
    mouseY.set(yVal);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn("perspective-1000 w-full", className)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative rounded-2xl border bg-black/50 backdrop-blur-lg overflow-hidden shadow-2xl p-6 transition-colors duration-500",
          borderColor
        )}
        {...props}
      >
        {/* Glow behind the card */}
        <div
          className={cn(
            "absolute -inset-2 bg-gradient-to-tr blur-xl opacity-30 transition-opacity duration-500 rounded-2xl pointer-events-none -z-10",
            isHovered ? "opacity-75" : "opacity-30",
            glowColor
          )}
        />

        {/* Cyber scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />

        {/* Dynamic Holographic Shine Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-500"
          style={{
            background: shineBackground,
            opacity: isHovered ? 1 : 0,
            mixBlendMode: "screen",
          }}
        />

        {/* Neon pulse border overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none border border-transparent rounded-2xl z-30"
          style={{
            boxShadow: isHovered
              ? "inset 0 0 12px rgba(138, 43, 226, 0.2), inset 0 0 4px rgba(0, 240, 255, 0.2)"
              : "none",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Content wrapper with perspective translation */}
        <div
          className="relative z-10 flex flex-col h-full"
          style={{ transform: "translateZ(30px)", willChange: "transform" }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
