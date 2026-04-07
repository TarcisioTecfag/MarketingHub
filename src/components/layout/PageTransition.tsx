import { motion, type Transition } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Smoother, more premium page transition
const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0,  scale: 1 },
  exit:    { opacity: 0, y: -8,  scale: 0.99 },
};

const pageTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.6,
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ── Reusable animation variants for use elsewhere in the app ─────────────────

/** Stagger container — wraps a list of animated children */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

/** Individual card/item that fades + slides up */
export const fadeSlideUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
};

/** Fade in only */
export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.25 } },
};

/** Scale pop — good for dialogs / cards on hover */
export const scalePop = {
  rest:  { scale: 1 },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 20 } },
  tap:   { scale: 0.97 },
};
