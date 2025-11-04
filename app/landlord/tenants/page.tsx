import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TenantsPage() {
  const session = await requireRole("LANDLORD");

  // Get all tenants assigned to units in landlord's properties
  const tenants = await prisma.user.findMany({
    where: {
      role: "TENANT",
      tenantUnits: {
        some: {
          unit: {
            property: {
              landlordId: session.user.id,
            },
          },
        },
      },
    },
    include: {
      tenantUnits: {
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
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
      _count: {
        select: {
          payments: true,
          maintenanceRequests: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Tenants
          </h1>
          <p className="text-white/60">Manage your tenants</p>
        </div>

        {tenants.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Tenants Yet</h3>
            <p className="text-white/60 mb-6">
              Tenants will appear here once they sign up via invitation links.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant: typeof tenants[0]) => (
              <Link key={tenant.id} href={`/landlord/tenants/${tenant.id}`}>
                <GlassCard className="hover:scale-[1.02] transition-transform cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {tenant.name || "Unnamed Tenant"}
                        </h3>
                        <p className="text-sm text-white/60">{tenant.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {tenant.phone && (
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Phone className="w-4 h-4" />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    {tenant.tenantUnits && tenant.tenantUnits.length > 0 && (
                      <div className="space-y-1">
                        {tenant.tenantUnits.slice(0, 2).map((ut) => (
                          <div key={ut.id} className="flex items-center gap-2 text-sm text-white/80">
                            <Building2 className="w-4 h-4" />
                            <span>
                              {ut.unit.property.address} - Unit {ut.unit.unitNumber}
                            </span>
                          </div>
                        ))}
                        {tenant.tenantUnits.length > 2 && (
                          <p className="text-xs text-white/60">
                            +{tenant.tenantUnits.length - 2} more unit{tenant.tenantUnits.length - 2 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-sm text-white/60">Payments:</span>
                      <span className="font-semibold text-white">
                        {tenant._count.payments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-sm text-white/60">Maintenance:</span>
                      <span className="font-semibold text-white">
                        {tenant._count.maintenanceRequests}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LandlordLayout>
  );
}

