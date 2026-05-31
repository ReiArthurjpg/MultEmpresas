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
        "inline-block font-black tracking-tight",
        className
      )}
      style={{
        color: "#e2e8f0",
        animation: disabled ? "none" : `sb-brand-pulse ${speed}s ease-in-out infinite`,
      }}
    >
      {text}
    </span>
  );
}

