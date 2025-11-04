"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Building2, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export function JoinApartmentForm() {
  const [invitationLink, setInvitationLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Extract token from full URL or use as-is if it's just a token
  const extractToken = (input: string): string => {
    const trimmed = input.trim();
    
    // If it's a full URL, extract the token part
    if (trimmed.includes("/invite/")) {
      const parts = trimmed.split("/invite/");
      return parts[parts.length - 1].split("?")[0].trim();
    }
    
    // If it's just a token, return as-is
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = extractToken(invitationLink);

      if (!token) {
        setError("Please enter a valid invitation link");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/v1/tenants/link-unit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitationToken: token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join apartment");
      }

      toast.success("Successfully joined the apartment!");
      setInvitationLink("");
      
      // Reload page to show updated unit assignments
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join apartment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Join Apartment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <GlassInput
            label="Invitation Link"
            type="text"
            value={invitationLink}
            onChange={(e) => {
              setInvitationLink(e.target.value);
              setError("");
            }}
            placeholder="Paste invitation link here (e.g., https://.../invite/abc123 or just the token)"
            disabled={isLoading}
            icon={<LinkIcon className="w-4 h-4" />}
            error={error}
          />
          <p className="mt-2 text-xs text-white/60">
            Enter the invitation link you received from your landlord. You can paste the full URL or just the token.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <GlassButton
          type="submit"
          variant="primary"
          disabled={isLoading || !invitationLink.trim()}
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Joining...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Join Apartment
            </span>
          )}
        </GlassButton>
      </form>
    </GlassCard>
  );
}

