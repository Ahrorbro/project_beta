import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const maintenanceRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  photos: z.array(z.string()).min(1),
});

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
    const validated = maintenanceRequestSchema.parse(body);

    // Get tenant's unit
    const tenant = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantUnits: { select: { unitId: true }, take: 1 } },
    });

    if (!tenant || !tenant.tenantUnits || tenant.tenantUnits.length === 0) {
      return NextResponse.json(
        { error: "Tenant not assigned to a unit" },
        { status: 400 }
      );
    }

    // Create maintenance request
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        unitId: tenant.tenantUnits[0].unitId,
        tenantId: session.user.id,
        title: validated.title,
        description: validated.description,
        photos: validated.photos,
        status: "SUBMITTED",
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE_MAINTENANCE_REQUEST",
      entityType: "MaintenanceRequest",
      entityId: maintenanceRequest.id,
      details: { title: validated.title },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Maintenance request created successfully", request: maintenanceRequest },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating maintenance request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

