"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong!</h1>
        <p className="text-white/60 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-white/40 mb-4">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-4 justify-center">
          <GlassButton variant="primary" onClick={reset}>
            Try Again
          </GlassButton>
          <Link href="/">
            <GlassButton variant="secondary">Go Home</GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

