"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({ text, disabled = false, speed = 4, className }: ShinyTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text font-black",
        !disabled && "animate-shiny",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(120deg, var(--primary) 35%, oklch(0.75 0.18 210) 50%, var(--primary) 65%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animationDuration: `${speed}s`,
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
      }}
    >
      {text}
    </span>
  );
}
