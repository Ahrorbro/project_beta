import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const leaseUpdateSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify lease belongs to landlord's property
    const lease = await prisma.leaseAgreement.findFirst({
      where: {
        id: params.id,
        unit: {
          property: {
            landlordId: session.user.id,
          },
        },
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = leaseUpdateSchema.parse(body);

    // Update lease
    const updated = await prisma.leaseAgreement.update({
      where: { id: lease.id },
      data: {
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
    });

    // Update unit lease dates if this is the active lease
    await prisma.unit.update({
      where: { id: lease.unitId },
      data: {
        leaseStartDate: new Date(validated.startDate),
        leaseEndDate: new Date(validated.endDate),
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE_LEASE",
      entityType: "LeaseAgreement",
      entityId: lease.id,
      details: {
        startDate: validated.startDate,
        endDate: validated.endDate,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ lease: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating lease:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

