import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prismaQuery as prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, Link as LinkIcon, Copy, Users, CreditCard, Wrench } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { UnitInvitationLink } from "@/components/landlord/UnitInvitationLink";
import { RemoveTenantButton } from "@/components/landlord/RemoveTenantButton";

interface UnitDetailPageProps {
  params: {
    id: string;
    unitId: string;
  };
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const session = await requireRole("LANDLORD");

  const unit = await prisma.unit.findFirst({
    where: {
      id: params.unitId,
      property: {
        id: params.id,
        landlordId: session.user.id,
      },
    },
    include: {
      property: true,
      tenants: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
  });

  if (!unit) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const invitationLink = `${baseUrl}/invite/${unit.invitationToken}`;

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/landlord/properties/${params.id}`}
              className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
            >
              ← Back to Property
            </Link>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Unit {unit.unitNumber}
            </h1>
            <p className="text-white/60">{unit.property.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Details */}
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Unit {unit.unitNumber}
                  {unit.floor && ` (Floor ${unit.floor})`}
                </h2>
                <p className="text-white/60">{unit.property.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Monthly Rent</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(unit.rentAmount)}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Status</p>
                <p className="text-2xl font-bold text-white">
                  {unit.isOccupied ? (
                    <span className="text-green-400">Occupied</span>
                  ) : (
                    <span className="text-gray-400">Vacant</span>
                  )}
                </p>
              </div>
            </div>

            {unit.leaseStartDate && unit.leaseEndDate && (
              <div className="mb-6 p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-2">Lease Period</p>
                <p className="text-white">
                  {formatDate(unit.leaseStartDate)} - {formatDate(unit.leaseEndDate)}
                </p>
              </div>
            )}

            {/* Tenants Info */}
            {unit.isOccupied && unit.tenants && unit.tenants.length > 0 ? (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-white/60" />
                  <h3 className="font-semibold text-white">
                    Tenant{unit.tenants.length > 1 ? "s" : ""} ({unit.tenants.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {unit.tenants.map((unitTenant, idx) => (
                    <div key={unitTenant.tenant.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">
                          {unitTenant.tenant.name || "Unnamed Tenant"}
                        </p>
                        <span className="text-xs text-white/60">#{idx + 1}</span>
                      </div>
                      <p className="text-sm text-white/60">{unitTenant.tenant.email}</p>
                      {unitTenant.tenant.phone && (
                        <p className="text-sm text-white/60">{unitTenant.tenant.phone}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Link
                          href={`/landlord/tenants/${unitTenant.tenant.id}`}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View Details →
                        </Link>
                        <RemoveTenantButton
                          propertyId={params.id}
                          unitId={params.unitId}
                          tenantId={unitTenant.tenant.id}
                          tenantName={unitTenant.tenant.name || unitTenant.tenant.email}
                          unitNumber={unit.unitNumber}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60">No tenants assigned</p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-white/60" />
                  <p className="text-sm text-white/60">Payments</p>
                </div>
                <p className="text-xl font-bold text-white">{unit._count.payments}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-white/60" />
                  <p className="text-sm text-white/60">Maintenance Requests</p>
                </div>
                <p className="text-xl font-bold text-white">{unit._count.maintenanceRequests}</p>
              </div>
            </div>
          </GlassCard>

          {/* Invitation Link Card - Always Visible */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Tenant Invitation</h3>
            </div>
            <p className="text-sm text-white/60 mb-4">
              {unit.isOccupied 
                ? `Share this link to invite additional tenants (spouse, roommate, family member). This unit already has ${unit.tenants.length} tenant${unit.tenants.length > 1 ? "s" : ""}. Each person gets a unique link.`
                : "Share this unique link with your tenant to allow them to sign up and access this unit."
              }
            </p>
            <UnitInvitationLink invitationLink={invitationLink} unitId={unit.id} />
          </GlassCard>
        </div>
      </div>
    </LandlordLayout>
  );
}

