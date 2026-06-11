"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Seconds before the first child animates. */
  delay?: number;
  /** Seconds between each child. */
  interval?: number;
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean;
};

const container: Variants = {
  hidden: {},
  visible: (custom: { delay: number; interval: number }) => ({
    transition: {
      delayChildren: custom.delay,
      staggerChildren: custom.interval,
    },
  }),
};

/**
 * Parent that staggers the entrance of its <StaggerItem> children.
 * Items animate 40ms apart by default, per the motion system.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  interval = 0.04,
  inView = false,
}: StaggerProps) {
  const inViewProps = inView
    ? { whileInView: "visible" as const, viewport: { once: true, margin: "-80px" } }
    : { animate: "visible" as const };

  return (
    <motion.div
      className={className}
      custom={{ delay, interval }}
      initial="hidden"
      variants={container}
      {...inViewProps}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
