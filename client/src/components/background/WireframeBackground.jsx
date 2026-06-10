import { useEffect, useRef } from 'react';

export default function WireframeBackground() {
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

    // 12 Vertices of an Icosahedron
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1,  phi,  0],
      [ 1,  phi,  0],
      [-1, -phi,  0],
      [ 1, -phi,  0],
      [ 0, -1,  phi],
      [ 0,  1,  phi],
      [ 0, -1, -phi],
      [ 0,  1, -phi],
      [ phi,  0, -1],
      [ phi,  0,  1],
      [-phi,  0, -1],
      [-phi,  0,  1],
    ];

    // Normalize vertices to lie on a sphere of radius 1
    const vertices = rawVertices.map(([x, y, z]) => {
      const len = Math.sqrt(x*x + y*y + z*z);
      return [x / len, y / len, z / len];
    });

    // Find edges (connections between vertices that are a certain distance apart)
    // For a unit icosahedron, the distance between adjacent vertices is ~1.05.
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dx = vertices[i][0] - vertices[j][0];
        const dy = vertices[i][1] - vertices[j][1];
        const dz = vertices[i][2] - vertices[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        // Adjacent vertices are distance ~1.05 apart (we use a tolerance of 1.1)
        if (dist < 1.1) {
          edges.push([i, j]);
        }
      }
    }

    let angleX = 0.05;
    let angleY = 0.08;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // Size: 25% of viewport width or height, max 250px, min 100px
      const scale = Math.min(250, Math.max(100, Math.min(canvas.width, canvas.height) * 0.25));

      // Slow rotation over time
      angleX += 0.0015;
      angleY += 0.002;

      // Rotation matrices
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project 3D vertices to 2D
      const projected = vertices.map(([x, y, z]) => {
        // Rotate X
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotate Y
        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        // Perspective projection
        const depth = 2.5; // camera distance
        const perspective = depth / (depth - z2);
        
        return [
          x2 * scale * perspective + centerX,
          y1 * scale * perspective + centerY
        ];
      });

      // Draw Edges
      ctx.lineWidth = 1;
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        // Fade lines based on average depth to give 3D depth feeling
        const z1 = vertices[i][2];
        const z2 = vertices[j][2];
        const avgZ = (z1 + z2) / 2; // -1 to 1
        const alpha = Math.max(0.1, (avgZ + 1) / 2 * 0.25); // mapped to 0.1 - 0.35

        ctx.strokeStyle = `rgba(223, 255, 0, ${alpha})`; // Acid yellow color overlay
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      });

      // Draw Vertices (dots)
      projected.forEach((p, idx) => {
        const z = vertices[idx][2];
        const size = Math.max(1.5, (z + 1) * 2);
        const alpha = Math.max(0.15, (z + 1) / 2 * 0.4);

        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`; // Neon blue dots
        ctx.beginPath();
        ctx.arc(p[0], p[1], size, 0, Math.PI * 2);
        ctx.fill();

        // Small neon glow around front vertices
        if (z > 0.5) {
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 8;
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(p[0], p[1], size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
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
      className="absolute inset-0 pointer-events-none z-0 opacity-20 mix-blend-screen"
    />
  );
}
