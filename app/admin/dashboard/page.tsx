import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { Users, Building2, CreditCard, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  await requireRole("SUPER_ADMIN");

  // Fetch system-wide statistics
  const [
    totalLandlords,
    totalTenants,
    totalProperties,
    totalPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "LANDLORD" } }),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.property.count(),
    prisma.payment.count(),
  ]);

  const stats = [
    {
      label: "Total Landlords",
      value: totalLandlords,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total Tenants",
      value: totalTenants,
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Total Properties",
      value: totalProperties,
      icon: Building2,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Payments",
      value: totalPayments,
      icon: CreditCard,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-white/60">System-wide overview and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat: typeof stats[0]) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={stat.label} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-white/40" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Quick Actions */}
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/landlords/new"
              className="glass-button text-center block"
            >
              Create New Landlord
            </a>
            <a
              href="/admin/landlords"
              className="glass-button text-center block"
            >
              Manage Landlords
            </a>
            <a
              href="/admin/analytics"
              className="glass-button text-center block"
            >
              View Analytics
            </a>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}

