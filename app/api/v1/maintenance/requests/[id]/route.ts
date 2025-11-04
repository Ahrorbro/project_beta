import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["SUBMITTED", "IN_PROGRESS", "RESOLVED"]),
  resolutionNotes: z.string().optional(),
  resolutionPhotos: z.array(z.string()).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify request belongs to landlord's property
    const maintenanceRequest = await prisma.maintenanceRequest.findFirst({
      where: {
        id: params.id,
        unit: {
          property: {
            landlordId: session.user.id,
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: "Maintenance request not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    // Update request
    const updated = await prisma.maintenanceRequest.update({
      where: { id: maintenanceRequest.id },
      data: {
        status: validated.status,
        resolutionNotes: validated.resolutionNotes,
        resolutionPhotos: validated.resolutionPhotos,
        resolvedAt: validated.status === "RESOLVED" ? new Date() : null,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE_MAINTENANCE_REQUEST",
      entityType: "MaintenanceRequest",
      entityId: maintenanceRequest.id,
      details: { status: validated.status },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating maintenance request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

