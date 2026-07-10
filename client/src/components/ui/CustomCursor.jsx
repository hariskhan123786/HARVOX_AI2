import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const onOver = (e) => {
      const el = e.target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer');
      setIsHovering(!!el);
    };

    const onDown = () => setIsClicking(true);
    const onUp   = () => setIsClicking(false);

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
          marginTop: isHovering ? -26 : -18,
          marginLeft: isHovering ? -26 : -18,
          border: `1.5px solid ${isHovering ? '#00F0FF' : '#8A2BE2'}`,
          background: isHovering ? 'rgba(0,240,255,0.06)' : 'rgba(138,43,226,0.06)',
          boxShadow: isHovering
            ? '0 0 16px rgba(0,240,255,0.35), inset 0 0 8px rgba(0,240,255,0.1)'
            : '0 0 12px rgba(138,43,226,0.35), inset 0 0 6px rgba(138,43,226,0.1)',
          // Smooth follow transition (hardware accelerated)
          transition: 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1), width 0.25s ease, height 0.25s ease, margin 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          willChange: 'transform, width, height',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      />

      {/* ── Inner dot ── */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          width: isClicking ? 14 : isHovering ? 0 : 7,
          height: isClicking ? 14 : isHovering ? 0 : 7,
          marginTop: isClicking ? -7 : isHovering ? 0 : -3.5,
          marginLeft: isClicking ? -7 : isHovering ? 0 : -3.5,
          background: isClicking
            ? 'radial-gradient(circle, #FF00C8, #8A2BE2)'
            : 'radial-gradient(circle, #00F0FF, #8A2BE2)',
          boxShadow: isClicking
            ? '0 0 18px #FF00C8, 0 0 30px rgba(255,0,200,0.5)'
            : '0 0 10px #00F0FF, 0 0 20px rgba(0,240,255,0.4)',
          transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease',
          willChange: 'transform, width, height',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      />
    </>
  );
}

