import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery } from "@/lib/prisma";
import { Building2, MapPin, Calendar, Users, Home } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function PropertiesAdminPage() {
  await requireRole("SUPER_ADMIN");

  const properties = await prismaQuery.property.findMany({
    include: {
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      units: {
        select: {
          id: true,
          isOccupied: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate occupied units for each property
  const propertiesWithStats = properties.map((property) => {
    const occupiedUnits = property.units.filter((unit) => unit.isOccupied).length;
    return {
      ...property,
      occupiedUnits,
      totalUnits: property.units.length,
    };
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              All Properties
            </h1>
            <p className="text-white/60">View and manage all properties across the system</p>
          </div>
          <div className="px-3 py-1.5 rounded-md text-sm bg-white/10 border border-white/20 text-white/80">
            Total: {properties.length}
          </div>
        </div>

        {properties.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Properties Yet</h3>
            <p className="text-white/60">Properties will appear here once landlords create them.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesWithStats.map((property) => (
              <GlassCard key={property.id} className="hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{property.address}</h3>
                      {property.location && (
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <MapPin className="w-3 h-3" />
                          <span>{property.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Users className="w-4 h-4" />
                    <span className="text-white/60">Landlord:</span>
                    <Link
                      href={`/admin/landlords/${property.landlord.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {property.landlord.name || property.landlord.email}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/60">Units:</span>
                      <span className="font-semibold text-white">
                        {property.occupiedUnits || 0} / {property.totalUnits}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">
                      {property.totalUnits > 0
                        ? Math.round(((property.occupiedUnits || 0) / property.totalUnits) * 100)
                        : 0}
                      % occupied
                    </span>
                  </div>
                </div>

                <Link href={`/admin/landlords/${property.landlord.id}/properties/${property.id}`}>
                  <button className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20">
                    View Details
                  </button>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

