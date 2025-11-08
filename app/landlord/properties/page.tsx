import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prismaQuery as prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Building2, MapPin, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PropertiesPage() {
  const session = await requireRole("LANDLORD");

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    select: {
      id: true,
      address: true,
      location: true,
      propertyType: true,
      units: {
        select: {
          id: true,
          isOccupied: true,
          rentAmount: true,
        },
      },
      _count: {
        select: {
          units: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Properties
            </h1>
            <p className="text-white/60">Manage your rental properties</p>
          </div>
          <Link href="/landlord/properties/new">
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Property
            </GlassButton>
          </Link>
        </div>

        {properties.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Properties Yet</h3>
            <p className="text-white/60 mb-6">Create your first property to get started.</p>
            <Link href="/landlord/properties/new">
              <GlassButton variant="primary">Add First Property</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: typeof properties[0]) => {
              const occupiedUnits = property.units.filter((u: typeof property.units[0]) => u.isOccupied).length;
              const totalRent = property.units.reduce((sum: number, unit: typeof property.units[0]) => sum + unit.rentAmount, 0);

              return (
                <Link key={property.id} href={`/landlord/properties/${property.id}`}>
                  <GlassCard className="hover:scale-[1.02] transition-transform cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{property.address}</h3>
                          {property.location && (
                            <p className="text-sm text-white/70 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {property.location}
                            </p>
                          )}
                          <p className="text-sm text-white/60 capitalize">{property.propertyType}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{property.address}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-sm text-white/60">Units:</span>
                        <span className="font-semibold text-white">
                          {occupiedUnits}/{property._count.units} occupied
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-sm text-white/60">Total Rent:</span>
                        <span className="font-semibold text-white">{formatCurrency(totalRent)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <GlassButton variant="secondary" size="sm" className="flex-1">
                        View Details
                      </GlassButton>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </LandlordLayout>
  );
}

