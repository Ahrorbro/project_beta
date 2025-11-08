import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery } from "@/lib/prisma";
import { CreditCard, Calendar, DollarSign } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PaymentItem } from "@/components/landlord/PaymentItem";

export default async function PaymentsAdminPage() {
  await requireRole("SUPER_ADMIN");

  const payments = await prismaQuery.payment.findMany({
    include: {
      unit: {
        include: {
          property: {
            select: {
              id: true,
              address: true,
              landlord: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { dueDate: "desc" },
  });

  // Calculate statistics
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter((p) => p.status === "OVERDUE").length;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  // Transform payments for PaymentItem component
  const transformedPayments = payments.map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    dueDate: payment.dueDate instanceof Date ? payment.dueDate : new Date(payment.dueDate),
    paidDate: payment.paidDate
      ? payment.paidDate instanceof Date
        ? payment.paidDate
        : new Date(payment.paidDate)
      : null,
    status: payment.status,
    editedAt: payment.editedAt
      ? payment.editedAt instanceof Date
        ? payment.editedAt
        : new Date(payment.editedAt)
      : null,
    unit: {
      unitNumber: payment.unit.unitNumber || "N/A",
      rentAmount: payment.unit.rentAmount || 0,
      property: {
        address: payment.unit.property.address,
      },
    },
    tenant: {
      name: payment.tenant.name,
      email: payment.tenant.email,
    },
  }));

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              All Payments
            </h1>
            <p className="text-white/60">View and manage all payments across the system</p>
          </div>
          <div className="px-3 py-1.5 rounded-md text-sm bg-white/10 border border-white/20 text-white/80">
            Total: {payments.length}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-white/40" />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Paid Amount</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(paidAmount)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-400/40" />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-400/40" />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-400/40" />
            </div>
          </GlassCard>
        </div>

        {/* Payments List */}
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6 text-white">Payment History</h2>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Payments Yet</h3>
              <p className="text-white/60">Payment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transformedPayments.map((payment) => (
                <PaymentItem key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </AdminLayout>
  );
}

