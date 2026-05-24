import { useEffect, useRef } from 'react';

export default function Starfield3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const stars = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      z: Math.random() * 2000,
    }));

    const draw = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.fillStyle = 'rgba(7, 11, 20, 0.2)'; // Primary color with trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.z -= 2;
        if (star.z <= 0) {
          star.x = Math.random() * 2000 - 1000;
          star.y = Math.random() * 2000 - 1000;
          star.z = 2000;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / 2000) * 3;
          const shade = parseInt((1 - star.z / 2000) * 255, 10);
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(${shade}, ${shade}, 255, ${(1 - star.z/2000)})`;
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
    />
  );
}
