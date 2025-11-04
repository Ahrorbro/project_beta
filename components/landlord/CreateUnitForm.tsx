"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().int().positive().optional(),
  rentAmount: z.number().positive("Rent amount must be positive"),
  leaseStartDate: z.string().optional(),
  leaseEndDate: z.string().optional(),
});

interface CreateUnitFormProps {
  propertyId: string;
}

export function CreateUnitForm({ propertyId }: CreateUnitFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: "",
    floor: "",
    rentAmount: "",
    leaseStartDate: "",
    leaseEndDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validated = unitSchema.parse({
        unitNumber: formData.unitNumber,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        rentAmount: parseFloat(formData.rentAmount),
        leaseStartDate: formData.leaseStartDate || undefined,
        leaseEndDate: formData.leaseEndDate || undefined,
      });

      const response = await fetch(`/api/v1/landlords/properties/${propertyId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create unit");
      }

      toast.success("Unit created successfully!");
      router.push(`/landlord/properties/${propertyId}/units/${data.unit.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the form errors");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to create unit");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <GlassInput
            label="Unit Number"
            value={formData.unitNumber}
            onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
            error={errors.unitNumber}
            disabled={isLoading}
            required
            placeholder="e.g., 1A, 1B, 2A"
          />

          <GlassInput
            label="Floor (Optional)"
            type="number"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            error={errors.floor}
            disabled={isLoading}
            placeholder="Floor number"
          />
        </div>

        <GlassInput
          label="Monthly Rent Amount (TZS)"
          type="number"
          value={formData.rentAmount}
          onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
          error={errors.rentAmount}
          disabled={isLoading}
          required
          placeholder="Enter rent amount"
        />

        {formData.rentAmount && (
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm text-white/60">Rent Amount:</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(parseFloat(formData.rentAmount) || 0)}/month
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <GlassInput
            label="Lease Start Date (Optional)"
            type="date"
            value={formData.leaseStartDate}
            onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
            error={errors.leaseStartDate}
            disabled={isLoading}
          />

          <GlassInput
            label="Lease End Date (Optional)"
            type="date"
            value={formData.leaseEndDate}
            onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
            error={errors.leaseEndDate}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-4">
          <GlassButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create Unit"
            )}
          </GlassButton>
          <GlassButton
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}

