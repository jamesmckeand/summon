import type { Variants } from "framer-motion";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0.01, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: easeOut },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0.01 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay },
  }),
};
