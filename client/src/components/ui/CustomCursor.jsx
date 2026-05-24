import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering]   = useState(false);
  const [isClicking, setIsClicking]   = useState(false);
  const [trail, setTrail]             = useState([]);
  const trailRef                      = useRef([]);
  const frameRef                      = useRef(null);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  /* Main dot — snappy */
  const dotX = useSpring(rawX, { stiffness: 800, damping: 40 });
  const dotY = useSpring(rawY, { stiffness: 800, damping: 40 });

  /* Ring — lags behind for a "following" feel */
  const ringX = useSpring(rawX, { stiffness: 200, damping: 28 });
  const ringY = useSpring(rawY, { stiffness: 200, damping: 28 });

  const addTrail = useCallback((x, y) => {
    const now = Date.now();
    trailRef.current = [
      { x, y, id: now },
      ...trailRef.current.filter(p => now - p.id < 600),
    ].slice(0, 10);
    setTrail([...trailRef.current]);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => addTrail(e.clientX, e.clientY));
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
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [rawX, rawY, addTrail]);

  return (
    <>
      {/* ── Particle trail ── */}
      {trail.map((p, i) => (
        <motion.div
          key={p.id}
          className="pointer-events-none fixed z-[9990] rounded-full"
          style={{
            left: p.x,
            top:  p.y,
            width:  `${6 - i * 0.5}px`,
            height: `${6 - i * 0.5}px`,
            background: i % 3 === 0 ? '#8A2BE2' : i % 3 === 1 ? '#00F0FF' : '#FF00C8',
            opacity: Math.max(0, (10 - i) / 10) * 0.6,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(1px)',
            boxShadow: `0 0 6px ${i % 3 === 0 ? '#8A2BE2' : i % 3 === 1 ? '#00F0FF' : '#FF00C8'}`,
          }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* ── Outer ring ── */}
      <motion.div
        className="pointer-events-none fixed z-[9997] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: ringX,
          y: ringY,
          width:  isHovering ? 52 : 36,
          height: isHovering ? 52 : 36,
          border: `1.5px solid ${isHovering ? '#00F0FF' : '#8A2BE2'}`,
          background: isHovering ? 'rgba(0,240,255,0.06)' : 'rgba(138,43,226,0.06)',
          boxShadow: isHovering
            ? '0 0 16px rgba(0,240,255,0.35), inset 0 0 8px rgba(0,240,255,0.1)'
            : '0 0 12px rgba(138,43,226,0.35), inset 0 0 6px rgba(138,43,226,0.1)',
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        }}
      />

      {/* ── Inner dot ── */}
      <motion.div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: dotX,
          y: dotY,
          width:  isClicking ? 14 : isHovering ? 0 : 7,
          height: isClicking ? 14 : isHovering ? 0 : 7,
          background: isClicking
            ? 'radial-gradient(circle, #FF00C8, #8A2BE2)'
            : 'radial-gradient(circle, #00F0FF, #8A2BE2)',
          boxShadow: isClicking
            ? '0 0 18px #FF00C8, 0 0 30px rgba(255,0,200,0.5)'
            : '0 0 10px #00F0FF, 0 0 20px rgba(0,240,255,0.4)',
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      />

      {/* ── Click burst ring ── */}
      {isClicking && (
        <motion.div
          className="pointer-events-none fixed z-[9996] -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-pink"
          style={{ x: dotX, y: dotY }}
          initial={{ width: 12, height: 12, opacity: 1 }}
          animate={{ width: 60, height: 60, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </>
  );
}
