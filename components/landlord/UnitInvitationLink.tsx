"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Copy, Check, RefreshCw, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface UnitInvitationLinkProps {
  invitationLink: string;
  unitId: string;
}

export function UnitInvitationLink({ invitationLink, unitId }: UnitInvitationLinkProps) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/v1/landlords/units/${unitId}/regenerate-link`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate link");
      }

      const data = await response.json();
      toast.success("New invitation link generated!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to regenerate link");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <GlassInput
          value={invitationLink}
          readOnly
          className="pr-12"
        />
        <button
          onClick={handleCopy}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/60" />
          )}
        </button>
      </div>

      <div className="flex gap-2">
        <GlassButton
          variant="primary"
          onClick={handleCopy}
          className="flex-1"
          size="sm"
        >
          {copied ? "Copied!" : "Copy Link"}
        </GlassButton>
        <GlassButton
          variant="secondary"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </GlassButton>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-white/60" />
          <p className="text-sm font-medium text-white/80">Share via:</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <GlassButton
            variant="blue"
            onClick={() => {
              const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationLink)}&text=${encodeURIComponent("Join my property unit on Rentify!")}`;
              window.open(telegramUrl, "_blank");
              toast.success("Opening Telegram...");
            }}
            size="sm"
            className="flex items-center justify-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/40"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.616 7.624c-.12.536-.43.667-.874.41l-2.41-1.776-1.16.746c-.132.132-.247.244-.509.244l.174-2.465 4.453-4.02c.194-.174-.042-.27-.3-.097l-5.498 3.46-2.37-.74c-.507-.158-.52-.507.106-.75l9.29-3.58c.415-.16.78.099.644.615z"/>
            </svg>
            Telegram
          </GlassButton>
          <GlassButton
            variant="green"
            onClick={() => {
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join my property unit on Rentify! ${invitationLink}`)}`;
              window.open(whatsappUrl, "_blank");
              toast.success("Opening WhatsApp...");
            }}
            size="sm"
            className="flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.77.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </GlassButton>
          <GlassButton
            variant="ghost"
            onClick={() => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent("Join my property unit on Rentify!")}&url=${encodeURIComponent(invitationLink)}`;
              window.open(twitterUrl, "_blank");
              toast.success("Opening X (Twitter)...");
            }}
            size="sm"
            className="flex items-center justify-center gap-2 border-white/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X (Twitter)
          </GlassButton>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-xs text-yellow-300">
          ⚠️ Each person gets a unique link. After someone uses the link, a new one will be generated automatically.
        </p>
      </div>
    </div>
  );
}

