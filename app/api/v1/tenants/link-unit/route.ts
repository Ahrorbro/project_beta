import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { z } from "zod";

const linkSchema = z.object({
  invitationToken: z.string(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = linkSchema.parse(body);

    // Verify invitation token
    const unit = await prisma.unit.findUnique({
      where: { invitationToken: validated.invitationToken },
      include: {
        tenants: {
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Invalid invitation link" },
        { status: 400 }
      );
    }

    // Check if tenant is already linked to this unit
    const existingLink = await prisma.unitTenant.findFirst({
      where: {
        unitId: unit.id,
        tenantId: session.user.id,
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { message: "You are already linked to this unit" },
        { status: 200 }
      );
    }

    // Link tenant to unit (allow multiple tenants per unit)
    const { randomBytes } = await import("crypto");
    const newInvitationToken = randomBytes(32).toString("hex");
    
    // Create the link
    await prisma.unitTenant.create({
      data: {
        unitId: unit.id,
        tenantId: session.user.id,
      },
    });

    // Mark unit as occupied and regenerate invitation token
    await prisma.unit.update({
      where: { id: unit.id },
      data: {
        isOccupied: true,
        invitationToken: newInvitationToken, // Regenerate token for next person
      },
    });

    return NextResponse.json({ message: "Unit linked successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error linking unit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

