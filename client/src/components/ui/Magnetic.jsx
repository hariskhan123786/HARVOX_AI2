import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * A wrapper component that applies a magnetic attraction effect to its child.
 * Uses high-performance GSAP quickTo and handles cleanups automatically.
 */
export default function Magnetic({ children, range = 35, strength = 0.3 }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      
      const distance = Math.hypot(deltaX, deltaY);
      
      if (distance < range) {
        // Smoothly pull element toward the mouse pointer
        xTo(deltaX * strength);
        yTo(deltaY * strength);
      } else {
        // Return to center when mouse drifts outside of range
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      // Snap or return smoothly to initial coordinates
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="inline-block transition-transform duration-200">
      {children}
    </div>
  );
}
