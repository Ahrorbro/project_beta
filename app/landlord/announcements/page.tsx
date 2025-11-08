import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { prismaQuery as prisma } from "@/lib/prisma";
import { Bell, Plus, Trash2, Users, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { DeleteAnnouncementButton } from "@/components/landlord/DeleteAnnouncementButton";

export default async function LandlordAnnouncementsPage() {
  const session = await requireRole("LANDLORD");

  const announcements = await prisma.announcement.findMany({
    where: { landlordId: session.user.id },
    include: {
      property: {
        select: {
          id: true,
          address: true,
        },
      },
      _count: {
        select: {
          recipients: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">Announcements</h1>
            <p className="text-white/60">Manage announcements for your tenants</p>
          </div>
          <Link href="/landlord/announcements/new">
            <GlassButton variant="primary" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Announcement
            </GlassButton>
          </Link>
        </div>

        {announcements.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold mb-2 text-white">No Announcements Yet</h3>
            <p className="text-white/60 mb-6">
              Create your first announcement to communicate with your tenants.
            </p>
            <Link href="/landlord/announcements/new">
              <GlassButton variant="primary">Create Announcement</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <GlassCard key={announcement.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">{announcement.title}</h3>
                    </div>
                    <p className="text-white/80 mb-4 whitespace-pre-wrap">{announcement.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{announcement._count.recipients} recipient{announcement._count.recipients !== 1 ? "s" : ""}</span>
                      </div>
                      {announcement.property && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{announcement.property.address}</span>
                        </div>
                      )}
                      <span>{formatDate(announcement.createdAt)}</span>
                      <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                        {announcement.targetType.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <DeleteAnnouncementButton
                    announcementId={announcement.id}
                    announcementTitle={announcement.title}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </LandlordLayout>
  );
}

