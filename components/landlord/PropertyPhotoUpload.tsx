"use client";

import { useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface PropertyPhotoUploadProps {
  propertyId: string;
  existingPhotos?: string[];
  onPhotosUpdated?: () => void;
}

export function PropertyPhotoUpload({ 
  propertyId, 
  existingPhotos = [],
  onPhotosUpdated 
}: PropertyPhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Update photos when existingPhotos prop changes
  useEffect(() => {
    setPhotos(existingPhotos);
  }, [existingPhotos]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    
    if (imageFiles.length === 0) {
      toast.error("Please select image files only");
      return;
    }

    setSelectedFiles(imageFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select photos to upload");
      return;
    }

    setUploading(true);
    try {
      // Upload files to Cloudinary using unified endpoint
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });

      const uploadResponse = await fetch("/api/upload?folder=properties", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload photos");
      }

      const uploadData = await uploadResponse.json();
      const uploadedUrls = uploadData.secure_urls || uploadData.urls || [];

      // Update property with new photo URLs
      const response = await fetch(`/api/v1/landlords/properties/${propertyId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: uploadedUrls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update property photos");
      }

      setPhotos(data.photos);
      setSelectedFiles([]);
      toast.success("Photos uploaded successfully");
      
      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoUrl: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/landlords/properties/${propertyId}/photos?photoUrl=${encodeURIComponent(photoUrl)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete photo");
      }

      setPhotos(photos.filter(p => p !== photoUrl));
      toast.success("Photo deleted successfully");
      
      if (onPhotosUpdated) {
        onPhotosUpdated();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete photo");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <GlassButton
            variant="secondary"
            type="button"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Select Photos
          </GlassButton>
        </label>

        {selectedFiles.length > 0 && (
          <>
            <span className="text-white/60">
              {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
            </span>
            <GlassButton
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Uploading...
                </span>
              ) : (
                "Upload Photos"
              )}
            </GlassButton>
          </>
        )}
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photoUrl) => (
            <div
              key={photoUrl}
              className="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10"
            >
              <div className="aspect-square relative">
                <Image
                  src={photoUrl}
                  alt={`Property photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <button
                onClick={() => handleDelete(photoUrl)}
                className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete photo"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && selectedFiles.length === 0 && (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p className="text-white/60">No photos uploaded yet</p>
          <p className="text-sm text-white/40 mt-2">
            Select and upload property photos
          </p>
        </div>
      )}
    </div>
  );
}

