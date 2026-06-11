"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating in. */
  delay?: number;
  /** Vertical travel distance in px (ignored when reduced motion is on). */
  y?: number;
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 16,
  inView = false,
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  const hidden = { opacity: 0, y: reduceMotion ? 0 : y };
  const visible = { opacity: 1, y: 0 };
  const transition = { duration: 0.5, delay, ease: "easeOut" as const };

  if (inView) {
    return (
      <motion.div
        className={className}
        initial={hidden}
        whileInView={visible}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={visible}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
