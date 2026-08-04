"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const item = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeroCopy({
  availability,
  title,
  description,
  actions,
}: {
  availability?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="flex flex-col items-start md:col-span-8">
        {availability}
        {title}
        {description}
        {actions}
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-start md:col-span-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.12, staggerChildren: 0.09 } },
      }}
    >
      {availability ? <motion.div className="w-full" variants={item}>{availability}</motion.div> : null}
      <motion.div className="w-full" variants={item}>{title}</motion.div>
      <motion.div className="w-full" variants={item}>{description}</motion.div>
      <motion.div className="w-full" variants={item}>{actions}</motion.div>
    </motion.div>
  );
}

export function HeroVisualMotion({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 34, rotate: 2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -8, 0], rotate: [-0.8, 0.8, -0.8] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
