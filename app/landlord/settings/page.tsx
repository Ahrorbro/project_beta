import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { User, Mail, Phone, Shield, Building2, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function LandlordSettingsPage() {
  const session = await requireRole("LANDLORD");

  const landlord = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      _count: {
        select: {
          landlordProperties: true,
        },
      },
    },
  });

  if (!landlord) {
    return null;
  }

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Settings
          </h1>
          <p className="text-white/60">Manage your account and subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Name</p>
                <p className="text-white font-medium">{landlord.name || "Not set"}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Email</p>
                <p className="text-white font-medium">{landlord.email}</p>
              </div>
              {landlord.phone && (
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-white/60 mb-1">Phone</p>
                  <p className="text-white font-medium">{landlord.phone}</p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Member Since</p>
                <p className="text-white font-medium">{formatDate(landlord.createdAt)}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Subscription</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Plan</p>
                <p className="text-white font-medium uppercase">
                  {landlord.subscription?.plan || "FREE_TRIAL"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Status</p>
                <p className="text-white font-medium capitalize">
                  {landlord.subscription?.status || "ACTIVE"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Properties</p>
                <p className="text-white font-medium">
                  {landlord._count.landlordProperties} / {landlord.subscription?.plan === "BASIC" ? "5" : "∞"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Data Protection</p>
                <p className="text-white font-medium">Tanzanian PDPA Compliant</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60 mb-1">Account Status</p>
                <p className="text-white font-medium">Active</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </LandlordLayout>
  );
}

