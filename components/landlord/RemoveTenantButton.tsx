"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassButton } from "@/components/ui/GlassButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { UserMinus } from "lucide-react";

interface RemoveTenantButtonProps {
  propertyId: string;
  unitId: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
}

export function RemoveTenantButton({
  propertyId,
  unitId,
  tenantId,
  tenantName,
  unitNumber,
}: RemoveTenantButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/landlords/properties/${propertyId}/units/${unitId}/tenants/${tenantId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove tenant");
      }

      toast.success("Tenant removed from unit successfully");
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove tenant");
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mt-2">
        <p className="text-xs text-white mb-2">
          Remove <strong>{tenantName}</strong> from Unit {unitNumber}?
        </p>
        <div className="flex gap-2">
          <GlassButton
            variant="primary"
            onClick={handleRemove}
            disabled={isLoading}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-xs"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <LoadingSpinner size="sm" />
                Removing...
              </span>
            ) : (
              "Remove"
            )}
          </GlassButton>
          <GlassButton
            variant="ghost"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            size="sm"
            className="text-xs"
          >
            Cancel
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <GlassButton
      variant="ghost"
      onClick={() => setShowConfirm(true)}
      size="sm"
      className="text-xs text-red-400 hover:text-red-300 mt-2"
    >
      <UserMinus className="w-3 h-3 mr-1" />
      Remove from Unit
    </GlassButton>
  );
}

