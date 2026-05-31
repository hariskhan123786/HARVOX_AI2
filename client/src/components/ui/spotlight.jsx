import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "../../utils/cn";

export default function Spotlight({
  className = "",
  fill = "rgba(138, 43, 226, 0.15)", // Custom Neon Purple highlight base
  size = 400,
  interactive = true,
}) {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic template calculated at top-level to resolve Hook Rule violation
  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      ${size}px circle at ${mouseX}px ${mouseY}px,
      ${fill},
      transparent 80%
    )
  `;

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (event) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Relative mouse coordinate offsets
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", () => setIsHovered(true));
      container.addEventListener("mouseleave", () => setIsHovered(false));
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", () => setIsHovered(true));
        container.removeEventListener("mouseleave", () => setIsHovered(false));
      }
    };
  }, [interactive, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden z-0",
        className
      )}
    >
      {/* Animated Static Spotlight Base */}
      <svg
        className="absolute inset-0 w-full h-full animate-pulseSlow opacity-30 select-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <g filter="url(#filter-spotlight)">
          <ellipse
            cx="720"
            cy="100"
            rx="500"
            ry="250"
            fill="url(#gradient-radial-base)"
          />
        </g>
        <defs>
          <filter
            id="filter-spotlight"
            x="-200"
            y="-200"
            width="1840"
            height="900"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="120" result="effect-blur" />
          </filter>
          <radialGradient
            id="gradient-radial-base"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(720 100) rotate(90) scale(250 500)"
          >
            <stop stopColor="#8b00ff" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#00f0ff" stopOpacity="0.1" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Interactive Cursor Tracking Radial Glow */}
      {interactive && (
        <motion.div
          className="absolute inset-0 transition-opacity duration-500 rounded-3xl"
          style={{
            background: spotlightBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}
