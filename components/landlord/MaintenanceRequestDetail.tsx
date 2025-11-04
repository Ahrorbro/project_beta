"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Wrench, Calendar, Image as ImageIcon, CheckCircle, Phone, Building2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import type { MaintenanceRequest, Unit, User as TenantUser } from "@prisma/client";

interface MaintenanceRequestDetailProps {
  request: MaintenanceRequest & {
    unit: Unit & {
      property: {
        address: string;
      };
    };
    tenant: TenantUser;
  };
}

export function MaintenanceRequestDetail({ request }: MaintenanceRequestDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [resolutionNotes, setResolutionNotes] = useState(request.resolutionNotes || "");
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>(request.resolutionPhotos || []);

  const handleStatusUpdate = async (newStatus: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/maintenance/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: newStatus === "RESOLVED" ? resolutionNotes : undefined,
          resolutionPhotos: newStatus === "RESOLVED" ? resolutionPhotos : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status updated successfully!");
      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (request.tenant.phone) {
      const phoneNumber = request.tenant.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${phoneNumber}`, "_blank");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/landlord/maintenance"
          className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
        >
          ← Back to Maintenance
        </Link>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {request.title}
        </h1>
        <p className="text-white/60">Maintenance request details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{request.title}</h2>
              <p className="text-white/60">{request.unit.property.address}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white/60 mb-2">Description</p>
            <p className="text-white">{request.description}</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Calendar className="w-4 h-4" />
              <span>Submitted: {formatDate(request.createdAt)}</span>
            </div>
            {request.resolvedAt && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle className="w-4 h-4" />
                <span>Resolved: {formatDate(request.resolvedAt)}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-white/60 mb-4">Status</p>
            <div className="flex gap-2">
              <GlassButton
                variant={status === "SUBMITTED" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusUpdate("SUBMITTED")}
                disabled={isLoading}
              >
                Submitted
              </GlassButton>
              <GlassButton
                variant={status === "IN_PROGRESS" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                disabled={isLoading}
              >
                In Progress
              </GlassButton>
              <GlassButton
                variant={status === "RESOLVED" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusUpdate("RESOLVED")}
                disabled={isLoading}
              >
                Resolved
              </GlassButton>
            </div>
          </div>

          {request.photos.length > 0 && (
            <div className="mb-6">
              <p className="text-white/60 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Photos ({request.photos.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {request.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                      <Image
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {status === "RESOLVED" && (
            <div className="mt-6 p-4 rounded-lg bg-white/5">
              <p className="text-white/60 mb-2">Resolution Notes</p>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="glass-input w-full min-h-[100px] resize-none"
                placeholder="Add resolution notes..."
                disabled={isLoading}
              />
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 text-white">Request Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Property</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/60" />
                <p className="text-white font-medium">{request.unit.property.address}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Unit</p>
              <p className="text-white font-medium">Unit {request.unit.unitNumber}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Tenant</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-white/60" />
                <p className="text-white font-medium">
                  {request.tenant.name || request.tenant.email}
                </p>
              </div>
            </div>
            {request.tenant.phone && (
              <div>
                <p className="text-sm text-white/60 mb-1">Contact</p>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </GlassButton>
              </div>
            )}
            <div>
              <p className="text-sm text-white/60 mb-1">Status</p>
              <p className="text-white font-medium capitalize">
                {status.replace("_", " ").toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Submitted</p>
              <p className="text-white font-medium">{formatDate(request.createdAt)}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

