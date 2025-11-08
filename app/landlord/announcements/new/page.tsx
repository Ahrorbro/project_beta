import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { CreateAnnouncementForm } from "@/components/landlord/CreateAnnouncementForm";
import { prismaQuery as prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateAnnouncementPage() {
  const session = await requireRole("LANDLORD");

  // Get all properties and tenants for the form
  const [properties, tenants] = await Promise.all([
    prisma.property.findMany({
      where: { landlordId: session.user.id },
      select: {
        id: true,
        address: true,
      },
      orderBy: { address: "asc" },
    }),
    prisma.user.findMany({
      where: {
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
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <Link
          href="/landlord/announcements"
          className="text-white/60 hover:text-white inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Announcements
        </Link>
        <CreateAnnouncementForm properties={properties} tenants={tenants} />
      </div>
    </LandlordLayout>
  );
}

