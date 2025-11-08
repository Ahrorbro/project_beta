"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { z } from "zod";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const maintenanceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  photos: z.array(z.string()).min(1, "At least one photo is required"),
});

export function CreateMaintenanceRequestForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photos: [] as File[],
    photoPreviews: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.slice(0, 5 - formData.photos.length);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFormData({
      ...formData,
      photos: [...formData.photos, ...newFiles],
      photoPreviews: [...formData.photoPreviews, ...newPreviews],
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = formData.photoPreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos, photoPreviews: newPreviews });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (formData.photos.length === 0) {
        setErrors({ photos: "At least one photo is required" });
        toast.error("Please upload at least one photo");
        setIsLoading(false);
        return;
      }

      // Upload photos first using unified upload endpoint
      const photoUrls: string[] = [];
      for (const photo of formData.photos) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", photo);

        const uploadResponse = await fetch("/api/upload?folder=maintenance", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload photo");
        }

        const uploadData = await uploadResponse.json();
        photoUrls.push(uploadData.secure_url || uploadData.url);
      }

      // Create maintenance request
      const response = await fetch("/api/v1/maintenance/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          photos: photoUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create maintenance request");
      }

      toast.success("Maintenance request submitted successfully!");
      router.push("/tenant/maintenance");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassInput
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          disabled={isLoading}
          required
          placeholder="Brief description of the issue"
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="glass-input w-full min-h-[120px] resize-none"
            placeholder="Describe the maintenance issue in detail..."
            disabled={isLoading}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Photos <span className="text-red-400">*</span>
            <span className="text-white/60 text-xs ml-2">
              (At least 1 required, up to 5)
            </span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {formData.photoPreviews.map((preview: string, index: number) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.photos.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-white/30 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center flex-col gap-2">
                <ImageIcon className="w-8 h-8 text-white/60" />
                <span className="text-xs text-white/60">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
          {errors.photos && (
            <p className="mt-1 text-sm text-red-400">{errors.photos}</p>
          )}
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
                Submitting...
              </span>
            ) : (
              "Submit Request"
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

