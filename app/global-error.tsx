"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertCircle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <div className="flex min-h-screen items-center justify-center p-4">
          <GlassCard className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-red-400">Critical Error</h1>
            <p className="text-white/60 mb-6">
              {error.message || "A critical error occurred. Please refresh the page."}
            </p>
            {error.digest && (
              <p className="text-xs text-white/40 mb-4">Error ID: {error.digest}</p>
            )}
            <div className="flex gap-4 justify-center">
              <GlassButton variant="primary" onClick={reset}>
                Try Again
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </body>
    </html>
  );
}

