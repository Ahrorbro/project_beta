"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { Link as LinkIcon, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface UnitInviteButtonProps {
  invitationLink: string;
  unitNumber: string;
}

export function UnitInviteButton({ invitationLink, unitNumber }: UnitInviteButtonProps) {
  const [showLink, setShowLink] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationLink)}&text=${encodeURIComponent(`Join Unit ${unitNumber} on Rentify!`)}`;
    window.open(telegramUrl, "_blank");
    toast.success("Opening Telegram...");
  };

  if (showLink) {
    return (
      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/60">Invitation Link:</p>
          <button
            onClick={() => setShowLink(false)}
            className="text-xs text-white/60 hover:text-white"
          >
            Hide
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={invitationLink}
            readOnly
            className="flex-1 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white/80"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <GlassButton
            variant="blue"
            size="sm"
            onClick={handleTelegramShare}
            className="flex items-center gap-1 px-2 py-1 text-xs"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.616 7.624c-.12.536-.43.667-.874.41l-2.41-1.776-1.16.746c-.132.132-.247.244-.509.244l.174-2.465 4.453-4.02c.194-.174-.042-.27-.3-.097l-5.498 3.46-2.37-.74c-.507-.158-.52-.507.106-.75l9.29-3.58c.415-.16.78.099.644.615z"/>
            </svg>
            Telegram
          </GlassButton>
        </div>
        <div className="flex gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="flex-1 text-xs"
          >
            Copy Link
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      <GlassButton
        variant="primary"
        size="sm"
        onClick={() => setShowLink(true)}
        className="flex-1 text-xs flex items-center justify-center gap-1"
      >
        <LinkIcon className="w-3 h-3" />
        Show Invite Link
      </GlassButton>
      <GlassButton
        variant="blue"
        size="sm"
        onClick={handleTelegramShare}
        className="flex items-center gap-1 px-3 text-xs"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.616 7.624c-.12.536-.43.667-.874.41l-2.41-1.776-1.16.746c-.132.132-.247.244-.509.244l.174-2.465 4.453-4.02c.194-.174-.042-.27-.3-.097l-5.498 3.46-2.37-.74c-.507-.158-.52-.507.106-.75l9.29-3.58c.415-.16.78.099.644.615z"/>
        </svg>
        Share
      </GlassButton>
    </div>
  );
}

