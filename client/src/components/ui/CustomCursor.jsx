import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useGSAP((context, contextSafe) => {
    if (!ringRef.current || !dotRef.current) return;

    // Use gsap.quickTo for high-performance sub-pixel positioning
    const xToRing = gsap.quickTo(ringRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const yToRing = gsap.quickTo(ringRef.current, "y", { duration: 0.35, ease: "power3.out" });

    const xToDot = gsap.quickTo(dotRef.current, "x", { duration: 0.08, ease: "power3.out" });
    const yToDot = gsap.quickTo(dotRef.current, "y", { duration: 0.08, ease: "power3.out" });

    // Set initial position offscreen and center the elements on mouse
    gsap.set([ringRef.current, dotRef.current], { xPercent: -50, yPercent: -50 });

    const onMove = contextSafe((e) => {
      xToRing(e.clientX);
      yToRing(e.clientY);
      xToDot(e.clientX);
      yToDot(e.clientY);
    });

    const onOver = contextSafe((e) => {
      const el = e.target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer');
      setIsHovering(!!el);
    });

    const onDown = contextSafe(() => setIsClicking(true));
    const onUp   = contextSafe(() => setIsClicking(false));

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  return (
    <>
      {/* ── Outer ring ── */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] rounded-full"
        style={{
          width: isHovering ? 52 : 36,
          height: isHovering ? 52 : 36,
          border: `1.5px solid ${isHovering ? '#00F0FF' : '#8A2BE2'}`,
          background: isHovering ? 'rgba(0,240,255,0.06)' : 'rgba(138,43,226,0.06)',
          boxShadow: isHovering
            ? '0 0 16px rgba(0,240,255,0.35), inset 0 0 8px rgba(0,240,255,0.1)'
            : '0 0 12px rgba(138,43,226,0.35), inset 0 0 6px rgba(138,43,226,0.1)',
          // Smooth width/height/border updates (transform handled by GSAP)
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          willChange: 'transform, width, height',
          left: 0,
          top: 0
        }}
      />

      {/* ── Inner dot ── */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          width: isClicking ? 14 : isHovering ? 0 : 7,
          height: isClicking ? 14 : isHovering ? 0 : 7,
          background: isClicking
            ? 'radial-gradient(circle, #FF00C8, #8A2BE2)'
            : 'radial-gradient(circle, #00F0FF, #8A2BE2)',
          boxShadow: isClicking
            ? '0 0 18px #FF00C8, 0 0 30px rgba(255,0,200,0.5)'
            : '0 0 10px #00F0FF, 0 0 20px rgba(0,240,255,0.4)',
          transition: 'width 0.2s ease, height 0.2s ease',
          willChange: 'transform, width, height',
          left: 0,
          top: 0
        }}
      />
    </>
  );
}
