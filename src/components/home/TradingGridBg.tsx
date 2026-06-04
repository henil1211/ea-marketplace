'use client';

import { useEffect, useRef } from 'react';

export default function TradingGridBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawGrid = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const spacing = 60;

      ctx.clearRect(0, 0, w, h);

      // Vertical grid lines
      ctx.strokeStyle = 'rgba(42, 45, 54, 0.5)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated candlestick-style chart line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(240, 185, 11, 0.12)';
      ctx.lineWidth = 1.5;
      const baseY = h * 0.45;
      const amplitude = h * 0.15;

      for (let x = 0; x < w; x += 2) {
        const y =
          baseY +
          Math.sin((x * 0.008) + time * 0.5) * amplitude * 0.5 +
          Math.sin((x * 0.015) + time * 0.8) * amplitude * 0.3 +
          Math.sin((x * 0.003) + time * 0.2) * amplitude * 0.7;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second line (profit green) below
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 192, 135, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 2) {
        const y =
          baseY + 40 +
          Math.sin((x * 0.01) + time * 0.3 + 1) * amplitude * 0.4 +
          Math.sin((x * 0.02) + time * 0.6 + 2) * amplitude * 0.2;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Floating particles
      for (let i = 0; i < 20; i++) {
        const px = ((i * 137.508) + time * 8) % w;
        const py = ((i * 89.333) + Math.sin(time + i) * 30) % h;
        const alpha = 0.05 + Math.sin(time + i * 0.5) * 0.03;
        const size = 1.5 + Math.sin(time * 0.5 + i) * 0.5;

        ctx.beginPath();
        ctx.fillStyle = `rgba(240, 185, 11, ${alpha})`;
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      time += 0.016;
      drawGrid();
      animId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
