import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { prismaQuery as prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MaintenanceRequestDetail } from "@/components/landlord/MaintenanceRequestDetail";

interface MaintenanceRequestDetailProps {
  params: {
    id: string;
  };
}

export default async function LandlordMaintenanceRequestDetailPage({
  params,
}: MaintenanceRequestDetailProps) {
  const session = await requireRole("LANDLORD");

  const request = await prisma.maintenanceRequest.findFirst({
    where: {
      id: params.id,
      unit: {
        property: {
          landlordId: session.user.id,
        },
      },
    },
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
      tenant: true,
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <LandlordLayout>
      <MaintenanceRequestDetail request={request} />
    </LandlordLayout>
  );
}

