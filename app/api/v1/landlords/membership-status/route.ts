import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { hasActiveAccess, isTrialExpired, getTrialDaysRemaining } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const landlord = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
      },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: "Landlord not found" },
        { status: 404 }
      );
    }

    const subscription = landlord.subscription;
    const hasAccess = hasActiveAccess(subscription);
    const trialExpired = isTrialExpired(subscription);
    const daysRemaining = getTrialDaysRemaining(subscription);

    return NextResponse.json({
      hasAccess,
      membershipPaid: subscription?.membershipPaid || false,
      membershipAmount: subscription?.membershipAmount || 80.00,
      membershipPaymentDate: subscription?.membershipPaymentDate || null,
      trialStartDate: subscription?.trialStartDate || null,
      trialEndDate: subscription?.trialEndDate || null,
      trialExpired,
      daysRemaining,
      isInTrial: !trialExpired && !subscription?.membershipPaid,
    });
  } catch (error) {
    console.error("Error fetching membership status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

