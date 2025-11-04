import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InviteLandingPage } from "@/components/tenant/InviteLandingPage";

export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  try {
    // Find unit by invitation token
    const unit = await prisma.unit.findUnique({
      where: { invitationToken: params.token },
      select: {
        id: true,
        unitNumber: true,
        floor: true,
        isOccupied: true,
        property: {
          select: {
            address: true,
          },
        },
        tenants: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!unit) {
      notFound();
    }

    // Don't redirect - let the page show even if occupied
    // The component will handle showing appropriate message
    return (
      <InviteLandingPage unit={unit} token={params.token} />
    );
  } catch (error) {
    console.error("Error loading invitation page:", error);
    notFound();
  }
}

