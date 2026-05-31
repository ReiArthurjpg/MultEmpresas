"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuroraProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Aurora({ className, children, ...props }: AuroraProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300 w-full",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div 
          className="absolute -inset-[10px] opacity-60 filter blur-[80px]"
          style={{
            background: `radial-gradient(circle at 10% 20%, var(--aurora-1) 0%, transparent 40%),
                         radial-gradient(circle at 90% 10%, var(--aurora-2) 0%, transparent 40%),
                         radial-gradient(circle at 50% 80%, var(--aurora-3) 0%, transparent 40%),
                         radial-gradient(circle at 10% 90%, var(--aurora-4) 0%, transparent 35%),
                         radial-gradient(circle at 90% 90%, var(--aurora-5) 0%, transparent 35%)`,
            animation: "aurora-move 25s infinite alternate ease-in-out",
          }}
        />
        
        {/* Camada de grid cibernético sutil */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                              linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(circle, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {children}
      </div>

      <style jsx global>{`
        @keyframes aurora-move {
          0% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(30px, -40px) rotate(60deg) scale(1.15);
          }
          100% {
            transform: translate(-20px, 30px) rotate(120deg) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
