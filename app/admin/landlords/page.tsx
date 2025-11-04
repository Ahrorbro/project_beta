import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Mail, User, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function LandlordsPage() {
  await requireRole("SUPER_ADMIN");

  const landlords = await prisma.user.findMany({
    where: { role: "LANDLORD" },
    include: {
      subscription: true,
      _count: {
        select: {
          landlordProperties: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Landlord Management
            </h1>
            <p className="text-white/60">View and manage all landlords</p>
          </div>
          <Link href="/admin/landlords/new">
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Landlord
            </GlassButton>
          </Link>
        </div>

        {landlords.length === 0 ? (
          <GlassCard className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Landlords Yet</h3>
            <p className="text-white/60 mb-6">Create your first landlord to get started.</p>
            <Link href="/admin/landlords/new">
              <GlassButton variant="primary">Create First Landlord</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landlords.map((landlord: typeof landlords[0]) => (
              <GlassCard key={landlord.id} className="hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {landlord.name || "Unnamed Landlord"}
                      </h3>
                      <p className="text-sm text-white/60">{landlord.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Mail className="w-4 h-4" />
                    <span>{landlord.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(landlord.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Properties:</span>
                    <span className="font-semibold text-white">
                      {landlord._count.landlordProperties}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Plan:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                      {landlord.subscription?.plan || "FREE_TRIAL"}
                    </span>
                  </div>
                </div>

                <Link href={`/admin/landlords/${landlord.id}`}>
                  <GlassButton variant="secondary" className="w-full">
                    View Details
                  </GlassButton>
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

