"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  targetType: z.enum(["ALL_TENANTS", "SPECIFIC_TENANTS", "PROPERTY_TENANTS"]),
  propertyId: z.string().optional(),
  tenantIds: z.array(z.string()).optional(),
});

interface CreateAnnouncementFormProps {
  properties: Array<{ id: string; address: string }>;
  tenants: Array<{ id: string; name: string | null; email: string }>;
}

export function CreateAnnouncementForm({ properties, tenants }: CreateAnnouncementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "ALL_TENANTS" as "ALL_TENANTS" | "SPECIFIC_TENANTS" | "PROPERTY_TENANTS",
    propertyId: "",
    tenantIds: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validated = announcementSchema.parse({
        ...formData,
        propertyId: formData.propertyId || undefined,
        tenantIds: formData.tenantIds.length > 0 ? formData.tenantIds : undefined,
      });

      const response = await fetch("/api/v1/landlords/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create announcement");
      }

      toast.success("Announcement created successfully");
      router.push("/landlord/announcements");
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to create announcement");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTenant = (tenantId: string) => {
    setFormData((prev) => ({
      ...prev,
      tenantIds: prev.tenantIds.includes(tenantId)
        ? prev.tenantIds.filter((id) => id !== tenantId)
        : [...prev.tenantIds, tenantId],
    }));
  };

  return (
    <GlassCard>
      <h2 className="text-2xl font-semibold mb-6 text-white">Create Announcement</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Title *
          </label>
          <GlassInput
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter announcement title"
            required
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Enter announcement message"
            required
            rows={6}
            className="glass-input w-full resize-none"
          />
          {errors.message && (
            <p className="text-red-400 text-sm mt-1">{errors.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Target Audience *
          </label>
          <select
            value={formData.targetType}
            onChange={(e) =>
              setFormData({
                ...formData,
                targetType: e.target.value as typeof formData.targetType,
                propertyId: "",
                tenantIds: [],
              })
            }
            className="glass-input w-full"
            required
          >
            <option value="ALL_TENANTS">All Tenants</option>
            <option value="PROPERTY_TENANTS">Property Tenants</option>
            <option value="SPECIFIC_TENANTS">Specific Tenants</option>
          </select>
        </div>

        {formData.targetType === "PROPERTY_TENANTS" && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Property *
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="glass-input w-full"
              required
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.targetType === "SPECIFIC_TENANTS" && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Select Tenants *
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
              {tenants.length === 0 ? (
                <p className="text-white/60 text-sm">No tenants available</p>
              ) : (
                tenants.map((tenant) => (
                  <label
                    key={tenant.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.tenantIds.includes(tenant.id)}
                      onChange={() => toggleTenant(tenant.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-white font-medium">
                        {tenant.name || "No name"}
                      </p>
                      <p className="text-white/60 text-sm">{tenant.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {formData.tenantIds.length > 0 && (
              <p className="text-white/60 text-sm mt-2">
                {formData.tenantIds.length} tenant{formData.tenantIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <GlassButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create Announcement"
            )}
          </GlassButton>
          <GlassButton
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}

