import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300",
        hover && "hover:bg-white/20 hover:scale-[1.02] hover:shadow-glass-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

