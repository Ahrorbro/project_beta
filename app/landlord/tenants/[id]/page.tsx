import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Users, Mail, Phone, Building2, CreditCard, Wrench, FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { TenantLeaseManagement } from "@/components/landlord/TenantLeaseManagement";

interface TenantDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const session = await requireRole("LANDLORD");

  const tenant = await prisma.user.findFirst({
    where: {
      id: params.id,
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
    include: {
      tenantUnits: {
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      leaseAgreements: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/landlord/tenants"
              className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
            >
              ← Back to Tenants
            </Link>
            <h1 className="text-4xl font-bold mb-2 text-white">
              {tenant.name || "Unnamed Tenant"}
            </h1>
            <p className="text-white/60">Tenant details and management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenant Profile */}
          <GlassCard className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {tenant.name || "Unnamed Tenant"}
                </h2>
                <p className="text-white/60">Tenant</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-white/60" />
                <span className="text-white/80">{tenant.email}</span>
              </div>
              {tenant.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">{tenant.phone}</span>
                </div>
              )}
              {tenant.tenantUnits && tenant.tenantUnits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/60">Unit(s):</p>
                  {tenant.tenantUnits.map((ut) => (
                    <div key={ut.id} className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-white/60" />
                      <span className="text-white/80">
                        {ut.unit.property.address} - Unit {ut.unit.unitNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/60">Joined:</span>
                <span className="text-white/80">{formatDate(tenant.createdAt)}</span>
              </div>
            </div>

            {tenant.phone && (
              <div className="mt-6">
                <a
                  href={`https://wa.me/${tenant.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button w-full flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Contact via WhatsApp
                </a>
              </div>
            )}
          </GlassCard>

          {/* Tenant Stats */}
          <GlassCard className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 text-white">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-white/60">Total Payments</p>
                </div>
                <p className="text-2xl font-bold text-white">{tenant.payments.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-white/60">Maintenance Requests</p>
                </div>
                <p className="text-2xl font-bold text-white">{tenant.maintenanceRequests.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Lease Management */}
        <GlassCard>
          <TenantLeaseManagement tenant={tenant} />
        </GlassCard>

        {/* Recent Payments */}
        {tenant.payments.length > 0 && (
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Recent Payments</h2>
            <div className="space-y-3">
              {tenant.payments.map((payment: typeof tenant.payments[0]) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-white/60">
                        Due: {formatDate(payment.dueDate)}
                        {payment.paidDate && ` • Paid: ${formatDate(payment.paidDate)}`}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === "PAID"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : payment.status === "OVERDUE"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Maintenance Requests */}
        {tenant.maintenanceRequests.length > 0 && (
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Recent Maintenance Requests</h2>
            <div className="space-y-3">
              {tenant.maintenanceRequests.map((request: typeof tenant.maintenanceRequests[0]) => (
                <Link
                  key={request.id}
                  href={`/landlord/maintenance/${request.id}`}
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
    </LandlordLayout>
  );
}

