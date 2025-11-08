import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery as prisma } from "@/lib/prisma";
import { FileText, Download, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TenantLeasePage() {
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
                  location: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      leaseAgreements: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tenant || !tenant.tenantUnits || tenant.tenantUnits.length === 0) {
    return (
      <TenantLayout>
        <GlassCard className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Unit Assigned</h3>
          <p className="text-white/60">
            Please contact your landlord to get assigned to a unit.
          </p>
        </GlassCard>
      </TenantLayout>
    );
  }

  const primaryUnit = tenant.tenantUnits[0]?.unit;

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Lease Agreement
          </h1>
          <p className="text-white/60">View your lease agreement and details</p>
        </div>

        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Lease Information</h2>
              <p className="text-white/60">{primaryUnit?.property.address || "No unit assigned"}</p>
            </div>
          </div>

          {primaryUnit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Property Address</p>
                <p className="font-semibold text-white">{primaryUnit.property.address}</p>
                {primaryUnit.property.location && (
                  <p className="text-sm text-white/60 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {primaryUnit.property.location}
                  </p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Unit Number</p>
                <p className="font-semibold text-white">Unit {primaryUnit.unitNumber}</p>
              </div>
              {primaryUnit.leaseStartDate && primaryUnit.leaseEndDate && (
                <>
                  <div className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <p className="text-sm text-white/60">Lease Start Date</p>
                    </div>
                    <p className="font-semibold text-white">{formatDate(primaryUnit.leaseStartDate)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <p className="text-sm text-white/60">Lease End Date</p>
                    </div>
                    <p className="font-semibold text-white">{formatDate(primaryUnit.leaseEndDate)}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {tenant.leaseAgreements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60 mb-4">No lease agreement uploaded yet</p>
              <p className="text-sm text-white/40">Contact your landlord to upload the lease agreement</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Lease Documents</h3>
              {tenant.leaseAgreements.map((lease: typeof tenant.leaseAgreements[0]) => (
                <div
                  key={lease.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">Lease Agreement</p>
                        <p className="text-sm text-white/60">
                          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={lease.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </TenantLayout>
  );
}

