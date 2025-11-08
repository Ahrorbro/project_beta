import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery } from "@/lib/prisma";
import { TrendingUp, Users, Building2, CreditCard, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireRole("SUPER_ADMIN");

  // Fetch comprehensive analytics
  const [
    totalLandlords,
    totalTenants,
    totalProperties,
    totalUnits,
    totalPayments,
    totalRevenue,
    activeSubscriptions,
    overduePayments,
  ] = await Promise.all([
    prismaQuery.user.count({ where: { role: "LANDLORD" } }),
    prismaQuery.user.count({ where: { role: "TENANT" } }),
    prismaQuery.property.count(),
    prismaQuery.unit.count(),
    prismaQuery.payment.count(),
    prismaQuery.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prismaQuery.subscription.count({
      where: { status: "ACTIVE" },
    }),
    prismaQuery.payment.count({
      where: { status: "OVERDUE" },
    }),
  ]);

  const revenue = totalRevenue._sum.amount || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            System Analytics
          </h1>
          <p className="text-white/60">Platform-wide statistics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalLandlords}</p>
              <p className="text-sm text-white/60">Total Landlords</p>
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalTenants}</p>
              <p className="text-sm text-white/60">Total Tenants</p>
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalProperties}</p>
              <p className="text-sm text-white/60">Total Properties</p>
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 opacity-10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{formatCurrency(revenue)}</p>
              <p className="text-sm text-white/60">Total Revenue</p>
            </div>
          </GlassCard>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Platform Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80">Total Units</span>
                </div>
                <span className="text-xl font-bold text-white">{totalUnits}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">Total Payments</span>
                </div>
                <span className="text-xl font-bold text-white">{totalPayments}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white/80">Active Subscriptions</span>
                </div>
                <span className="text-xl font-bold text-white">{activeSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                  <span className="text-white/80">Overdue Payments</span>
                </div>
                <span className="text-xl font-bold text-white">{overduePayments}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Quick Insights</h2>
            <div className="space-y-4">
              <div className="relative overflow-hidden p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Average Units per Property</p>
                    <p className="text-2xl font-bold text-white">
                      {totalProperties > 0 ? (totalUnits / totalProperties).toFixed(1) : "0"}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="relative overflow-hidden p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Average Payment Amount</p>
                    <p className="text-2xl font-bold text-white">
                      {totalPayments > 0 ? formatCurrency(revenue / totalPayments) : formatCurrency(0)}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/40" />
                </div>
              </div>
              <div className="relative overflow-hidden p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Tenant to Landlord Ratio</p>
                    <p className="text-2xl font-bold text-white">
                      {totalLandlords > 0 ? (totalTenants / totalLandlords).toFixed(1) : "0"} : 1
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminLayout>
  );
}

