import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { randomBytes } from "crypto";

interface RouteParams {
  params: {
    unitId: string;
  };
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify unit belongs to landlord
    const unit = await prisma.unit.findFirst({
      where: {
        id: params.unitId,
        property: {
          landlordId: session.user.id,
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    // Generate new invitation token
    const newInvitationToken = randomBytes(32).toString("hex");

    // Update unit with new token
    const updated = await prisma.unit.update({
      where: { id: unit.id },
      data: { invitationToken: newInvitationToken },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "REGENERATE_INVITATION_LINK",
      entityType: "Unit",
      entityId: unit.id,
      details: { unitNumber: unit.unitNumber },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      message: "Invitation link regenerated",
      invitationToken: newInvitationToken,
    });
  } catch (error) {
    console.error("Error regenerating invitation link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

