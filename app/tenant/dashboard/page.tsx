import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery as prisma } from "@/lib/prisma";
import { Building2, CreditCard, Wrench, FileText, Calendar, Phone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TenantDashboard() {
  const session = await requireRole("TENANT");

  // Get tenant with unit and related data - optimized with select
  const tenant = (await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      tenantUnits: {
        select: {
          unit: {
            select: {
              id: true,
              unitNumber: true,
              rentAmount: true,
              floor: true,
              leaseStartDate: true,
              leaseEndDate: true,
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
        take: 10, // Limit to prevent excessive data
      },
      payments: {
        select: {
          id: true,
          amount: true,
          dueDate: true,
          status: true,
        },
        orderBy: { dueDate: "asc" },
        take: 3,
      },
      maintenanceRequests: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        where: {
          status: { in: ["SUBMITTED", "IN_PROGRESS"] },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      leaseAgreements: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })) as unknown as {
    id: string;
    email: string;
    name: string | null;
    tenantUnits: Array<{
      unit: {
        id: string;
        unitNumber: string;
        rentAmount: number;
        floor: number | null;
        leaseStartDate: Date | null;
        leaseEndDate: Date | null;
        property: {
          address: string;
          location: string | null;
        };
      };
    }>;
    payments: Array<{
      id: string;
      amount: number;
      dueDate: Date;
      status: string;
    }>;
    maintenanceRequests: Array<{
      id: string;
      title: string;
      status: string;
      createdAt: Date;
    }>;
    leaseAgreements: Array<{
      id: string;
      startDate: Date;
      endDate: Date;
    }>;
  } | null;

  if (!tenant || !tenant.tenantUnits || tenant.tenantUnits.length === 0) {
    return (
      <TenantLayout>
        <GlassCard className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Unit Assigned</h3>
          <p className="text-white/60">
            Please contact your landlord to get assigned to a unit.
          </p>
        </GlassCard>
      </TenantLayout>
    );
  }

  // Get the first unit (primary unit) or all units
  const primaryUnit = tenant.tenantUnits[0]?.unit;
  const allUnits = tenant.tenantUnits.map(ut => ut.unit);
  const activeLease = tenant.leaseAgreements[0];
  const upcomingPayment = tenant.payments.find((p: typeof tenant.payments[0]) => p.status === "PENDING");
  const overduePayments = tenant.payments.filter((p: typeof tenant.payments[0]) => p.status === "OVERDUE");

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Dashboard
          </h1>
          <p className="text-white/60">Welcome back, {tenant.name || "Tenant"}!</p>
        </div>

        {/* Unit Information */}
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {primaryUnit?.property.address || "No Unit Assigned"}
              </h2>
              <p className="text-white/60">
                {primaryUnit ? (
                  <>
                    {primaryUnit.property.location && (
                      <span className="block text-white/80 mb-1">
                        📍 {primaryUnit.property.location}
                      </span>
                    )}
                    Unit {primaryUnit.unitNumber}{primaryUnit.floor && ` (Floor ${primaryUnit.floor})`}
                  </>
                ) : (
                  "Please contact your landlord"
                )}
              </p>
              {allUnits.length > 1 && (
                <p className="text-sm text-white/60 mt-1">
                  +{allUnits.length - 1} more unit{allUnits.length - 1 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {primaryUnit && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Monthly Rent</p>
                <p className="text-xl font-bold text-white">{formatCurrency(primaryUnit.rentAmount)}</p>
              </div>
              {primaryUnit.leaseStartDate && primaryUnit.leaseEndDate && (
                <>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/60 mb-1">Lease Start</p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(primaryUnit.leaseStartDate)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/60 mb-1">Lease End</p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(primaryUnit.leaseEndDate)}
                    </p>
                  </div>
                </>
              )}
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Status</p>
                <p className="text-sm font-semibold text-green-400">Active</p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Alerts */}
        {(overduePayments.length > 0 || upcomingPayment) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {overduePayments.length > 0 && (
              <GlassCard className="border-l-4 border-l-red-500">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-semibold text-white">Overdue Payments</h2>
                </div>
                <p className="text-white/80 mb-4">
                  You have {overduePayments.length} overdue payment
                  {overduePayments.length > 1 ? "s" : ""} that need attention.
                </p>
                <Link href="/tenant/payments?filter=overdue">
                  <button className="glass-button text-sm">View Payments</button>
                </Link>
              </GlassCard>
            )}

            {upcomingPayment && (
              <GlassCard className="border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Upcoming Payment</h2>
                </div>
                <p className="text-white/80 mb-2">
                  Payment of {formatCurrency(upcomingPayment.amount)} due on{" "}
                  {formatDate(upcomingPayment.dueDate)}
                </p>
                <Link href="/tenant/payments">
                  <button className="glass-button text-sm">View Details</button>
                </Link>
              </GlassCard>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/tenant/payments">
            <GlassCard className="hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Payments</h3>
                  <p className="text-sm text-white/60">View payment history</p>
                </div>
              </div>
            </GlassCard>
          </Link>

          <Link href="/tenant/maintenance">
            <GlassCard className="hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Maintenance</h3>
                  <p className="text-sm text-white/60">
                    {tenant.maintenanceRequests.length > 0
                      ? `${tenant.maintenanceRequests.length} pending`
                      : "Submit request"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>

          <Link href="/tenant/lease">
            <GlassCard className="hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Lease</h3>
                  <p className="text-sm text-white/60">
                    {activeLease ? "View lease agreement" : "No lease uploaded"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Recent Activity */}
        {tenant.maintenanceRequests.length > 0 && (
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Recent Maintenance Requests</h2>
            <div className="space-y-3">
              {tenant.maintenanceRequests.map((request: typeof tenant.maintenanceRequests[0]) => (
                <Link
                  key={request.id}
                  href={`/tenant/maintenance/${request.id}`}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{request.title}</p>
                      <p className="text-sm text-white/60">{formatDate(request.createdAt)}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === "RESOLVED"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : request.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </TenantLayout>
  );
}

