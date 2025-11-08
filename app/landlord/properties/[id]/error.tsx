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
    console.error("Property page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-red-400">Error Loading Property</h1>
        <p className="text-white/60 mb-6">
          {error.message || "Failed to load property details. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-white/40 mb-4">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-4 justify-center">
          <GlassButton variant="primary" onClick={reset}>
            Try Again
          </GlassButton>
          <Link href="/landlord/properties">
            <GlassButton variant="secondary">Back to Properties</GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

