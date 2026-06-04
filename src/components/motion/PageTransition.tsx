'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cinematicPage } from '@/lib/motion';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        className="flex-1"
        variants={cinematicPage}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
