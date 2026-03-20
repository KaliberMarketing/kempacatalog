"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface LazySpinnerProps {
  delay?: number;
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizes = {
  sm: "h-4 w-4 border-[1.5px]",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
};

export function LazySpinner({ delay = 400, size = "md", text }: LazySpinnerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className={`animate-spin rounded-full border-muted-foreground border-t-transparent ${sizes[size]}`}
          />
          {text && (
            <p className="text-sm text-muted-foreground">{text}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
