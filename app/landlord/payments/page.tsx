import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prismaQuery as prisma } from "@/lib/prisma";
import { CreditCard, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { PaymentItem } from "@/components/landlord/PaymentItem";

interface PaymentsPageProps {
  searchParams: {
    filter?: string;
  };
}

export default async function LandlordPaymentsPage({ searchParams }: PaymentsPageProps) {
  const session = await requireRole("LANDLORD");

  const payments = await prisma.payment.findMany({
    where: {
      unit: {
        property: {
          landlordId: session.user.id,
        },
      },
      ...(searchParams.filter === "overdue" && { status: "OVERDUE" }),
      ...(searchParams.filter === "pending" && { status: "PENDING" }),
      ...(searchParams.filter === "paid" && { status: "PAID" }),
    },
    include: {
      unit: {
        select: {
          id: true,
          unitNumber: true,
          rentAmount: true,
          property: {
            select: {
              address: true,
            },
          },
        },
      },
      tenant: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { dueDate: "desc" },
  });

  const totalPaid = payments
    .filter((p: typeof payments[0]) => p.status === "PAID")
    .reduce((sum: number, p: typeof payments[0]) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p: typeof payments[0]) => p.status === "PENDING");
  const overduePayments = payments.filter((p: typeof payments[0]) => p.status === "OVERDUE");

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">
              Payments
            </h1>
            <p className="text-white/60">Track and manage rental payments</p>
          </div>
          <Link href="/landlord/payments/new">
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Record Payment
            </GlassButton>
          </Link>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
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
              <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
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
              <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
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
              <Link href="/landlord/payments">
                <GlassButton
                  variant={!searchParams.filter ? "primary" : "secondary"}
                  size="sm"
                >
                  All
                </GlassButton>
              </Link>
              <Link href="/landlord/payments?filter=pending">
                <GlassButton
                  variant={searchParams.filter === "pending" ? "primary" : "secondary"}
                  size="sm"
                >
                  Pending
                </GlassButton>
              </Link>
              <Link href="/landlord/payments?filter=overdue">
                <GlassButton
                  variant={searchParams.filter === "overdue" ? "primary" : "secondary"}
                  size="sm"
                >
                  Overdue
                </GlassButton>
              </Link>
              <Link href="/landlord/payments?filter=paid">
                <GlassButton
                  variant={searchParams.filter === "paid" ? "primary" : "secondary"}
                  size="sm"
                >
                  Paid
                </GlassButton>
              </Link>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Payments Yet</h3>
              <p className="text-white/60 mb-6">Payment history will appear here</p>
              <Link href="/landlord/payments/new">
                <GlassButton variant="primary">Record First Payment</GlassButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: typeof payments[0]) => (
                <PaymentItem key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </LandlordLayout>
  );
}

