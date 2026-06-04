import type { Variants, Transition } from 'framer-motion';

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const fastTransition: Transition = {
  duration: 0.35,
  ease: premiumEase,
};

export const smoothTransition: Transition = {
  duration: 0.55,
  ease: premiumEase,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: smoothTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: fastTransition,
  },
};

export const cinematicPage: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.992, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.996,
    filter: 'blur(8px)',
    transition: { duration: 0.2, ease: premiumEase },
  },
};

export const navDrop: Variants = {
  hidden: { opacity: 0, y: -14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const cardHover = {
  y: -6,
  scale: 1.015,
  transition: fastTransition,
};

export const spotlightHover = {
  y: -8,
  scale: 1.02,
  rotateX: 0,
  rotateY: 0,
  transition: fastTransition,
};

export const buttonHover = {
  scale: 1.025,
  transition: fastTransition,
};

export const buttonTap = {
  scale: 0.975,
  transition: { duration: 0.12, ease: premiumEase },
};
