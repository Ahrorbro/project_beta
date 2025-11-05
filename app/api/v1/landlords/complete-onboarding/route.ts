import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  acceptedTerms: z.boolean().refine((val) => val === true, "Must accept terms"),
  acceptedPDPA: z.boolean().refine((val) => val === true, "Must accept PDPA"),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = onboardingSchema.parse(body);

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        landlordProfileComplete: true,
      },
    });

    return NextResponse.json({ message: "Onboarding completed" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

