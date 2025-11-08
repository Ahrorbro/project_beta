"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassButton } from "@/components/ui/GlassButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface DeletePropertyButtonProps {
  propertyId: string;
  propertyAddress: string;
}

export function DeletePropertyButton({ propertyId, propertyAddress }: DeletePropertyButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/landlords/properties/${propertyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to delete property";
        toast.error(errorMessage);
        setShowConfirm(false);
        return;
      }

      toast.success("Property deleted successfully");
      router.push("/landlord/properties");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete property. Please try again.");
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <p className="text-sm text-white mb-3">
          Are you sure you want to delete <strong>{propertyAddress}</strong>? This action cannot be undone.
        </p>
        <p className="text-xs text-white/60 mb-4">
          Note: You can only delete properties with no occupied units.
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
      className="w-full justify-start text-red-400 hover:text-red-300"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete Property
    </GlassButton>
  );
}

