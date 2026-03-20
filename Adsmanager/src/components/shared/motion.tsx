"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { x: -240, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -240, opacity: 0 },
};

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export { motion, AnimatePresence };
