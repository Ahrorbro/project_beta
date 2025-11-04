"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import toast from "react-hot-toast";

export function BackfillUnitTenantsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");

  const runBackfill = async () => {
    setIsLoading(true);
    setLastResult("");
    try {
      const res = await fetch("/api/v1/admin/backfill/unit-tenants", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Backfill failed");
      }
      const msg = `Created ${data.created} link(s) out of ${data.totalPairs}`;
      setLastResult(msg);
      toast.success("Backfill complete");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Backfill failed";
      setLastResult(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <GlassButton onClick={runBackfill} variant="secondary" disabled={isLoading}>
        {isLoading ? "Running Backfill..." : "Backfill Tenant Links"}
      </GlassButton>
      {lastResult && (
        <p className="text-xs text-white/60">{lastResult}</p>
      )}
    </div>
  );
}


