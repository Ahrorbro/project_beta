import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Mail, Phone, Calendar, Building2, CreditCard } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { MembershipPaymentForm } from "@/components/admin/MembershipPaymentForm";
import { PaymentItem } from "@/components/landlord/PaymentItem";

interface LandlordDetailPageProps {
  params: {
    id: string;
  };
}

export default async function LandlordDetailPage({ params }: LandlordDetailPageProps) {
  await requireRole("SUPER_ADMIN");

  const landlord = await prismaQuery.user.findUnique({
    where: { id: params.id, role: "LANDLORD" },
    include: {
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          membershipPaid: true,
          membershipPaymentDate: true,
          membershipAmount: true,
        },
      },
      landlordProperties: {
        include: {
          _count: {
            select: {
              units: true,
            },
          },
        },
      },
      _count: {
        select: {
          landlordProperties: true,
        },
      },
    },
  });

  if (!landlord) {
    notFound();
  }

  // Get landlord activity stats and payments
  const [totalPayments, totalMaintenanceRequests, payments] = await Promise.all([
    prismaQuery.payment.count({
      where: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
    }),
    prismaQuery.maintenanceRequest.count({
      where: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
    }),
    prismaQuery.payment.findMany({
      where: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        paidDate: true,
        status: true,
        editedAt: true,
        createdAt: true,
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
      take: 10,
    }),
  ]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/landlords"
              className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
            >
              ← Back to Landlords
            </Link>
            <h1 className="text-4xl font-bold mb-2 text-white">
              {landlord.name || "Unnamed Landlord"}
            </h1>
            <p className="text-white/60">Landlord details and activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {landlord.name || "Unnamed Landlord"}
                </h3>
                <p className="text-sm text-white/60">Landlord</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-white/60" />
                <span className="text-white/80">{landlord.email}</span>
              </div>
              {landlord.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">{landlord.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-white/60" />
                <span className="text-white/80">
                  Joined {formatDate(landlord.createdAt)}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Stats Card */}
          <GlassCard className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 text-white">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold text-white">{landlord._count.landlordProperties}</p>
                <p className="text-sm text-white/60">Properties</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold text-white">{totalPayments}</p>
                <p className="text-sm text-white/60">Payments</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <User className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-2xl font-bold text-white">{totalMaintenanceRequests}</p>
                <p className="text-sm text-white/60">Requests</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${
                    landlord.subscription?.membershipPaid
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                  }`}>
                    {landlord.subscription?.membershipPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <p className="text-sm text-white/60">Membership</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Membership Payment Section */}
        {landlord.subscription && (
          <div className="mt-6">
            <MembershipPaymentForm
              landlordId={landlord.id}
              landlordName={landlord.name || "Landlord"}
              currentStatus={{
                membershipPaid: landlord.subscription.membershipPaid || false,
                membershipPaymentDate: landlord.subscription.membershipPaymentDate || null,
                membershipAmount: landlord.subscription.membershipAmount || 80.00,
              }}
            />
          </div>
        )}

        {/* Recent Payments */}
        {payments.length > 0 && (
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Recent Payments</h2>
              <Link
                href={`/admin/landlords/${landlord.id}/payments`}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {payments.map((payment) => {
                const paymentForComponent = {
                  ...payment,
                  dueDate: payment.dueDate instanceof Date ? payment.dueDate : new Date(payment.dueDate),
                  paidDate: payment.paidDate ? (payment.paidDate instanceof Date ? payment.paidDate : new Date(payment.paidDate)) : null,
                  editedAt: payment.editedAt ? (payment.editedAt instanceof Date ? payment.editedAt : new Date(payment.editedAt)) : null,
                  unit: {
                    ...payment.unit,
                    unitNumber: payment.unit.unitNumber || "N/A",
                    rentAmount: payment.unit.rentAmount || 0,
                  },
                };
                return <PaymentItem key={payment.id} payment={paymentForComponent} />;
              })}
            </div>
          </GlassCard>
        )}

        {/* Properties List */}
        {landlord.landlordProperties.length > 0 && (
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-6 text-white">Properties</h2>
            <div className="space-y-4">
              {landlord.landlordProperties.map((property: {
                id: string;
                address: string;
                propertyType: string;
                _count: { units: number };
              }) => (
                <div
                  key={property.id}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{property.address}</h3>
                      <p className="text-sm text-white/60">
                        {property.propertyType} • {property._count.units} units
                      </p>
                    </div>
                    <Link
                      href={`/admin/landlords/${landlord.id}/properties/${property.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </AdminLayout>
  );
}

