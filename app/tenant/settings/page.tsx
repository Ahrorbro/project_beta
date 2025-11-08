import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery as prisma } from "@/lib/prisma";
import { User, Mail, Phone, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { JoinApartmentForm } from "@/components/tenant/JoinApartmentForm";

export default async function TenantSettingsPage() {
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
    },
  });

  if (!tenant) {
    return null;
  }

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Settings
          </h1>
          <p className="text-white/60">Manage your account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Name</p>
                <p className="text-white font-medium">{tenant.name || "Not set"}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Email</p>
                <p className="text-white font-medium">{tenant.email}</p>
              </div>
              {tenant.phone && (
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-white/60 mb-1">Phone</p>
                  <p className="text-white font-medium">{tenant.phone}</p>
                </div>
              )}
              {tenant.tenantUnits && tenant.tenantUnits.length > 0 && (
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-white/60 mb-2">Assigned Unit{tenant.tenantUnits.length > 1 ? "s" : ""}</p>
                  <div className="space-y-2">
                    {tenant.tenantUnits.map((ut) => (
                      <div key={ut.id} className="mb-2">
                        <p className="text-white font-medium">
                          {ut.unit.property.address} - Unit {ut.unit.unitNumber}
                        </p>
                        {ut.unit.property.location && (
                          <p className="text-sm text-white/60 ml-4">
                            📍 {ut.unit.property.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Member Since</p>
                <p className="text-white font-medium">{formatDate(tenant.createdAt)}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Data Protection</p>
                <p className="text-white font-medium">Tanzanian PDPA Compliant</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Account Status</p>
                <p className="text-white font-medium">Active</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Join Apartment Section */}
        <JoinApartmentForm />
      </div>
    </TenantLayout>
  );
}

