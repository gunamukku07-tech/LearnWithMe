import { Variants } from 'motion/react';

/**
 * LearnWithMe — Framer Motion Animation Variants (Part 1 Foundation)
 * Natural, GPU-friendly easing using transform and opacity.
 */

export const EASE_EDITORIAL: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE_EDITORIAL },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.22, ease: EASE_EDITORIAL },
  },
};

export const scrollRevealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      delay,
      ease: EASE_EDITORIAL,
    },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_EDITORIAL,
    },
  },
};

export const cardHoverMotion = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -5,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

export const buttonTapMotion = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.985 },
};
