import { redirect } from "next/navigation";
import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prisma } from "@/lib/prisma";
import { Building2, Users, CreditCard, Wrench, TrendingUp, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function LandlordDashboard() {
  const session = await requireRole("LANDLORD");

  // Check if profile is complete and get subscription
  const landlord = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  });

  if (!landlord) {
    redirect("/auth/login");
  }

  if (!landlord.landlordProfileComplete) {
    redirect("/landlord/onboarding");
  }

  // Check if user has active access (trial or paid membership)
  const { hasActiveAccess } = await import("@/lib/subscription");
  if (!landlord.subscription || !hasActiveAccess(landlord.subscription)) {
    redirect("/landlord/membership-required");
  }

  // Fetch landlord statistics
  const [
    totalProperties,
    totalUnits,
    totalTenants,
    totalPayments,
    totalRevenue,
    overduePayments,
    pendingMaintenance,
  ] = await Promise.all([
    prisma.property.count({
      where: { landlordId: session.user.id },
    }),
    prisma.unit.count({
      where: {
        property: {
          landlordId: session.user.id,
        },
      },
    }),
    prisma.user.count({
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
    }),
    prisma.payment.count({
      where: {
        unit: {
          property: {
            landlordId: session.user.id,
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        unit: {
          property: {
            landlordId: session.user.id,
          },
        },
        status: "PAID",
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: {
        unit: {
          property: {
            landlordId: session.user.id,
          },
        },
        status: "OVERDUE",
      },
    }),
    prisma.maintenanceRequest.count({
      where: {
        unit: {
          property: {
            landlordId: session.user.id,
          },
        },
        status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      },
    }),
  ]);

  const revenue = totalRevenue._sum.amount || 0;

  const stats = [
    {
      label: "Total Properties",
      value: totalProperties,
      icon: Building2,
      color: "from-blue-500 to-cyan-500",
      link: "/landlord/properties",
    },
    {
      label: "Total Units",
      value: totalUnits,
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      link: "/landlord/properties",
    },
    {
      label: "Active Tenants",
      value: totalTenants,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      link: "/landlord/tenants",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(revenue),
      icon: CreditCard,
      color: "from-orange-500 to-red-500",
      link: "/landlord/payments",
    },
  ];

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">
              Dashboard
            </h1>
            <p className="text-white/60">Welcome back, {landlord.name || "Landlord"}!</p>
          </div>
          <Link href="/landlord/properties/new">
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Property
            </GlassButton>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat: typeof stats[0]) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.link}>
                <GlassCard className="hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-white/40" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </GlassCard>
              </Link>
            );
          })}
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {overduePayments > 0 && (
            <GlassCard className="border-l-4 border-l-red-500">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Overdue Payments</h2>
              </div>
              <p className="text-white/80 mb-4">
                You have {overduePayments} overdue payment{overduePayments > 1 ? "s" : ""} that need attention.
              </p>
              <Link href="/landlord/payments?filter=overdue">
                <GlassButton variant="secondary" size="sm">
                  View Payments
                </GlassButton>
              </Link>
            </GlassCard>
          )}

          {pendingMaintenance > 0 && (
            <GlassCard className="border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Pending Maintenance</h2>
              </div>
              <p className="text-white/80 mb-4">
                You have {pendingMaintenance} maintenance request{pendingMaintenance > 1 ? "s" : ""} waiting for your attention.
              </p>
              <Link href="/landlord/maintenance?filter=pending">
                <GlassButton variant="secondary" size="sm">
                  View Requests
                </GlassButton>
              </Link>
            </GlassCard>
          )}
        </div>
      </div>
    </LandlordLayout>
  );
}

