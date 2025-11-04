import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import { Eye, EyeOff, Calendar } from "lucide-react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  showCalendarIcon?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, className, icon, type, showPasswordToggle, showCalendarIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const isDate = type === "date" || type === "month";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 z-10">
              {icon}
            </div>
          )}
          {isDate && !icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 z-10 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "glass-input w-full",
              icon && "pl-10",
              (isDate && !icon) && "pl-10",
              (isPassword && showPasswordToggle) && "pr-10",
              isDate && "pr-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

