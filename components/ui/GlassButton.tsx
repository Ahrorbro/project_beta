import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "green" | "orange" | "blue" | "purple" | "yellow" | "pink";
  size?: "sm" | "md" | "lg";
}

export function GlassButton({
  children,
  variant = "primary",
  className,
  size = "md",
  ...props
}: GlassButtonProps) {
  const variants = {
    primary: "bg-white/10 hover:bg-white/20 text-white border-white/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white border-white/20",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30",
    ghost: "bg-transparent hover:bg-white/10 text-white border-white/10",
    green: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border-emerald-500/30",
    orange: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 border-orange-500/30",
    blue: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-500/30",
    purple: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-500/30",
    yellow: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 border-yellow-500/30",
    pink: "bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border-pink-500/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "glass rounded-lg font-medium transition-all duration-300 border",
        "hover:shadow-lg active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

