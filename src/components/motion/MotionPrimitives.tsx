'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import type { MouseEvent, ReactNode } from 'react';
import { buttonHover, buttonTap, cardHover, fastTransition } from '@/lib/motion';

interface MotionBoxProps {
  children: ReactNode;
  className?: string;
}

export function MotionButton({ children, className }: MotionBoxProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={className}
      whileHover={reduceMotion ? undefined : buttonHover}
      whileTap={reduceMotion ? undefined : buttonTap}
      transition={fastTransition}
    >
      {children}
    </motion.span>
  );
}

export function MagneticButton({ children, className }: MotionBoxProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22 });
  const springY = useSpring(y, { stiffness: 260, damping: 22 });

  function handleMove(event: MouseEvent<HTMLSpanElement>) {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileHover={reduceMotion ? undefined : buttonHover}
      whileTap={reduceMotion ? undefined : buttonTap}
      style={{ x: springX, y: springY }}
      transition={fastTransition}
    >
      {children}
    </motion.span>
  );
}

export function MotionCard({ children, className }: MotionBoxProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduceMotion ? undefined : cardHover}
      transition={fastTransition}
    >
      {children}
    </motion.div>
  );
}

export function MouseGlowCard({ children, className }: MotionBoxProps) {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.06), transparent 42%)`;

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      className={`relative overflow-hidden ${className || ''}`}
      onMouseMove={reduceMotion ? undefined : handleMouseMove}
      whileHover={reduceMotion ? undefined : cardHover}
      transition={fastTransition}
    >
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background }}
        />
      )}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-60%' }}
          whileHover={{ x: '360%' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
