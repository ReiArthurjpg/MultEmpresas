"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function BlurText({ text, className, delay = 0 }: BlurTextProps) {
  const words = text.split(" ");
  return (
    <span className={cn("inline-flex flex-wrap justify-center", className)}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ filter: "blur(8px)", opacity: 0, y: 8 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + idx * 0.08,
            ease: [0.16, 1, 0.3, 1], // easeOutExpo
          }}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
