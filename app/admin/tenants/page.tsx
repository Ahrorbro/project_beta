import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery } from "@/lib/prisma";
import { Users, Mail, Phone, Calendar, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TenantsAdminPage() {
  await requireRole("SUPER_ADMIN");

  const tenants = await prismaQuery.user.findMany({
    where: { role: "TENANT" },
    include: {
      tenantUnits: {
        include: {
          unit: {
            include: {
              property: { select: { id: true, address: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { payments: true, maintenanceRequests: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Tenants
            </h1>
            <p className="text-white/60">All registered tenants</p>
          </div>
          <div className="px-3 py-1.5 rounded-md text-sm bg-white/10 border border-white/20 text-white/80">
            Total: {tenants.length}
          </div>
        </div>

        {tenants.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Tenants Yet</h3>
            <p className="text-white/60">Tenants will appear here once they join.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <GlassCard key={tenant.id} className="hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {tenant.name || "Unnamed Tenant"}
                      </h3>
                      <p className="text-sm text-white/60">{tenant.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Mail className="w-4 h-4" />
                    <span>{tenant.email}</span>
                  </div>
                  {tenant.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Phone className="w-4 h-4" />
                      <span>{tenant.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(tenant.createdAt)}</span>
                  </div>
                </div>

                {tenant.tenantUnits && tenant.tenantUnits.length > 0 && (
                  <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/60 mb-1">
                      Unit{tenant.tenantUnits.length > 1 ? "s" : ""}
                    </p>
                    {tenant.tenantUnits.map((ut) => (
                      <div key={ut.id} className="flex items-center gap-2 text-sm text-white/80">
                        <Building2 className="w-4 h-4" />
                        <span>
                          {ut.unit.property.address} • Unit {ut.unit.unitNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                  <span>{tenant._count.payments} payments</span>
                  <span>{tenant._count.maintenanceRequests} requests</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


