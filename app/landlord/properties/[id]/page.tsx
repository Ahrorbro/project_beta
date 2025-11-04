import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, MapPin, Plus, Users, CreditCard, Wrench } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { UnitInviteButton } from "@/components/landlord/UnitInviteButton";

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const session = await requireRole("LANDLORD");

  const property = (await prisma.property.findFirst({
    where: {
      id: params.id,
      landlordId: session.user.id,
    },
    include: {
      units: {
        include: {
          tenants: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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
        orderBy: [
          { floor: "asc" },
          { unitNumber: "asc" },
        ],
      },
    },
  })) as unknown as {
    id: string;
    address: string;
    propertyType: string;
    description: string | null;
    units: Array<{
      id: string;
      unitNumber: string;
      rentAmount: number;
      isOccupied: boolean;
      floor: number | null;
      invitationToken: string;
      tenants: Array<{
        id: string;
        tenant: {
          id: string;
          name: string | null;
          email: string;
        };
      }>;
      _count: {
        payments: number;
        maintenanceRequests: number;
      };
    }>;
  } | null;

  if (!property) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const occupiedUnits = property.units.filter((u: typeof property.units[0]) => u.isOccupied).length;
  const totalRent = property.units.reduce((sum: number, unit: typeof property.units[0]) => sum + unit.rentAmount, 0);

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/landlord/properties"
              className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
            >
              ← Back to Properties
            </Link>
            <h1 className="text-4xl font-bold mb-2 text-white">
              {property.address}
            </h1>
            <p className="text-white/60 capitalize">{property.propertyType} property</p>
          </div>
          <Link href={`/landlord/properties/${property.id}/units/new`}>
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Unit
            </GlassButton>
          </Link>
        </div>

        {/* Property Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{property.address}</h2>
                <p className="text-white/60 capitalize">{property.propertyType} property</p>
              </div>
            </div>

            {property.description && (
              <div className="mb-6 p-4 rounded-lg bg-white/5">
                <p className="text-white/80">{property.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Total Units</p>
                <p className="text-2xl font-bold text-white">{property.units.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Occupied Units</p>
                <p className="text-2xl font-bold text-white">{occupiedUnits}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Vacant Units</p>
                <p className="text-2xl font-bold text-white">
                  {property.units.length - occupiedUnits}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Total Monthly Rent</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalRent)}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Link href={`/landlord/properties/${property.id}/units/new`}>
                <GlassButton variant="secondary" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </GlassButton>
              </Link>
              <Link href={`/landlord/properties/${property.id}/edit`}>
                <GlassButton variant="secondary" className="w-full justify-start">
                  Edit Property
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Units List */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Units</h2>
            <span className="text-sm text-white/60">
              {property.units.length} unit{property.units.length !== 1 ? "s" : ""}
            </span>
          </div>

          {property.units.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Units Yet</h3>
              <p className="text-white/60 mb-6">
                Create your first unit to start managing tenants.
              </p>
              <Link href={`/landlord/properties/${property.id}/units/new`}>
                <GlassButton variant="primary">Add First Unit</GlassButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.units.map((unit: typeof property.units[0]) => {
                const invitationLink = `${baseUrl}/invite/${unit.invitationToken}`;
                return (
                  <div
                    key={unit.id}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <Link href={`/landlord/properties/${property.id}/units/${unit.id}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">
                            Unit {unit.unitNumber}
                            {unit.floor && ` (Floor ${unit.floor})`}
                          </h3>
                          <p className="text-sm text-white/60">
                            {formatCurrency(unit.rentAmount)}/month
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          unit.isOccupied ? "bg-green-500" : "bg-gray-500"
                        }`} />
                      </div>

                      {unit.isOccupied && unit.tenants && unit.tenants.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-white/80">
                              {unit.tenants.length} Tenant{unit.tenants.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="space-y-1 mt-2">
                            {unit.tenants.slice(0, 2).map((ut) => (
                              <p key={ut.tenant.id} className="text-xs text-white/60">
                                • {ut.tenant.name || ut.tenant.email}
                              </p>
                            ))}
                            {unit.tenants.length > 2 && (
                              <p className="text-xs text-white/40">
                                +{unit.tenants.length - 2} more
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-sm text-white/60">Vacant</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
                        {unit._count.payments > 0 && (
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            <span>{unit._count.payments} payments</span>
                          </div>
                        )}
                        {unit._count.maintenanceRequests > 0 && (
                          <div className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            <span>{unit._count.maintenanceRequests} requests</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    {/* Invitation Link Section - Always Visible */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <UnitInviteButton 
                        invitationLink={invitationLink} 
                        unitNumber={unit.unitNumber}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </LandlordLayout>
  );
}

