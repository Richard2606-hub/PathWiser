'use client';

import { useEffect, useRef } from 'react';

/**
 * Ambient particle canvas behind the hero content.
 * Yellow particles connected by faint lines. Prefers-reduced-motion respected.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced-motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{ x: number; y: number; r: number; dx: number; dy: number; o: number }> = [];
    let raf = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;
      // Regenerate particles proportional to viewport
      const count = Math.min(60, Math.floor((displayW * displayH) / 20000));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * displayW,
        y: Math.random() * displayH,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        o: Math.random() * 0.5 + 0.2,
      }));
    };

    const draw = () => {
      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;
      ctx.clearRect(0, 0, displayW, displayH);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = displayW;
        if (p.x > displayW) p.x = 0;
        if (p.y < 0) p.y = displayH;
        if (p.y > displayH) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250,204,21,${p.o})`;
        ctx.fill();
      }
      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(250,204,21,${0.08 * (1 - d / 120)})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
