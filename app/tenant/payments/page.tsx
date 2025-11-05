import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prismaQuery as prisma } from "@/lib/prisma";
import { CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface PaymentsPageProps {
  searchParams: {
    filter?: string;
  };
}

export default async function TenantPaymentsPage({ searchParams }: PaymentsPageProps) {
  const session = await requireRole("TENANT");

  const tenant = (await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenantUnits: {
        include: {
          unit: {
            include: {
              property: {
                select: {
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
        orderBy: { dueDate: "desc" },
        where: searchParams.filter === "overdue" ? { status: "OVERDUE" } : undefined,
      },
    },
  })) as unknown as {
    id: string;
    tenantUnits: Array<{
      unit: {
        property: {
          address: string;
        };
      };
    }>;
    payments: Array<{
      id: string;
      amount: number;
      dueDate: Date;
      paidDate: Date | null;
      status: string;
      createdAt: Date;
    }>;
  } | null;

  if (!tenant || !tenant.tenantUnits || tenant.tenantUnits.length === 0) {
    return (
      <TenantLayout>
        <GlassCard className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Unit Assigned</h3>
          <p className="text-white/60">
            Please contact your landlord to get assigned to a unit.
          </p>
        </GlassCard>
      </TenantLayout>
    );
  }

  const totalPaid = tenant.payments
    .filter((p: typeof tenant.payments[0]) => p.status === "PAID")
    .reduce((sum: number, p: typeof tenant.payments[0]) => sum + p.amount, 0);
  const pendingPayments = tenant.payments.filter((p: typeof tenant.payments[0]) => p.status === "PENDING");
  const overduePayments = tenant.payments.filter((p: typeof tenant.payments[0]) => p.status === "OVERDUE");

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Payments
          </h1>
          <p className="text-white/60">View and manage your payment history</p>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Paid</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Pending</p>
                <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Overdue</p>
                <p className="text-2xl font-bold text-white">{overduePayments.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Payment List */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Payment History</h2>
            <div className="flex gap-2">
              <Link href="/tenant/payments">
                <GlassButton
                  variant={!searchParams.filter ? "primary" : "secondary"}
                  size="sm"
                >
                  All
                </GlassButton>
              </Link>
              <Link href="/tenant/payments?filter=overdue">
                <GlassButton
                  variant={searchParams.filter === "overdue" ? "primary" : "secondary"}
                  size="sm"
                >
                  Overdue
                </GlassButton>
              </Link>
            </div>
          </div>

          {tenant.payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Payments Yet</h3>
              <p className="text-white/60">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenant.payments.map((payment: typeof tenant.payments[0]) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-white/60" />
                        <p className="text-xl font-bold text-white">{formatCurrency(payment.amount)}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(payment.dueDate)}</span>
                        </div>
                        {payment.paidDate && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Paid: {formatDate(payment.paidDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          payment.status === "PAID"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : payment.status === "OVERDUE"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}
                      >
                        {payment.status}
                      </span>
                      {payment.status === "PENDING" && (
                        <GlassButton variant="primary" size="sm">
                          Pay Now
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </TenantLayout>
  );
}

