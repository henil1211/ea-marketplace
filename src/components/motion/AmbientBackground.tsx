'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(240,185,11,0.045),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(0,192,135,0.035),transparent_32%)]" />
      <motion.div
        className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-vault-gold/[0.045] blur-[90px]"
        animate={reduceMotion ? undefined : { x: [0, 42, 0], y: [0, 28, 0], opacity: [0.45, 0.72, 0.45] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-[38vh] h-80 w-80 rounded-full bg-vault-profit/[0.035] blur-[100px]"
        animate={reduceMotion ? undefined : { x: [0, -36, 0], y: [0, -24, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}
