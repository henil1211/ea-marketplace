'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, staggerContainer, smoothTransition } from '@/lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'article';
  delay?: number;
}

export function PageShell({ children, className }: MotionBoxProps) {
  return (
    <StaggerReveal className={className || 'mx-auto max-w-[1440px] px-6 py-8 lg:px-12'}>
      {children}
    </StaggerReveal>
  );
}

export function Reveal({ children, className, id, as = 'div', delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const StaticComponent = as;
    return <StaticComponent id={id} className={className}>{children}</StaticComponent>;
  }

  return (
    <Component
      id={id}
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ ...smoothTransition, delay }}
    >
      {children}
    </Component>
  );
}

export function StaggerReveal({ children, className, id, as = 'div', delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const StaticComponent = as;
    return <StaticComponent id={id} className={className}>{children}</StaticComponent>;
  }

  return (
    <Component
      id={id}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ children, className }: MotionBoxProps) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

interface MotionBoxProps {
  children: ReactNode;
  className?: string;
}
