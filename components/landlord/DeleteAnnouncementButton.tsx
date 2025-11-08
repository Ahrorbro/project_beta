"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassButton } from "@/components/ui/GlassButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface DeleteAnnouncementButtonProps {
  announcementId: string;
  announcementTitle: string;
}

export function DeleteAnnouncementButton({ 
  announcementId, 
  announcementTitle 
}: DeleteAnnouncementButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/landlords/announcements/${announcementId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete announcement");
      }

      toast.success("Announcement deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete announcement");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <p className="text-sm text-white mb-3">
          Are you sure you want to delete this announcement?
        </p>
        <div className="flex gap-2">
          <GlassButton
            variant="primary"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Deleting...
              </span>
            ) : (
              "Yes, Delete"
            )}
          </GlassButton>
          <GlassButton
            variant="ghost"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Cancel
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <GlassButton
      variant="secondary"
      onClick={() => setShowConfirm(true)}
      className="text-red-400 hover:text-red-300"
    >
      <Trash2 className="w-4 h-4" />
    </GlassButton>
  );
}

