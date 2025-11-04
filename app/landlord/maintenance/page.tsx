import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prisma } from "@/lib/prisma";
import { Wrench, Clock, CheckCircle, Building2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface MaintenancePageProps {
  searchParams: {
    filter?: string;
  };
}

export default async function LandlordMaintenancePage({ searchParams }: MaintenancePageProps) {
  const session = await requireRole("LANDLORD");

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      unit: {
        property: {
          landlordId: session.user.id,
        },
      },
      ...(searchParams.filter === "pending" && {
        status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      }),
      ...(searchParams.filter === "resolved" && { status: "RESOLVED" }),
    },
    include: {
      unit: {
        include: {
          property: {
            select: {
              address: true,
            },
          },
        },
      },
      tenant: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingRequests = requests.filter(
    (r: typeof requests[0]) => r.status === "SUBMITTED" || r.status === "IN_PROGRESS"
  );
  const resolvedRequests = requests.filter((r: typeof requests[0]) => r.status === "RESOLVED");

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Maintenance Requests
          </h1>
          <p className="text-white/60">View and manage maintenance requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Requests</p>
                <p className="text-2xl font-bold text-white">{requests.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Pending</p>
                <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Resolved</p>
                <p className="text-2xl font-bold text-white">{resolvedRequests.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Requests List */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Requests</h2>
            <div className="flex gap-2">
              <Link href="/landlord/maintenance">
                <GlassButton
                  variant={!searchParams.filter ? "primary" : "secondary"}
                  size="sm"
                >
                  All
                </GlassButton>
              </Link>
              <Link href="/landlord/maintenance?filter=pending">
                <GlassButton
                  variant={searchParams.filter === "pending" ? "primary" : "secondary"}
                  size="sm"
                >
                  Pending
                </GlassButton>
              </Link>
              <Link href="/landlord/maintenance?filter=resolved">
                <GlassButton
                  variant={searchParams.filter === "resolved" ? "primary" : "secondary"}
                  size="sm"
                >
                  Resolved
                </GlassButton>
              </Link>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Requests Yet</h3>
              <p className="text-white/60">Maintenance requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request: typeof requests[0]) => (
                <Link
                  key={request.id}
                  href={`/landlord/maintenance/${request.id}`}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{request.title}</h3>
                      <p className="text-sm text-white/60 mb-3 line-clamp-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{request.unit.property.address} - Unit {request.unit.unitNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{request.tenant.name || request.tenant.email}</span>
                        </div>
                        <span>Submitted: {formatDate(request.createdAt)}</span>
                        {request.photos.length > 0 && (
                          <span>{request.photos.length} photo{request.photos.length > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
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
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </LandlordLayout>
  );
}

