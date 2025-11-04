import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prisma } from "@/lib/prisma";
import { Wrench, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TenantMaintenancePage() {
  const session = await requireRole("TENANT");

  const tenant = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenantUnits: {
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
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tenant || !tenant.tenantUnits || tenant.tenantUnits.length === 0) {
    return (
      <TenantLayout>
        <GlassCard className="text-center py-12">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Unit Assigned</h3>
          <p className="text-white/60">
            Please contact your landlord to get assigned to a unit.
          </p>
        </GlassCard>
      </TenantLayout>
    );
  }

  const pendingRequests = tenant.maintenanceRequests.filter(
    (r: typeof tenant.maintenanceRequests[0]) => r.status === "SUBMITTED" || r.status === "IN_PROGRESS"
  );
  const resolvedRequests = tenant.maintenanceRequests.filter((r: typeof tenant.maintenanceRequests[0]) => r.status === "RESOLVED");

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">
              Maintenance Requests
            </h1>
            <p className="text-white/60">Submit and track maintenance requests</p>
          </div>
          <Link href="/tenant/maintenance/new">
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Request
            </GlassButton>
          </Link>
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
                <p className="text-2xl font-bold text-white">{tenant.maintenanceRequests.length}</p>
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
          <h2 className="text-2xl font-semibold mb-6 text-white">Your Requests</h2>

          {tenant.maintenanceRequests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Requests Yet</h3>
              <p className="text-white/60 mb-6">Submit your first maintenance request</p>
              <Link href="/tenant/maintenance/new">
                <GlassButton variant="primary">Create Request</GlassButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tenant.maintenanceRequests.map((request: typeof tenant.maintenanceRequests[0]) => (
                <Link
                  key={request.id}
                  href={`/tenant/maintenance/${request.id}`}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{request.title}</h3>
                      <p className="text-sm text-white/60 mb-2 line-clamp-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
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
    </TenantLayout>
  );
}

