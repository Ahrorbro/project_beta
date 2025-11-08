import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prismaQuery as prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, MapPin, Users, CreditCard, Wrench, Calendar } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface PropertyDetailPageProps {
  params: {
    id: string;
    propertyId: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  await requireRole("SUPER_ADMIN");

  try {
    // Verify landlord exists
    const landlord = await prisma.user.findUnique({
      where: { id: params.id, role: "LANDLORD" },
      select: { id: true, name: true, email: true },
    });

    if (!landlord) {
      notFound();
    }

    // Get property with all details - simplified query
    const property = await prisma.property.findFirst({
      where: { 
        id: params.propertyId,
        landlordId: landlord.id,
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
                    phone: true,
                  },
                },
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
    });

    if (!property) {
      notFound();
    }

    // Calculate stats
    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter((unit) => unit.tenants && unit.tenants.length > 0).length;
    const totalRent = property.units.reduce((sum, unit) => sum + (unit.rentAmount || 0), 0);
    const totalPayments = property.units.reduce(
      (sum, unit) => sum + (unit._count?.payments || 0),
      0
    );
    const totalMaintenanceRequests = property.units.reduce(
      (sum, unit) => sum + (unit._count?.maintenanceRequests || 0),
      0
    );

    return (
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <Link
              href={`/admin/landlords/${landlord.id}`}
              className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
            >
              ← Back to {landlord.name || "Landlord"}
            </Link>
            <h1 className="text-4xl font-bold mb-2 text-white">
              {property.address}
            </h1>
            {property.location && (
              <p className="text-white/80 flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5" />
                {property.location}
              </p>
            )}
            <p className="text-white/60">Property details and units</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-blue-400" />
                <span className="text-sm text-white/60">Total Units</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalUnits}</p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-green-400" />
                <span className="text-sm text-white/60">Occupied</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {occupiedUnits}/{totalUnits}
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-white/60">Total Rent</span>
              </div>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalRent)}</p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-6 h-6 text-orange-400" />
                <span className="text-sm text-white/60">Maintenance</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalMaintenanceRequests}</p>
            </GlassCard>
          </div>

          {/* Property Details */}
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">Address</span>
                </div>
                <p className="text-white font-medium">{property.address}</p>
              </div>
              {property.location && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/60">Location</span>
                  </div>
                  <p className="text-white font-medium">{property.location}</p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">Type</span>
                </div>
                <p className="text-white font-medium capitalize">{property.propertyType}</p>
              </div>
              {property.description && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-white/60">Description</span>
                  </div>
                  <p className="text-white/80">{property.description}</p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">Created</span>
                </div>
                <p className="text-white font-medium">{formatDate(property.createdAt)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Units List */}
          {property.units.length > 0 ? (
            <GlassCard>
              <h2 className="text-2xl font-semibold mb-6 text-white">Units</h2>
              <div className="space-y-4">
                {property.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">
                          Unit {unit.unitNumber}
                          {unit.floor && ` • Floor ${unit.floor}`}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4 text-white/60" />
                            <span className="text-white/80">Rent: {formatCurrency(unit.rentAmount || 0)}</span>
                          </div>
                          {unit.tenants && unit.tenants.length > 0 ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">
                                Occupied by: {unit.tenants.map((ut) => ut.tenant.name || ut.tenant.email).join(", ")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-white/40" />
                              <span className="text-white/60">Vacant</span>
                            </div>
                          )}
                          {unit.leaseStartDate && unit.leaseEndDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-white/60" />
                              <span className="text-white/80">
                                Lease: {formatDate(unit.leaseStartDate)} - {formatDate(unit.leaseEndDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          unit.tenants && unit.tenants.length > 0 
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-white/10 text-white/60 border-white/20"
                        }`}>
                          {unit.tenants && unit.tenants.length > 0 ? "Occupied" : "Vacant"}
                        </span>
                        <div className="text-xs text-white/60">
                          <div>{unit._count?.payments || 0} payments</div>
                          <div>{unit._count?.maintenanceRequests || 0} requests</div>
                        </div>
                      </div>
                    </div>
                    {unit.tenants && unit.tenants.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-medium text-white mb-2">Tenant Details</h4>
                        <div className="space-y-2 text-sm text-white/80">
                          {unit.tenants.map((ut) => (
                            <div key={ut.tenant.id} className="p-2 rounded bg-white/5">
                              <p><span className="text-white/60">Name:</span> {ut.tenant.name || "N/A"}</p>
                              <p><span className="text-white/60">Email:</span> {ut.tenant.email}</p>
                              {ut.tenant.phone && <p><span className="text-white/60">Phone:</span> {ut.tenant.phone}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard>
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Units Yet</h3>
                <p className="text-white/60">This property doesn't have any units yet.</p>
              </div>
            </GlassCard>
          )}
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error("Error loading property details:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // Return a user-friendly error page instead of throwing
    return (
      <AdminLayout>
        <GlassCard className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-400">Error Loading Property</h1>
          <p className="text-white/60 mb-4">
            {error instanceof Error ? error.message : "Failed to load property details. Please try again."}
          </p>
          <Link href={`/admin/landlords/${params.id}`}>
            <GlassButton variant="primary">Back to Landlord</GlassButton>
          </Link>
        </GlassCard>
      </AdminLayout>
    );
  }
}

