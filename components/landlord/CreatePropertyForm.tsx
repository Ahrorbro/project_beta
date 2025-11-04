"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { z } from "zod";
import Link from "next/link";

const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  propertyType: z.enum(["single", "multi"], {
    required_error: "Property type is required",
  }),
  description: z.string().optional(),
});

export function CreatePropertyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    propertyType: "single" as "single" | "multi",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validated = propertySchema.parse(formData);

      const response = await fetch("/api/v1/landlords/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create property");
      }

      toast.success("Property created successfully!");
      router.push(`/landlord/properties/${data.property.id}`);
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
        toast.error(error instanceof Error ? error.message : "Failed to create property");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassInput
          label="Property Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          error={errors.address}
          disabled={isLoading}
          required
          placeholder="Enter property address"
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Property Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, propertyType: "single" })}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.propertyType === "single"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-center">
                <p className="font-semibold text-white mb-1">Single Unit</p>
                <p className="text-xs text-white/60">One rental unit</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, propertyType: "multi" })}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                formData.propertyType === "multi"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="text-center">
                <p className="font-semibold text-white mb-1">Multi-Unit</p>
                <p className="text-xs text-white/60">Multiple units</p>
              </div>
            </button>
          </div>
          {errors.propertyType && (
            <p className="mt-1 text-sm text-red-400">{errors.propertyType}</p>
          )}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="glass-input w-full min-h-[100px] resize-none"
            placeholder="Add property description..."
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
              "Create Property"
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

