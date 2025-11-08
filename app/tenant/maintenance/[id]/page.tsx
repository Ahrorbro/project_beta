import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery as prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Wrench, Calendar, Image as ImageIcon, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface MaintenanceRequestDetailProps {
  params: {
    id: string;
  };
}

export default async function MaintenanceRequestDetailPage({ params }: MaintenanceRequestDetailProps) {
  const session = await requireRole("TENANT");

  const request = await prisma.maintenanceRequest.findFirst({
    where: {
      id: params.id,
      tenantId: session.user.id,
    },
    include: {
      unit: {
        include: {
              property: {
                select: {
                  address: true,
                  location: true,
                },
              },
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div>
          <Link
            href="/tenant/maintenance"
            className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
          >
            ← Back to Maintenance
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-white">
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
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  request.status === "RESOLVED"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : request.status === "IN_PROGRESS"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                }`}
              >
                {request.status.replace("_", " ")}
              </span>
            </div>

            {request.photos.length > 0 && (
              <div>
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

            {request.resolutionNotes && (
              <div className="mt-6 p-4 rounded-lg bg-white/5">
                <p className="text-white/60 mb-2">Resolution Notes</p>
                <p className="text-white">{request.resolutionNotes}</p>
              </div>
            )}

            {request.resolutionPhotos.length > 0 && (
              <div className="mt-6">
                <p className="text-white/60 mb-4">Resolution Photos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {request.resolutionPhotos.map((photo: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                      <Image
                        src={photo}
                        alt={`Resolution photo ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 text-white">Request Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/60">Unit</p>
                <p className="text-white font-medium">
                  {request.unit.property.address} - Unit {request.unit.unitNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Status</p>
                <p className="text-white font-medium capitalize">
                  {request.status.replace("_", " ").toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Submitted</p>
                <p className="text-white font-medium">{formatDate(request.createdAt)}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </TenantLayout>
  );
}

